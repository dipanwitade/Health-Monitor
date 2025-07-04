# create_async_tables.py

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from models import Base  # this should include SleepSession and all models
from database import SQLALCHEMY_DATABASE_URL

async def create_tables():
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("✅ Async tables created successfully.")

if __name__ == "__main__":
    asyncio.run(create_tables())
