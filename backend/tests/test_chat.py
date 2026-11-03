from datetime import datetime, timedelta, timezone
from uuid import UUID
import json

import httpx
import pytest
from sqlalchemy import select

from app.api.v1 import chat
from app.models.reminder import Reminder
from app.models.user import User
from app.workers import reminders as worker
from tests.conftest import TestingSessionLocal


@pytest.mark.asyncio
async def test_gemini_request_extracts_structured_intent(monkeypatch):
    async_client_type = httpx.AsyncClient
    monkeypatch.setattr(chat.settings, "ai_provider_api_key", "test-key")

    def respond(request):
        body = json.loads(request.content)
        assert request.headers["x-goog-api-key"] == "test-key"
        assert body["generationConfig"]["responseFormat"]["text"]["schema"]["properties"]["action"]["enum"] == ["expense", "income", "lent", "received", "borrowed", "repaid", "reminder", "question"]
        assert body["contents"][-1]["parts"][0]["text"] == "دفعت ٥٠٠ جنيه"
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": json.dumps({"action": "expense", "amount": 500, "description": "شراء", "transaction_date": "2026-11-03", "reply": ""})}]}}]})

    monkeypatch.setattr(chat.httpx, "AsyncClient", lambda **kwargs: async_client_type(transport=httpx.MockTransport(respond), **kwargs))
    intent = await chat.read_intent(chat.ChatRequest(message="دفعت ٥٠٠ جنيه"))
    assert intent.amount == 500


@pytest.mark.asyncio
async def test_chat_saves_expense(async_client, auth_headers, monkeypatch):
    async def parse(_request):
        return chat.Intent(action="expense", amount=500, description="أمازون", transaction_date="2026-11-03", reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "دفعت ٥٠٠ جنيه في أمازون"})
    assert response.status_code == 200
    assert response.json()["action"] == "expense"
    transactions = await async_client.get("/api/v1/money/transactions", headers=auth_headers)
    assert transactions.json()["items"][0]["description"] == "أمازون"
    assert transactions.json()["items"][0]["amount"] == "500.00"


@pytest.mark.asyncio
async def test_chat_saves_income_and_matches_expense_category(async_client, auth_headers, monkeypatch):
    async def income(_request):
        return chat.Intent(action="income", amount=700, description="مرتب", transaction_date="2026-11-03", reply="")

    monkeypatch.setattr(chat, "read_intent", income)
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "قبضت ٧٠٠ جنيه"})
    assert response.json()["action"] == "income"

    async def expense(_request):
        return chat.Intent(action="expense", amount=50, description="أمازون", category_name="Shopping", transaction_date="2026-11-03", reply="")

    monkeypatch.setattr(chat, "read_intent", expense)
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "دفعت ٥٠ جنيه في أمازون"})
    assert response.json()["action"] == "expense"
    transactions = (await async_client.get("/api/v1/money/transactions", headers=auth_headers)).json()["items"]
    categories = (await async_client.get("/api/v1/money/categories", headers=auth_headers)).json()
    shopping = next(category for category in categories if category["name"] == "Shopping")
    assert next(item for item in transactions if item["type"] == "PERSONAL_EXPENSE")["category_id"] == shopping["id"]
    assert any(item["type"] == "INCOME" for item in transactions)


@pytest.mark.asyncio
@pytest.mark.parametrize("action,transaction_type", [
    ("lent", "LENT_TO_PERSON"),
    ("received", "RECEIVED_FROM_PERSON"),
    ("borrowed", "BORROWED_FROM_PERSON"),
    ("repaid", "REPAID_TO_PERSON"),
])
async def test_chat_handles_every_debt_type(async_client, auth_headers, monkeypatch, action, transaction_type):
    async def parse(_request):
        return chat.Intent(action=action, amount=200, currency="EGP", person_name="بيا", transaction_date="2026-11-03", reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    for _ in range(2):
        response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "سلفت بيا ٢٠٠ جنيه"})
        assert response.status_code == 200
        assert response.json()["action"] == action
    transactions = (await async_client.get("/api/v1/money/transactions", headers=auth_headers)).json()["items"]
    people = (await async_client.get("/api/v1/money/people", headers=auth_headers)).json()
    assert len(people) == 1
    assert people[0]["name"] == "بيا"
    assert len(transactions) == 2
    assert all(item["type"] == transaction_type and item["person_id"] == people[0]["id"] for item in transactions)


