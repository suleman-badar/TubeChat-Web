from datetime import datetime
from sqlalchemy import select

from fastapi import HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.subscription_model import Subscription
import os
import hmac
import hashlib
import time


def verify_paddle_signature(raw_body: bytes, paddle_signature: str):
    """verify the paddel sugnature header matches our computed hmac signature of the request body using our paddle public key"""

    print("RAW PADDLE_SIGNATURE HEADER:", repr(paddle_signature))
    try:
        parts = dict(p.split("=", 1) for p in paddle_signature.split(";"))
        ts, h1 = parts["ts"], parts["h1"]
    except Exception as e:
        print("PARSE ERROR:", e)
        raise HTTPException(status_code=400, detail="Invalid Paddle Signature header")

    if abs(time.time() - int(ts)) > 300:  # 5 minutes
        raise HTTPException(status_code=400, detail="Signature timestamp is too old")

    signed_payload = f"{ts}:".encode() + raw_body
    computed = hmac.new(
        os.environ["PADDLE_WEBHOOK_SECRET"].encode(), signed_payload, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(computed, h1):
        raise HTTPException(status_code=400, detail="Invalid Paddle Signature")


async def handle_paddle_webhook(
    request: Request,
    db: AsyncSession,
    paddle_signature=Header(None, alias="Paddle-Signature"),
):
    raw_body = await request.body()

    if not paddle_signature:
        raise HTTPException(status_code=400, detail="Missing Paddle Signature header")

    verify_paddle_signature(raw_body, paddle_signature)

    payload = await request.json()
    print("PADDLE WEBHOOK PAYLOAD:", payload)
    event_type = payload.get("event_type")
    data = payload.get("data", {})

    print("EVENT TYPE:", event_type)

    if event_type in ("subscription.created", "subscription.updated"):
        paddle_subscription_id = data.get("id")
        paddle_customer_id = data.get("customer_id")

        status = data.get("status")
        current_period_end = data.get("current_billing_period", {}).get("ends_at")

        our_user_id = data.get("custom_data", {}).get("user_id")
        print("OUR_USER_ID FROM PADDLE:", repr(our_user_id), type(our_user_id))

        # 1. Verify user exists in the database
        from app.database.models.user_model import User
        res_user = await db.execute(
            select(User).where(User.id == our_user_id)
        )
        db_user = res_user.scalar_one_or_none()
        if not db_user:
            print(f"User {our_user_id} not found in database. Skipping webhook.")
            return {"status": "user_not_found"}

        # 2. Check if the purchased item's price ID matches PADDLE_PRO_PRICE_ID
        items = data.get("items", [])
        has_pro_price = False
        pro_price_id = os.environ.get("PADDLE_PRO_PRICE_ID")
        
        for item in items:
            price_id = item.get("price", {}).get("id")
            if price_id == pro_price_id:
                has_pro_price = True
                break

        target_plan = "free"
        if status == "active" and has_pro_price:
            target_plan = "pro"

        # 3. Get or dynamically create the subscription row
        res = await db.execute(
            select(Subscription).where(Subscription.user_id == our_user_id)
        )
        subscription = res.scalar_one_or_none()
        print("SUBSCRIPTION FOUND:", subscription)

        if not subscription:
            subscription = Subscription(user_id=our_user_id, plan="free", status="none")
            db.add(subscription)
            await db.flush()

        # 4. Update the subscription details
        subscription.paddle_subscription_id = paddle_subscription_id
        subscription.paddle_customer_id = paddle_customer_id
        subscription.status = status
        subscription.plan = target_plan
        if current_period_end:
            subscription.current_period_end = datetime.fromisoformat(
                current_period_end.replace("Z", "+00:00")
            )
        await db.commit()

    elif event_type == "subscription.cancelled":
        paddle_subscription_id = data.get("id")

        res = await db.execute(
            select(Subscription).where(
                Subscription.paddle_subscription_id == paddle_subscription_id
            )
        )
        subscription = res.scalar_one_or_none()

        if subscription:
            subscription.status = "canceled"
            subscription.plan = "free"
            await db.commit()

    return {"status": "ok"}
