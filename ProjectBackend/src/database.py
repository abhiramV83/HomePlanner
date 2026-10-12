from pathlib import Path
import os
import pymongo
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")

def get_database_client():
    # If the MONGO_URI is Atlas, let's test if we can ping it quickly (2s timeout).
    # If it fails, we fall back to local MongoDB.
    if "mongodb.net" in mongo_uri:
        try:
            print(f"Attempting connection to Atlas MongoDB ({mongo_uri})...")
            test_client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            test_client.admin.command("ping")
            print("Connected to Atlas MongoDB successfully.")
            return AsyncIOMotorClient(mongo_uri)
        except Exception as e:
            print(f"Failed to connect to Atlas MongoDB ({e}). Falling back to local MongoDB at mongodb://localhost:27017")
            return AsyncIOMotorClient("mongodb://localhost:27017")
    else:
        return AsyncIOMotorClient(mongo_uri)

client = get_database_client()
db = client[os.getenv("DATABASE_NAME", "homeplanner")]
plans_collection = db["plans"]