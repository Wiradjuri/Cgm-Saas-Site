import app.database
from app.models import License


def can_use_feature(user_id: int, required: int) -> bool:
    if required <= 0:
        return True

    db = app.database.SessionLocal()
    try:
        license_record = db.query(License).filter(License.user_id == user_id).first()
        if license_record is None:
            return False

        available = license_record.total_licenses - license_record.used_licenses
        return available >= required
    finally:
        db.close()
