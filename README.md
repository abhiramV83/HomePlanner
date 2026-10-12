# HomePlanner - Premium AI Floor Plan Architect

HomePlanner is a full-stack interactive architectural floor planner application. Powered by a high-performance hybrid AI engine (**Groq Qwen/Llama** with automatic **Google Gemini 2.5 Flash** fallback), the application transforms spatial requirements (plot dimensions, floors, style, rooms, parking preferences) into structurally valid, coordinate-aligned 2D CAD floor plan layouts.

The platform provides a complete end-to-end user workflow:
**Requirements Input → Multi-Variant CAD Generation → Interactive Blueprint Visualization → Vastu Shastra Assessment → Localized Cost Estimation → Conversational Refinement → MongoDB Persistence → Dashboard Management → High-Res PDF Export & Public Sharing**.

---

## 🚀 Key Features

*   **Hybrid AI Inference Engine**: Primary ultra-fast generation powered by Groq (`qwen/qwen3.8-27b`) with automatic failover to Google Gemini (`gemini-2.5-flash`), guaranteeing high availability, resilient schema compliance, and immunity to single-provider rate limits.
*   **Coordinate-Aligned CAD Generation**: Emits strict JSON schemas describing rooms (`x`, `y`, `width`, `length` in feet) and openings (`doors`, `windows`) that are verified against physical plot boundaries with Pydantic self-healing bounds clamping and overlap detection.
*   **Layout Variants Comparison**: Generates 3 distinctly themed layout alternatives concurrently (Option A: Spacious Open Concept, Option B: Smart Functional Efficiency, Option C: Luxury Executive Villa), allowing side-by-side area, room count, and budget comparison with single-click activation.
*   **Interactive CAD Canvas**: Custom SVG renderer featuring multi-floor toggling, zoom in/out/reset controls, interactive room hover inspector, inward/outward door swing arcs, window double-lines, dimension lines, and a dynamic North compass reflecting true directional orientation.
*   **Conversational Plan Refinement**: Context-aware chat enabling users to request natural modifications ("make the kitchen larger", "move bedroom 1 to the first floor", "shift pooja room to the northeast") and recalculate the layout immediately without losing other rooms.
*   **Vastu Shastra Compliance Rating**: Computes room centroid compass bearings relative to plot centers and North direction offsets (NE Pooja, SE Kitchen, SW Master Bed, NW/W Toilets), presenting an overall 0–100 score and room-by-room compliance badges.
*   **Localized Cost Worksheet**: Construction budgets calculated using regional rates for Bangalore, Mumbai, Hyderabad, and Tier-2 cities, incorporating an 18% structural allowance for load-bearing walls, passages, columns, and circulation.
*   **High-Res PDF Spec-Sheet Compiler**: One-click download compiled via `jsPDF` + `html2canvas` packaging the architectural layout drawing, project meta, area statistics, Vastu scorecard, and budget worksheet.
*   **Dashboard & Public Sharing**: Manage saved blueprints by browser session, open prior designs, copy read-only public sharing URLs (`/plan/:id`), and safely delete outdated projects.

---

## 🛠️ Project Structure

```
HomePlanner/
├── ProjectBackend/              # FastAPI Application
│   ├── src/
│   │   ├── main.py              # Application entrypoint & CORS middleware
│   │   ├── models.py            # Pydantic CAD schemas, validators & overlap check
│   │   ├── database.py          # Async Motor MongoDB connection & fallback
│   │   ├── ai/
│   │   │   └── llm.py           # Hybrid Groq + Gemini structured JSON orchestrator
│   │   ├── prompts/
│   │   │   └── floorplan_prompt.py # Architectural prompts & variant themes
│   │   └── routes/
│   │       ├── generate.py      # POST /plans/generate (concurrent variants)
│   │       ├── refine.py        # POST /plans/refine (conversational refinement)
│   │       └── plans.py         # CRUD routes for persistence & public links
│   ├── .env.example             # Backend environment variable template
│   ├── requirements.txt         # Python dependencies
│   └── test_endpoints.py        # Production-grade 8-endpoint integration test suite
│
├── ProjectFrontnd/              # React 19 + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── api/
│   │   │   └── plans.js         # Unified client network API wrappers
│   │   ├── components/
│   │   │   ├── Home/            # Main workspace & parameter input forms
│   │   │   ├── FloorPlanRenderer.jsx # Interactive CAD SVG canvas with zoom & compass
│   │   │   ├── ChatPanel.jsx    # Conversational refinement with suggestion chips
│   │   │   ├── CostPanel.jsx    # Civil cost worksheet & city selector
│   │   │   ├── VariantCompare.jsx # Side-by-side Option A/B/C layout comparison
│   │   │   ├── VastuBadge.jsx   # Vastu compliance rating pills
│   │   │   ├── Dashboard.jsx    # Saved project manager with share/delete actions
│   │   │   ├── PublicView.jsx   # Read-only client blueprint view
│   │   │   ├── Header/          # Accessible navigation header
│   │   │   ├── Footer/          # Semantic footer with SVG icons
│   │   │   └── About/           # Platform overview & architecture
│   │   └── utils/
│   │       ├── vastu.js         # Centroid bearing math & Vastu rules
│   │       ├── costEstimate.js  # Regional cost estimation algorithms
│   │       └── pdfExport.js     # High-DPI jsPDF architectural spec sheet exporter
│   ├── package.json
│   └── vite.config.js
```

---

## ⚙️ Setup and Installation

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ProjectBackend
   ```

2. Configure environment variables in `.env`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=homeplanner
   ```

3. Activate virtual environment and install dependencies:
   ```bash
   v2env\Scripts\activate       # Windows PowerShell
   pip install -r requirements.txt
   ```

4. Launch the FastAPI backend server:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

5. Run integration tests to verify all 8 endpoints:
   ```bash
   python test_endpoints.py
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ProjectFrontnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   ```
   http://localhost:5173/homeplanner/
   ```

5. Verify linting and build:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📡 API Specification Cheat Sheet

| Verb | Path | Description |
|---|---|---|
| `GET` | `/` | API status and health check |
| `POST` | `/plans/generate` | Generate structured CAD layout (supports `variants=3`) |
| `POST` | `/plans/refine` | Refine active layout via conversational message and chat history |
| `POST` | `/plans/` | Save a new plan or update an existing document in MongoDB |
| `GET` | `/plans/?session={uuid}` | List all saved plans associated with a session |
| `GET` | `/plans/{id}` | Retrieve full plan document by ID |
| `GET` | `/plans/{id}/public` | Public read-only plan details for client sharing |
| `DELETE` | `/plans/{id}` | Delete a saved plan document |
| `POST` | `/chat` | Plain-text architectural advice |
