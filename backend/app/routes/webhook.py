from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import License, Subscription, User
from app.services.plan_mapper import get_plan

router = APIRouter()


def _extract_email(payload: dict) -> str | None:
    possible_email_values = [
        payload.get("buyer_email_address"),
        payload.get("data", {}).get("object", {}).get("payment", {}).get("buyer_email_address"),
        payload.get("data", {}).get("object", {}).get("order", {}).get("buyer_email_address"),
    ]

    for value in possible_email_values:
        if isinstance(value, str) and value.strip():
            return value.strip().lower()

    return None


def _extract_sku(payload: dict) -> str | None:
    possible_sku_values = [
        payload.get("note"),
        payload.get("data", {}).get("object", {}).get("payment", {}).get("note"),
        payload.get("data", {}).get("object", {}).get("order", {}).get("note"),
        payload.get("metadata", {}).get("sku") if isinstance(payload.get("metadata"), dict) else None,
        payload.get("data", {}).get("object", {}).get("payment", {}).get("metadata", {}).get("sku"),
    ]

    for value in possible_sku_values:
        if isinstance(value, str) and value.strip():
            return value.strip().upper()

    return None


@router.post("/webhook/square")
async def square_webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    try:
        try:
            payload = await request.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {exc}")

        if payload is None:
            raise HTTPException(status_code=400, detail="Payload is required")

        email = _extract_email(payload)
        sku = _extract_sku(payload)

        if not email:
            raise HTTPException(status_code=400, detail="buyer_email_address not found in payload")

        if not sku:
            raise HTTPException(status_code=400, detail="SKU not found in payload note/metadata")

        total_licenses = get_plan(sku)

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(email=email, created_at=datetime.utcnow())
            db.add(user)
            db.flush()

        subscription = Subscription(
            user_id=user.id,
            sku=sku,
            status="active",
            start_date=datetime.utcnow(),
        )
        db.add(subscription)

        license_record = db.query(License).filter(License.user_id == user.id).first()
        if license_record is None:
            license_record = License(
                user_id=user.id,
                total_licenses=total_licenses,
                used_licenses=0,
            )
            db.add(license_record)
        else:
            license_record.total_licenses = total_licenses

        db.commit()

        print(f"[WEBHOOK] {email} purchased {sku}")
        return {"success": True, "email": email, "sku": sku}
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {exc}")
