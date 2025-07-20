from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import User, ActivityLog

router = APIRouter()

@router.get("/activity-logs")
async def get_activity_logs(
    user_email: str = Query(...),
    days: int = Query(7),
    db: AsyncSession = Depends(get_db)
):
    # Fetch user by email
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate date range
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days)

    # Fetch activities
    result = await db.execute(
        select(ActivityLog)
        .where(
            ActivityLog.user_id == user.id,
            ActivityLog.start_time >= start_time,
            ActivityLog.end_time <= end_time
        )
        .order_by(ActivityLog.start_time.desc())
    )
    logs = result.scalars().all()

    return [
        {
            "activity_type": log.activity_type,
            "start_time": log.start_time,
            "end_time": log.end_time,
            "duration_minutes": log.duration_minutes
        }
        for log in logs
    ]
