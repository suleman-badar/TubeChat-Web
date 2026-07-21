from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class RecentChatSessionResponse(BaseModel):
    id: UUID
    title: str
    updated_at: datetime

    model_config = {"from_attributes": True}
