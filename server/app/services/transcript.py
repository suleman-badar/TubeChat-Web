from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def fetch_transcript(youtube_id: str):
    """Fetch transcript from YouTube for a given YouTube ID."""
    api = YouTubeTranscriptApi()
    transcript = api.fetch(youtube_id)
    return transcript


def split_transcript(transcript, youtube_id: str) -> list[Document]:
    """Split transcript into chunks."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    full_text = " ".join(snippet.text for snippet in transcript)
    doc = [
        Document(
            page_content=full_text,
            metadata={
                "youtube_id": youtube_id,
            },
        )
    ]
    chunks = splitter.split_documents(doc)
    return chunks


def get_transcript_chunks(youtube_id: str) -> list[Document]:
    """Fetch and split transcript for a given YouTube ID."""
    raw_transcript = fetch_transcript(youtube_id)
    chunks = split_transcript(raw_transcript, youtube_id)
    return chunks
