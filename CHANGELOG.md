# Changelog

All notable changes to HomePlanner are documented in this file in adherence with [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.1.0] - 2026-11-23

### Added
- **Multi-Floor Blueprint Canvas**: Dynamic full-page rendering of every storey in executive PDF exports.
- **Dynamic Floor Badge**: Canvas top-left indicator showing floor level, room count, and square footage.
- **Dynamic Pagination**: Multi-page document calculation ($N$ blueprints + Cost Sheet + Vastu Schedule).
- **Multi-Floor MEP Notes**: Engineering disclaimers for vertical plumbing shafts and column alignment.
- **Docker Compose Setup**: Multi-container orchestration for FastAPI, React Vite, and MongoDB.
- **CI/CD Automation**: GitHub Actions pipelines for linting, integration testing, and Docker builds.

### Changed
- Refined Vastu schedule row heights for high room density layouts ($\le 15$ rooms per sheet).
- Optimized PDF layout margins to prevent page overruns.

---

## [2.0.0] - 2026-10-15

### Added
- Complete platform rewrite: React 19 frontend + FastAPI asynchronous Python backend.
- Hybrid Groq + Gemini LLM orchestration with automatic sub-second failover.
- Interactive dual-theme CAD studio (Blueprint Dark `#070d18` and Parchment Light `#f8fafc`).
- Vastu Shastra assessment engine with centroid bearing trigonometry and directional scoring.
- Civil construction cost estimation engine with regional tier multipliers.
- Motor async MongoDB persistence with dashboard manager and public sharing URLs.

---

## [1.0.0] - 2026-08-01

### Added
- Initial proof of concept floorplan generator with single-floor rectangular plots.
- Basic room program and rough dimension output.
