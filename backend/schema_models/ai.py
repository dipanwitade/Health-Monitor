from pydantic import BaseModel

class HealthMetrics(BaseModel):
    heart_rate: float
    spo2: float
    systolic_bp: float
    diastolic_bp: float
