import logging
import os
from types import SimpleNamespace

import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

logger = logging.getLogger(__name__)
SUPADATA_TRANSCRIPT_URL = "https://api.supadata.ai/v1/youtube/transcript"


def _supadata_transcript(youtube_id: str):
    api_key = os.getenv("SUPADATA_API_KEY")
    if not api_key:
        return None

    response = httpx.get(
        SUPADATA_TRANSCRIPT_URL,
        params={"videoId": youtube_id, "text": "true"},
        headers={"x-api-key": api_key},
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload.get("content", payload.get("transcript", payload.get("text")))

    if isinstance(content, str) and content.strip():
        return [SimpleNamespace(text=content)]

    if isinstance(content, list):
        snippets = []
        for item in content:
            text = item if isinstance(item, str) else item.get("text")
            if isinstance(text, str) and text.strip():
                snippets.append(SimpleNamespace(text=text))
        if snippets:
            return snippets

    raise ValueError("Supadata returned no transcript content")


def fetch_transcript(youtube_id: str):
    """Fetch from Supadata first, then fall back to direct YouTube access."""
    try:
        transcript = _supadata_transcript(youtube_id)
        if transcript:
            logger.info("Fetched transcript for %s through Supadata", youtube_id)
            return transcript
    except Exception:
        logger.warning(
            "Supadata transcript request failed for %s; trying YouTube fallback",
            youtube_id,
            exc_info=True,
        )

    api = YouTubeTranscriptApi()
    return api.fetch(youtube_id)


# no need to create Document obj for each snippet, coz each snipper is already very small.
# It will not create any meaningful chunk. Instead, we will create # a single Document object
# for the entire transcript# and then split it into chunks using the RecursiveCharacterTextSplitter.


def split_transcript(transcript, youtube_id: str) -> list[Document]:
    """Split transcript into chunks."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=300)
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
