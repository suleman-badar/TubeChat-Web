from sqlalchemy import select, text, func

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.database.models.subscription_model import Subscription


from app.database.crud.video_crud import (
    create_video,
    is_video_indexed_in_postgres,
    is_video_indexed_in_vector_store,
)
from app.services.transcript import get_transcript_chunks
from app.services.vector_store import (
    _COLLECTION_NAME,
    index_transcript,
)
from app.services.youtube import extract_youtube_id
from app.database.models.video_model import Video
from app.database.models.chat_session_model import ChatSession
from app.database.models.user_model import User

from app.schemas.video_schema import RecentChatSessionResponse
from app.services.auth_service import is_guest_user


import logging

logger = logging.getLogger(__name__)


async def index_video(url: str, db: AsyncSession) -> Video:
    """
    Index a YouTube video.

    Workflow:
    1. Extract YouTube ID
    2. Check if already indexed
    3. Fetch transcript & chunk it
    4. Store embeddings in PGVector
    5. Store metadata in PostgreSQL
    """
    youtube_id = extract_youtube_id(url)
    if not youtube_id:
        raise ValueError("Invalid YouTube URL")

    logging.info(f"Indexing video with YouTube ID: {youtube_id}")

    # Check if the video is already indexed
    index_in_postgres = await is_video_indexed_in_postgres(db, youtube_id)
    index_in_vector_store = await is_video_indexed_in_vector_store(db, youtube_id)

    if index_in_postgres and index_in_vector_store:
        logger.info(f"Video {youtube_id} already indexed.")
        return index_in_postgres

    if index_in_postgres and not index_in_vector_store:
        await db.execute(
            text("""
            DELETE FROM langchain_pg_embedding e
            USING langchain_pg_collection c
            WHERE e.collection_id = c.uuid
              AND c.name = :collection_name
              AND e.cmetadata->>'youtube_id' = :youtube_id
        """),
            {"collection_name": _COLLECTION_NAME, "youtube_id": youtube_id},
        )
        await db.commit()

    chunks = get_transcript_chunks(youtube_id)
    if not chunks:
        raise ValueError("Transcript not found or empty")

    await index_transcript(chunks)

    # Only create a new Postgres row if one does not already exist
    # covers the drift case where PGVector was wiped but Postgres wasn't
    if index_in_postgres:
        logger.info(f"Re-indexed vectors for existing video {youtube_id}.")
        return index_in_postgres

    video = await create_video(
        db,
        youtube_id=youtube_id,
    )
    logger.info(f"Video {youtube_id} indexed successfully.")
    return video


async def get_video_chat_sessions(
    youtube_id: str,
    current_user: User,
    db: AsyncSession,
) -> list[RecentChatSessionResponse]:

    # Verify that the video exists
    res = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    video = res.scalar_one_or_none()

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found.",
        )

    # Fetch this user's chat sessions for the video
    res = await db.execute(
        select(
            ChatSession.id,
            ChatSession.title,
            ChatSession.updated_at,
        )
        .where(
            ChatSession.video_id == video.id,
            ChatSession.user_id == current_user.id,
        )
        .order_by(ChatSession.updated_at.desc())
    )

    rows = res.all()

    return [
        RecentChatSessionResponse(
            id=row.id,
            title=row.title,
            youtube_id=video.youtube_id,
            updated_at=row.updated_at,
        )
        for row in rows
    ]


async def index_video_for_user(
    url: str,
    user: User,
    db: AsyncSession,
) -> tuple[Video, ChatSession]:
    # Extract YouTube ID
    youtube_id = extract_youtube_id(url)
    if not youtube_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # 1. Fetch user's subscription
    res = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    sub = res.scalar_one_or_none()
    plan = sub.plan if sub else "free"

    # 2. Check if this is a guest user (email ends with @guest.tubechat.ai)
    is_guest = is_guest_user(user.email)

    # 3. Determine the video limit
    if plan == "pro":
        limit = 15
    else:
        limit = 2

    # 4. Check if the user already has a session for this video
    # First find the video if it exists
    res = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    video = res.scalar_one_or_none()

    session = None
    if video:
        # Check if user has a session for it
        res = await db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user.id, ChatSession.video_id == video.id)
            .limit(1)
        )
        session = res.scalar_one_or_none()

    # 5. If they don't have a session, enforce the limit
    if not session:
        # Count distinct videos the user has sessions for
        res = await db.execute(
            select(func.count(func.distinct(ChatSession.video_id)))
            .where(ChatSession.user_id == user.id)
        )
        count = res.scalar_one_or_none() or 0
        if count >= limit:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "VIDEO_LIMIT_REACHED",
                    "message": f"You have reached the maximum limit of {limit} videos on the {plan} plan. Please upgrade to index more videos.",
                    "upgrade_required": True,
                },
            )

    # 6. Index the video using existing function if it wasn't indexed yet
    if not video:
        video = await index_video(url, db)

    # 7. Create a chat session if one doesn't exist
    if not session:
        session = ChatSession(
            user_id=user.id,
            video_id=video.id,
            title="New Chat",
        )
        db.add(session)
        try:
            await db.commit()
            await db.refresh(session)
        except Exception:
            await db.rollback()
            raise

    return video, session

