from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.subscription_model import Subscription


async def get_billing_config(current_user, db: AsyncSession):
    res = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = res.scalar_one_or_none()

    if not subscription:
        subscription = Subscription(user_id=current_user.id, plan="free", status="none")
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    return {
        "plan": subscription.plan,
        "status": subscription.status,
    }
