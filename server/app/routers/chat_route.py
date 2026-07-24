from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db_dependency import get_db
from app.database.models.user_model import User
from app.dependencies.auth_dependency import get_optional_user
from app.schemas.chat_schema import ChatSessionResponse, ChatResponse, ChatRequest
from app.schemas.video_schema import RecentChatSessionResponse
from app.services.chat_service import (
    send_message,
    get_chat_session,
    get_recent_chat_sessions,
)

router = APIRouter(prefix="/chat", tags=["Chat"])


# @router.get("/")
# def chat():
#     return {"message": "Chat API"}


@router.post("/messages", response_model=ChatResponse)
async def send_message_route(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return await send_message(request, db, user=user)


@router.get(
    "/chat-sessions/recent",
    response_model=list[RecentChatSessionResponse],
)
async def recent_sessions(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return await get_recent_chat_sessions(db, user=user)


@router.get(
    "/chat-sessions/{session_id}",
    response_model=ChatSessionResponse,
)
async def get_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await get_chat_session(session_id, db)
