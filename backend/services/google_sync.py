# backend/services/google_sync.py
import json
from models import HealthData, User
from datetime import datetime, timedelta, timezone
import httpx
from routers.google_auth import DATA_TYPES, GOOGLE_FIT_API_URL, build_request_body
from sqlalchemy.future import select
from models import SleepSession

async def sync_google_fit_data(user: User, db, days_back: int = 1):
    now = datetime.utcnow()

    async with httpx.AsyncClient() as client:
        for offset in range(days_back):
            day = now - timedelta(days=offset)
            start_time = day.replace(hour=0, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(days=1)

            start_millis = int(start_time.timestamp() * 1000)
            end_millis = int(end_time.timestamp() * 1000)

            headers = {
                "Authorization": f"Bearer {user.access_token}"
            }

            for key, data_type in DATA_TYPES.items():
                request_body = build_request_body(data_type, start_millis, end_millis)
                response = await client.post(
                    GOOGLE_FIT_API_URL,
                    headers=headers,
                    json=build_request_body(data_type, start_millis, end_millis),
                    timeout=30.0
                    
                )
                print(f"Fetching {key} → status {response.status_code}")
                # print("Response:", response.json())


                if response.status_code != 200:
                    continue

                for bucket in response.json().get("bucket", []):
                    for dataset in bucket.get("dataset", []):
                        for point in dataset.get("point", []):
                            ts = int(point["startTimeNanos"]) // 1_000_000
                            ts_dt = datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
                            ts_dt = ts_dt.replace(microsecond=0)


                            # Deduplication check
                            exists = await db.execute(
                                select(HealthData).where(
                                    HealthData.user_id == user.id,
                                    HealthData.metric_type == key,
                                    HealthData.timestamp >= ts_dt.replace(microsecond=0),
                                    # HealthData.timestamp >= ts_dt,
                                    HealthData.timestamp <= ts_dt.replace(microsecond=999000)
                                    # HealthData.timestamp <= ts_dt + timedelta(milliseconds=999)
                                )
                            )
                            if exists.scalars().first():
                                continue  # Skip duplicates

                            # if key == "blood_pressure":
                            #     systolic = diastolic = None
                            #     for val in point["value"]:
                            #         for entry in val.get("mapVal", []):
                            #             if entry["key"] == "systolic":
                            #                 systolic = entry["value"].get("fpVal")
                            #             elif entry["key"] == "diastolic":
                            #                 diastolic = entry["value"].get("fpVal")

                            #     if systolic and diastolic:
                            #         exists = await db.execute(
                            #             select(HealthData).where(
                            #                 HealthData.user_id == user.id,
                            #                 HealthData.metric_type == key,
                            #                 HealthData.timestamp == ts_dt
                            #             )
                            #         )
                            #         if not exists.scalars().first():
                            #             db.add(HealthData(
                            #                 user_id=user.id,
                            #                 metric_type=key,
                            #                 systolic=int(systolic),
                            #                 diastolic=int(diastolic),
                            #                 timestamp=ts_dt
                            #             ))

                            # elif key == "sleep":
                            #     sleep_type = point["value"][0].get("intVal")
                            #     sleep_duration = (int(point["endTimeNanos"]) - int(point["startTimeNanos"])) / 1e9 / 3600  # hours

                            #     if sleep_duration > 0:
                            #         exists = await db.execute(
                            #             select(HealthData).where(
                            #                 HealthData.user_id == user.id,
                            #                 HealthData.metric_type == key,
                            #                 HealthData.timestamp == ts_dt
                            #             )
                            #         )
                            #         if not exists.scalars().first():
                            #             db.add(HealthData(
                            #                 user_id=user.id,
                            #                 metric_type=key,
                            #                 value=round(sleep_duration, 2),
                            #                 timestamp=ts_dt
                            #             ))

                            # elif key == "stress":
                            #     stress_val = point["value"][0].get("fpVal")
                            #     if stress_val is not None:
                            #         exists = await db.execute(
                            #             select(HealthData).where(
                            #                 HealthData.user_id == user.id,
                            #                 HealthData.metric_type == key,
                            #                 HealthData.timestamp == ts_dt
                            #             )
                            #         )
                            #         if not exists.scalars().first():
                            #             db.add(HealthData(
                            #                 user_id=user.id,
                            #                 metric_type=key,
                            #                 value=stress_val,
                            #                 timestamp=ts_dt
                            #             ))

                            # else:
                            #     value = point["value"][0].get("fpVal")
                            #     if value is not None:
                            #         exists = await db.execute(
                            #             select(HealthData).where(
                            #                 HealthData.user_id == user.id,
                            #                 HealthData.metric_type == key,
                            #                 HealthData.timestamp == ts_dt
                            #             )
                            #         )
                            #         if not exists.scalars().first():
                            #             db.add(HealthData(
                            #                 user_id=user.id,
                            #                 metric_type=key,
                            #                 value=value,
                            #                 timestamp=ts_dt
                            #             ))

                            # Handle each metric
                            # if key == "blood_pressure":
                            #     systolic = diastolic = None
                            #     for val in point["value"]:
                            #         for entry in val.get("mapVal", []):
                            #             if entry["key"] == "systolic":
                            #                 systolic = entry["value"].get("fpVal")
                            #             elif entry["key"] == "diastolic":
                            #                 diastolic = entry["value"].get("fpVal")
                            #     if systolic and diastolic:
                            #         db.add(HealthData(
                            #             user_id=user.id,
                            #             metric_type=key,
                            #             systolic=int(systolic),
                            #             diastolic=int(diastolic),
                            #             timestamp=ts_dt
                            #         ))

                            elif key == "blood_pressure":
                                values = [v.get("fpVal") for v in point["value"] if "fpVal" in v and isinstance(v.get("fpVal"), (int, float))]

                                if len(values) >= 2:
                                    # Sort values descending to assume systolic > diastolic
                                    values.sort(reverse=True)
                                    systolic = values[0]
                                    diastolic = values[-1]

                                    exists = await db.execute(
                                        select(HealthData).where(
                                            HealthData.user_id == user.id,
                                            HealthData.metric_type == key,
                                            HealthData.timestamp == ts_dt
                                        )
                                    )
                                    if not exists.scalars().first():
                                        db.add(HealthData(
                                            user_id=user.id,
                                            metric_type=key,
                                            systolic=int(systolic),
                                            diastolic=int(diastolic),
                                            timestamp=ts_dt
                                        ))


                            elif key == "sleep":
                                # Extract duration for meaningful sleep stages only (2: light, 3: deep, 4: REM, 5: awake)
                                sleep_stage = point["value"][0].get("intVal", 0)
                                start_nanos = int(point["startTimeNanos"])
                                end_nanos = int(point["endTimeNanos"])
                                duration_sec = (end_nanos - start_nanos) / 1e9
                                sleep_duration = duration_sec / 3600  # Convert to hours

                                print(f"[🛌 Sleep] Stage: {sleep_stage}, Duration (hrs): {sleep_duration:.2f}, Time: {ts_dt}")

                                # Store only meaningful sleep stages and skip unknown/awake if needed
                                if sleep_stage in [2, 3, 4] and sleep_duration > 0:
                                    start_dt = datetime.fromtimestamp(start_nanos / 1e9, tz=timezone.utc).replace(microsecond=0)
                                    end_dt = datetime.fromtimestamp(end_nanos / 1e9, tz=timezone.utc).replace(microsecond=0)

                                    # Optional deduplication for sessions
                                    session_exists = await db.execute(
                                        select(SleepSession).where(
                                            SleepSession.user_id == user.id,
                                            SleepSession.start_time == start_dt,
                                            SleepSession.end_time == end_dt,
                                        )
                                    )
                                    if not session_exists.scalars().first():
                                        db.add(SleepSession(
                                            user_id=user.id,
                                            start_time=start_dt,
                                            end_time=end_dt,
                                            duration_hours=round(sleep_duration, 2),
                                        ))


                            elif key == "distance":
                                raw_val = point["value"][0]
                                value = raw_val.get("fpVal") or raw_val.get("intVal")  # Fallback in case it's not fpVal
                                print(f"[📏 Distance] Value: {value} meters at {ts_dt}")

                                if value is not None and value > 0:
                                    exists = await db.execute(
                                        select(HealthData).where(
                                            HealthData.user_id == user.id,
                                            HealthData.metric_type == key,
                                            HealthData.timestamp == ts_dt
                                        )
                                    )
                                    if not exists.scalars().first():
                                        db.add(HealthData(
                                            user_id=user.id,
                                            metric_type=key,
                                            value=round(value / 1000, 2),  # Convert to km
                                            timestamp=ts_dt
                                        ))


                            elif key == "steps":
                                value = point["value"][0].get("intVal")
                                if value is not None:
                                    db.add(HealthData(
                                        user_id=user.id,
                                        metric_type=key,
                                        value=value,
                                        timestamp=ts_dt
                                    ))

                            elif key == "stress":
                                stress_val = point["value"][0].get("fpVal")
                                if stress_val is not None:
                                    db.add(HealthData(
                                        user_id=user.id,
                                        metric_type=key,
                                        value=stress_val,
                                        timestamp=ts_dt
                                    ))

                       


                            # elif key in ["distance", "calories", "spo2", "heart_rate"]:
                            #     value = point["value"][0].get("fpVal")
                            #     if value is not None:
                            #         db.add(HealthData(
                            #             user_id=user.id,
                            #             metric_type=key,
                            #             value=value,
                            #             timestamp=ts_dt
                            #         ))

                            else:
                                value_dict = point["value"][0]
                                value = value_dict.get("fpVal") or value_dict.get("intVal")
                                if value is not None:
                                    db.add(HealthData(
                                        user_id=user.id,
                                        metric_type=key,
                                        value=value,
                                        timestamp=ts_dt
                                    ))




    await db.commit()




# from datetime import datetime, timedelta
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from models import HealthData, User, SleepSession
# from routers.google_auth import GOOGLE_FIT_API_URL, DATA_TYPES, build_request_body
# import httpx
# import hashlib


# def get_time_range(days_back: int):
#     end_time = datetime.utcnow()
#     start_time = end_time - timedelta(days=days_back)
#     return int(start_time.timestamp() * 1000), int(end_time.timestamp() * 1000)

# def generate_hash(user_id: int, metric_type: str, timestamp: datetime, value: float):
#     content = f"{user_id}:{metric_type}:{timestamp.isoformat()}:{value}"
#     return hashlib.sha256(content.encode()).hexdigest()


# def within_time_range(ts1: datetime, ts2: datetime, minutes: int = 5):
#     return abs((ts1 - ts2).total_seconds()) <= minutes * 60


# async def sync_google_fit_data(user: User, db: AsyncSession, days_back: int = 7):
#     if not user.access_token:
#         return

#     headers = {
#         "Authorization": f"Bearer {user.access_token}",
#         "Content-Type": "application/json"
#     }

#     start_time_millis, end_time_millis = get_time_range(days_back)

#     for metric_key, data_type_name in DATA_TYPES.items():
#         body = build_request_body(data_type_name, start_time_millis, end_time_millis)

#         async with httpx.AsyncClient() as client:
#             response = await client.post(
#                 GOOGLE_FIT_API_URL,
#                 headers=headers,
#                 json=body
#             )

#         if response.status_code != 200:
#             print("Google Fit API error:", response.text)
#             continue

#         data = response.json()

#         for bucket in data.get("bucket", []):
#             for dataset in bucket.get("dataset", []):
#                 data_type_name = dataset.get("dataSourceId", "").lower()

#                 if "sleep.segment" in data_type_name:
#                     for point in dataset.get("point", []):
#                         start_time = datetime.fromtimestamp(int(point["startTimeNanos"]) / 1e9)
#                         end_time = datetime.fromtimestamp(int(point["endTimeNanos"]) / 1e9)
#                         duration_hours = round((end_time - start_time).total_seconds() / 3600, 2)

#                         if duration_hours < 0.25:
#                             continue

#                         exists = await db.execute(
#                             select(SleepSession).where(
#                                 SleepSession.user_id == user.id,
#                                 SleepSession.start_time == start_time,
#                                 SleepSession.end_time == end_time
#                             )
#                         )
#                         if exists.scalars().first():
#                             continue

#                         db.add(SleepSession(
#                             user_id=user.id,
#                             start_time=start_time,
#                             end_time=end_time,
#                             duration_hours=duration_hours
#                         ))
#                     continue

#                 if metric_key in ["steps", "distance", "calories"]:
#                     total = 0
#                     for point in dataset.get("point", []):
#                         if metric_key == "steps":
#                             total += round(point["value"][0].get("intVal", 0))
#                         else:
#                             total += round(point["value"][0].get("fpVal", 0), 2)

#                     if total > 0:
#                         bucket_time = datetime.fromtimestamp(int(bucket["startTimeMillis"]) / 1000)
#                         dedup_hash = generate_hash(user.id, metric_key, bucket_time, total)

#                         exists = await db.execute(
#                             select(HealthData).where(
#                                 HealthData.user_id == user.id,
#                                 HealthData.metric_type == metric_key,
#                                 HealthData.hash == dedup_hash
#                             )
#                         )
#                         if exists.scalars().first():
#                             continue

#                         db.add(HealthData(
#                             user_id=user.id,
#                             metric_type=metric_key,
#                             timestamp=bucket_time,
#                             value=total,
#                             hash=dedup_hash
#                         ))

#                 else:
#                     for point in dataset.get("point", []):
#                         start_time = datetime.fromtimestamp(int(point["startTimeNanos"]) / 1e9)
#                         values = point.get("value", [])

#                         if metric_key == "blood_pressure" and len(values) >= 2:
#                             systolic = round(values[0].get("fpVal", 0))
#                             diastolic = round(values[1].get("fpVal", 0))

#                             exists = await db.execute(
#                                 select(HealthData).where(
#                                     HealthData.user_id == user.id,
#                                     HealthData.metric_type == metric_key,
#                                     HealthData.systolic == systolic,
#                                     HealthData.diastolic == diastolic,
#                                     HealthData.timestamp.between(start_time - timedelta(minutes=5), start_time + timedelta(minutes=5))
#                                 )
#                             )
#                             if exists.scalars().first():
#                                 continue

#                             db.add(HealthData(
#                                 user_id=user.id,
#                                 metric_type=metric_key,
#                                 timestamp=start_time,
#                                 systolic=systolic,
#                                 diastolic=diastolic,
#                                 hash=generate_hash(user.id, metric_key, start_time, systolic + diastolic)
#                             ))
#                             continue

#                         elif metric_key in ["heart_rate", "spo2", "stress"]:
#                             if metric_key == "heart_rate":
#                                 value = round(values[0].get("fpVal", 0))
#                             elif metric_key == "spo2":
#                                 value = round(values[0].get("fpVal", 0) * 100, 1)
#                             elif metric_key == "stress":
#                                 value = round(values[0].get("fpVal", 0), 2)

#                             dedup_hash = generate_hash(user.id, metric_key, start_time, value)

#                             exists = await db.execute(
#                                 select(HealthData).where(
#                                     HealthData.user_id == user.id,
#                                     HealthData.metric_type == metric_key,
#                                     HealthData.hash == dedup_hash
#                                 )
#                             )
#                             if exists.scalars().first():
#                                 continue

#                             db.add(HealthData(
#                                 user_id=user.id,
#                                 metric_type=metric_key,
#                                 timestamp=start_time,
#                                 value=value,
#                                 hash=dedup_hash
#                             ))

#     await db.commit()
