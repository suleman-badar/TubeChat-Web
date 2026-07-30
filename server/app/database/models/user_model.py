from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, func, Uuid, DateTime

from app.database.base_model import Base
from app.database.models.chat_session_model import ChatSession
from app.database.models.subscription_model import Subscription

import uuid
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    subscriptions: Mapped["Subscription"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
