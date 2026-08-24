from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, func
from fastapi import HTTPException
from uuid import UUID
import math

from app.models.money import Transaction, Person
from app.schemas.money import TransactionCreate, TransactionUpdate, PaginatedResponse
from app.services.money.person_service import get_person
from app.services.money.category_service import get_category

async def get_transaction(db: AsyncSession, user_id: UUID, transaction_id: UUID) -> Transaction:
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id, Transaction.id == transaction_id)
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

async def get_transactions(
    db: AsyncSession, 
    user_id: UUID, 
    page: int = 1, 
    size: int = 50,
    type: Optional[str] = None,
    category_id: Optional[UUID] = None,
    person_id: Optional[UUID] = None,
    search: Optional[str] = None
) -> PaginatedResponse[Any]:
    query = select(Transaction).where(Transaction.user_id == user_id)
    
    if type:
        query = query.where(Transaction.type == type)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if person_id:
        query = query.where(Transaction.person_id == person_id)
    if search:
        query = query.where(Transaction.description.ilike(f"%{search}%"))
        
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    query = query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    query = query.offset((page - 1) * size).limit(size)
    
    # Eager load relationships for the response if needed, but we'll keep it simple for now
    result = await db.execute(query)
    items = list(result.scalars().all())
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if size > 0 else 0
    )

async def create_transaction(db: AsyncSession, user_id: UUID, data: TransactionCreate) -> Transaction:
    # Validation
    if data.person_id:
        # Validate person belongs to user
        await get_person(db, user_id, data.person_id)
        
    if data.category_id:
        # Validate category belongs to user
        await get_category(db, user_id, data.category_id)
        
    new_tx = Transaction(
        user_id=user_id,
        person_id=data.person_id,
        category_id=data.category_id,
        amount=data.amount,
        currency=data.currency,
        type=data.type,
        description=data.description,
        transaction_date=data.transaction_date
    )
    
    db.add(new_tx)
    await db.commit()
    await db.refresh(new_tx)
    return new_tx

async def update_transaction(db: AsyncSession, user_id: UUID, transaction_id: UUID, data: TransactionUpdate) -> Transaction:
    tx = await get_transaction(db, user_id, transaction_id)
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Validate related entities if they are being updated
    if 'person_id' in update_data and update_data['person_id']:
        await get_person(db, user_id, update_data['person_id'])
        
    if 'category_id' in update_data and update_data['category_id']:
        await get_category(db, user_id, update_data['category_id'])
        
    for key, value in update_data.items():
        setattr(tx, key, value)
        
    # Re-validate type logic
    if tx.type in ["LENT_TO_PERSON", "RECEIVED_FROM_PERSON", "BORROWED_FROM_PERSON", "REPAID_TO_PERSON"]:
        if not tx.person_id:
            raise HTTPException(status_code=400, detail=f"person_id is required for transaction type {tx.type}")
            
    await db.commit()
    await db.refresh(tx)
    return tx

async def delete_transaction(db: AsyncSession, user_id: UUID, transaction_id: UUID):
    tx = await get_transaction(db, user_id, transaction_id)
    await db.delete(tx)
    await db.commit()
