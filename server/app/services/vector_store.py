from langchain_chroma import Chroma
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_core.documents import Document

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


def index_transcript(chunks: list[Document]) -> None:
    """Index a video transcript in the Chroma vector store."""

    if not chunks:
        raise ValueError("No transcript chunks to index.")

    vector_store = get_vector_store()
    vector_store.add_documents(chunks)

    logger.info(f"Indexed {len(chunks)} transcript chunks in Chroma vector store.")


def get_retriever(youtube_id: str) -> VectorStoreRetriever:
    """Return a retriever for a specific YouTube ID."""
    vector_store = get_vector_store()

    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3, "filter": {"youtube_id": youtube_id}},
    )
