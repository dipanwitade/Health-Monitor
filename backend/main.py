from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from database import Base, engine, async_session
from models import User
from routers import auth, healthdata, google_auth,user
from routers.google_health import router as google_health_router
from services.google_sync import sync_google_fit_data
from routers import activity  
from routers import personalized_ai
from services.train_user_model import train_user_model
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", # React app origin
                #    "https://health-monitor-djcv.onrender.com"  # add deployed frontend URL
                "https://health-monitor-web-sdmv.vercel.app"
],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

# Include routers
app.include_router(auth.router)
app.include_router(healthdata.router)

app.include_router(google_auth.router)
app.include_router(google_health_router)

app.include_router(user.router)
app.include_router(activity.router)
app.include_router(personalized_ai.router, prefix="", tags=["personalized_ai"]) 

@app.get("/")
def root():
    return {"message": "Smart Health API is running"}



@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()

        MODEL_BASE = os.path.join(os.path.abspath(os.path.dirname(__file__)),"ml_models", "personalized", "users")

        for user in users:
            if user.access_token:
                try:
                    # 1) Sync Google Fit
                    await sync_google_fit_data(user, db)
                    print(f" Synced data for {user.email}")

                    # 2) Train only if model missing (first-time setup)
                    user_folder = os.path.join(MODEL_BASE, f"user_{user.id}")
                    model_path = os.path.join(user_folder, "unsupervised_model.pkl")
                    scaler_path = os.path.join(user_folder, "scaler.pkl")

                    if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
                        await train_user_model(user.id, db)
                        print(f" Trained first personalized model for {user.email}")
                    else:
                        print(f" Model already exists for {user.email}, skipping training")
                        
                except Exception as e:
                    print(f" Failed to sync/train for {user.email}: {e}")


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok"}