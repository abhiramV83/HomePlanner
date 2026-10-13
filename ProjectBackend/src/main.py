import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.ai.llm import generate_response
from src.database import db
from src.routes.plans import router as plans_router
from src.routes.generate import router as generate_router
from src.routes.refine import router as refine_router


app = FastAPI(
    title="HomePlanner API",
    description="CAD Floor Plan Generator & Architectural Assistant",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://abhiramv83.github.io"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await db.command("ping")
        print("[OK] MongoDB Connected Successfully")
    except Exception as e:
        print(f"[WARNING] MongoDB connection ping failed: {e}. Persistence endpoints may be unavailable.")


app.include_router(plans_router)
app.include_router(generate_router)
app.include_router(refine_router)


class ChatRequest(BaseModel):
    prompt: str
    user_id: str


class ChatResponse(BaseModel):
    response: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_text = generate_response(request.prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat generation error: {str(e)}"
        )


@app.get("/")
async def root():
    return {
        "message": "HomePlanner API Running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health():
    db_status = "connected"
    try:
        await db.command("ping")
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "database": db_status
    }