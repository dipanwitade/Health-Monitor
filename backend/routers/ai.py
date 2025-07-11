from fastapi import APIRouter
from schema_models.ai import HealthMetrics
import joblib
import numpy as np
import os

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
