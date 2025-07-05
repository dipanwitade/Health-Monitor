from fastapi import APIRouter, Request, Depends, HTTPException,Query
from datetime import datetime, timedelta,timezone
import httpx
from models import User, HealthData, SleepSession
import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from typing import List, Optional
import json
from .google_auth import GOOGLE_FIT_API_URL, DATA_TYPES, build_request_body  # Adjust if needed
from sqlalchemy import and_,func

from services.google_sync import sync_google_fit_data

from pydantic import BaseModel

import pytz

router = APIRouter()

# @router.get("/health-data")
# async def get_health_data(user_email: str, db: AsyncSession = Depends(get_db)):
    
#     # ✅ Fetch user from DB to get access token
#     # user = await User.get_by_email(user_email)
#     result = await db.execute(select(User).where(User.email == user_email))
#     user = result.scalar_one_or_none()
    
#     if not user or not user.access_token:
#         return {"error": "Access token not found for user."}

#     access_token = user.access_token

#     # Calculate start and end time for Today
#     today = datetime.now()
#     start = datetime(today.year, today.month, today.day)
#     end = start + timedelta(days=1) - timedelta(milliseconds=1)

#     startTimeMillis = int(start.timestamp() * 1000)
#     endTimeMillis = int(end.timestamp() * 1000)


#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json"
#         }
    
#     body = {
#         "aggregateBy": [
#             {"dataTypeName": "com.google.heart_rate.bpm"},
#             {"dataTypeName": "com.google.blood_pressure"},
#             {"dataTypeName": "com.google.oxygen_saturation"}
#         ],
#         "bucketByTime": {"durationMillis": 86400000},  # 1 day
#         "startTimeMillis": startTimeMillis,
#         "endTimeMillis": endTimeMillis
#     }

#     # async with httpx.AsyncClient() as client:
#     #     response = await client.post("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
#     #                                  headers=headers,
#     #                                  json=body)

#     response = httpx.post(
#         "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
#         headers=headers,
#         json=body
#     )

#     raw_data = response.json()
#     print("RAW RESPONSE from Google Fit:", json.dumps(raw_data, indent=2))
#     print("Access token being used:", access_token)


#     heart_rate_data = []
#     spo2_data = []
#     blood_pressure_data = []


#     for bucket in raw_data.get("bucket", []):
#         for dataset in bucket.get("dataset", []):
#             data_type = dataset.get("dataSourceId", "").lower()

#             for point in dataset.get("point", []):
#                 # start_time_nanos = point.get("startTimeNanos")
#                 # if not start_time_nanos:
#                 #     continue
#                 # timestamp = int(start_time_nanos[:13])
#                 timestamp = int(point["startTimeNanos"][:13])
#                 values = point["value"]

#                 if "heart_rate" in data_type:
#                     for val in values:
#                         if "fpVal" in val:
#                             val_rounded = round(val.get("fpVal", 0))
#                             # print(f"  → Value: {val_rounded}")
#                             heart_rate_data.append({
#                                 "timestamp": timestamp,
#                                 "value": val_rounded
#                             })

#                 elif "oxygen_saturation" in data_type:
#                      for val in values:
#                           spo2_data.append({
#                                "timestamp": timestamp,
#                                 "value": round(val.get("fpVal", 0) * 100, 1)
#                                 })

#                 elif "blood_pressure" in data_type:
#                      if len(values) >= 2:
#                         systolic = round(values[0].get("fpVal", 0))
#                         diastolic = round(values[1].get("fpVal", 0))
#                         blood_pressure_data.append({
#                             "timestamp": timestamp,
#                             "systolic": systolic,
#                             "diastolic": diastolic
#                             })

#     # print("✔ Done parsing.")
#     # print("Final heart_rate_data:", heart_rate_data)

#     return {
#         "heart_rate": heart_rate_data,
#         "spo2": spo2_data,
#         "blood_pressure": blood_pressure_data
#     }

# @router.get("/healthdata/history")
# async def get_health_data_history(
#     user_email: str,
#     start_date: str = Query(..., description="YYYY-MM-DD"),
#     end_date: str = Query(..., description="YYYY-MM-DD"),
#     db: AsyncSession = Depends(get_db),
# ):
#     try:
#         start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
#         end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
#         if start_dt > end_dt:
#             raise HTTPException(status_code=400, detail="start_date must be before end_date.")

