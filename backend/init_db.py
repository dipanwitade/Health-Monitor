# backend/init_db.py

import asyncio
from database import engine, Base
import models 

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully.")

# This is only run manually when starting up
if __name__ == "__main__":
    asyncio.run(init_models())
