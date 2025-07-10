from fastapi import APIRouter, HTTPException
from schema_models.ai import HealthMetrics
import joblib
import numpy as np
import os

router = APIRouter()

# Load model and scaler once
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # This gives you: backend/routers/
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml_models", "isolation_forest_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "..", "ml_models", "scaler.pkl")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

@router.post("/ai/anomaly-detect")
def detect_anomaly(metrics: HealthMetrics):
    try:
        features = np.array([[metrics.heart_rate, metrics.spo2, metrics.systolic_bp, metrics.diastolic_bp]])
        scaled = scaler.transform(features)
        prediction = model.predict(scaled)[0]  # -1 = anomaly, 1 = normal
        score = model.decision_function(scaled)[0]
        score = model.decision_function(scaled)[0]
        prediction = model.predict(scaled)[0]

        print("Anomaly score:", score)

        # status = "anomaly" if prediction == -1 else "normal"
        return {
            "result": "anomaly" if prediction == -1 else "normal",
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
