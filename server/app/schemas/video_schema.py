from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class RecentChatSessionResponse(BaseModel):
    id: UUID
    title: str
    youtube_id: str
    updated_at: datetime

    model_config = {"from_attributes": True}
