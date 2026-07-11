from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def fetch_transcript(video_id):
    """Fetch transcript from YouTube for a given video ID."""
    api = YouTubeTranscriptApi()
    transcript = api.fetch(video_id)
    return transcript

def split_transcript(transcript, video_id):
    """Split transcript into chunks."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = [
        Document(
            page_content=snippet.text,
            metadata={
                "video_id": video_id,
                "start": snippet.start,
                "duration": snippet.duration,
            },
        )
        for snippet in transcript
    ]
    chunks = splitter.split_documents(docs)
    return chunks

def transcipt(video_id):
    """Fetch and split transcript for a given video ID."""
    transcript = fetch_transcript(video_id)
    chunks = split_transcript(transcript, video_id)
    return chunks