@pytest.mark.asyncio
async def test_debt_without_person_asks_instead_of_saving(async_client, auth_headers, monkeypatch):
    async def parse(_request):
        return chat.Intent(action="lent", amount=200, transaction_date="2026-11-03", reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "سلفت ٢٠٠ جنيه"})
    assert response.status_code == 200
    assert response.json()["action"] == "question"
    assert (await async_client.get("/api/v1/money/transactions", headers=auth_headers)).json()["items"] == []


@pytest.mark.asyncio
async def test_incomplete_reminder_is_not_saved(async_client, auth_headers, monkeypatch):
    async def parse(_request):
        return chat.Intent(action="reminder", description="اجتماع", reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    monkeypatch.setattr(chat.settings, "smtp_host", "smtp.test")
    monkeypatch.setattr(chat.settings, "smtp_user", "test")
    monkeypatch.setattr(chat.settings, "smtp_password", "test")
    monkeypatch.setattr(chat.settings, "smtp_from", "test@example.com")
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "فكرني الجمعة باجتماع"})
    assert response.json()["action"] == "question"
    assert (await async_client.get("/api/v1/chat/reminders", headers=auth_headers)).json() == []


@pytest.mark.asyncio
async def test_reminder_without_email_setup_explains_limit(async_client, auth_headers, monkeypatch):
    async def parse(_request):
        return chat.Intent(action="reminder", description="اجتماع", event_at="2026-11-06T15:00:00+02:00", remind_at="2026-11-06T14:00:00+02:00", reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    monkeypatch.setattr(chat.settings, "smtp_host", None)
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "فكرني الجمعة الساعة ٣"})
    assert response.status_code == 200
    assert response.json()["action"] == "question"
    assert "مش مفعّلة" in response.json()["reply"]
    assert (await async_client.get("/api/v1/chat/reminders", headers=auth_headers)).json() == []


@pytest.mark.asyncio
async def test_reminder_delivery_and_cancel(async_client, auth_headers, monkeypatch):
    now = datetime.now(timezone.utc)
    event_at = now + timedelta(hours=3)
    remind_at = now + timedelta(hours=2)

    async def parse(_request):
        return chat.Intent(action="reminder", description="اجتماع", event_at=event_at.isoformat(), remind_at=remind_at.isoformat(), reply="")

    monkeypatch.setattr(chat, "read_intent", parse)
    monkeypatch.setattr(chat.settings, "smtp_host", "smtp.test")
    monkeypatch.setattr(chat.settings, "smtp_user", "test")
    monkeypatch.setattr(chat.settings, "smtp_password", "test")
    monkeypatch.setattr(chat.settings, "smtp_from", "test@example.com")
    response = await async_client.post("/api/v1/chat/message", headers=auth_headers, json={"message": "فكرني بالاجتماع"})
    assert response.status_code == 200
    reminder_id = response.json()["record_id"]
    listed = await async_client.get("/api/v1/chat/reminders", headers=auth_headers)
    assert [item["id"] for item in listed.json()] == [reminder_id]

    async with TestingSessionLocal() as db:
        reminder = (await db.execute(select(Reminder).where(Reminder.id == UUID(reminder_id)))).scalar_one()
        reminder.remind_at = now - timedelta(minutes=1)
        await db.commit()

    sent = []
    monkeypatch.setattr(worker, "send_email", lambda address, title, event: sent.append((address, title)))
    monkeypatch.setattr(worker, "AsyncSessionLocal", TestingSessionLocal)
    await worker.send_due_reminders()
    await worker.send_due_reminders()
    assert len(sent) == 1
    assert sent[0][1] == "اجتماع"
    assert (await async_client.get("/api/v1/chat/reminders", headers=auth_headers)).json() == []

    async with TestingSessionLocal() as db:
        user = (await db.execute(select(User))).scalar_one()
        other = Reminder(user_id=user.id, title="Next", event_at=event_at, remind_at=remind_at)
        db.add(other)
        await db.commit()
        reminder_id = str(other.id)
    deleted = await async_client.delete(f"/api/v1/chat/reminders/{reminder_id}", headers=auth_headers)
    assert deleted.status_code == 204
