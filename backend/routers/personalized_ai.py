# /backend/routers/personalized_ai.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta
import pytz
import os
import joblib
import numpy as np

from models import User, HealthData
from database import get_db
import pandas as pd

from services.train_user_model import train_user_model

router = APIRouter()

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE_PATH = os.path.join(BACKEND_DIR, "ml_models", "personalized", "users")

TZ = pytz.timezone("Asia/Kolkata")
RESTING_METRICS = ["heart_rate", "spo2", "blood_pressure"]


# ---------------------------------------------------
# Utility: Load trained user model 
# ---------------------------------------------------
async def get_user_model(user_id: int):
    user_folder = os.path.join(BASE_PATH, f"user_{user_id}")
    model_path = os.path.join(user_folder, "unsupervised_model.pkl")
    scaler_path = os.path.join(user_folder, "scaler.pkl")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise HTTPException(status_code=202, detail="Personalized model not trained yet")

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler


def _ist_day_bounds_to_utc_naive(day_start_ist: datetime):
    
    start_ist = day_start_ist
    end_ist = start_ist + timedelta(days=1)

    start_utc_naive = start_ist.astimezone(pytz.UTC).replace(tzinfo=None)
    end_utc_naive = end_ist.astimezone(pytz.UTC).replace(tzinfo=None)
    return start_utc_naive, end_utc_naive, end_ist


