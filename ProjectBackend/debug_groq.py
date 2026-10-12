import os, json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

from src.prompts.floorplan_prompt import SYSTEM_PROMPT, build_generate_prompt
from src.ai.llm import generate_structured_json

user_prompt = build_generate_prompt("30x40", 2, 4, 3, "Modern luxury", "Open", "1 car", ["Pooja room"])

print("=== Test 1: Raw content WITHOUT response_format ===")
r = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
    temperature=0.2
)
content = r.choices[0].message.content or ""
print("Content length:", len(content))
print("Content preview (first 300 chars):", content[:300])
print()

print("=== Test 2: generate_structured_json (with extraction) ===")
try:
    result = generate_structured_json(SYSTEM_PROMPT, user_prompt)
    print("SUCCESS - Keys:", list(result.keys()))
    print("Meta title:", result.get("meta", {}).get("title"))
    print("Room count:", len(result.get("rooms", [])))
    print("Opening count:", len(result.get("openings", [])))
except Exception as e:
    print("FAILED:", e)
