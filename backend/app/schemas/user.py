from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# Properties to receive via API on login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Properties to receive from Google OAuth
class GoogleAuthRequest(BaseModel):
    code: str

# Properties to return via API
class UserResponse(UserBase):
    id: UUID
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token response schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
