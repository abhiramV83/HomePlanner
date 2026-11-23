# HomePlanner Multi-Cloud Deployment Playbook

## 1. Containerized Docker Deployment

The fastest way to deploy HomePlanner to any cloud VPS (Ubuntu 22.04 LTS):

```bash
# 1. Clone repository
git clone https://github.com/abhiramV83/HomePlanner.git /opt/homeplanner
cd /opt/homeplanner

# 2. Configure environment
cat <<EOF > .env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=mongodb://mongo:27017
DATABASE_NAME=homeplanner
EOF

# 3. Launch Docker stack
docker compose -f docker-compose.yml up -d --build
```

---

## 2. Serverless Cloud Hosting (Vercel + Render)

- **Frontend (Vercel)**:
  - Root directory: `ProjectFrontnd`
  - Build command: `npm run build`
  - Output directory: `dist`
- **Backend (Render / Railway)**:
  - Root directory: `ProjectBackend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
  - Set Environment Variables: `GROQ_API_KEY`, `GEMINI_API_KEY`, `MONGO_URI`.
