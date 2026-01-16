import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.ai.gemini import Gemini
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
origins = [
      "http://localhost:5173",
  "http://127.0.0.1:5173"]
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

gemini_api_key = os.getenv("GEMINI_API_KEY")
print("GEMINI KEY FOUND:", bool(gemini_api_key))

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found! Set it before running uvicorn.")

ai_platform = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_text = ai_platform.chat(request.prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))