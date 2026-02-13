from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import HealthData
from schemas import HealthDataCreate

router = APIRouter(prefix="/healthdata", tags=["Health Data"])



@router.post("/")
def submit_health_data(data: HealthDataCreate, db: Session = Depends(get_db)):
    new_data = HealthData(
        user_id=data.user_id,
        heart_rate=data.heart_rate,
        blood_pressure=data.blood_pressure,
        spo2=data.spo2,
    )
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return {"message": "Health data submitted", "data_id": new_data.id}
