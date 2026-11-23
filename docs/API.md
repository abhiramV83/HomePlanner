# HomePlanner REST API Reference

The HomePlanner backend exposes an asynchronous REST API on port `8000`.

---

## Endpoints

### 1. `GET /`
**Description**: System health check, runtime status, and active LLM configuration.

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "HomePlanner API",
  "version": "2.1.0",
  "primary_llm": "groq",
  "fallback_llm": "gemini"
}
```

---

### 2. `POST /plans/generate`
**Description**: Generates 3 coordinate-aligned floor plan options.

**Request Body**:
```json
{
  "plot_width": 30.0,
  "plot_length": 40.0,
  "floors": 2,
  "bedrooms": 3,
  "bathrooms": 3,
  "style": "Modern Minimalist",
  "kitchen_type": "open",
  "parking": "car",
  "extras": ["balcony", "pooja"],
  "variants": 3
}
```

---

### 3. `POST /plans/refine`
**Description**: Conversational layout mutation.

**Request Body**:
```json
{
  "current_plan": { "meta": {}, "rooms": [], "openings": [] },
  "user_message": "Expand living room width by 3 feet",
  "chat_history": []
}
```

---

### 4. `POST /plans/`
**Description**: Persists blueprint document to MongoDB.

---

### 5. `GET /plans/?session={uuid}`
**Description**: Retrieves all saved blueprints for a user session.
