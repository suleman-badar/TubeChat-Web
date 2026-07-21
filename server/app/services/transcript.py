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
    docs = [
        Document(
            page_content=snippet.text,
            metadata={
                "youtube_id": youtube_id,
                "start": snippet.start,
                "duration": snippet.duration,
            },
        )
        for snippet in transcript
    ]
    chunks = splitter.split_documents(docs)
    return chunks


def get_transcript_chunks(youtube_id: str) -> list[Document]:
    """Fetch and split transcript for a given YouTube ID."""
    raw_transcript = fetch_transcript(youtube_id)
    chunks = split_transcript(raw_transcript, youtube_id)
    return chunks
