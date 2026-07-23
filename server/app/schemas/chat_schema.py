from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field

# ==========================================================
# Request Schemas
# ==========================================================


class ChatRequest(BaseModel):
    youtube_id: Optional[str] = Field(
        default=None,
        description="Required when starting a new conversation.",
    )

    session_id: Optional[UUID] = Field(
        default=None,
        description="Required when continuing an existing conversation.",
    )

    question: str = Field(
        ...,
        description="The user's question.",
    )


# ==========================================================
# Response Schemas
# ==========================================================


class ChatResponse(BaseModel):
    session_id: UUID
    answer: str


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class MessageResponse(BaseModel):
    id: UUID
    role: MessageRole
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ChatSessionInfo(BaseModel):
    id: UUID
    youtube_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ChatSessionResponse(BaseModel):
    session: ChatSessionInfo
    messages: list[MessageResponse]


