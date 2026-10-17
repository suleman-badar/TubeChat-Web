from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import text

from app.dependencies.db_dependency import AsyncSessionLocal

GUEST_MSG_LIMIT = 20  # max messages per 24 hours per IP for guests
GUEST_VIDEO_LIMIT = 2  # max videos indexed per 24 hours per IP for guests
WINDOW_24H = 86400  # 24 hours in seconds


async def _check_and_record_limit(
    ip: str,
    event_type: str,
    limit: int,
    error_code: str,
    error_msg: str,
) -> None:
    if not ip:
        return

    cutoff = datetime.now(timezone.utc) - timedelta(seconds=WINDOW_24H)
    lock_key = f"guest-rate-limit:{event_type}:{ip}"

    async with AsyncSessionLocal() as db:
        async with db.begin():
            await db.execute(
                text("SELECT pg_advisory_xact_lock(hashtext(:lock_key))"),
                {"lock_key": lock_key},
            )
            await db.execute(
                text(
                    "DELETE FROM guest_rate_limit_events "
                    "WHERE event_type = :event_type AND created_at < :cutoff"
                ),
                {"event_type": event_type, "cutoff": cutoff},
            )
            result = await db.execute(
                text(
                    "SELECT COUNT(*) FROM guest_rate_limit_events "
                    "WHERE ip_address = :ip AND event_type = :event_type "
                    "AND created_at >= :cutoff"
                ),
                {"ip": ip, "event_type": event_type, "cutoff": cutoff},
            )
            if result.scalar_one() >= limit:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "code": error_code,
                        "message": error_msg,
                        "upgrade_required": True,
                    },
                )

            await db.execute(
                text(
                    "INSERT INTO guest_rate_limit_events "
                    "(ip_address, event_type) VALUES (:ip, :event_type)"
                ),
                {"ip": ip, "event_type": event_type},
            )


async def check_and_record_message_limit(ip: str) -> None:
    await _check_and_record_limit(
        ip,
        "message",
        GUEST_MSG_LIMIT,
        "GUEST_MSG_RATE_LIMIT_EXCEEDED",
        f"Anonymous trial limit reached ({GUEST_MSG_LIMIT} messages per 24 hours). Please log in or create a registered account to continue chatting.",
    )


async def check_and_record_video_limit(ip: str) -> None:
    await _check_and_record_limit(
        ip,
        "video",
        GUEST_VIDEO_LIMIT,
        "GUEST_VIDEO_RATE_LIMIT_EXCEEDED",
        f"Anonymous video indexing limit reached ({GUEST_VIDEO_LIMIT} videos per 24 hours). Please sign up or log in to index more videos.",
    )
