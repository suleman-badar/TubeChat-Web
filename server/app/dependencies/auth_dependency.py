from uuid import UUID

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db_dependency import get_db
from app.database.models.user_model import User
from app.services.auth_service import decode_jwt_token


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the JWT from the access_token cookie.
    Returns the authenticated User or raises 401."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_jwt_token(token)  # raises 401 on invalid/expired
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    res = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None for guests instead of raising 401.
    Used on routes that work for both authenticated users and guests."""
    token = request.cookies.get("access_token")
    if not token:
        return None

    try:
        payload = decode_jwt_token(token)
    except HTTPException:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    res = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = res.scalar_one_or_none()
    return user  # None if user was deleted after token was issued
