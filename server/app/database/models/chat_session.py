
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, func, Uuid, DateTime

from app.database.base import Base
from app.database.models.message import Message

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.database.models.user import User
    from app.database.models.video import Video


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )
        
    
    video_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        default="New Chat"
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    messages : Mapped[list["Message"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan"
    )
    
    user : Mapped["User"] = relationship(
        back_populates="chat_sessions"
    )
    
    video: Mapped["Video"] = relationship(
        back_populates="chat_sessions"
    )
