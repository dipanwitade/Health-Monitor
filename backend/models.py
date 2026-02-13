from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint, Index
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

from sqlalchemy.future import select
from database import async_session  
from sqlalchemy.ext.asyncio import AsyncSession







class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    profile_pic = Column(String, nullable=True)
    password = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    role = Column(String, default="Patient")
    last_fit_sync_at = Column(DateTime, nullable=True)  # UTC naive datetime
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    health_data = relationship("HealthData", back_populates="user")
    sleep_sessions = relationship("SleepSession", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

    @classmethod
    async def get_by_email(cls, db: AsyncSession, email: str):
        async with async_session() as session:
            result = await db.execute(select(cls).where(cls.email == email))
            return result.scalars().first()





class HealthData(Base):
    __tablename__ = "healthdata"
    __table_args__ = (
        UniqueConstraint("user_id", "metric_type", "timestamp", name="uq_healthdata_user_metric_ts"),
        Index("ix_healthdata_user_metric_ts", "user_id", "metric_type", "timestamp"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    metric_type = Column(String)  # e.g., heart_rate, spo2, blood_pressure
    value = Column(Float, nullable=True)
    systolic = Column(Integer, nullable=True)
    diastolic = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)  # store UTC naive
    hash = Column(String, nullable=True, index=True)
    activity_type = Column(String, nullable=True)

    user = relationship("User", back_populates="health_data")


class SleepSession(Base):
    __tablename__ = "sleep_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "start_time", "end_time", name="uq_sleep_user_start_end"),
        Index("ix_sleep_user_start", "user_id", "start_time"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, nullable=False)  
    end_time = Column(DateTime, nullable=False)    
    duration_hours = Column(Float, nullable=False)

    user = relationship("User", back_populates="sleep_sessions")



class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    activity_type = Column(String, nullable=False)

    user = relationship("User", back_populates="activities")
