from uuid import UUID
import json
from sqlalchemy import func, select
from typing import AsyncGenerator

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models.chat_session_model import ChatSession
from app.database.models.user_model import User
from app.database.models.video_model import Video
from app.database.models.subscription_model import Subscription
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
from app.services.auth_service import is_guest_user


async def validate_limits(
    request: ChatRequest,
    db: AsyncSession,
    user: User | None = None,
    client_ip: str | None = None,
):
    # Enforce IP-based rate limit for guest users to prevent credit-burning abuse
    is_guest = True
    if user:
        is_guest = is_guest_user(user.email)
    
    if is_guest and client_ip:
        from app.services.rate_limit_service import check_and_record_message_limit
        check_and_record_message_limit(client_ip)

    if request.session_id:
        res = await db.execute(
            select(ChatSession)
            .options(selectinload(ChatSession.video))
            .where(ChatSession.id == request.session_id)
        )
        session = res.scalar_one_or_none()

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Stream Chat session not found.",
            )

        res = await db.execute(
            select(func.count(Message.id)).where(
                Message.session_id == session.id, Message.role == MessageRole.USER
            )
        )
        no_of_messages = res.scalar_one_or_none() or 0

        is_guest = True
        plan = "free"
        if user:
            is_guest = is_guest_user(user.email)
            res = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id)
            )
            subscription = res.scalar_one_or_none()
            plan = subscription.plan if subscription else "free"

        if is_guest:
            limit = 8
        elif plan == "free":
            limit = 15
        else:
            limit = 100

        if no_of_messages >= limit:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "MESSAGE_LIMIT_REACHED",
                    "message": f"You have reached the maximum number of messages ({limit}) for this chat session. Please start a new chat session.",
                    "upgrade_required": True,
                },
            )

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

        # Check if the user already has a session for this video
        res = await db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == (user.id if user else None))
            .where(ChatSession.video_id == video.id)
            .limit(1)
        )
        existing_sess = res.scalar_one_or_none()

        if not existing_sess:
            # Fetch subscription plan
            is_guest = True
            plan = "free"
            if user:
                is_guest = is_guest_user(user.email)
                res = await db.execute(
                    select(Subscription).where(Subscription.user_id == user.id)
                )
                subscription = res.scalar_one_or_none()
                plan = subscription.plan if subscription else "free"

            if plan == "pro":
                limit = 15
            else:
                limit = 2

            # Count distinct videos the user has sessions for
            res = await db.execute(
                select(func.count(func.distinct(ChatSession.video_id))).where(
                    ChatSession.user_id == (user.id if user else None)
                )
            )
            count = res.scalar_one_or_none() or 0
            if count >= limit:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "code": "VIDEO_LIMIT_REACHED",
                        "message": f"You have reached the maximum limit of {limit} videos on the {plan} plan. Please upgrade to chat with more videos.",
                        "upgrade_required": True,
                    },
                )


async def stream_message(
    request: ChatRequest,
    db: AsyncSession,
    llm: BaseChatModel,
    prompt: ChatPromptTemplate,
    user: User | None = None,
) -> AsyncGenerator[str, None]:

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
            raise HTTPException(
                status_code=404,
                detail="Stream Chat session not found.",
            )
        video = session.video

    # ---------------------------------------------------------
    # New chat
    # ---------------------------------------------------------
    else:
        res = await db.execute(
            select(Video).where(Video.youtube_id == request.youtube_id)
        )
        video = res.scalar_one_or_none()

        if video is None:
            raise HTTPException(status_code=404, detail="Video not found.")

        title = request.question.strip()
        if len(title) > 20:
            title = title[:57].rsplit(" ", 1)[0] + "..."

        session = ChatSession(
            user_id=user.id if user else None,
            video_id=video.id,
            title=title if title else "New Chat",
        )

        db.add(session)
        await db.flush()  # Ensure session.id is available before adding messages

    # Send the session_id first so the client knows which session this belongs to
    # (important for new chats, where the client didn't have a session_id yet)
    yield json.dumps({"type": "session", "session_id": str(session.id)}) + "\n"

    # db.commit()
    # db.refresh(session)
    # ---------------------------------------------------------
    # RAG
    # ---------------------------------------------------------
    chat_history = await get_chat_history(session.id, db)
    retriever = get_retriever(video.youtube_id)
    rag_pipeline = create_rag_pipeline(retriever, llm, prompt)

    full_answer = ""

    try:
        async for chunk in rag_pipeline.astream(
            {"question": request.question, "chat_history": chat_history}
        ):
            token = chunk.content
            if token:
                full_answer += token
                yield json.dumps({"type": "answer", "content": token}) + "\n"
    except Exception:
        await db.rollback()
        yield json.dumps(
            {
                "type": "error",
                "content": "Something went wrong generating the response.",
            }
        ) + "\n"
        raise

    user_message = Message(
        session_id=session.id,
        role=MessageRole.USER,
        content=request.question,
    )

    assistant_message = Message(
        session_id=session.id,
        role=MessageRole.ASSISTANT,
        content=full_answer,
    )

    db.add(user_message)
    db.add(assistant_message)
    session.updated_at = func.now()  # Update the session's updated_at timestamp\
    # print("COMMITTING SESSION", session.id)
    await db.commit()

    yield json.dumps({"type": "done"}) + "\n"


async def get_chat_session(
    session_id: UUID,
    db: AsyncSession,
    user: User | None = None,
) -> ChatSessionResponse:

    res = await db.execute(
        select(ChatSession)
        .options(
            selectinload(ChatSession.messages),
            selectinload(ChatSession.video),
            selectinload(ChatSession.user),
        )
        .where(ChatSession.id == session_id)
    )
    session = res.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    is_guest = False
    if user:
        is_guest = is_guest_user(user.email)
    elif session.user:
        is_guest = is_guest_user(session.user.email)

    messages = []
    if not is_guest:
        messages = [
            MessageResponse.model_validate(message) for message in session.messages
        ]

    return ChatSessionResponse(
        session=ChatSessionInfo(
            id=session.id,
            youtube_id=session.video.youtube_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
        ),
        messages=messages,
    )


async def get_recent_chat_sessions(
    db: AsyncSession,
    user: User | None = None,
) -> list[RecentChatSessionResponse]:

    if user is None or is_guest_user(user.email):
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
