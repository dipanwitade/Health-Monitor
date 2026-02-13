from fastapi import APIRouter, HTTPException, Depends
from database import  get_db
import bcrypt
from schemas import UserLogin
from models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter(prefix="/auth", tags=["Auth"])

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

