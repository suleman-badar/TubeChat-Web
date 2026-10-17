from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request

from app.dependencies.security_dependency import require_csrf
from app.schemas.chat_schema import ChatRequest
from app.services.chat_service import _require_session_access


def make_request(
    cookie_token: str | None = None, header_token: str | None = None
) -> Request:
    headers = []
    if cookie_token is not None:
        headers.append((b"cookie", f"csrf_token={cookie_token}".encode()))
    if header_token is not None:
        headers.append((b"x-csrf-token", header_token.encode()))
    return Request({"type": "http", "method": "POST", "path": "/", "headers": headers})


def test_question_length_is_bounded():
    ChatRequest(question="x" * 4000)

    with pytest.raises(ValidationError):
        ChatRequest(question="x" * 4001)


def test_csrf_requires_matching_cookie_and_header():
    with pytest.raises(HTTPException) as missing:
        require_csrf(make_request())
    assert missing.value.status_code == 403

    with pytest.raises(HTTPException) as mismatched:
        require_csrf(make_request("cookie-token", "different-token"))
    assert mismatched.value.status_code == 403

    assert require_csrf(make_request("same-token", "same-token")) is None


def test_only_session_owner_can_access_session():
    owner_id = uuid4()
    owner = SimpleNamespace(id=owner_id, email="owner@example.com")
    owned_session = SimpleNamespace(user_id=owner_id)

    assert _require_session_access(owned_session, owner) is None

    other_user = SimpleNamespace(id=uuid4(), email="other@example.com")
    with pytest.raises(HTTPException) as denied:
        _require_session_access(owned_session, other_user)
    assert denied.value.status_code == 404


def test_guest_cannot_access_session():
    guest = SimpleNamespace(id=uuid4(), email="guest@example.com@guest.tubechat.ai")
    guest_session = SimpleNamespace(user_id=guest.id)

    with pytest.raises(HTTPException) as denied:
        _require_session_access(guest_session, guest)
    assert denied.value.status_code == 404

    with pytest.raises(HTTPException) as anonymous:
        _require_session_access(guest_session, None)
    assert anonymous.value.status_code == 404