#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    

#     # 🔐 Find user by email
#     result = await db.execute(select(User).where(User.email == user_email))
#     user = result.scalars().first()

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found.")


#     # 📊 Get health records for the user between dates
#     result = await db.execute(
#         select(HealthData).where(
#             HealthData.user_id == user.id,
#             HealthData.timestamp >= start_dt.replace(tzinfo=None),
#             HealthData.timestamp <= end_dt.replace(tzinfo=None),
#         )
#     )
#     records: List[HealthData] = result.scalars().all()

#     heart_rate = []
#     spo2 = []
#     blood_pressure = []
#     steps = []
#     distance = []
#     calories = []
#     sleep = []
#     stress = []


#     for rec in records:
#         ts = int(rec.timestamp.timestamp() * 1000)

#         if rec.metric_type == "heart_rate" and rec.value is not None:
#             heart_rate.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "spo2" and rec.value is not None:
#             spo2.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "blood_pressure" and rec.systolic and rec.diastolic:
#             blood_pressure.append({
#                 "timestamp": ts,
#                 "systolic": rec.systolic,
#                 "diastolic": rec.diastolic
#             })
        
#         elif rec.metric_type == "steps":
#             steps.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "distance":
#             distance.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "calories":
#             calories.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "sleep":
#             sleep.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "stress":
#             stress.append({"timestamp": ts, "value": rec.value})

#     print(f"→ Found {len(records)} records")
#     print(f"[DEBUG] Found {len(records)} records for {user.email} between {start_dt} and {end_dt}")
#     for r in records:
#         print(r.timestamp, r.metric_type, r.value or (r.systolic, r.diastolic))



#     return {
#         "heart_rate": heart_rate,
#         "spo2": spo2,
#         "blood_pressure": blood_pressure,
#         "steps": steps,
#         "distance": distance,
#         "calories": calories,
#         "sleep": sleep,
#         "stress": stress
#     }

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


    # Find the user
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Define today's date range (UTC)
    # now = datetime.utcnow()
    # start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    # sleep_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=8)


     # ⏰ Step 1: Compute time range based on IST
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
            # HealthData.timestamp >= start_of_day,     #OLD VERSION
            # HealthData.timestamp >= sleep_start,      #NEW VERSION
            HealthData.timestamp >= start_utc,
            # HealthData.timestamp <= now
            HealthData.timestamp <= end_utc
        )
    )
   

    records: List[HealthData] = result.scalars().all()

    # Format by metric type
    heart_rate = []
    spo2 = []
    blood_pressure = []
    sleep = []
    stress = []
    steps = []
    calories = []
    distance = []

    for rec in records:
        ts = int(rec.timestamp.timestamp() * 1000)

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
        date_label = session.start_time.strftime("%a")  # Mon, Tue, etc.
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
            SleepSession.start_time >= start_dt,
            SleepSession.end_time <= end_dt
        ).order_by(SleepSession.start_time)
    )
    sessions = result.scalars().all()

    return {
        "sleep_sessions": [
            {
                "date": s.start_time.date().isoformat(),
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat(),
                "duration_minutes": s.duration_minutes or round(s.duration_hours * 60, 2)
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
        # # start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc) #OLD VERSION
        # start_dt = datetime.strptime(start_date, "%Y-%m-%d")                                #NEW VERSION
        # # end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc) #OLD VERSION
        # end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)                #NEW VERSION

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
            HealthData.timestamp >= start_dt, # .replace(tzinfo=None),
            HealthData.timestamp < end_dt, # .replace(tzinfo=None),
        )
    )
    records: List[HealthData] = result.scalars().all()

    for rec in records:
        ts = int(rec.timestamp.timestamp() * 1000)
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
        # query = select(
        #     func.sum(HealthData.value) if metric in METRICS_SUM else func.avg(HealthData.value)
        # ).where(
        #     HealthData.user_id == user.id,
        #     HealthData.metric_type == metric,
        #     HealthData.timestamp >= start_dt.replace(tzinfo=None),
        #     HealthData.timestamp <= end_dt.replace(tzinfo=None)
        # )
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

    # Handle blood pressure separately
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







