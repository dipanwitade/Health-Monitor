# from pydantic import BaseModel, EmailStr, Field
# from typing import Optional

# class UserSignup(BaseModel):
#     name: str
#     email: str
#     password: str

# class UserLogin(BaseModel):
#     email: str
#     password: str

# class UserResponse(BaseModel):
#     id: int
#     name: str
#     email: str

#     class Config:
#         orm_mode = True

# # backend/schemas.py

# from pydantic import BaseModel, EmailStr

# class UserCreate(BaseModel):
#     name: str
#     email: EmailStr
#     password: str
    

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# class HealthDataCreate(BaseModel):
#     user_id: int
#     heart_rate: float
#     blood_pressure: str
#     spo2: float


from pydantic import BaseModel, EmailStr
from typing import Optional

# 🧾 Signup schema with extended fields
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    gender: str
    phone: str
    country: str
    role: str

# 🔐 Login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ✅ Schema for returning user data (e.g. in API response)
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

# 🏥 Optional: Used when inserting health data
class HealthDataCreate(BaseModel):
    user_id: int
    heart_rate: float
    blood_pressure: str
    spo2: float
