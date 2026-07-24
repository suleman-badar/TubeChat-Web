from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import bcrypt
import os
import jwt

from dotenv import load_dotenv

from app.database.models.user_model import User
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def create_jwt_token(user_id: UUID) -> str:
    """Create a signed JWT with the user's ID as subject, valid for JWT_EXPIRY_DAYS."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> dict:
    """Decode and validate a JWT. Raises 401 on expiry or invalid signature."""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def register_user(request: UserRegisterRequest, db: AsyncSession) -> User:
    email = request.email
    password = request.password
    confirmPassword = request.confirmPassword

    if password != confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    res = await db.execute(select(User).where(User.email == email))
    existing_user = res.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user = User(email=email, hashed_password=hashed_password)

    db.add(user)
    try:
        await db.commit()
    except:
        await db.rollback()
        raise

    await db.refresh(user)

    return user


async def login_user(request: UserLoginRequest, db: AsyncSession) -> User:
    email = request.email
    password = request.password

    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user


async def get_user_by_id(user_id: UUID, db: AsyncSession) -> User:
    """Fetch a user by their UUID. Used by the /me endpoint."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
