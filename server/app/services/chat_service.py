from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models.chat_session_model import ChatSession
from app.database.models.user_model import User
from app.database.models.video_model import Video

from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    ChatSessionInfo,
    ChatSessionResponse,
    MessageResponse,
)
from app.schemas.video_schema import RecentChatSessionResponse

from app.services.vector_store import get_retriever
from app.services.rag import create_rag_pipeline


def send_message(
    request: ChatRequest,
    db: Session,
) -> ChatResponse:

    print("youtube_id:", request.youtube_id)
    print("session_id:", request.session_id)

    # ---------------------------------------------------------
    # Temporary single-user implementation
    # Replace this with current_user after JWT
    # ---------------------------------------------------------

    user = db.query(User).first()

    if user is None:
        raise HTTPException(status_code=500, detail="No user found.")

    # ---------------------------------------------------------
    # Existing chat
    # ---------------------------------------------------------

    if request.session_id:
        session = (
            db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        )
        if session is None:
            raise HTTPException(status_code=404, detail="Chat session not found.")
        video = session.video
    # ---------------------------------------------------------
    # New chat
    # ---------------------------------------------------------
    else:
        if request.youtube_id is None:
            raise HTTPException(
                status_code=400, detail="youtube_id is required for a new chat."
            )
        video = db.query(Video).filter(Video.youtube_id == request.youtube_id).first()
        if video is None:
            raise HTTPException(status_code=404, detail="Video not found.")
        session = ChatSession(
            user_id=user.id,
            video_id=video.id,
        )

        db.add(session)
        db.commit()
        db.refresh(session)
    # ---------------------------------------------------------
    # RAG
    # ---------------------------------------------------------
    retriever = get_retriever(video.youtube_id)
    if retriever is None:
        raise HTTPException(status_code=404, detail="Retriever not found.")
    rag_pipeline, _, _ = create_rag_pipeline(retriever)
    answer = rag_pipeline.invoke(
        {
            "question": request.question,
        }
    )
    return ChatResponse(
        session_id=session.id,
        answer=answer.content,
    )


def get_chat_session(
    session_id: UUID,
    db: Session,
) -> ChatSessionResponse:

    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    return ChatSessionResponse(
        session=ChatSessionInfo.model_validate(session),
        messages=[
            MessageResponse.model_validate(message) for message in session.messages
        ],
    )


def get_recent_chat_sessions(
    db: Session,
) -> list[RecentChatSessionResponse]:
    sessions = (
        db.query(ChatSession).order_by(ChatSession.updated_at.desc()).limit(10).all()
    )
    return [RecentChatSessionResponse.model_validate(session) for session in sessions]
