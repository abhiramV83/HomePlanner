import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.ai.gemini import Gemini
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi import Request
daily_usage = {}  # { "ip": {"count": int, "date": "YYYY-MM-DD"} }
DAILY_LIMIT = 1



app = FastAPI()
origins = [
    "http://localhost:5173",
    "https://abhiramv83.github.io"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def load_system_prompt():
    try:
        with open("src/prompts/system_prompt.md", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""

system_prompt = load_system_prompt()

gemini_api_key = os.getenv("GEMINI_API_KEY")# api key as a env variable
print("GEMINI KEY FOUND:", bool(gemini_api_key))

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found! Set it before running uvicorn.")

ai_platform = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)#constructer executes when this obj creates

class ChatRequest(BaseModel):
    prompt: str
    user_id: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_key = request.user_id
    today = datetime.now().date().isoformat()

    if user_key not in daily_usage:
        daily_usage[user_key] = {"count": 0, "date": today}

    if daily_usage[user_key]["date"] != today:
        daily_usage[user_key] = {"count": 0, "date": today}

    if daily_usage[user_key]["count"] >= DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached (1 request/day). Try again tomorrow."
        )

    daily_usage[user_key]["count"] += 1

    try:
        response_text = ai_platform.chat(request.prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Hello"}