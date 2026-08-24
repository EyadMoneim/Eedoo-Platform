from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, TokenResponse, GoogleAuthRequest
from app.services.auth import (
    register_user,
    authenticate_user,
    google_authenticate,
    create_access_token,
    create_refresh_token
)

router = APIRouter()

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, # Should be true in production, False if no HTTPS locally
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )

@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserCreate, 
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user = await register_user(db, user_data)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    set_refresh_cookie(response, refresh_token)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    set_refresh_cookie(response, refresh_token)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request_data: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user = await google_authenticate(db, request_data.code)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    set_refresh_cookie(response, refresh_token)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}
