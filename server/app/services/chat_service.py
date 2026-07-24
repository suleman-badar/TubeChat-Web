from uuid import UUID
from sqlalchemy import func, select

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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


async def send_message(
    request: ChatRequest,
    db: AsyncSession,
    user: User | None = None,
) -> ChatResponse:
    try:
        # ---------------------------------------------------------
        # Existing chat
        # ---------------------------------------------------------

        if request.session_id:
            res = await db.execute(
                select(ChatSession)
                .options(selectinload(ChatSession.video))
                .where(ChatSession.id == request.session_id)
            )
            session = res.scalar_one_or_none()

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
            res = await db.execute(
                select(Video).where(Video.youtube_id == request.youtube_id)
            )
            video = res.scalar_one_or_none()

            if video is None:
                raise HTTPException(status_code=404, detail="Video not found.")
            session = ChatSession(
                user_id=user.id if user else None,
                video_id=video.id,
            )

            db.add(session)
            await db.flush()  # Ensure session.id is available before adding messages

            # db.commit()
            # db.refresh(session)
        # ---------------------------------------------------------
        # RAG
        # ---------------------------------------------------------
        chat_history = await get_chat_history(session.id, db)
        retriever = get_retriever(video.youtube_id)

        rag_pipeline, _, _ = create_rag_pipeline(retriever)
        answer = await rag_pipeline.ainvoke(
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
        await db.commit()

        return ChatResponse(
            session_id=session.id,
            answer=answer.content,
        )

    except HTTPException:
        await db.rollback()
        raise

    except Exception:
        await db.rollback()
        raise


async def get_chat_session(
    session_id: UUID,
    db: AsyncSession,
) -> ChatSessionResponse:

    res = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages), selectinload(ChatSession.video))
        .where(ChatSession.id == session_id)
    )
    session = res.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    return ChatSessionResponse(
        session=ChatSessionInfo(
            id=session.id,
            youtube_id=session.video.youtube_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
        ),
        messages=[
            MessageResponse.model_validate(message) for message in session.messages
        ],
    )


async def get_recent_chat_sessions(
    db: AsyncSession,
    user: User | None = None,
) -> list[RecentChatSessionResponse]:

    if user is None:
        return []

    res = await db.execute(
        select(
            ChatSession.id,
            ChatSession.title,
            ChatSession.updated_at,
            Video.youtube_id,
        )
        .join(Video, ChatSession.video_id == Video.id)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(10)
    )

    rows = res.all()

    return [
        RecentChatSessionResponse(
            id=row.id,
            title=row.title,
            youtube_id=row.youtube_id,
            updated_at=row.updated_at,
        )
        for row in rows
    ]
