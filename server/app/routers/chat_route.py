from uuid import UUID
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.dependencies.db_dependency import get_db
from app.dependencies.auth_dependency import get_optional_user
from app.dependencies.rag_dependency import get_llm, get_prompt
from app.database.models.user_model import User
from app.schemas.chat_schema import ChatSessionResponse, ChatResponse, ChatRequest
from app.schemas.video_schema import RecentChatSessionResponse
from app.services.chat_service import (
    stream_message,
    get_chat_session,
    get_recent_chat_sessions,
    validate_limits,
)

router = APIRouter(prefix="/chat", tags=["Chat"])


# @router.get("/")
# def chat():
#     return {"message": "Chat API"}


@router.post("/messages/stream", response_model=ChatResponse)
async def send_stream_route(
    request: ChatRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    llm: ChatOpenAI = Depends(get_llm),
    prompt: ChatPromptTemplate = Depends(get_prompt),
):
    await validate_limits(request, db, user, client_ip=req.client.host)
    return StreamingResponse(
        stream_message(request, db, user=user, llm=llm, prompt=prompt),
        media_type="application/x-ndjson",
    )


@router.get(
    "/recent-sessions",
    response_model=list[RecentChatSessionResponse],
)
async def recent_sessions(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return await get_recent_chat_sessions(db, user=user)


@router.get(
    "/chat-sessions/{session_id}",
    response_model=ChatSessionResponse,
)
async def get_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return await get_chat_session(session_id, db, user=user)
