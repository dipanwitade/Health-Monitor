from pydantic import BaseModel, EmailStr
from typing import Optional

# Signup schema with extended fields
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    gender: str
    phone: str
    country: str
    role: str

# Login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for returning user data 
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: int
    gender: str
    phone: str
    country: str
    role: str

    class Config:
        orm_mode = True


class HealthDataCreate(BaseModel):
    user_id: int
    heart_rate: float
    blood_pressure: str
    spo2: float


class UserUpdate(BaseModel):
    email: EmailStr  
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    role: Optional[str] = None
