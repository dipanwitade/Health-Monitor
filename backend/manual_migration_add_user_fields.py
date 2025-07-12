import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "sqlite+aiosqlite:///./healthcare.db"

columns_to_add = [
    ("age", "INTEGER"),
    ("gender", "VARCHAR(10)"),
    ("phone", "VARCHAR(20)"),
    ("country", "VARCHAR(50)"),
    ("role", "VARCHAR(20)")
]

async def run_migration():
    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        for column, col_type in columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN {column} {col_type}"))
                print(f"✅ Added column: {column}")
            except Exception as e:
                if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"⚠️  Column '{column}' already exists. Skipping.")
                else:
                    print(f"❌ Failed to add column {column}: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
