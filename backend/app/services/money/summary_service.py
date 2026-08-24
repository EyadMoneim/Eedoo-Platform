from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from decimal import Decimal

from app.models.money import Transaction
from app.schemas.money import MoneySummary, TransactionType

async def get_money_summary(db: AsyncSession, user_id: UUID) -> MoneySummary:
    result = await db.execute(
        select(Transaction.type, func.sum(Transaction.amount))
        .where(Transaction.user_id == user_id)
        .group_by(Transaction.type)
    )
    
    totals = {row[0]: Decimal(row[1] or 0) for row in result.all()}
    
    total_income = totals.get(TransactionType.INCOME.value, Decimal(0))
    total_personal_expenses = totals.get(TransactionType.PERSONAL_EXPENSE.value, Decimal(0))
    total_lent = totals.get(TransactionType.LENT_TO_PERSON.value, Decimal(0))
    total_received_back = totals.get(TransactionType.RECEIVED_FROM_PERSON.value, Decimal(0))
    total_borrowed = totals.get(TransactionType.BORROWED_FROM_PERSON.value, Decimal(0))
    total_repaid = totals.get(TransactionType.REPAID_TO_PERSON.value, Decimal(0))
    
    money_owed_to_user = total_lent - total_received_back
    money_user_owes = total_borrowed - total_repaid
    
    cash_balance = (
        total_income
        - total_personal_expenses
        - total_lent
        + total_received_back
        - total_repaid
        + total_borrowed
    )
    
    net_position = cash_balance + money_owed_to_user - money_user_owes
    
    return MoneySummary(
        total_income=total_income,
        total_personal_expenses=total_personal_expenses,
        total_lent=total_lent,
        total_received_back=total_received_back,
        total_borrowed=total_borrowed,
        total_repaid=total_repaid,
        money_owed_to_user=money_owed_to_user,
        money_user_owes=money_user_owes,
        cash_balance=cash_balance,
        net_position=net_position
    )
