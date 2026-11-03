from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Literal
from unicodedata import normalize
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.reminder import Reminder
from app.models.money import Person
from app.models.user import User
from app.schemas.money import TransactionCreate, TransactionType
from app.services.money.category_service import get_categories
from app.services.money.person_service import get_people
from app.services.money.transaction_service import create_transaction


router = APIRouter()
CAIRO = ZoneInfo("Africa/Cairo")
MODEL = "gemini-3.5-flash-lite"
MoneyAction = Literal["expense", "income", "lent", "received", "borrowed", "repaid"]
Action = Literal["expense", "income", "lent", "received", "borrowed", "repaid", "reminder", "question"]
MONEY_TYPES = {
    "expense": TransactionType.PERSONAL_EXPENSE,
    "income": TransactionType.INCOME,
    "lent": TransactionType.LENT_TO_PERSON,
    "received": TransactionType.RECEIVED_FROM_PERSON,
    "borrowed": TransactionType.BORROWED_FROM_PERSON,
    "repaid": TransactionType.REPAID_TO_PERSON,
}


class ChatLine(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=500)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[ChatLine] = Field(default_factory=list, max_length=4)


class Intent(BaseModel):
    action: Action
    amount: float | None = None
    description: str | None = None
    person_name: str | None = None
    category_name: str | None = None
    currency: str | None = None
    transaction_date: str | None = None
    event_at: str | None = None
    remind_at: str | None = None
    reply: str


class ChatResponse(BaseModel):
    reply: str
    action: Action
    record_id: str | None = None


async def read_intent(request: ChatRequest) -> Intent:
    if not settings.ai_provider_api_key:
        raise HTTPException(503, "Gemini API key is not configured")

    now = datetime.now(CAIRO)
    instructions = (
        "You are Eedoo, parsing Egyptian Arabic or English personal finance and reminder requests. "
        "Return JSON only. Classify one clear money transaction or email reminder. "
        "Money actions: expense=personal spending, income=ordinary income, "
        "lent=I gave someone money to repay me, received=they paid back money I lent, "
        "borrowed=I took money from someone to repay them, repaid=I paid back money I borrowed. "
        "For debt actions extract the person's name in person_name. Never treat a loan as ordinary income or expense. "
        "An ordinary transfer or 'someone gave me money' without a clear loan or income meaning needs a clarifying question. "
        "Use category_name for expenses if explicit or obvious: Food, Transport, Shopping, Bills, Education, Entertainment, Health, Other; otherwise null. "
        "For a money action give positive amount, currency as a 3-letter ISO code (EGP for جنيه), "
        "a short description and ISO transaction_date; default to today's date if absent. "
        "If currency is unstated in an Egyptian Arabic money request, use EGP. "
        "For multiple actions or missing amount/person, return action=question and ask one brief question in the user's language. "
        "Use the prior turns to fill missing fields after a follow-up answer. Never invent amount, person, date, meeting time, or recipient. "
        "For a reminder give a short title in description and event_at and remind_at as ISO local datetimes "
        "in Africa/Cairo. If no notification lead time is specified, use one hour. "
        "If event time is missing, ask for it. Use the prior turns only to resolve a follow-up. "
        f"Current local date/time: {now.isoformat()}. "
        "Examples: 'دفعت ٥٠٠ جنيه في امازون' => expense; "
        "'سلفت بيا ٢٠٠ جنيه' => lent with person_name=بيا; "
        "'بيا سلفني ٢٠٠ جنيه' => borrowed with person_name=بيا; "
        "'بيا رجعتلي ١٠٠ جنيه من السلفة' => received; "
        "'استلفت ٣٠٠ من أحمد' => borrowed; 'رجعت لأحمد ١٠٠ من الدين' => repaid; "
        "'فكرني باجتماع الجمعة الساعة ٣ العصر قبلها بساعة' => reminder. "
        "For action=question, reply with the question; otherwise reply may be empty."
    )
    contents = [
        {"role": "user" if line.role == "user" else "model", "parts": [{"text": line.content}]}
        for line in request.history
    ]
    contents.append({"role": "user", "parts": [{"text": request.message}]})
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                headers={"x-goog-api-key": settings.ai_provider_api_key},
                json={
                    "systemInstruction": {"parts": [{"text": instructions}]},
                    "contents": contents,
                    "generationConfig": {
                        "responseFormat": {"text": {"mimeType": "APPLICATION_JSON", "schema": Intent.model_json_schema()}},
                        "maxOutputTokens": 300,
                    },
                },
            )
            if response.status_code == 429:
                raise HTTPException(429, "Gemini free-tier limit reached. Try again later")
            if response.status_code in (401, 403):
                raise HTTPException(503, "Gemini API key cannot access this model")
            response.raise_for_status()
            return Intent.model_validate_json(response.json()["candidates"][0]["content"]["parts"][0]["text"])
    except httpx.TimeoutException as exc:
        raise HTTPException(504, "Gemini took too long. Please try again") from exc
    except (httpx.HTTPError, KeyError, IndexError, ValueError, ValidationError) as exc:
        raise HTTPException(502, "Could not understand the request right now") from exc


