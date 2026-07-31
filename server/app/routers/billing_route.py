import os

from fastapi import APIRouter, Depends

from app.database.models.user_model import User
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.db_dependency import get_db
from app.services.billing_service import get_billing_config

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/config")
async def billing_config(
    current_user: User = Depends(get_current_user), db=Depends(get_db)
):
    data = await get_billing_config(current_user, db)

    return {
        **data,
        "client_side_token": os.environ.get("PADDLE_CLIENT_SIDE_TOKEN"),
        "price_id": os.environ.get("PADDLE_PRO_PRICE_ID"),
        "user_id": str(current_user.id),
        "user_email": current_user.email,
        "environment": os.environ.get("PADDLE_ENVIRONMENT", "sandbox"),
    }
