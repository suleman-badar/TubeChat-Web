from langchain_chroma import Chroma
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.message_model import Message, MessageRole


from app.services.rag import get_embeddings

import logging

logger = logging.getLogger(__name__)
vector_store: Chroma | None = None

_COLLECTION_NAME = "youtube_transcripts"
_PERSIST_DIRECTORY = "./chroma_db"


def initialize_vector_store() -> None:
    global vector_store

    if vector_store is not None:
        return

    vector_store = Chroma(
        collection_name=_COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=_PERSIST_DIRECTORY,
    )


def get_vector_store() -> Chroma:
    if vector_store is None:
        raise RuntimeError("Vector store has not been initialized.")

    return vector_store


async def index_transcript(chunks: list[Document]) -> None:
    """Index a video transcript in the Chroma vector store."""

    if not chunks:
        raise ValueError("No transcript chunks to index.")

    vector_store = get_vector_store()
    await vector_store.aadd_documents(chunks)

    logger.info(f"Indexed {len(chunks)} transcript chunks in Chroma vector store.")


def get_retriever(youtube_id: str) -> VectorStoreRetriever:
    """Return a retriever for a specific YouTube ID."""
    vector_store = get_vector_store()

    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3, "filter": {"youtube_id": youtube_id}},
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
    # print(f"Fetched {messages} ")

    messages.reverse()

    history = []

    for message in messages:
        if message.role == MessageRole.USER:
            history.append(HumanMessage(content=message.content))
        else:
            history.append(AIMessage(content=message.content))

    return history
