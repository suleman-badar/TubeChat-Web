from collections.abc import Generator
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.database.database import engine

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
