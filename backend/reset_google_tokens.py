# reset_google_tokens.py

from database import SessionLocal  # <-- adjust if needed
from models import User            # <-- adjust if needed

def reset_tokens(email):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.access_token = None
        user.refresh_token = None
        db.commit()
        print(f"✅ Tokens reset for: {email}")
    else:
        print("❌ User not found")

if __name__ == "__main__":
    reset_tokens("jrtnmy@gmail.com")
