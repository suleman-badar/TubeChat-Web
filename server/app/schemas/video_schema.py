from pydantic import BaseModel, Field
from datetime import datetime
from datetime import datetime
from uuid import UUID


class IndexVideoRequest(BaseModel):
    video_url: str = Field(
        ...,
        description="YouTube video URL to index",
    )


class IndexVideoResponse(BaseModel):
    id: UUID
    youtube_id: str
    indexed_at: datetime
    session_id: UUID | None = None

    model_config = {"from_attributes": True}


class RecentChatSessionResponse(BaseModel):
    id: UUID
    title: str
    youtube_id: str
    updated_at: datetime

    model_config = {"from_attributes": True}
