from app.services.rag import get_embeddings
from langchain_chroma import Chroma


def get_vector_store():
    """Get a Chroma vector store for YouTube transcripts."""
    embeddings = get_embeddings()
    
    vector_store = Chroma(
        collection_name="youtube_transcripts",
        embedding_function=embeddings,
        persist_directory="./chroma_db",
    )
    return vector_store


def index_video(video_id, chunks):
    """Index a video transcript in the Chroma vector store."""
    vector_store = get_vector_store()
    
    existing= vector_store.get(
        where={"video_id": video_id},
        limit=1
    )
    
    if existing["ids"]:
        print(f"Video {video_id} already indexed.")
        return False
    
    print(f"Indexing video {video_id}...")
    vector_store.add_documents(chunks)
    return True


def get_retriever(video_id):
    """Get a retriever for a specific video ID."""
    vector_store = get_vector_store()
    
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": 3,
            "filter": {"video_id": video_id}
        }
    )
    return retriever
        