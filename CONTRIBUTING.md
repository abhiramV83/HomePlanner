# Contributing to HomePlanner

Thank you for your interest in contributing to HomePlanner! We welcome contributions from architects, software engineers, and Vedic spatial design enthusiasts.

---

## Code of Conduct

We are dedicated to providing a welcoming, harassment-free environment for everyone. Please be respectful, inclusive, and professional in all communications.

---

## Development Workflow

### 1. Fork & Branch
- Fork the repository and clone your local copy.
- Create a dedicated feature branch from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```

### 2. Branch Naming Conventions
- `feature/*` — New user-facing capabilities or tools.
- `fix/*` — Bug fixes and regression repairs.
- `docs/*` — Documentation improvements and guides.
- `refactor/*` — Internal code restructuring without behavioral alterations.

### 3. Commit Guidelines (Conventional Commits)
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(scope): ...`
- `fix(scope): ...`
- `docs(scope): ...`
- `refactor(scope): ...`
- `test(scope): ...`
- `chore(scope): ...`

### 4. Code Quality & Formatting
- **Python Backend**: Formatted with `black` and linted with `flake8`. All Pydantic models must have strict field validation.
- **Frontend**: Standard React 19 functional components with Tailwind CSS v4 styling tokens. No direct DOM manipulation outside Canvas utilities.

### 5. Running Tests Before Submitting
```bash
# Verify backend integration tests
cd ProjectBackend && python test_endpoints.py

# Verify frontend build
cd ../ProjectFrontnd && npm run build
```

---

## Submitting a Pull Request
1. Ensure your branch is rebased onto the latest `origin/main`.
2. Provide a clear description of the problem solved and test evidence.
3. Link relevant issue numbers.
