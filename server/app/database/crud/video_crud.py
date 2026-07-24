from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models.video_model import Video


async def get_video_by_youtube_id(db: AsyncSession, youtube_id: str) -> Video | None:
    res = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
    return res.scalar_one_or_none()


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
