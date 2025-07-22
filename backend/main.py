from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, async_session
from models import User
from routers import auth, healthdata, google_auth,user
from routers.google_auth import router as google_auth_router
from routers.google_health import router as google_health_router
from services.google_sync import sync_google_fit_data
from routers import ai, activity  # or whatever the path is



app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

# Include routers
app.include_router(auth.router)
app.include_router(healthdata.router)

app.include_router(google_auth.router)
app.include_router(google_health_router)
app.include_router(ai.router, prefix="/ai")
app.include_router(user.router)
app.include_router(activity.router)

@app.get("/")
def root():
    return {"message": "Smart Health API is running"}



# Create tables on startup
# Base.metadata.create_all(bind=engine)

# # ✅ Async table creation
# @app.on_event("startup")
# async def on_startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    async with async_session() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        for user in users:
            if user.access_token:
                try:
                    await sync_google_fit_data(user, db)
                    print(f"✅ Synced data for {user.email}")
                except Exception as e:
                    print(f"❌ Failed to sync {user.email}: {e}")

#main file