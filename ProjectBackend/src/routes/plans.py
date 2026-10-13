from bson import ObjectId
from datetime import datetime
from typing import Optional, Any
from fastapi import APIRouter, HTTPException

from src.database import plans_collection
from src.models import PlanDocument

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("/")
async def save_plan(plan: PlanDocument):
    plan_dict = plan.model_dump(by_alias=True)
    plan_id = plan_dict.pop("_id", None)
    
    # Set/Update timestamps
    now = datetime.utcnow()
    plan_dict["updatedAt"] = now

    if plan_id:
        # Check if ObjectID is valid
        try:
            obj_id = ObjectId(plan_id)
        except Exception:
            raise HTTPException(400, "Invalid plan ID format")

        existing = await plans_collection.find_one({"_id": obj_id})
        if existing and "createdAt" in existing:
            plan_dict["createdAt"] = existing["createdAt"]
        else:
            plan_dict["createdAt"] = now

        result = await plans_collection.replace_one(
            {"_id": obj_id},
            plan_dict
        )
        if result.matched_count == 0:
            # Fallback: if not found, insert it with this ID
            plan_dict["_id"] = obj_id
            plan_dict["createdAt"] = now
            await plans_collection.insert_one(plan_dict)
            return {
                "id": plan_id,
                "message": "Plan saved successfully (created)"
            }
        return {
            "id": plan_id,
            "message": "Plan updated successfully"
        }
    else:
        plan_dict["createdAt"] = now
        result = await plans_collection.insert_one(plan_dict)
        return {
            "id": str(result.inserted_id),
            "message": "Plan saved successfully"
        }


@router.get("/")
async def get_plans(session: Optional[str] = None):
    query = {}
    if session:
        query["sessionId"] = session

    plans = []
    async for plan in plans_collection.find(query).sort("updatedAt", -1):
        plan["_id"] = str(plan["_id"])
        plans.append(plan)
    return plans


@router.get("/{plan_id}")
async def get_plan(plan_id: str):
    try:
        obj_id = ObjectId(plan_id)
    except Exception:
        raise HTTPException(400, "Invalid plan ID format")

    plan = await plans_collection.find_one(
        {"_id": obj_id}
    )

    if not plan:
        raise HTTPException(404, "Plan not found")

    plan["_id"] = str(plan["_id"])
    return plan


@router.get("/{plan_id}/public")
async def get_public_plan(plan_id: str):
    # Public route to get a plan read-only
    try:
        obj_id = ObjectId(plan_id)
    except Exception:
        raise HTTPException(400, "Invalid plan ID format")

    plan = await plans_collection.find_one(
        {"_id": obj_id}
    )

    if not plan:
        raise HTTPException(404, "Plan not found")

    plan["_id"] = str(plan["_id"])
    return plan


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    try:
        obj_id = ObjectId(plan_id)
    except Exception:
        raise HTTPException(400, "Invalid plan ID format")

    result = await plans_collection.delete_one(
        {"_id": obj_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(404, "Plan not found")

    return {
        "message": "Deleted successfully"
    }