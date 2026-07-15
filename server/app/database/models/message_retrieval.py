from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, JSON, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, Text, Uuid, func
  

if TYPE_CHECKING:
    from app.database.models.message import Message


class MessageRetrieval(Base):
    __tablename__ = "message_retrievals"

    message_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("messages.id", ondelete="CASCADE"),
        primary_key=True,
    )
    retrieved_context: Mapped[str] = mapped_column(Text, nullable=False)
    retrieved_sources: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    message: Mapped["Message"] = relationship(back_populates="retrieval")
    
