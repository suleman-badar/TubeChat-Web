from langchain_core.vectorstores import VectorStoreRetriever
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_postgres import PGVector

from app.database.models.message_model import Message, MessageRole
from app.services.rag import build_embeddings

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import os

logger = logging.getLogger(__name__)
vector_store: PGVector | None = None

_COLLECTION_NAME = "youtube_transcripts"


def initialize_vector_store() -> None:
    global vector_store

    if vector_store is not None:
        return

    connection_string = os.environ["DATABASE_URL"].replace(
        "postgresql+asyncpg://", "postgresql+psycopg://"
    )

    vector_store = PGVector(
        collection_name=_COLLECTION_NAME,
        embeddings=build_embeddings(),
        connection=connection_string,
        use_jsonb=True,
        async_mode=True,
    )
    logger.info("PGVector store initialized.")


def get_vector_store() -> PGVector:
    if vector_store is None:
        raise RuntimeError("Vector store has not been initialized.")
    return vector_store


async def index_transcript(chunks: list[Document]) -> None:
    """Index a video transcript in the PGVector vector store."""

    if not chunks:
        raise ValueError("No transcript chunks to index.")

    vector_store = get_vector_store()
    await vector_store.aadd_documents(chunks)

    logger.info(f"Indexed {len(chunks)} transcript chunks in PGVector vector store.")


def get_retriever(youtube_id: str) -> VectorStoreRetriever:
    """Return a retriever for a specific YouTube ID."""
    vector_store = get_vector_store()
    return vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "filter": {"youtube_id": youtube_id}},
    )


async def get_chat_history(
    session_id: str, db: AsyncSession, limit=10
) -> list[BaseMessage]:
    """Fetch chat history for a given session ID."""
    res = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = res.scalars().all()
    messages.reverse()
    history = []

    for message in messages:
        if message.role == MessageRole.USER:
            history.append(HumanMessage(content=message.content))
        else:
            history.append(AIMessage(content=message.content))

    return history
