# Quick run (backend)

# Change directory to backend
Set-Location -Path "backend"

# Install dependencies if not.
#pip install -r requirements.txt


# Run FastAPI with uvicorn
uvicorn app.main:app --reload --port 8000