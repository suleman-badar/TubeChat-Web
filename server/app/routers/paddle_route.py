from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db_dependency import get_db
from app.services.paddle_service import handle_paddle_webhook

router = APIRouter(prefix="/paddle", tags=["Paddle"])


@router.post("/webhook")
async def paddle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    paddle_signature: str = Header(None, alias="Paddle-Signature"),
):
    await handle_paddle_webhook(request, db, paddle_signature)
    return {"message": "Paddle webhook received"}
