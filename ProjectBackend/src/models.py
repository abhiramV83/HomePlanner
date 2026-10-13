from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, model_validator

class Room(BaseModel):
    name: str
    type: str  # e.g., "bedroom", "kitchen", "bathroom", "living", "pooja", "hallway", "balcony", "dining"
    floor: int
    x: float
    y: float
    width: float
    length: float

    @model_validator(mode="before")
    @classmethod
    def sanitize_room_fields(cls, data: Any) -> Any:
        if isinstance(data, dict) and "type" in data and isinstance(data["type"], str):
            data["type"] = data["type"].lower().strip()
        return data

    @model_validator(mode="after")
    def validate_dimensions(self) -> "Room":
        self.type = self.type.lower().strip()
        if self.width <= 0 or self.length <= 0:
            raise ValueError("Room width and length must be greater than 0")
        if self.x < 0 or self.y < 0:
            raise ValueError("Room coordinates must be non-negative")
        return self

class Opening(BaseModel):
    type: str  # "door" or "window"
    floor: int
    x: float
    y: float
    width: float
    wall: str  # "north", "south", "east", "west"

    @model_validator(mode="before")
    @classmethod
    def sanitize_opening_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "type" in data and isinstance(data["type"], str):
                data["type"] = data["type"].lower().strip()
            if "wall" in data and isinstance(data["wall"], str):
                data["wall"] = data["wall"].lower().strip()
        return data

    @model_validator(mode="after")
    def validate_opening(self) -> "Opening":
        self.type = self.type.lower().strip()
        self.wall = self.wall.lower().strip()
        if self.width <= 0:
            raise ValueError("Opening width must be greater than 0")
        if self.x < 0 or self.y < 0:
            raise ValueError("Opening coordinates must be non-negative")
        if self.type not in ("door", "window"):
            raise ValueError("Opening type must be 'door' or 'window'")
        if self.wall not in ("north", "south", "east", "west"):
            raise ValueError("Opening wall must be one of 'north', 'south', 'east', 'west'")
        return self

class Meta(BaseModel):
    plotWidth: float
    plotLength: float
    style: str
    northDirection: float = 0.0  # degrees, default 0
    totalFloors: int = 1
    title: str = "My Dream Home"
    description: str = ""

    @model_validator(mode="after")
    def validate_plot(self) -> "Meta":
        if self.plotWidth <= 0 or self.plotLength <= 0:
            raise ValueError("Plot width and length must be greater than 0")
        return self

class FloorPlan(BaseModel):
    meta: Meta
    rooms: list[Room]
    openings: list[Opening]

    @model_validator(mode="after")
    def validate_floorplan(self) -> "FloorPlan":
        width = self.meta.plotWidth
        length = self.meta.plotLength

        # Sanitize and clamp room boundaries accurately to prevent plot overshoot
        for room in self.rooms:
            # Ensure room width and length do not exceed total plot dimensions
            room.width = max(2.0, min(room.width, width))
            room.length = max(2.0, min(room.length, length))

            # Clamp coordinates so room is strictly bounded by [0, width] and [0, length]
            room.x = max(0.0, min(room.x, max(0.0, width - room.width)))
            room.y = max(0.0, min(room.y, max(0.0, length - room.length)))

        # Sanitize openings to fit walls
        for op in self.openings:
            op.x = max(0.0, min(op.x, width))
            op.y = max(0.0, min(op.y, length))

            if op.wall in ("north", "south"):
                if op.x + op.width > width:
                    op.width = max(1.0, width - op.x)
            elif op.wall in ("east", "west"):
                if op.y + op.width > length:
                    op.width = max(1.0, length - op.y)

        return self

    def find_overlaps(self, tolerance: float = 0.5) -> list[dict[str, Any]]:
        """Find overlapping rooms on the same floor exceeding tolerance."""
        overlaps = []
        by_floor: dict[int, list[Room]] = {}
        for r in self.rooms:
            by_floor.setdefault(r.floor, []).append(r)

        for floor, frooms in by_floor.items():
            for i in range(len(frooms)):
                for j in range(i + 1, len(frooms)):
                    r1 = frooms[i]
                    r2 = frooms[j]
                    if (
                        r1.x < r2.x + r2.width - tolerance
                        and r2.x < r1.x + r1.width - tolerance
                        and r1.y < r2.y + r2.length - tolerance
                        and r2.y < r1.y + r1.length - tolerance
                    ):
                        overlaps.append({
                            "floor": floor,
                            "room1": r1.name,
                            "room2": r2.name
                        })
        return overlaps


class PlanDocument(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    sessionId: str
    planJson: FloorPlan
    chatHistory: list[dict[str, Any]] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }