from uuid import UUID
from sqlalchemy import func

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models.chat_session_model import ChatSession
from app.database.models.user_model import User
from app.database.models.video_model import Video
from app.database.models.message_model import Message, MessageRole

from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    ChatSessionInfo,
    ChatSessionResponse,
    MessageResponse,
)
from app.schemas.video_schema import RecentChatSessionResponse

from app.services.vector_store import get_retriever, get_chat_history
from app.services.rag import create_rag_pipeline


def send_message(
    request: ChatRequest,
    db: Session,
    user: User | None = None,
) -> ChatResponse:
    try:
        # ---------------------------------------------------------
        # Existing chat
        # ---------------------------------------------------------

        if request.session_id:
            session = (
                db.query(ChatSession)
                .filter(ChatSession.id == request.session_id)
                .first()
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
            video = (
                db.query(Video).filter(Video.youtube_id == request.youtube_id).first()
            )
            if video is None:
                raise HTTPException(status_code=404, detail="Video not found.")
            session = ChatSession(
                user_id=user.id if user else None,
                video_id=video.id,
            )

            db.add(session)
            db.flush()  # Ensure session.id is available before adding messages

            # db.commit()
            # db.refresh(session)
        # ---------------------------------------------------------
        # RAG
        # ---------------------------------------------------------
        chat_history = get_chat_history(session.id, db)
        retriever = get_retriever(video.youtube_id)

        rag_pipeline, _, _ = create_rag_pipeline(retriever)
        answer = rag_pipeline.invoke(
            {
                "question": request.question,
                "chat_history": chat_history,
            }
        )

        user_message = Message(
            session_id=session.id,
            role=MessageRole.USER,
            content=request.question,
        )

        assistant_message = Message(
            session_id=session.id,
            role=MessageRole.ASSISTANT,
            content=answer.content,
        )

        db.add(user_message)
        db.add(assistant_message)
        session.updated_at = func.now()  # Update the session's updated_at timestamp
        db.commit()

        return ChatResponse(
            session_id=session.id,
            answer=answer.content,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


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
    user: User | None = None,
) -> list[RecentChatSessionResponse]:
    if user is None:
        return []
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(10)
        .all()
    )
    return [RecentChatSessionResponse.model_validate(session) for session in sessions]
