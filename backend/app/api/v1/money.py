from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.money import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    PersonCreate, PersonUpdate, PersonResponse, PersonSummary,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    MoneySummary, PaginatedResponse
)

from app.services.money import transaction_service, person_service, category_service, summary_service

router = APIRouter()

# --- Transactions ---

@router.get("/transactions", response_model=PaginatedResponse[TransactionResponse])
async def get_transactions(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    type: Optional[str] = None,
    category_id: Optional[UUID] = None,
    person_id: Optional[UUID] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await transaction_service.get_transactions(db, current_user.id, page, size, type, category_id, person_id, search)

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await transaction_service.create_transaction(db, current_user.id, data)

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await transaction_service.get_transaction(db, current_user.id, transaction_id)

@router.patch("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await transaction_service.update_transaction(db, current_user.id, transaction_id, data)

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await transaction_service.delete_transaction(db, current_user.id, transaction_id)
    return {"message": "Transaction deleted"}

# --- People ---

@router.get("/people", response_model=List[PersonResponse])
async def get_people(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await person_service.get_people(db, current_user.id)

@router.post("/people", response_model=PersonResponse)
async def create_person(
    data: PersonCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await person_service.create_person(db, current_user.id, data)

@router.get("/people/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await person_service.get_person(db, current_user.id, person_id)

@router.patch("/people/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: UUID,
    data: PersonUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await person_service.update_person(db, current_user.id, person_id, data)

@router.delete("/people/{person_id}")
async def delete_person(
    person_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await person_service.delete_person(db, current_user.id, person_id)
    return {"message": "Person deleted"}

@router.get("/people/{person_id}/summary", response_model=PersonSummary)
async def get_person_summary(
    person_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await person_service.get_person_summary(db, current_user.id, person_id)

# --- Categories ---

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await category_service.get_categories(db, current_user.id)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await category_service.create_category(db, current_user.id, data)

@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await category_service.update_category(db, current_user.id, category_id, data)

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await category_service.delete_category(db, current_user.id, category_id)
    return {"message": "Category deleted"}

# --- Summary ---

@router.get("/summary", response_model=MoneySummary)
async def get_money_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await summary_service.get_money_summary(db, current_user.id)