def local_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    return parsed.replace(tzinfo=CAIRO) if parsed.tzinfo is None else parsed.astimezone(CAIRO)


def same_name(value: str) -> str:
    return " ".join(normalize("NFKC", value).casefold().split())


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    intent = await read_intent(request)
    if intent.action == "question":
        return ChatResponse(action="question", reply=intent.reply or "ممكن توضحلي التفاصيل؟")

    if intent.action in MONEY_TYPES:
        try:
            amount = Decimal(str(intent.amount))
            transaction_date = date.fromisoformat(intent.transaction_date or "")
            currency = (intent.currency or "EGP").upper()
            if not amount.is_finite() or amount <= 0 or len(currency) != 3 or not currency.isalpha():
                raise ValueError("Invalid amount or currency")
        except (ValueError, TypeError, InvalidOperation, ValidationError):
            return ChatResponse(action="question", reply="ممكن توضح المبلغ والعملة والتاريخ؟")

        person_id = None
        person_name = (intent.person_name or "").strip()
        if intent.action in ("lent", "received", "borrowed", "repaid"):
            if not person_name or len(person_name) > 255:
                return ChatResponse(action="question", reply="مين الشخص اللي الحركة دي معاه؟")
            matches = [person for person in await get_people(db, current_user.id) if same_name(person.name) == same_name(person_name)]
            if len(matches) > 1:
                return ChatResponse(action="question", reply=f"عندك أكتر من شخص باسم {person_name}. وضّح الشخص من صفحة الناس الأول.")
            if matches:
                person_id = matches[0].id
            else:
                person = Person(user_id=current_user.id, name=person_name)
                db.add(person)
                await db.flush()
                person_id = person.id

        category_id = None
        if intent.action == "expense" and intent.category_name:
            matches = [category for category in await get_categories(db, current_user.id) if same_name(category.name) == same_name(intent.category_name)]
            if len(matches) == 1:
                category_id = matches[0].id
        try:
            transaction = TransactionCreate(
                amount=amount,
                currency=currency,
                type=MONEY_TYPES[intent.action],
                person_id=person_id,
                category_id=category_id,
                description=intent.description,
                transaction_date=transaction_date,
            )
        except ValidationError:
            await db.rollback()
            return ChatResponse(action="question", reply="ممكن توضح تفاصيل الحركة؟")
        saved = await create_transaction(db, current_user.id, transaction)
        labels = {"expense": "مصروف", "income": "دخل", "lent": "سُلفة لـ", "received": "استرداد من", "borrowed": "استلاف من", "repaid": "سداد لـ"}
        subject = person_name if person_id else (saved.description or "بدون وصف")
        return ChatResponse(action=intent.action, reply=f"سجلت {labels[intent.action]} {subject}: {saved.amount} {saved.currency}.", record_id=str(saved.id))

    if not all((settings.smtp_host, settings.smtp_user, settings.smtp_password, settings.smtp_from)):
        return ChatResponse(action="question", reply="التذكيرات بالإيميل لسه مش مفعّلة. دلوقتي أقدر أسجّل حركاتك في e-Money.")
    try:
        event_at = local_datetime(intent.event_at or "")
        remind_at = local_datetime(intent.remind_at or "")
        title = (intent.description or "").strip()
        if not title or len(title) > 255 or not datetime.now(timezone.utc) < remind_at < event_at:
            raise ValueError("Invalid reminder")
    except ValueError:
        return ChatResponse(action="question", reply="ممكن تحدد ميعاد الحدث ووقت التنبيه قبله؟")
    reminder = Reminder(user_id=current_user.id, title=title, event_at=event_at, remind_at=remind_at)
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    return ChatResponse(
        action="reminder",
        reply=f"تمام، هبعتلك إيميل على {current_user.email} يوم {remind_at.strftime('%Y-%m-%d')} الساعة {remind_at.strftime('%H:%M')} بتوقيت القاهرة: {title}.",
        record_id=str(reminder.id),
    )


@router.get("/reminders")
async def get_reminders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Reminder).where(Reminder.user_id == current_user.id, Reminder.sent_at.is_(None))
        .order_by(Reminder.remind_at).limit(50)
    )
    return [
        {"id": str(item.id), "title": item.title, "event_at": item.event_at, "remind_at": item.remind_at}
        for item in result.scalars()
    ]


@router.delete("/reminders/{reminder_id}", status_code=204)
async def delete_reminder(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == current_user.id, Reminder.sent_at.is_(None))
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(404, "Reminder not found")
    await db.delete(reminder)
    await db.commit()
