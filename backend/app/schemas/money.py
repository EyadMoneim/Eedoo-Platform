from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class TransactionType(str, Enum):
    PERSONAL_EXPENSE = "PERSONAL_EXPENSE"
    INCOME = "INCOME"
    LENT_TO_PERSON = "LENT_TO_PERSON"
    RECEIVED_FROM_PERSON = "RECEIVED_FROM_PERSON"
    BORROWED_FROM_PERSON = "BORROWED_FROM_PERSON"
    REPAID_TO_PERSON = "REPAID_TO_PERSON"

# --- Categories ---
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    icon: Optional[str] = Field(None, max_length=50)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = Field(None, max_length=100)

class CategoryResponse(CategoryBase):
    id: UUID
    user_id: Optional[UUID]
    is_system: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- People ---
class PersonBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    name: Optional[str] = Field(None, max_length=255)

class PersonResponse(PersonBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PersonSummary(BaseModel):
    person: PersonResponse
    total_lent: Decimal
    total_received: Decimal
    total_borrowed: Decimal
    total_repaid: Decimal
    current_balance: Decimal

# --- Transactions ---
from pydantic import BaseModel, Field, model_validator

class TransactionBase(BaseModel):
    person_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    amount: Decimal = Field(..., gt=0)
    currency: str = Field("EGP", max_length=3)
    type: TransactionType
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: date

    @model_validator(mode='after')
    def validate_person_for_type(self) -> 'TransactionBase':
        if self.type in [
            TransactionType.LENT_TO_PERSON, 
            TransactionType.RECEIVED_FROM_PERSON,
            TransactionType.BORROWED_FROM_PERSON, 
            TransactionType.REPAID_TO_PERSON
        ]:
            if not self.person_id:
                raise ValueError(f"person_id is required for transaction type {self.type}")
        return self

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    person_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    type: Optional[TransactionType] = None
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: Optional[date] = None

class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Optional inclusions for rich responses
    person: Optional[PersonResponse] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# --- Summary ---
class MoneySummary(BaseModel):
    total_income: Decimal
    total_personal_expenses: Decimal
    total_lent: Decimal
    total_received_back: Decimal
    total_borrowed: Decimal
    total_repaid: Decimal
    
    money_owed_to_user: Decimal
    money_user_owes: Decimal
    cash_balance: Decimal
    net_position: Decimal

# --- Pagination ---
from typing import TypeVar, Generic
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
