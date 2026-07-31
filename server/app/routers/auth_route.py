from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.user_model import User
from app.schemas.auth_schema import (
    UserRegisterRequest,
    UserLoginRequest,
    UserMeResponse,
)
from app.services.auth_service import register_user, login_user, create_jwt_token, create_guest_user, is_guest_user
from app.dependencies.auth_dependency import get_current_user, get_optional_user
from app.dependencies.db_dependency import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def _set_auth_cookie(response: Response, token: str):
    """Set the JWT as an httpOnly, Secure, SameSite=Lax cookie."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


@router.post("/register")
async def register(
    request: UserRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await register_user(request, db)
    token = create_jwt_token(user.id)
    _set_auth_cookie(response, token)
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(
    request: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await login_user(request, db)
    token = create_jwt_token(user.id)
    _set_auth_cookie(response, token)
    return {"message": "Login successful"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserMeResponse)
async def me(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await get_optional_user(request, db)
    if not user:
        user = await create_guest_user(db)
        token = create_jwt_token(user.id)
        _set_auth_cookie(response, token)
    return UserMeResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        is_guest=is_guest_user(user.email),
    )

