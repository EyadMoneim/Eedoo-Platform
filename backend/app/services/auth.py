import httpx
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Password Utilities ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT Utilities ---
def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def create_access_token(user_id: str) -> str:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    return create_token({"sub": str(user_id)}, expires_delta)

def create_refresh_token(user_id: str) -> str:
    expires_delta = timedelta(days=settings.refresh_token_expire_days)
    return create_token({"sub": str(user_id)}, expires_delta)

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None

# --- Core Authentication Services ---
async def register_user(db: AsyncSession, user_data: UserCreate) -> User:
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    if not user.password_hash or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    return user

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    import uuid
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalars().first()

# --- Google OAuth Services ---
async def exchange_google_code(code: str) -> dict:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
    # Exchange auth code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google auth failed: {response.text}"
        )
        
    return response.json()

async def get_google_user_info(access_token: str) -> dict:
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)
        
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get Google user info"
        )
        
    return response.json()

async def google_authenticate(db: AsyncSession, code: str) -> User:
    # 1. Exchange code for Google tokens
    token_data = await exchange_google_code(code)
    google_access_token = token_data.get("access_token")
    
    if not google_access_token:
        raise HTTPException(status_code=400, detail="No access token from Google")
        
    # 2. Get user info from Google
    user_info = await get_google_user_info(google_access_token)
    
    google_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name", "Google User")
    avatar_url = user_info.get("picture")
    
    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Google account missing email or ID")
        
    # 3. Check if user exists by google_id
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalars().first()
    
    if user:
        return user
        
    # 4. If not found by google_id, check by email (Account Linking)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user:
        # Link account
        user.google_id = google_id
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(user)
        return user
        
    # 5. Create new user
    new_user = User(
        name=name,
        email=email,
        google_id=google_id,
        avatar_url=avatar_url,
        password_hash=None # Google users might not have a password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user
