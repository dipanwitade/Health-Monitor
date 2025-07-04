from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import  get_db
import models, schemas
import bcrypt
from schemas import UserCreate, UserLogin
from models import User
from database import async_session

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


router = APIRouter(prefix="/auth", tags=["Auth"])

# Dependency to get DB session
# def get_db():
#     db = async_session()
#     try:
#         yield db
#     finally:
#         db.close()

@router.post("/signup")
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # existing_user = db.query(User).filter(User.email == user.email).first()
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password.decode('utf-8')
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User created successfully"}


@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # db_user = db.query(User).filter(User.email == user.email).first()
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {"message": "Login successful"}

