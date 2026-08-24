from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException
from uuid import UUID

from app.models.money import Person, Transaction
from app.schemas.money import PersonCreate, PersonUpdate, PersonSummary, TransactionType
from decimal import Decimal

async def get_people(db: AsyncSession, user_id: UUID) -> List[Person]:
    result = await db.execute(select(Person).where(Person.user_id == user_id).order_by(Person.name))
    return list(result.scalars().all())

async def get_person(db: AsyncSession, user_id: UUID, person_id: UUID) -> Person:
    result = await db.execute(select(Person).where(Person.user_id == user_id, Person.id == person_id))
    person = result.scalars().first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

async def create_person(db: AsyncSession, user_id: UUID, data: PersonCreate) -> Person:
    new_person = Person(
        user_id=user_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        notes=data.notes
    )
    db.add(new_person)
    await db.commit()
    await db.refresh(new_person)
    return new_person

async def update_person(db: AsyncSession, user_id: UUID, person_id: UUID, data: PersonUpdate) -> Person:
    person = await get_person(db, user_id, person_id)
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(person, key, value)
        
    await db.commit()
    await db.refresh(person)
    return person

async def delete_person(db: AsyncSession, user_id: UUID, person_id: UUID):
    person = await get_person(db, user_id, person_id)
    await db.delete(person)
    await db.commit()

async def get_person_summary(db: AsyncSession, user_id: UUID, person_id: UUID) -> PersonSummary:
    person = await get_person(db, user_id, person_id)
    
    result = await db.execute(
        select(Transaction.type, func.sum(Transaction.amount))
        .where(Transaction.user_id == user_id, Transaction.person_id == person_id)
        .group_by(Transaction.type)
    )
    
    totals = {row[0]: Decimal(row[1] or 0) for row in result.all()}
    
    total_lent = totals.get(TransactionType.LENT_TO_PERSON.value, Decimal(0))
    total_received = totals.get(TransactionType.RECEIVED_FROM_PERSON.value, Decimal(0))
    total_borrowed = totals.get(TransactionType.BORROWED_FROM_PERSON.value, Decimal(0))
    total_repaid = totals.get(TransactionType.REPAID_TO_PERSON.value, Decimal(0))
    
    # Positive means they owe us, negative means we owe them
    current_balance = (total_lent - total_received) - (total_borrowed - total_repaid)
    
    return PersonSummary(
        person=person,
        total_lent=total_lent,
        total_received=total_received,
        total_borrowed=total_borrowed,
        total_repaid=total_repaid,
        current_balance=current_balance
    )
