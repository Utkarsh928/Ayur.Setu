
# Ayush Dual Coding Starter Repo

This starter repo contains a **backend FastAPI** service with sample NAMASTE and ICD data,
plus endpoints for search, translate, generating a FHIR Condition, and uploading FHIR Bundles.

## Quick start (backend)

Requirements:
- Python 3.10+
- pip

Run (from backend folder):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Default API key: `dev-key`. Add header `x-api-key: dev-key` to requests.

Endpoints:
- GET /health
- GET /terms?q=...&system=NAMASTE|TM2|BIO  (requires x-api-key)
- POST /translate?namaste_code=N-0001  (requires x-api-key)
- POST /problemlist/condition?namaste_code=N-0001&patient_id=PAT-1  (requires x-api-key)
- POST /bundle  (send a FHIR-like bundle JSON, requires x-api-key)

Data is in `backend/data/`:
- namaste.csv
- icd11_tm2.json
- icd11_bio.json
- conceptmap.json

This is a starter/prototype. Replace API key with OAuth later and persist to a real DB.

# Project Setup and Run Guide

Welcome! This guide will walk you through setting up and running this project's backend (FastAPI) and frontend (React + Vite). Follow these simple steps to get everything up and running smoothly.

## 🟢 Step 1: Run the Backend (FastAPI)

1. Open your terminal or VS Code terminal in the project's root directory.

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

✅ **Success!** You should see a message confirming the server is running on `http://127.0.0.1:8000`. Open your browser to `http://127.0.0.1:8000/docs` to access the Swagger UI, where you can test all the API endpoints.

## 🟠 Step 2: Run the Frontend (React + Vite)

1. Open a new terminal window by pressing  *ctrl + Shift +`* in VS code and keep the backend server running in the other.

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install the necessary Node.js packages. Make sure you have Node.js installed on your system.
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

✅ **Success!** The terminal will display a local link, typically `http://172.0.0.1:5173`. Open this link in your browser to view the frontend user interface, which is now connected to the backend.

## Prerequisites

- Python 3.7+
- Node.js (Latest LTS version recommended)
- Git (for cloning the repository)

## Project Structure

```
project-root/
├── backend/
│   ├── app/
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Troubleshooting

- If you encounter permission issues on Windows, try running the terminal as administrator
- Make sure both servers are running simultaneously for full functionality
- Check that all dependencies are properly installed if you encounter import errors

# ayush_dualcoding_starter
# Ayur-Setu
