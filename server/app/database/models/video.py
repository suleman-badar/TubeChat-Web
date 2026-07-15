import uuid
from datetime import datetime

from sqlalchemy import String, Uuid, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING


from app.database.base import Base


if TYPE_CHECKING:
    from app.database.models.chat_session import ChatSession



class Video(Base):
    __tablename__ = "videos"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    youtube_id: Mapped[str] = mapped_column(
        String(11),
        unique=True,
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    thumbnail: Mapped[str | None] = mapped_column(
        String(500)
    )

    channel: Mapped[str | None] = mapped_column(
        String(255)
    )

    indexed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    last_opened: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )

    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        back_populates="video"
    )