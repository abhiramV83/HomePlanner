import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from src.ai.llm import generate_structured_json
from src.models import FloorPlan
from src.prompts.floorplan_prompt import SYSTEM_PROMPT

router = APIRouter(prefix="/plans", tags=["Plans Refinement"])

class RefineRequest(BaseModel):
    currentPlan: FloorPlan
    userMessage: str
    chatHistory: list[dict[str, Any]] = []

@router.post("/refine", response_model=FloorPlan)
async def refine_plan(request: RefineRequest):
    system_prompt = SYSTEM_PROMPT + """
You are performing a conversational refinement on an existing floor plan layout.
The user wants to make modifications. You must output the ENTIRE updated floor plan JSON. Do not output a diff or any explanation.
Ensure you retain the overall layout except for the modifications requested. Ensure coordinates remain valid and no rooms overlap.

CRITICAL: Return ONLY a raw JSON object matching the floor plan schema. Start your response directly with '{' and end with '}'. Do NOT wrap the JSON in markdown code blocks. Do NOT write any introduction or explanation text.
"""
    
    history_str = ""
    for msg in request.chatHistory[-6:]:  # Keep recent context to avoid token bloat
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_str += f"{role.upper()}: {content[:300]}\n"
        
    user_prompt = f"""
Current Floor Plan JSON:
{request.currentPlan.model_dump_json(indent=2)}

Conversation History:
{history_str}
New Request from User:
USER: {request.userMessage}

Please modify the floor plan according to the new request. 
Retain existing rooms that were not requested to change.
Ensure room widths, lengths, and positions fit within the plot boundary.

CRITICAL: Return ONLY the complete updated floor plan JSON. Start your response directly with '{{' and end with '}}'. Do NOT use markdown code blocks or backticks.
"""

    loop = asyncio.get_event_loop()
    # First attempt
    try:
        raw_json = await loop.run_in_executor(None, generate_structured_json, system_prompt, user_prompt)
        validated_plan = FloorPlan.model_validate(raw_json)
        return validated_plan
    except Exception as e:
        print(f"[Refine] First refinement attempt failed ({e}). Retrying once...")
        
        # Retry once
        try:
            retry_user_prompt = user_prompt + "\n\nCRITICAL: Ensure the JSON structure is correct and matches schema. Coordinates must fit in plot bounds."
            raw_json = await loop.run_in_executor(None, generate_structured_json, system_prompt, retry_user_prompt)
            validated_plan = FloorPlan.model_validate(raw_json)
            return validated_plan
        except Exception as e2:
            print(f"[Refine] Second refinement attempt failed ({e2})")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to refine floor plan with valid structure. Error: {str(e2)}"
            )
