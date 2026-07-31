# app/backfill.py
import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.dependencies.db_dependency import AsyncSessionLocal
from app.services.video_service import index_video
from sqlalchemy import select
from app.database.models.video_model import Video

from app.services.vector_store import initialize_vector_store


async def backfill():
    initialize_vector_store()
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Video))
        videos = res.scalars().all()
        for video in videos:
            url = f"https://www.youtube.com/watch?v={video.youtube_id}"
            try:
                await index_video(url, db)
                print(f"Re-indexed {video.youtube_id}")
            except Exception as e:
                print(f"Failed {video.youtube_id}: {e}")


if __name__ == "__main__":
    asyncio.run(backfill())
