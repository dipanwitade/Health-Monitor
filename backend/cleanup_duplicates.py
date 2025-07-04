from models import SleepSession
from database import async_session
from sqlalchemy.future import select
import asyncio
async def remove_sleep_duplicates():
    async with async_session() as db:
        print("Fetching all sleep sessions...")
        result = await db.execute(select(SleepSession))
        all_sleep = result.scalars().all()

        seen = set()
        to_delete = []

        for rec in all_sleep:
            key = (rec.user_id, rec.start_time, rec.end_time)
            if key in seen:
                to_delete.append(rec)
            else:
                seen.add(key)

        print(f"Found {len(to_delete)} duplicate SleepSessions. Deleting...")

        for rec in to_delete:
            await db.delete(rec)

        await db.commit()
        print("Sleep session cleanup complete.")

# Run cleanup
asyncio.run(remove_sleep_duplicates())
