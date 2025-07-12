from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship, declarative_base

from sqlalchemy.future import select
from database import async_session  # Make sure this is imported
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine







class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    profile_pic = Column(String, nullable=True)
    password = Column(String, nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    country = Column(String, nullable=False)
    role = Column(String, nullable=False)

    # ➕ Add these new columns:
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)

    health_data = relationship("HealthData", back_populates="user")
    sleep_sessions = relationship("SleepSession", back_populates="user", cascade="all, delete-orphan")

    @classmethod
    async def get_by_email(cls, db: AsyncSession, email: str):
        async with async_session() as session:
            # result = await session.execute(select(cls).where(cls.email == email))
            result = await db.execute(select(cls).where(cls.email == email))
            return result.scalars().first()




class HealthData(Base):
    __tablename__ = "healthdata"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    metric_type = Column(String)  # e.g., heart_rate, spo2, blood_pressure
    value = Column(Float, nullable=True)
    systolic = Column(Integer, nullable=True)
    diastolic = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    hash = Column(String, nullable=True, index=True)

    user = relationship("User", back_populates="healt" \
    "" \
    "h_data")


class SleepSession(Base):
    __tablename__ = "sleep_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_hours = Column(Float, nullable=False)

    user = relationship("User", back_populates="sleep_sessions")