import time
from collections import defaultdict
from fastapi import HTTPException

# In-memory stores: ip -> list of timestamps
_message_limits = defaultdict(list)
_video_limits = defaultdict(list)

# Limits configuration
GUEST_MSG_LIMIT = 20    # max messages per 24 hours per IP for guests
GUEST_VIDEO_LIMIT = 2   # max videos indexed per 24 hours per IP for guests
WINDOW_24H = 86400      # 24 hours in seconds


def check_ip_rate_limit(ip: str, store: dict, limit: int, window: int, error_code: str, error_msg: str):
    if not ip:
        return
    now = time.time()
    # Clean up old timestamps outside the window
    store[ip] = [t for t in store[ip] if now - t < window]
    
    if len(store[ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail={
                "code": error_code,
                "message": error_msg,
                "upgrade_required": True
            }
        )


def record_ip_request(ip: str, store: dict):
    if not ip:
        return
    store[ip].append(time.time())


def check_and_record_message_limit(ip: str):
    check_ip_rate_limit(
        ip,
        _message_limits,
        GUEST_MSG_LIMIT,
        WINDOW_24H,
        "GUEST_MSG_RATE_LIMIT_EXCEEDED",
        f"Anonymous trial limit reached ({GUEST_MSG_LIMIT} messages per 24 hours). Please log in or create a registered account to continue chatting."
    )
    record_ip_request(ip, _message_limits)


def check_and_record_video_limit(ip: str):
    check_ip_rate_limit(
        ip,
        _video_limits,
        GUEST_VIDEO_LIMIT,
        WINDOW_24H,
        "GUEST_VIDEO_RATE_LIMIT_EXCEEDED",
        f"Anonymous video indexing limit reached ({GUEST_VIDEO_LIMIT} videos per 24 hours). Please sign up or log in to index more videos."
    )
    record_ip_request(ip, _video_limits)
