# /backend/services/train_user_model.py

import os
import json
import joblib

import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import HealthData



from datetime import datetime, timezone

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE_PATH = os.path.join(BASE_DIR, "ml_models", "personalized", "users")





RETRAIN_MIN_NEW_WINDOWS = 50      # retrain if >= 50 new 5-min windows
RETRAIN_COOLDOWN_HOURS = 12       # don't retrain more often than every 12 hours
MIN_WINDOWS_TO_TRAIN = 10         # don't train at all unless baseline >= 10 windows


def _user_folder(user_id: int) -> str:
    return os.path.join(BASE_PATH, f"user_{user_id}")


def _metadata_path(user_id: int) -> str:
    return os.path.join(_user_folder(user_id), "metadata.json")


def _load_metadata(user_id: int) -> dict:
    path = _metadata_path(user_id)
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def _hours_since(iso_ts: str) -> float:
    try:
        dt = datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (now - dt.astimezone(timezone.utc)).total_seconds() / 3600.0
    except Exception:
        return 1e9  
    
    
async def get_current_window_count(user_id: int, db: AsyncSession) -> int:
    df = await fetch_user_data(user_id, db)  
    return int(len(df)) if df is not None else 0

async def should_retrain_user_model(user_id: int, db: AsyncSession) -> bool:
    current_windows = await get_current_window_count(user_id, db)
    if current_windows < MIN_WINDOWS_TO_TRAIN:
        # Not enough baseline to train at all
        return False

    meta = _load_metadata(user_id)
    last_trained = meta.get("last_trained")
    prev_windows = int(meta.get("n_windows", 0))

    # Cooldown check
    if last_trained and _hours_since(last_trained) < RETRAIN_COOLDOWN_HOURS:
        return False

    # New data threshold
    new_windows = current_windows - prev_windows
    return new_windows >= RETRAIN_MIN_NEW_WINDOWS



async def fetch_user_data(user_id: int, db: AsyncSession):
    """
    Fetch resting health data and aggregate into 5-minute windows.
    """
    result = await db.execute(
        select(HealthData)
        .where(
            HealthData.user_id == user_id,
            HealthData.activity_type == "resting",
            HealthData.metric_type.in_(["heart_rate", "spo2", "blood_pressure"])
        )
    )
    records = result.scalars().all()

    if not records:
        return pd.DataFrame()

    rows = []
    for r in records:
        rows.append({
            "timestamp": r.timestamp,
            "heart_rate": r.value if r.metric_type == "heart_rate" else None,
            "spo2": r.value if r.metric_type == "spo2" else None,
            "systolic_bp": r.systolic if r.metric_type == "blood_pressure" else None,
            "diastolic_bp": r.diastolic if r.metric_type == "blood_pressure" else None,
        })

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.set_index("timestamp", inplace=True)

    # 5-minute window aggregation
    windowed = df.resample("5min").agg({
        "heart_rate": "mean",
        "spo2": "min",
        "systolic_bp": "max",
        "diastolic_bp": "max"
    })

    windowed.dropna(inplace=True)
    return windowed



async def train_user_model(user_id: int, db: AsyncSession):
    """Train personalized unsupervised and supervised models for a user."""
    df = await fetch_user_data(user_id, db)
    if df.empty or len(df) < MIN_WINDOWS_TO_TRAIN:
        print(f" Not enough baseline windows to train user {user_id}. windows={len(df)}")
        return

    print("TRAIN DEBUG")
    print("CWD:", os.getcwd())
    print("BASE_PATH:", os.path.abspath(BASE_PATH))
    print("user_id:", user_id)
    print("windows:", len(df))
    print("df.head():", df.head())

    if df.empty:
        print(f"No resting data for user {user_id}. Skipping training.")
        return
    if len(df) < 3:
        print(f"Not enough windows to train for user {user_id}: {len(df)}")
        return


    # 1️ Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df)

    # 2️ Train Isolation Forest (unsupervised anomalies)
    iso_model = IsolationForest(contamination=0.05, random_state=42)
    iso_model.fit(X_scaled)

    
    df_supervised = df.copy()
    df_supervised["label"] = 0
    
    n_anomalies = max(5, int(len(df) * 0.05))
    for col in ["heart_rate", "spo2", "systolic_bp", "diastolic_bp"]:
        df_supervised.loc[df_supervised.sample(n=n_anomalies).index, col] *= 1.5
    df_supervised.loc[df_supervised.sample(n=n_anomalies).index, "label"] = 1

    X_sup = df_supervised[["heart_rate", "spo2", "systolic_bp", "diastolic_bp"]].values
    y_sup = df_supervised["label"].values
    sup_model = RandomForestClassifier(n_estimators=100, random_state=42)
    sup_model.fit(X_sup, y_sup)

    # 4️ Create user folder
    user_folder = os.path.join(BASE_PATH, f"user_{user_id}")
    os.makedirs(user_folder, exist_ok=True)

    # 5️ Save models & scaler
    joblib.dump(iso_model, os.path.join(user_folder, "unsupervised_model.pkl"))
    joblib.dump(sup_model, os.path.join(user_folder, "supervised_model.pkl"))
    joblib.dump(scaler, os.path.join(user_folder, "scaler.pkl"))

    # 6️ Save metadata
    metadata = {
        "last_trained": datetime.now(timezone.utc).isoformat(),
        "n_windows": int(len(df)),
        "metrics": ["heart_rate", "spo2", "systolic_bp", "diastolic_bp"],
        "model_version": "v2_windowed",
    }

    with open(os.path.join(user_folder, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)

    print(f" Trained models saved for user {user_id}")
