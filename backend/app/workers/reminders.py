"""Run with: python -m app.workers.reminders"""

import asyncio
import logging
import smtplib
import ssl
from datetime import datetime, timezone
from email.message import EmailMessage
from zoneinfo import ZoneInfo

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.reminder import Reminder
from app.models.user import User


logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


def send_email(address: str, title: str, event_at: datetime) -> None:
    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = address
    message["Subject"] = f"Eedoo reminder: {title}"
    local_event = event_at.astimezone(ZoneInfo("Africa/Cairo"))
    message.set_content(f"تذكير: {title}\nموعد الحدث: {local_event:%Y-%m-%d %H:%M} بتوقيت القاهرة.")
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)


async def send_due_reminders() -> None:
    async with AsyncSessionLocal() as db:
        async with db.begin():
            result = await db.execute(
                select(Reminder, User)
                .join(User, User.id == Reminder.user_id)
                .where(Reminder.sent_at.is_(None), Reminder.remind_at <= datetime.now(timezone.utc))
                .order_by(Reminder.remind_at)
                .limit(10)
                .with_for_update(of=Reminder, skip_locked=True)
            )
            for reminder, user in result:
                await asyncio.to_thread(send_email, user.email, reminder.title, reminder.event_at)
                reminder.sent_at = datetime.now(timezone.utc)


async def main() -> None:
    if not all((settings.smtp_host, settings.smtp_user, settings.smtp_password, settings.smtp_from)):
        raise RuntimeError("SMTP settings are required for reminder delivery")
    while True:
        try:
            await send_due_reminders()
        except Exception:
            log.exception("Reminder delivery failed; will retry")
        await asyncio.sleep(30)


if __name__ == "__main__":
    asyncio.run(main())
