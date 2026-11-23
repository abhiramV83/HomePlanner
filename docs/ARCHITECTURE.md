# HomePlanner System Architecture Specification

## 1. System Vision & Paradigm

HomePlanner bridges natural language spatial design and deterministic computer-aided drafting (CAD). Rather than treating architectural generation as an image generation task (such as diffusion models), HomePlanner enforces a **geometric coordinate paradigm**:
1. Spatial requirements are processed into structured Cartesian bounding boxes ($x, y, w, l$).
2. Geometries are verified and bounded by a strict Pydantic mathematical validator.
3. Blueprints are rendered deterministically on the client using vector SVG and native 2D Canvas graphics.

---

## 2. Component Decoupling & Microservices

```
+------------------------------------------------------------------------+
|                          Client Browser                                |
|                                                                        |
|  +--------------------+  +--------------------+  +-------------------+ |
|  | Studio UI / Inputs |  | Interactive Canvas |  | PDF Canvas Engine | |
|  +--------------------+  +--------------------+  +-------------------+ |
+------------------------------------------------------------------------+
                                   | HTTP REST
                                   v
+------------------------------------------------------------------------+
|                    FastAPI Application Gateway                         |
|                                                                        |
|  +--------------------+  +--------------------+  +-------------------+ |
|  | Route Controllers  |  | Pydantic Validator |  | CORS & Middleware | |
|  +--------------------+  +--------------------+  +-------------------+ |
+------------------------------------------------------------------------+
              |                                          |
              v                                          v
+-----------------------------+            +-----------------------------+
|    AI Inference Gateway     |            |  Motor Async Persistence    |
|                             |            |                             |
|  [Groq] Primary 32B/70B     |            |  MongoDB 'plans' Collection |
|  [Gemini] Fallback 2.5      |            |  Session & Public Indexes   |
+-----------------------------+            +-----------------------------+
```

---

## 3. High-Throughput REST Gateway

Built on Python 3.12+ and FastAPI:
- Asynchronous non-blocking event loop handles hundreds of concurrent generation requests.
- Automatic Pydantic JSON schema serialization and input sanitation.
- Unified error response schema ensuring predictable client notifications.
