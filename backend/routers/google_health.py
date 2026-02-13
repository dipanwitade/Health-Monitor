from fastapi import APIRouter, Depends, HTTPException,Query
from datetime import datetime, timedelta,timezone
import httpx
from models import User, HealthData, SleepSession
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from typing import List
from schemas import UserUpdate
from services.google_sync import sync_google_fit_data

from pydantic import BaseModel

import pytz

router = APIRouter()



class SyncRequest(BaseModel):
    user_email: str
    days_back: int = 7  # default to 7 days

@router.post("/google/sync")
async def sync_now(payload: SyncRequest, db: AsyncSession = Depends(get_db)):
    user_email = payload.user_email
    days_back = payload.days_back

    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await sync_google_fit_data(user, db, days_back=days_back)
    return {"detail": f"Synced successfully for last {days_back} days"}

@router.get("/google/health-data")
async def get_today_health_data(
    user_email: str,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")


    india_tz = pytz.timezone("Asia/Kolkata")
    today_ist = datetime.now(india_tz).date()


    
    # IST midnight → UTC range
    ist_start = india_tz.localize(datetime.combine(today_ist, datetime.min.time()))
    ist_end = india_tz.localize(datetime.combine(today_ist, datetime.max.time()))
    start_utc = ist_start.astimezone(timezone.utc)
    end_utc = ist_end.astimezone(timezone.utc)
 
    

    # Fetch today's data from DB
    result = await db.execute(
        select(HealthData).where(
            HealthData.user_id == user.id,
            HealthData.timestamp >= start_utc,
            HealthData.timestamp <= end_utc
        )
    )
   

    records: List[HealthData] = result.scalars().all()

    
    heart_rate = []
    spo2 = []
    blood_pressure = []
    sleep = []
    stress = []
    steps = []
    calories = []
    distance = []

    for rec in records:
        ts = int(rec.timestamp.replace(tzinfo=timezone.utc).timestamp() * 1000) 

        if rec.metric_type == "heart_rate" and rec.value is not None:
            heart_rate.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "spo2" and rec.value is not None:
            spo2.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "blood_pressure" and rec.systolic and rec.diastolic:
            blood_pressure.append({
                "timestamp": ts,
                "systolic": rec.systolic,
                "diastolic": rec.diastolic
            })

        elif rec.metric_type == "sleep" and rec.value is not None:
            sleep.append({"timestamp": ts, "value": rec.value})
        
        elif rec.metric_type == "steps" and rec.value is not None:
            steps.append({"timestamp": ts, "value": rec.value})

        elif rec.metric_type == "calories" and rec.value is not None:
            calories.append({"timestamp": ts, "value": rec.value})


        elif rec.metric_type == "stress" and rec.value is not None:
            stress.append({"timestamp": ts, "value": rec.value})
        
        elif rec.metric_type == "distance" and rec.value is not None:
            distance.append({"timestamp": ts, "value": rec.value})


    return {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "blood_pressure": blood_pressure,
        "sleep": sleep,
        "stress": stress,
        "steps": steps,
        "calories": calories,
        "distance": distance
    }




@router.get("/sleep/week")
async def get_weekly_sleep(user_email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.utcnow()
    one_week_ago = now - timedelta(days=7)

    result = await db.execute(
        select(SleepSession).where(
            SleepSession.user_id == user.id,
            SleepSession.start_time >= one_week_ago,
            SleepSession.start_time <= now
        ).order_by(SleepSession.start_time)
    )

    sleep_sessions: List[SleepSession] = result.scalars().all()
    sleep_summary = []

    for session in sleep_sessions:
        date_label = session.start_time.strftime("%a")  
        sleep_summary.append({
            "day": date_label,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat(),
            "duration_hours": round(session.duration_hours, 2)
        })

    return {"sleep_sessions": sleep_summary}


@router.get("/sleep-sessions")
async def get_sleep_sessions(user_email: str, days: int = 7, db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(User).where(User.email == user_email))
    user = user.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    end_dt = datetime.utcnow()
    start_dt = end_dt - timedelta(days=days)

    result = await db.execute(
        select(SleepSession).where(
            SleepSession.user_id == user.id,
            SleepSession.start_time <= end_dt,
            SleepSession.end_time >= start_dt
        ).order_by(SleepSession.start_time)
    )
    sessions = result.scalars().all()

    return {
        "sleep_sessions": [
            {
                "date": s.start_time.date().isoformat(),
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat(),
                "duration_hours": s.duration_hours,
                "duration_minutes": round(s.duration_hours * 60, 2)
            } for s in sessions
        ]
    }

@router.get("/healthdata/history")
async def get_health_data_history(
    user_email: str,
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    try:

        india_tz = pytz.timezone("Asia/Kolkata")

        # Convert local IST dates to UTC-aware datetime ranges
        local_start = datetime.strptime(start_date, "%Y-%m-%d")
        local_end = datetime.strptime(end_date, "%Y-%m-%d")

        # Localize to IST and convert to UTC
        start_dt = india_tz.localize(local_start).astimezone(timezone.utc)
        end_dt = india_tz.localize(local_end.replace(hour=23, minute=59, second=59)).astimezone(timezone.utc)

        if start_dt > end_dt:
            raise HTTPException(status_code=400, detail="start_date must be before end_date.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Time-series data containers
    heart_rate = []
    spo2 = []
    blood_pressure = []
    steps = []
    distance = []
    calories = []
    sleep = []
    stress = []

    # Fetch all health records for date range
    result = await db.execute(
        select(HealthData).where(
            HealthData.user_id == user.id,
            HealthData.timestamp >= start_dt, 
            HealthData.timestamp < end_dt, 
        )
    )
    records: List[HealthData] = result.scalars().all()

    for rec in records:
        
        ts = int(rec.timestamp.replace(tzinfo=timezone.utc).timestamp() * 1000)

        if rec.metric_type == "heart_rate" and rec.value is not None:
            heart_rate.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "spo2" and rec.value is not None:
            spo2.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "blood_pressure" and rec.systolic and rec.diastolic:
            blood_pressure.append({
                "timestamp": ts,
                "systolic": rec.systolic,
                "diastolic": rec.diastolic
            })
        elif rec.metric_type == "steps":
            steps.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "distance":
            distance.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "calories":
            calories.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "sleep":
            sleep.append({"timestamp": ts, "value": rec.value})
        elif rec.metric_type == "stress":
            stress.append({"timestamp": ts, "value": rec.value})

    # Aggregate metrics
    METRICS_SUM = {"steps", "calories", "distance"}
    METRICS_AVG = {"heart_rate", "spo2", "stress"}

    averageMetrics = {}

    for metric in METRICS_SUM | METRICS_AVG:
        is_sum = metric in METRICS_SUM
        
        values = locals()[metric]
        if values:
            agg_val = sum([v['value'] for v in values]) if is_sum else sum([v['value'] for v in values]) / len(values)
            averageMetrics[metric] = round(agg_val, 2)
        else:
            averageMetrics[metric] = None
    print(f"Records for {start_date}:")
    print("steps:", len(steps), steps)
    print("distance:", len(distance), distance)
    print("calories:", len(calories), calories)

    
    bp_values = blood_pressure
    if bp_values:
        systolic_vals = [v["systolic"] for v in bp_values]
        diastolic_vals = [v["diastolic"] for v in bp_values]
        averageMetrics["blood_pressure"] = {
            "systolic": round(sum(systolic_vals) / len(systolic_vals), 2) if systolic_vals else None,
            "diastolic": round(sum(diastolic_vals) / len(diastolic_vals), 2) if diastolic_vals else None
        }
    else:
        averageMetrics["blood_pressure"] = None
    return {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "blood_pressure": blood_pressure,
        "steps": steps,
        "distance": distance,
        "calories": calories,
        "sleep": sleep,
        "stress": stress,
        "averageMetrics": averageMetrics
    }




@router.put("/users/update")
async def update_user_profile(update_data: UserUpdate, db: AsyncSession = Depends(get_db)):
    try:
        
        result = await db.execute(select(User).where(User.email == update_data.email))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        
        if update_data.age is not None:
            user.age = update_data.age
        if update_data.gender is not None:
            user.gender = update_data.gender
        if update_data.phone is not None:
            user.phone = update_data.phone
        if update_data.country is not None:
            user.country = update_data.country
        if update_data.role is not None:
            user.role = update_data.role

        await db.commit()
        await db.refresh(user)

        return {"message": "User profile updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.get("/google/devices")
async def get_google_devices(user_email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()
    if not user or not user.access_token:
        raise HTTPException(status_code=404, detail="User not found or not connected")

    url = "https://www.googleapis.com/fitness/v1/users/me/dataSources"
    headers = {"Authorization": f"Bearer {user.access_token}"}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="Failed to fetch data sources")

        data_sources = res.json().get("dataSource", [])

        
        seen = set()
        devices = []

        for source in data_sources:
            device = source.get("device")
            if device:
                key = (device.get("manufacturer"), device.get("model"), device.get("uid"))
                if key not in seen:
                    seen.add(key)
                    devices.append({
                        "type": device.get("type"),
                        "manufacturer": device.get("manufacturer"),
                        "model": device.get("model"),
                        "version": device.get("version"),
                        "uid": device.get("uid")
                    })

        return {"devices": devices}
