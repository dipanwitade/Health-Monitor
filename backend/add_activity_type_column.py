# add_activity_type_column.py

import sqlite3  # or import psycopg2 for Postgres / MySQLdb for MySQL depending on your DB
from database import SQLALCHEMY_DATABASE_URL

def add_column():
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        conn = sqlite3.connect(SQLALCHEMY_DATABASE_URL.split("///")[-1])
    else:
        raise Exception("Update this script for your specific DB engine")

    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE healthdata ADD COLUMN activity_type TEXT;")
        print("✅ Column 'activity_type' added successfully to 'healthdata' table.")
    except Exception as e:
        print("⚠️ Could not add column. Error:", e)
    finally:
        conn.commit()
        conn.close()

if __name__ == "__main__":
    add_column()
