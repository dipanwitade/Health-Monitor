# backend/routers/google_auth.py

from datetime import datetime, time, timedelta
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import os
from sqlalchemy.orm import Session
from database import get_db
from models import User, HealthData

from urllib.parse import urlencode

from dotenv import load_dotenv
from typing import Optional, List


load_dotenv()

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"

# Replace these with your actual credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

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
        "prompt": "consent"
    })
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")

# @router.get("/auth/callback")
# async def auth_callback(code: str):
#     token_data = {
#         "code": code,
#         "client_id": GOOGLE_CLIENT_ID,
#         "client_secret": GOOGLE_CLIENT_SECRET,
#         "redirect_uri": REDIRECT_URI,
#         "grant_type": "authorization_code",
#     }
#     # response = requests.post(token_url, data=data)
#     async with httpx.AsyncClient() as client:
#         response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
#         token_info = response.json()

#     if "access_token" not in token_info:
#         raise HTTPException(status_code=401, detail="Token exchange failed")
    
#     return {"access_token": token_info.get("access_token"), "refresh_token": token_info.get("refresh_token")}

# @router.get("/auth/google/login")
# def google_login():
#     query = urlencode({
#         "client_id": GOOGLE_CLIENT_ID,
#         "response_type": "code",
#         "redirect_uri": REDIRECT_URI,
#         "scope": " ".join(SCOPES),
#         "access_type": "offline",
#         "prompt": "consent"
#     })
#     return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")


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

    # token_response = requests.post(token_url, data=token_data)
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

    # user_info_response = requests.get(user_info_url, headers=headers)
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
    # user = db.query(User).filter(User.email == email).first()
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


    # Optional: Create a JWT token or session here

    frontend_url = f"http://localhost:3000/oauth-success?email={email}"
    return RedirectResponse(frontend_url)


@router.get("/auth/fitness/heart-rate")
async def get_heart_rate_data(db:AsyncSession = Depends(get_db), email: str = "testuser@example.com"):
    # user = db.query(User).filter(User.email == email).first()

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user or not user.access_token:
        raise HTTPException(status_code=401, detail="User not authorized")

    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Content-Type": "application/json"
    }

    # dataset = "0000000000000-" + str(int(time.time() * 1000000000))  # nanosecond format

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

    # response = requests.post(url, headers=headers, json=body)
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=body)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch heart rate data")

    return response.json()



GOOGLE_FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"

# Define data source types
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

# routers/google_auth.py

# DATA_TYPES = {
#     "heart_rate": {
#         "dataTypeName": "com.google.heart_rate.bpm",
#         "dataSourceId": "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm"
#     },
#     "spo2": {
#         "dataTypeName": "com.google.oxygen_saturation",
#         "dataSourceId": "derived:com.google.oxygen_saturation:com.google.android.gms:merged"
#     },
#     "blood_pressure": {
#         "dataTypeName": "com.google.blood_pressure",
#         "dataSourceId": "derived:com.google.blood_pressure:com.google.android.gms:merged"
#     },
#     "steps": {
#         "dataTypeName": "com.google.step_count.delta",
#         "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas"
#     },
#     "calories": {
#         "dataTypeName": "com.google.calories.expended",
#         "dataSourceId": "derived:com.google.calories.expended:com.google.android.gms:merged"
#     },
#     "distance": {
#         "dataTypeName": "com.google.distance.delta",
#         "dataSourceId": "derived:com.google.distance.delta:com.google.android.gms:merged"
#     },
#     "sleep": {
#         "dataTypeName": "com.google.sleep.segment",
#         "dataSourceId": "derived:com.google.sleep.segment:com.google.android.gms:merged"
#     },
#     "stress": {
#         "dataTypeName": "com.google.stress_level",
#         "dataSourceId": "derived:com.google.stress_level:com.google.android.gms:merged"
#     }
# }




def build_request_body(data_type, start_time_millis, end_time_millis):
    return {
        "aggregateBy": [{
            "dataTypeName": data_type
            # "dataTypeName": data_type["dataTypeName"],
            # "dataSourceId": data_type["dataSourceId"]
        }],
        "bucketByTime": { "durationMillis": 3600000 },  # hourly buckets
        "startTimeMillis": start_time_millis,
        "endTimeMillis": end_time_millis
    }


# @router.get("/google/health-data")
# async def get_health_data(user_email: str,period: Optional[str] = "today", db: AsyncSession = Depends(get_db)):
#     # user = db.query(User).filter(User.email == user_email).first()
#     result = await db.execute(select(User).where(User.email == user_email))
#     user = result.scalars().first()

#     if not user or not user.access_token:
#         raise HTTPException(status_code=400, detail="Google account not linked")
    

#     # if period == "today":
#     #     end_time = datetime.utcnow()
#     #     start_time = end_time.replace(hour=0, minute=0, second=0, microsecond=0)
#     # elif period == "yesterday":
#     #     end_time = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
#     #     start_time = end_time - timedelta(days=1)
#     # else:
#     #     # fallback to last 24h
#     #     end_time = datetime.utcnow()
#     #     start_time = end_time - timedelta(days=1)



