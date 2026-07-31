from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, Integer, String, Uuid, func
import uuid
from datetime import datetime

from app.database.base_model import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Paddle identifiers — link our user to Paddle's records

    paddle_customer_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    paddle_subscription_id: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )

    # "free" or "pro" , drives feature gating in your backend
    plan: Mapped[str] = mapped_column(String(20), nullable=False, default="free")

    # Mirrors Paddle's subscription status: active, past_due, canceled, trialing, paused, none
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="none")

    current_period_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # --- Usage tracking for the free tier ---
    videos_indexed_this_period: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    usage_period_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="subscriptions")
