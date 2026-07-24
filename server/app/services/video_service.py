from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException


from app.database.crud.video_crud import create_video, get_video_by_youtube_id
from app.services.transcript import get_transcript_chunks
from app.services.vector_store import index_transcript
from app.services.youtube import extract_youtube_id
from app.database.models.video_model import Video
from app.database.models.chat_session_model import ChatSession
from app.database.models.user_model import User

from app.schemas.video_schema import RecentChatSessionResponse


import logging

logger = logging.getLogger(__name__)


async def index_video(url: str, db: AsyncSession) -> Video:
    """
    Index a YouTube video.

    Workflow:
    1. Extract YouTube ID
    2. Check if already indexed
    3. Fetch transcript & chunk it
    4. Store embeddings in Chroma
    5. Store metadata in PostgreSQL
    """
    youtube_id = extract_youtube_id(url)
    if not youtube_id:
        raise ValueError("Invalid YouTube URL")

    logging.info(f"Indexing video with YouTube ID: {youtube_id}")

    # Check if the video is already indexed
    existing_video = get_video_by_youtube_id(db, youtube_id)
    if existing_video:
        logger.info(f"Video {youtube_id} already indexed.")
        return existing_video

    chunks = get_transcript_chunks(youtube_id)
    if not chunks:
        raise ValueError("Transcript not found or empty")

    await index_transcript(chunks)

    video = create_video(
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
