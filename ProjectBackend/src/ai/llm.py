import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Model configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")

GROQ_MODEL = "qwen/qwen3.8-27b"
GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = """You are a luxury home architect. Generate a clear home plan in plain text. Keep it medium length (around 250-350 words). Include floor-wise layout, important room sizes, parking plan, and 6 luxury features. Avoid long explanations.
"""

# Initialize Groq client if key available
_groq_client = None
if GROQ_API_KEY:
    try:
        from openai import OpenAI
        _groq_client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
    except Exception as e:
        print(f"[LLM] Warning: Failed to initialize Groq client: {e}")

# Initialize Gemini if key available
_gemini_available = False
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_available = True
    except Exception as e:
        print(f"[LLM] Warning: Failed to configure Gemini SDK: {e}")


def _clean_json_text(raw_text: str) -> str:
    """Extract and sanitize JSON from model output."""
    raw_text = raw_text.strip()
    if not raw_text:
        raise ValueError("Model returned empty text.")

    # Remove markdown code fences if present (```json ... ``` or ``` ... ```)
    fence_match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw_text)
    if fence_match:
        return fence_match.group(1).strip()

    # Extract outermost JSON object { ... }
    brace_match = re.search(r"\{[\s\S]*\}", raw_text)
    if brace_match:
        return brace_match.group(0).strip()

    return raw_text


def _call_groq_structured(system_prompt: str, user_prompt: str) -> dict:
    if not _groq_client:
        raise RuntimeError("Groq client not configured")

    completion = _groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=4096
    )

    content = completion.choices[0].message.content or ""
    clean = _clean_json_text(content)
    return json.loads(clean)


def _call_gemini_structured(system_prompt: str, user_prompt: str) -> dict:
    if not _gemini_available:
        raise RuntimeError("Gemini SDK not configured")

    import google.generativeai as genai
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_prompt
    )
    response = model.generate_content(
        user_prompt,
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.2
        }
    )
    content = response.text or ""
    clean = _clean_json_text(content)
    return json.loads(clean)


def generate_response(prompt: str) -> str:
    """Generates plain text response for general conversational queries."""
    # Try Groq first
    if _groq_client:
        try:
            r = _groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1024
            )
            ans = r.choices[0].message.content
            if ans and ans.strip():
                return ans.strip()
        except Exception as e:
            print(f"[LLM] Groq plain text call failed ({e}), falling back to Gemini...")

    # Fallback to Gemini
    if _gemini_available:
        import google.generativeai as genai
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.3}
        )
        return response.text or ""

    raise RuntimeError("No LLM provider available to generate response.")


def _safe_str(val) -> str:
    try:
        return str(val).encode("ascii", errors="replace").decode("ascii")
    except Exception:
        return "<unprintable>"


def generate_structured_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Primary structured JSON generator with automatic fallback across providers.
    Tries Groq -> Falls back to Google Gemini (gemini-2.5-flash).
    """
    errors = []

    # 1. Try Groq
    if _groq_client:
        try:
            return _call_groq_structured(system_prompt, user_prompt)
        except Exception as e:
            print(f"[LLM] Groq structured generation failed ({_safe_str(e)}). Attempting fallback...")
            errors.append(f"Groq error: {_safe_str(e)}")

    # 2. Try Gemini
    if _gemini_available:
        try:
            return _call_gemini_structured(system_prompt, user_prompt)
        except Exception as e:
            print(f"[LLM] Gemini structured generation failed ({_safe_str(e)}).")
            errors.append(f"Gemini error: {_safe_str(e)}")

    raise RuntimeError(f"All LLM providers failed to generate valid structured JSON. Errors: {' | '.join(errors)}")