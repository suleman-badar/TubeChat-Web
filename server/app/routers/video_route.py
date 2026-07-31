from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.user_model import User
from app.dependencies.db_dependency import get_db
from app.services.video_service import index_video_for_user, get_video_chat_sessions
from app.schemas.video_schema import (
    RecentChatSessionResponse,
    IndexVideoRequest,
    IndexVideoResponse,
)
from app.dependencies.auth_dependency import get_current_user, get_optional_user
from app.services.auth_service import create_guest_user, create_jwt_token, is_guest_user
from app.services.rate_limit_service import check_and_record_video_limit

router = APIRouter(prefix="/video", tags=["Videos"])

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


@router.post("/index", response_model=IndexVideoResponse)
async def index(
    request: IndexVideoRequest,
    req: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> IndexVideoResponse:
    user = await get_optional_user(req, db)
    if not user:
        # Before creating a guest user, verify their IP rate limits
        check_and_record_video_limit(req.client.host)
        user = await create_guest_user(db)
        token = create_jwt_token(user.id)
        _set_auth_cookie(response, token)
    elif is_guest_user(user.email):
        # Existing guest user - enforce IP rate limiting
        check_and_record_video_limit(req.client.host)

    video, session = await index_video_for_user(request.video_url, user, db)
    return IndexVideoResponse(
        id=video.id,
        youtube_id=video.youtube_id,
        indexed_at=video.indexed_at,
        session_id=session.id,
    )


@router.get(
    "/{youtube_id}/chat-sessions",
    response_model=list[RecentChatSessionResponse],
)
async def get_video_sessions(
    youtube_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_video_chat_sessions(youtube_id, current_user, db)

