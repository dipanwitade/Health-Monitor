
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite DB URL
# SQLALCHEMY_DATABASE_URL = "sqlite:///./healthcare.db"
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./healthcare.db"

# Create engine
# engine = create_async_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
# )

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# Create session
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
Base = declarative_base()


# def get_db():
#     db: Session = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


async def get_db():
    async with async_session() as session:
        yield session