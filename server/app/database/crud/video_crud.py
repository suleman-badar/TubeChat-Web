from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.database.models.video_model import Video
from app.services.vector_store import _COLLECTION_NAME


async def is_video_indexed_in_postgres(
    db: AsyncSession, youtube_id: str
) -> Video | None:
    res = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    return res.scalar_one_or_none()


async def is_video_indexed_in_vector_store(db: AsyncSession, youtube_id: str) -> bool:

    result = await db.execute(
        text("""
            SELECT 1 FROM langchain_pg_embedding e
            JOIN langchain_pg_collection c ON e.collection_id = c.uuid
            WHERE c.name = :collection_name
              AND e.cmetadata->>'youtube_id' = :youtube_id
            LIMIT 1
             """),
        {"collection_name": _COLLECTION_NAME, "youtube_id": youtube_id},
    )
    return result.first() is not None


async def create_video(
    db: AsyncSession,
    **kwargs,
) -> Video:

    video = Video(**kwargs)
    db.add(video)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(video)

    return video
