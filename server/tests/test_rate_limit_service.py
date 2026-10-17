import pytest
from fastapi import HTTPException

from app.services import rate_limit_service


class FakeResult:
    def __init__(self, count: int = 0):
        self.count = count

    def scalar_one(self):
        return self.count


class FakeTransaction:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeDatabase:
    def __init__(self, count: int):
        self.count = count
        self.inserted = False

    def begin(self):
        return FakeTransaction()

    async def execute(self, statement, parameters=None):
        if "SELECT COUNT(*)" in str(statement).upper():
            return FakeResult(self.count)
        if "INSERT INTO guest_rate_limit_events" in str(statement):
            self.inserted = True
        return FakeResult()


class FakeSessionFactory:
    def __init__(self, database):
        self.database = database

    def __call__(self):
        factory = self

        class SessionContext:
            async def __aenter__(self):
                return factory.database

            async def __aexit__(self, exc_type, exc, traceback):
                return False

        return SessionContext()


@pytest.mark.asyncio
async def test_message_limit_records_event(monkeypatch):
    database = FakeDatabase(count=0)
    monkeypatch.setattr(
        rate_limit_service,
        "AsyncSessionLocal",
        FakeSessionFactory(database),
    )

    await rate_limit_service.check_and_record_message_limit("203.0.113.10")

    assert database.inserted is True


@pytest.mark.asyncio
async def test_message_limit_rejects_at_limit(monkeypatch):
    database = FakeDatabase(count=rate_limit_service.GUEST_MSG_LIMIT)
    monkeypatch.setattr(
        rate_limit_service,
        "AsyncSessionLocal",
        FakeSessionFactory(database),
    )

    with pytest.raises(HTTPException) as raised:
        await rate_limit_service.check_and_record_message_limit("203.0.113.10")

    assert raised.value.status_code == 429
    assert database.inserted is False
