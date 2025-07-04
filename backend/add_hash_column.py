from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from models import HealthData, SleepSession

DATABASE_URL = "sqlite+aiosqlite:///./healthcare.db"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def wipe_health_tables():
    async with async_session() as session:
        await session.execute(text("DELETE FROM healthdata"))
        await session.execute(text("DELETE FROM sleep_sessions"))
        await session.commit()
        print("🗑️ Wiped all health and sleep session data.")

import asyncio
asyncio.run(wipe_health_tables())
