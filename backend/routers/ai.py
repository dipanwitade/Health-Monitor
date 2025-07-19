from fastapi import APIRouter, Depends, HTTPException, Query
from schema_models.ai import HealthMetrics
import joblib
import numpy as np
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from database import get_db
from models import User, HealthData
from typing import List, Dict
import pytz

router = APIRouter()

# Load model and scaler
model_path = os.path.join("ml_models", "isolation_forest_model.pkl")
scaler_path = os.path.join("ml_models", "scaler.pkl")

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

@router.post("/anomaly")

def detect_anomaly(data: HealthMetrics):
    print("📥 Input:", data)
    X = np.array([[data.heart_rate, data.spo2, data.systolic_bp, data.diastolic_bp]])
    X_scaled = scaler.transform(X)
    result = model.predict(X_scaled)[0]
    score = model.decision_function(X_scaled)[0]
    print("🔍 Score:", score, "Prediction:", result)
    return {
        "result": "anomaly" if result == -1 else "normal",
        "score": round(score, 5)
    }

@router.get("/insights")
async def get_health_insights(user_email: str, db: AsyncSession = Depends(get_db)):
    # Step 1: Find user
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Time ranges
    tz = pytz.timezone("Asia/Kolkata")
    now = datetime.now(tz)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    week_1_start = today - timedelta(days=7)
    week_2_start = today - timedelta(days=14)

    metrics = ["steps", "heart_rate", "sleep", "calories"]
    insights = []

    for metric in metrics:
        # Week N (recent)
        result = await db.execute(
            select(HealthData).where(
                HealthData.user_id == user.id,
                HealthData.metric_type == metric,
                HealthData.timestamp >= week_1_start.astimezone(pytz.UTC),
                HealthData.timestamp < today.astimezone(pytz.UTC),
                HealthData.value != None
            )
        )
        week1_values = [r.value for r in result.scalars().all()]
        week1_avg = sum(week1_values) / len(week1_values) if week1_values else 0

        # Week N-1 (previous)
        result = await db.execute(
            select(HealthData).where(
                HealthData.user_id == user.id,
                HealthData.metric_type == metric,
                HealthData.timestamp >= week_2_start.astimezone(pytz.UTC),
                HealthData.timestamp < week_1_start.astimezone(pytz.UTC),
                HealthData.value != None
            )
        )
        week2_values = [r.value for r in result.scalars().all()]
        week2_avg = sum(week2_values) / len(week2_values) if week2_values else 0

        if week1_avg and week2_avg:
            change = (week1_avg - week2_avg) / week2_avg

            if change < -0.2:
                insights.append(f"⬇️ Your average {metric.replace('_', ' ')} dropped by {abs(round(change * 100))}% compared to last week.")
            elif change > 0.2:
                insights.append(f"⬆️ Your average {metric.replace('_', ' ')} increased by {round(change * 100)}% this week.")
            else:
                insights.append(f"📊 Your {metric.replace('_', ' ')} remained stable this week.")

    return {"insights": insights}