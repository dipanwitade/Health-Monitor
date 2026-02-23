# backend/routers/google_auth.py

from datetime import datetime, time, timedelta
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import os
from database import get_db
from models import User

from urllib.parse import urlencode

from dotenv import load_dotenv


load_dotenv()

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# REDIRECT_URI = "http://localhost:8000/auth/google/callback"
REDIRECT_URI = os.getenv("REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")  


SCOPES = [
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.blood_pressure.read",
    "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    # "https://www.googleapis.com/auth/fitness.stress.read",
    "https://www.googleapis.com/auth/fitness.location.read",
    "https://www.googleapis.com/auth/fitness.nutrition.read",
    "openid",
    "email",
    "profile"
]

async def refresh_access_token(refresh_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(GOOGLE_TOKEN_URL, data={
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        })

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Unable to refresh token")

    return response.json()

@router.get("/auth/google/login")
async def login():
    query = urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        # "prompt": "consent"
        "include_granted_scopes": "true",
        "prompt": "select_account",
    })
    

    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")



@router.get("/auth/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    code = request.query_params.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google callback")

    # Step 1: Exchange code for token
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    print("REDIRECT_URI =", os.getenv("REDIRECT_URI"))
    print("FRONTEND_URL =", os.getenv("FRONTEND_URL"))

    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        token_json = token_response.json()

    if "access_token" not in token_json:
        print("Token exchange failed:", token_json)
        raise HTTPException(status_code=401, detail="Token exchange failed")

    access_token = token_json["access_token"]
    refresh_token = token_json.get("refresh_token")  # Can be None on repeated login

    # Step 2: Fetch user info using the access token
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}


    async with httpx.AsyncClient() as client:
        user_info_response = await client.get(user_info_url, headers=headers)
        user_info = user_info_response.json()

    if "email" not in user_info:
        print("User info fetch failed:", user_info)
        raise HTTPException(status_code=401, detail="Failed to fetch user info")

    # Step 3: Extract info
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    

    # Step 4: Save user or get existing user
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        user = User(
            name=name,
            email=email,
            profile_pic=picture,
            access_token=access_token,
            refresh_token=refresh_token
        )
        db.add(user)
    
    else:
        user.access_token = access_token
        user.refresh_token = refresh_token or user.refresh_token

    await db.commit()
    await db.refresh(user)

    frontend_url = f"{FRONTEND_URL}/oauth-success?email={email}"
    return RedirectResponse(frontend_url)



@router.get("/auth/fitness/heart-rate")
async def get_heart_rate_data(db:AsyncSession = Depends(get_db), email: str = "testuser@example.com"):

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authorized")

    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Content-Type": "application/json"
    }


    dataset = f"0000000000000-{int(time.time() * 1e9)}"  # nanosecond format
    url = f"https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"

    body = {
        "aggregateBy": [{
            "dataTypeName": "com.google.heart_rate.bpm"
        }],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        "endTimeMillis": int(datetime.utcnow().timestamp() * 1000)
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=body)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch heart rate data")

    return response.json()



GOOGLE_FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"


DATA_TYPES = {
    "heart_rate": "com.google.heart_rate.bpm",
    "blood_pressure": "com.google.blood_pressure",
    "spo2": "com.google.oxygen_saturation",

    "steps": "com.google.step_count.delta",
    "distance": "com.google.distance.delta",
    "calories": "com.google.calories.expended",
    "sleep": "com.google.sleep.segment",
    "stress": "com.google.stress_level"
    
}


def build_request_body(data_type, start_time_millis, end_time_millis):
    return {
        "aggregateBy": [{
            "dataTypeName": data_type
        }],
        "bucketByTime": { "durationMillis": 3600000 },  # hourly buckets
        "startTimeMillis": start_time_millis,
        "endTimeMillis": end_time_millis
    }
