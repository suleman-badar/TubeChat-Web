from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
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
def send_message_route(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    return send_message(request, db)


@router.get(
    "/chat-sessions/recent",
    response_model=list[RecentChatSessionResponse],
)
def recent_sessions(
    db: Session = Depends(get_db),
):
    return get_recent_chat_sessions(db)


@router.get(
    "/chat-sessions/{session_id}",
    response_model=ChatSessionResponse,
)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
):
    return get_chat_session(session_id, db)
