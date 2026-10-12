SYSTEM_PROMPT = """You are an expert luxury home architect who outputs floor plans strictly as valid JSON conforming to the requested schema.

The user will provide requirements including:
- Plot size (e.g., 30x40 ft)
- Number of floors
- Number of bedrooms and bathrooms
- Style (e.g., Modern luxury, Traditional, Minimal)
- Kitchen type (Open or Closed)
- Parking details
- Extra rooms/features (e.g., Pooja room, Balcony, Garden)

Your task is to generate a fully realized, luxury, architectural floor plan layout.

### COORDINATE SYSTEM & DESIGN RULES:
1. Plot size: The plot width and length define the maximum boundary (X goes from 0 to plotWidth, Y goes from 0 to plotLength).
2. Setbacks: Leave appropriate open space (setbacks) around the house:
   - Front setback (usually at y = 0 to 4-8 ft) for entrance path, porch, or parking.
   - Rear setback (usually 2-4 ft at plotLength).
   - Side setbacks (1-3 ft on sides).
3. Rooms layout:
   - Each room is a rectangle defined by: `x`, `y`, `width`, `length` (all in feet).
   - Rooms MUST fit entirely within the buildable area (x + width <= plotWidth, y + length <= plotLength).
   - Rooms MUST NOT overlap each other on the same floor. They should share adjacent walls.
   - For multi-floor layouts (floor 0 = Ground, floor 1 = First, etc.), design each floor logically. Hallway/staircase should align across floors.
4. Vastu compliance guidelines (for luxury Indian residences):
   - Pooja room: Northeast (NE) corner is ideal.
   - Kitchen: Southeast (SE) corner is ideal, Northwest (NW) is secondary.
   - Master Bedroom: Southwest (SW) corner is ideal.
   - Bathrooms: Northwest (NW), West (W), or South (S). Never in the Northeast (NE).
   - Living room / Entrance: North (N) or East (E) side.
   - North direction: The parameter `northDirection` represents degrees (0 = Up/North, 90 = East, 180 = South, 270 = West).
5. Openings (Doors and Windows):
   - A door or window should lie on one of the four walls of a room:
     - North wall: y matches room y, x is within room's X range. wall = "north"
     - South wall: y matches room y + length, x is within room's X range. wall = "south"
     - East wall: x matches room x + width, y is within room's Y range. wall = "east"
     - West wall: x matches room x, y is within room's Y range. wall = "west"
   - Door widths: main door 4ft, bedroom door 3ft, bathroom door 2.5ft. Windows: 3-5ft.

### JSON OUTPUT FORMAT:
You must output ONLY raw, valid JSON. Do not include markdown code block formatting (no ```json). Do not include any pre-text or post-text explanation.

The JSON structure must match this schema:
{
  "meta": {
    "plotWidth": float (width of plot in feet),
    "plotLength": float (length of plot in feet),
    "style": string (matching requested style),
    "northDirection": float (degrees, default 0.0),
    "totalFloors": int (number of floors, minimum 1),
    "title": string (a short creative title, e.g., "The Serene Oasis Duplex"),
    "description": string (short design description summarizing the layout features)
  },
  "rooms": [
    {
      "name": string (e.g., "Master Bedroom", "Kitchen", "Living Room", "Pooja Room", "Guest Bedroom", "Dining Room", "Staircase Hall"),
      "type": string (must be one of: "bedroom", "kitchen", "bathroom", "living", "pooja", "hallway", "balcony", "dining"),
      "floor": int (0 for ground floor, 1 for first floor, etc.),
      "x": float (x-coordinate in feet),
      "y": float (y-coordinate in feet),
      "width": float (width in feet),
      "length": float (length in feet)
    }
  ],
  "openings": [
    {
      "type": string ("door" or "window"),
      "floor": int,
      "x": float (x-coordinate),
      "y": float (y-coordinate),
      "width": float (width in feet),
      "wall": string ("north", "south", "east", "west")
    }
  ]
}
"""

VARIANT_THEMES = [
    {
        "name": "Option A - Open Concept Flow",
        "focus": "Spacious interconnected living and dining zones, central entry foyer, and generous natural daylight ventilation."
    },
    {
        "name": "Option B - Smart Functional Efficiency",
        "focus": "Optimized circulation corridors, private bedrooms, dedicated work/study spaces, and high utility-to-circulation ratio."
    },
    {
        "name": "Option C - Luxury Executive Villa",
        "focus": "Expansive master suite retreat, extended balcony/terrace indoor-outdoor connections, and resort-style bath layouts."
    }
]


def build_generate_prompt(plot: str, floors: int, bedrooms: int, bathrooms: int, style: str, kitchen: str, parking: str, extras: list[str], theme_note: str = "") -> str:
    extras_str = ", ".join(extras) if extras else "None"
    theme_part = f"\n- Design Theme Focus: {theme_note}" if theme_note else ""
    return f"""Generate an architectural floor plan with the following inputs:
- Plot Size: {plot} (width x length in feet, e.g. "30x40" or "40x60")
- Total Floors: {floors}
- Number of Bedrooms: {bedrooms}
- Number of Bathrooms: {bathrooms}
- Architectural Style: {style}
- Kitchen style: {kitchen} kitchen
- Parking details: {parking}
- Extras desired: {extras_str}{theme_part}

CRITICAL: Return ONLY a raw JSON object matching the requested schema. Start your response directly with '{{' and end with '}}'. Do NOT wrap the JSON in markdown code blocks or backticks. Do NOT write any introduction or explanation text.
"""


def build_variant_prompt(plot: str, floors: int, bedrooms: int, bathrooms: int, style: str, kitchen: str, parking: str, extras: list[str], variant_index: int) -> str:
    idx = variant_index % len(VARIANT_THEMES)
    theme = VARIANT_THEMES[idx]
    extras_str = ", ".join(extras) if extras else "None"
    return f"""Generate floor plan {theme['name']} with the following inputs:
- Plot Size: {plot} (width x length in feet)
- Total Floors: {floors}
- Number of Bedrooms: {bedrooms}
- Number of Bathrooms: {bathrooms}
- Architectural Style: {style}
- Kitchen style: {kitchen} kitchen
- Parking details: {parking}
- Extras desired: {extras_str}
- UNIQUE THEME EMPHASIS: {theme['focus']}
- In the 'meta' object, set 'title' to reflect this distinct variation (e.g. "{theme['name']} - ...").

CRITICAL: Return ONLY a raw JSON object matching the requested schema. Start your response directly with '{{' and end with '}}'. Do NOT wrap the JSON in markdown code blocks.
"""


def build_variants_prompt(plot: str, floors: int, bedrooms: int, bathrooms: int, style: str, kitchen: str, parking: str, extras: list[str]) -> str:
    extras_str = ", ".join(extras) if extras else "None"
    return f"""Generate 3 distinctly different alternative floor plan options with the following inputs:
- Plot Size: {plot} (width x length in feet, e.g. "30x40" or "40x60")
- Total Floors: {floors}
- Number of Bedrooms: {bedrooms}
- Number of Bathrooms: {bathrooms}
- Architectural Style: {style}
- Kitchen style: {kitchen} kitchen
- Parking details: {parking}
- Extras desired: {extras_str}

Please generate 3 different floor plan layouts (different room distributions, stairs placement, room sizes, or outdoor setups).
The JSON response MUST be a single object with a key "variants" containing an array of 3 floor plans. Each floor plan in the array must strictly match the floor plan schema.

CRITICAL: Return ONLY a raw JSON object matching the variants schema. Start your response directly with '{{' and end with '}}'. Do NOT wrap the JSON in markdown code blocks.
"""
