from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.video_service import index_video, get_video_chat_sessions
from app.schemas.video_schema import RecentChatSessionResponse

router = APIRouter(prefix="/video", tags=["Videos"])


class IndexVideoRequest(BaseModel):
    video_url: str = Field(
        ...,
        description="YouTube video URL to index",
    )


class IndexVideoResponse(BaseModel):
    id: UUID
    youtube_id: str
    indexed_at: datetime

    model_config = {"from_attributes": True}


@router.get("/")
def get_video() -> dict[str, str]:
    return {"message": "This endpoint will show the video link form."}


@router.post("/index", response_model=IndexVideoResponse)
def index(
    request: IndexVideoRequest,
    db: Session = Depends(get_db),
) -> IndexVideoResponse:
    video = index_video(request.video_url, db)

    return video


@router.get(
    "/{youtube_id}/chat-sessions",
    response_model=list[RecentChatSessionResponse],
)
def get_video_sessions(
    youtube_id: str,
    db: Session = Depends(get_db),
):
    return get_video_chat_sessions(youtube_id, db)
