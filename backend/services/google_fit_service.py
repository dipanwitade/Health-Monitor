from datetime import datetime, timedelta

def fetch_google_fit_data(user_email: str):
    # Dummy data for now — you can add real Google API integration later
    now = datetime.utcnow()

    return {
        "heart_rate": [
            {"timestamp": now.isoformat(), "value": 78},
            {"timestamp": (now - timedelta(hours=1)).isoformat(), "value": 75}
        ],
        "spo2": [
            {"timestamp": now.isoformat(), "value": 97}
        ],
        "blood_pressure": [
            {"timestamp": now.isoformat(), "systolic": 120, "diastolic": 80}
        ]
    }
