import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.ai.llm import generate_structured_json
from src.prompts.floorplan_prompt import (
    SYSTEM_PROMPT,
    build_generate_prompt,
    build_variant_prompt,
    build_variants_prompt
)
from src.models import FloorPlan

router = APIRouter(prefix="/plans", tags=["Plans Generation"])

class GenerateRequest(BaseModel):
    plot: str
    floors: int
    bedrooms: int
    bathrooms: int
    style: str
    kitchen: str
    parking: str
    extras: list[str] = []
    variants: int = 1

class GenerateResponse(BaseModel):
    variants: list[FloorPlan]


async def _generate_single_variant_async(request: GenerateRequest, index: int) -> FloorPlan:
    """Generates a single variant asynchronously in a thread executor."""
    prompt = build_variant_prompt(
        plot=request.plot,
        floors=request.floors,
        bedrooms=request.bedrooms,
        bathrooms=request.bathrooms,
        style=request.style,
        kitchen=request.kitchen,
        parking=request.parking,
        extras=request.extras,
        variant_index=index
    )

    loop = asyncio.get_event_loop()
    try:
        raw_json = await loop.run_in_executor(None, generate_structured_json, SYSTEM_PROMPT, prompt)
        return FloorPlan.model_validate(raw_json)
    except Exception as e:
        print(f"[Generate] Variant {index} first attempt failed ({e}), retrying once...")
        retry_prompt = prompt + "\n\nCRITICAL: Keep coordinates within boundaries and ensure valid JSON."
        raw_json = await loop.run_in_executor(None, generate_structured_json, SYSTEM_PROMPT, retry_prompt)
        return FloorPlan.model_validate(raw_json)


@router.post("/generate", response_model=GenerateResponse)
async def generate_plan(request: GenerateRequest):
    if request.variants > 1:
        # Generate distinct variants concurrently
        num_variants = min(max(request.variants, 2), 3)
        tasks = [_generate_single_variant_async(request, i) for i in range(num_variants)]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        valid_variants = [r for r in results if isinstance(r, FloorPlan)]

        if not valid_variants:
            # Fallback to single generation
            first_err = results[0] if results else "Unknown error"
            print(f"[Generate] All concurrent variant generations failed ({first_err}). Falling back to single...")
            try:
                single_plan = await _generate_single_variant_async(request, 0)
                valid_variants = [single_plan]
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate layout variants: {str(e)}"
                )

        return GenerateResponse(variants=valid_variants)

    else:
        # Single layout generation
        prompt = build_generate_prompt(
            plot=request.plot,
            floors=request.floors,
            bedrooms=request.bedrooms,
            bathrooms=request.bathrooms,
            style=request.style,
            kitchen=request.kitchen,
            parking=request.parking,
            extras=request.extras
        )

        loop = asyncio.get_event_loop()
        try:
            raw_json = await loop.run_in_executor(None, generate_structured_json, SYSTEM_PROMPT, prompt)
            plan = FloorPlan.model_validate(raw_json)
            return GenerateResponse(variants=[plan])
        except Exception as e:
            print(f"[Generate] Single layout first attempt failed ({e}), retrying...")
            try:
                retry_prompt = prompt + "\n\nCRITICAL: Ensure coordinates do not exceed plot boundaries. Return valid JSON only."
                raw_json = await loop.run_in_executor(None, generate_structured_json, SYSTEM_PROMPT, retry_prompt)
                plan = FloorPlan.model_validate(raw_json)
                return GenerateResponse(variants=[plan])
            except Exception as e2:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate a structurally valid floor plan. Error: {str(e2)}"
                )
