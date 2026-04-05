# Ayur Setu - Complete Setup Guide

This guide will help you set up the Ayur Setu application with proper MongoDB configuration, API keys, and AI insights.

---

## 📋 Prerequisites

- Python 3.10+ installed
- Node.js 16+ installed
- Git installed
- A MongoDB Atlas account (free tier available)
- A Google Gemini API key

---

## 🔧 Step 1: MongoDB Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" and create a free account
3. Verify your email

### 1.2 Create a Cluster
1. After login, click "Create a Deployment"
2. Select **M0 (Free)** tier
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region close to you
5. Click "Create Deployment"
6. Wait for the cluster to be created (2-3 minutes)

### 1.3 Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `ayur_setu_user`
5. Enter a strong password (save this!)
6. Click "Add User"

### 1.4 Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Drivers" (not "MongoDB Compass")
4. Copy the connection string
5. It should look like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

### 1.5 Update .env File
Replace the `MONGODB_URI` in `backend/.env`:
```
MONGODB_URI=mongodb+srv://ayur_setu_user:YOUR_PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu
```

---

## 🤖 Step 2: Google Gemini API Setup (for AI Insights)

### 2.1 Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the API key

### 2.2 Update .env File
Replace the `GEMINI_API_KEY` in `backend/.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

---

## 🔐 Step 3: API Key Configuration

### 3.1 Generate Secure API Key
For development, you can use a simple key. For production, use a strong random key:

**Option 1: Simple (Development)**
```
API_KEY=dev-key-12345
```

**Option 2: Secure (Production)**
Generate using Python:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.2 Update .env File
```
API_KEY=your-secure-api-key-here
```

---

## 📦 Step 4: Backend Setup

### 4.1 Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4.2 Verify .env Configuration
Make sure `backend/.env` has all required values:
- ✓ `MONGODB_URI` - MongoDB connection string
- ✓ `GEMINI_API_KEY` - Google Gemini API key
- ✓ `API_KEY` - Your API key
- ✓ `USE_AUTH` - Set to True for production

### 4.3 Run Backend Server
```bash
# Windows (PowerShell)
python start_server.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will start at `http://localhost:8000`

---

## 🎨 Step 5: Frontend Setup

### 5.1 Install Dependencies
```bash
cd frontend
npm install
```

### 5.2 Run Frontend Development Server
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

---

## ✅ Step 6: Verify Setup

### 6.1 Check Backend Health
```bash
curl http://localhost:8000/health
```
Expected response: `{"ok": true}`

### 6.2 Test API with Key
```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/terms?q=fever&system=NAMASTE
```

### 6.3 Test MongoDB Connection
The backend will print on startup:
```
✓ MongoDB connection successful
```

### 6.4 Test AI Insights
Make a POST request to generate AI overview:
```bash
curl -X POST http://localhost:8000/ai/overview \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"code": "BA00", "name": "Fever"}'
```

---

## 🗺️ Step 7: Mapping Configuration

The application uses three coding systems:

### 7.1 NAMASTE (Traditional Indian Medicine)
- **File**: `backend/data/namaste.csv`
- **Format**: CSV with columns: code, display
- **Example**: `BA00, Fever`

### 7.2 ICD-11 TM2 (Traditional Medicine)
- **File**: `backend/data/icd11_tm2.json`
- **Format**: JSON array with code and display

### 7.3 ICD-11 BIO (Biomedical)
- **File**: `backend/data/icd11_bio.json`
- **Format**: JSON array with code and display

### 7.4 Concept Mapping
- **File**: `backend/data/conceptmap.json`
- **Format**: JSON array mapping NAMASTE codes to TM2 and Biomedical codes
- **Example**:
```json
{
  "namaste": "BA00",
  "tm2": "BA00.0",
  "biomed": "BA01.1"
}
```

---

## 📊 Database Schema

### Collections

#### 1. patients
```json
{
  "patient_id": "string",
  "name": "string",
  "condition": "string",
  "disease_name": "string",
  "codes": {
    "namaste": {"code": "string", "display": "string", "system": "NAMASTE"},
    "tm2": {"code": "string", "display": "string", "system": "ICD11-TM2"},
    "biomed": {"code": "string", "display": "string", "system": "ICD11-BIO"}
  },
  "_createdAt": "ISO timestamp"
}
```

#### 2. diagnoses
```json
{
  "patient_id": "string",
  "diagnosis": {
    "earlier_meds": "string",
    "current_meds": "string",
    "doctor_names": "string",
    "hospital_names": "string"
  },
  "_updatedAt": "ISO timestamp"
}
```

#### 3. treatments
```json
{
  "patient_id": "string",
  "treatment": {
    "items": [
      {
        "drug": "string",
        "dosage": "string",
        "time": "string",
        "remark": "string"
      }
    ],
    "note": "string"
  },
  "_updatedAt": "ISO timestamp"
}
```

---

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Patient Management
```
POST /patients                          # Create/update patient
GET /patients                           # Get all patients
GET /patients/{patient_id}              # Get patient details
POST /patients/{patient_id}/codes       # Set disease codes
```

### Diagnosis & Treatment
```
POST /patients/{patient_id}/diagnosis   # Create/update diagnosis
GET /patients/{patient_id}/diagnosis    # Get diagnosis
POST /patients/{patient_id}/treatment   # Create/update treatment
GET /patients/{patient_id}/treatment    # Get treatment
GET /patients/{patient_id}/summary      # Get combined summary
```

### Search & Mapping
```
GET /search?q=fever                     # Universal search
GET /terms?q=fever&system=NAMASTE       # Search by system
POST /translate?namaste_code=BA00       # Get mappings
```

### AI Insights
```
POST /ai/overview                       # Generate AI overview
GET /api/ai-overview?code=BA00&name=Fever&lang=en  # Get AI overview
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
**Error**: `MongoDB connection failed`
- ✓ Check MONGODB_URI in .env
- ✓ Verify username and password
- ✓ Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- ✓ Ensure cluster is running

### Gemini API Not Working
**Error**: `Gemini API not configured`
- ✓ Check GEMINI_API_KEY in .env
- ✓ Verify API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- ✓ Ensure API is enabled in Google Cloud Console

### API Key Validation Failed
**Error**: `Invalid API key`
- ✓ Check x-api-key header matches API_KEY in .env
- ✓ Ensure header is sent with all requests

### Port Already in Use
**Error**: `Address already in use`
- ✓ Change port: `uvicorn app.main:app --port 8001`
- ✓ Or kill existing process on port 8000

---

## 📝 Environment Variables Summary

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| MONGODB_URI | Yes | `mongodb+srv://...` | MongoDB Atlas connection string |
| GEMINI_API_KEY | Yes | `AIzaSy...` | Google Gemini API key |
| API_KEY | Yes | `dev-key-12345` | Your API key for requests |
| USE_AUTH | No | `True` | Enable/disable authentication |
| FRONTEND_ORIGINS | No | `http://localhost:5173` | CORS allowed origins |

---

## 🚀 Deployment

### For Production
1. Set `USE_AUTH=True`
2. Use strong API_KEY (generate with secrets module)
3. Use production MongoDB cluster (not free tier)
4. Set proper FRONTEND_ORIGINS
5. Use environment variables, not .env file
6. Enable HTTPS
7. Set up proper logging and monitoring

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas dashboard for connection issues

---

**Last Updated**: April 2026
**Version**: 1.0