#     # Time range for today
#     end_time = datetime.utcnow()
#     start_time = end_time - timedelta(days=1)
#     start_millis = int(start_time.timestamp() * 1000)
#     end_millis = int(end_time.timestamp() * 1000)

#     headers = {
#         "Authorization": f"Bearer {user.access_token}"
#     }

#     results = {}

#     async with httpx.AsyncClient() as client:
#         for key, data_type in DATA_TYPES.items():
#             extracted = []
#             response = await client.post(
#                 GOOGLE_FIT_API_URL,
#                 headers=headers,
#                 json=build_request_body(data_type, start_millis, end_millis)
#             )

#             # if response.status_code == 401:
#             #     raise HTTPException(status_code=401, detail="Invalid or expired token. Please re-authenticate.")

#             # Retry once if 401
#             # if response.status_code == 401 and user.refresh_token:
#             #     new_tokens = await refresh_access_token(user.refresh_token)

#             #     user.access_token = new_tokens["access_token"]
#             #     await db.commit()  # Save new access token

#             #     headers["Authorization"] = f"Bearer {user.access_token}"
#             #     response = await client.post(
#             #         GOOGLE_FIT_API_URL,
#             #         headers=headers,
#             #         json=build_request_body(data_type, start_millis, end_millis)
#             #     )

#             # if response.status_code != 200:
#             #     results[key] = []
#             #     continue
#             if response.status_code != 200:
#                 if response.status_code == 401:
#                     raise HTTPException(status_code=401, detail="Invalid or expired token. Please re-authenticate.")
#                 results[key] = []
#                 continue


#             buckets = response.json().get("bucket", [])

#             for bucket in buckets:
#                 for dataset in bucket.get("dataset", []):
#                     points = dataset.get("point", [])
#                     if not points:
#                         continue  # skip empty dataset

#                     for point in points:
#                         ts = int(point["startTimeNanos"]) // 1_000_000

#                         if data_type == "com.google.blood_pressure":
#                             systolic = diastolic = None
#                             for val in point["value"]:
#                                 map_val = val.get("mapVal", [])
#                                 for entry in map_val:
#                                     if entry["key"] == "systolic":
#                                         systolic = entry["value"].get("fpVal")
#                                     elif entry["key"] == "diastolic":
#                                         diastolic = entry["value"].get("fpVal")
#                             if systolic is not None and diastolic is not None:
#                                 extracted.append({
#                                     "timestamp": ts,
#                                     "systolic": int(systolic),
#                                     "diastolic": int(diastolic)
#                                 })
#                         else:
#                             value = point["value"][0].get("fpVal")
#                             if value is not None:
#                                 extracted.append({
#                                     "timestamp": ts,
#                                     "value": int(value)
#                                 })

#             # results[key] = extracted
#             for entry in extracted:
#                 ts = datetime.fromtimestamp(entry["timestamp"] / 1000)

#                 if key == "blood_pressure":
#                     new_entry = HealthData(
#                         user_id=user.id,
#                         metric_type=key,
#                         systolic=entry["systolic"],
#                         diastolic=entry["diastolic"],
#                         timestamp=ts
#                     )

#                 else:
#                     new_entry = HealthData(
#                         user_id=user.id,
#                         metric_type=key,
#                         value=entry["value"],
#                         timestamp=ts
#                     )

#                 db.add(new_entry)
#     await db.commit()

#     print("Final results to return:", results)
#     return results


# @router.get("/healthdata/history")
# async def get_health_data_history(
#     user_email: str,
#     start_date: str = Query(..., description="YYYY-MM-DD"),
#     end_date: str = Query(..., description="YYYY-MM-DD"),
#     db: AsyncSession = Depends(get_db),
# ):
#     try:
#         start_dt = datetime.strptime(start_date, "%Y-%m-%d")
#         end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

#     # 🔐 Find user by email
#     result = await db.execute(select(User).where(User.email == user_email))
#     user = result.scalars().first()

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found.")

#     # 📊 Get health records for the user between dates
#     result = await db.execute(
#         select(HealthData).where(
#             HealthData.user_id == user.id,
#             HealthData.timestamp >= start_dt,
#             HealthData.timestamp <= end_dt,
#         )
#     )
#     records: List[HealthData] = result.scalars().all()

#     heart_rate = []
#     spo2 = []
#     blood_pressure = []

#     for rec in records:
#         ts = int(rec.timestamp.timestamp() * 1000)

#         if rec.metric_type == "heart_rate" and rec.value is not None:
#             heart_rate.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "spo2" and rec.value is not None:
#             spo2.append({"timestamp": ts, "value": rec.value})

#         elif rec.metric_type == "blood_pressure" and rec.systolic and rec.diastolic:
#             blood_pressure.append({
#                 "timestamp": ts,
#                 "systolic": rec.systolic,
#                 "diastolic": rec.diastolic
#             })

#     return {
#         "heart_rate": heart_rate,
#         "spo2": spo2,
#         "blood_pressure": blood_pressure
#     }



# @router.post("/google/sync")
# async def sync_now(user_email: str, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(User).where(User.email == user_email))
#     user = result.scalars().first()

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     await sync_google_fit_data(user, db)
#     return {"detail": "Synced successfully"}