async def _pick_latest_ist_day_with_data(db: AsyncSession, user_id: int, min_windows: int = 3):
    
    latest_ts = (
        await db.execute(
            select(HealthData.timestamp)
            .where(
                HealthData.user_id == user_id,
                HealthData.activity_type == "resting",
                HealthData.metric_type.in_(RESTING_METRICS),
            )
            .order_by(HealthData.timestamp.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if not latest_ts:
        return None

    latest_ist = pytz.UTC.localize(latest_ts).astimezone(TZ)

    min_rows_hint = max(10, min_windows * 3)

    for back in range(0, 8):
        candidate = latest_ist - timedelta(days=back)
        day_start_ist = candidate.replace(hour=0, minute=0, second=0, microsecond=0)

        start_utc_naive, end_utc_naive, _ = _ist_day_bounds_to_utc_naive(day_start_ist)

        row_count = (
            await db.execute(
                select(func.count())
                .select_from(HealthData)
                .where(
                    HealthData.user_id == user_id,
                    HealthData.activity_type == "resting",
                    HealthData.metric_type.in_(RESTING_METRICS),
                    HealthData.timestamp >= start_utc_naive,
                    HealthData.timestamp < end_utc_naive,
                )
            )
        ).scalar_one()

        if row_count >= min_rows_hint:
            return day_start_ist

    return latest_ist.replace(hour=0, minute=0, second=0, microsecond=0)


def _confidence_label(total_windows: int) -> str:
    
    if total_windows >= 200:
        return "high"
    if total_windows >= 50:
        return "medium"
    return "low"


def _human_metric_name(key: str) -> str:
    mapping = {
        "heart_rate": "Heart Rate",
        "spo2": "SpO₂",
        "systolic_bp": "Blood Pressure",
        "diastolic_bp": "Blood Pressure",
    }
    return mapping.get(key, key)


# ---------------------------------------------------
# Personalized anomaly detection endpoint
# ---------------------------------------------------
@router.get("/personal_anomaly")
async def personal_anomaly(
    email: str,
    date: str = Query(default=None, description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    # 1️ Get user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2️ Determine IST day start
    if date:
        naive_local = datetime.strptime(date, "%Y-%m-%d")
        selected = TZ.localize(naive_local)
        start_ist = selected.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start_ist = await _pick_latest_ist_day_with_data(db, user.id, min_windows=3)
        if not start_ist:
            return {"status": "no_data", "message": "No resting health data available"}

    start_utc_naive, end_utc_naive, _ = _ist_day_bounds_to_utc_naive(start_ist)

    # 3️ Fetch resting health metrics within UTC-naive bounds
    result = await db.execute(
        select(HealthData).where(
            HealthData.user_id == user.id,
            HealthData.metric_type.in_(RESTING_METRICS),
            HealthData.activity_type == "resting",
            HealthData.timestamp >= start_utc_naive,
            HealthData.timestamp < end_utc_naive,
        )
    )
    records = result.scalars().all()

    if not records:
        return {"status": "no_data", "message": "No resting health data for this day"}

    # 4️ Convert records to DataFrame
    rows = []
    for r in records:
        rows.append(
            {
                "timestamp": r.timestamp,  # UTC-naive in DB
                "heart_rate": r.value if r.metric_type == "heart_rate" else None,
                "spo2": r.value if r.metric_type == "spo2" else None,
                "systolic_bp": r.systolic if r.metric_type == "blood_pressure" else None,
                "diastolic_bp": r.diastolic if r.metric_type == "blood_pressure" else None,
            }
        )

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.set_index("timestamp", inplace=True)

    # 5-minute window aggregation
    windowed = df.resample("5min").agg(
        {
            "heart_rate": "mean",
            "spo2": "min",
            "systolic_bp": "max",
            "diastolic_bp": "max",
        }
    )

    windowed.dropna(inplace=True)

    if len(windowed) < 3:
        return {"status": "insufficient", "message": "Not enough aggregated data windows"}

    X = windowed.values

    # 5️ Load model & predict
    model, scaler = await get_user_model(user.id)
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)

    total = len(predictions)
    anomalies = int(np.sum(predictions == -1))
    percent = round((anomalies / total) * 100, 2)

    # ---------------------------------------------------
    # NEW: Build UI-friendly series + anomaly timestamps
    # ---------------------------------------------------
    series = []
    anomaly_timestamps = []


    for ts_utc_naive, row, pred in zip(windowed.index, windowed.values, predictions):
        ts_utc = pytz.UTC.localize(pd.to_datetime(ts_utc_naive).to_pydatetime())
        ts_ist = ts_utc.astimezone(TZ)

        point = {
            "timestamp": ts_ist.isoformat(), 
            "heart_rate": float(row[0]),
            "spo2": float(row[1]),
            "systolic_bp": float(row[2]),
            "diastolic_bp": float(row[3]),
            "is_anomaly": int(pred == -1),
        }
        series.append(point)
        if pred == -1:
            anomaly_timestamps.append(point["timestamp"])

    
    cols = ["heart_rate", "spo2", "systolic_bp", "diastolic_bp"]
    contrib_scores = {}

    for c in cols:
        vals = windowed[c].values.astype(float)
        mu = float(np.mean(vals))
        sd = float(np.std(vals)) or 1.0
        contrib_scores[c] = float(np.mean(np.abs((vals - mu) / sd)))

    contributors_sorted = sorted(contrib_scores.items(), key=lambda x: x[1], reverse=True)
    top_contributors = [_human_metric_name(k) for k, _ in contributors_sorted[:2]]

    return {
        
        "status": "alert" if percent > 20 else "ok",
        "date": start_ist.date().isoformat(),  # IST date shown to user
        "total_records": total,
        "anomalies": anomalies,
        "percent_anomalies": percent,
        "note": "Personalized anomalies detected using resting health metrics",

        
        "series": series,  
        "anomaly_timestamps": anomaly_timestamps,  
        "top_contributors": top_contributors,  
        "data_confidence": _confidence_label(total),  
    }


# ---------------------------------------------------
# Model readiness status endpoint
# ---------------------------------------------------
@router.get("/personal_model_status")
async def personal_model_status(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_folder = os.path.join(BASE_PATH, f"user_{user.id}")
    model_path = os.path.join(user_folder, "unsupervised_model.pkl")
    scaler_path = os.path.join(user_folder, "scaler.pkl")

    if not os.path.exists(user_folder):
        return {"trained": False, "message": "Collecting baseline health data"}

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return {"trained": False, "message": "Model training in progress"}

    return {"trained": True, "message": "Personalized model ready"}


@router.post("/personal_model/train")
async def train_personal_model(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await train_user_model(user.id, db)

    user_folder = os.path.join(BASE_PATH, f"user_{user.id}")
    model_path = os.path.join(user_folder, "unsupervised_model.pkl")
    scaler_path = os.path.join(user_folder, "scaler.pkl")
    meta_path = os.path.join(user_folder, "metadata.json")

    return {
        "user_id": user.id,
        "cwd": os.getcwd(),
        "user_folder": user_folder,
        "model_exists": os.path.exists(model_path),
        "scaler_exists": os.path.exists(scaler_path),
        "metadata_exists": os.path.exists(meta_path),
    }
