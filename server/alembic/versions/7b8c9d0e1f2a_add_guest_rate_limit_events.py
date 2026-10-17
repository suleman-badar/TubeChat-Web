"""add persistent guest rate limit events

Revision ID: 7b8c9d0e1f2a
Revises: 4c322d0a2514
Create Date: 2026-10-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "7b8c9d0e1f2a"
down_revision: Union[str, Sequence[str], None] = "4c322d0a2514"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "guest_rate_limit_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("ip_address", sa.String(length=255), nullable=False),
        sa.Column("event_type", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_guest_rate_limit_events_lookup",
        "guest_rate_limit_events",
        ["ip_address", "event_type", "created_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_guest_rate_limit_events_lookup",
        table_name="guest_rate_limit_events",
    )
    op.drop_table("guest_rate_limit_events")
