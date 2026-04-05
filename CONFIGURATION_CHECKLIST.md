# Configuration Checklist for Ayur Setu

Use this checklist to ensure all components are properly configured.

---

## ✅ MongoDB Setup

- [ ] Created MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Created a free M0 cluster
- [ ] Created database user with username and password
- [ ] Obtained MongoDB connection string
- [ ] Added IP address to MongoDB Atlas whitelist (0.0.0.0/0 for development)
- [ ] Updated `backend/.env` with MONGODB_URI

**Connection String Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu
```

---

## ✅ Google Gemini API Setup

- [ ] Created Google account (if needed)
- [ ] Visited https://makersuite.google.com/app/apikey
- [ ] Created API key
- [ ] Copied API key
- [ ] Updated `backend/.env` with GEMINI_API_KEY

**Verification**:
```bash
# Test if API key works
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## ✅ API Key Configuration

- [ ] Generated secure API key
- [ ] Updated `backend/.env` with API_KEY

**Generate Secure Key** (Python):
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## ✅ Backend Configuration

- [ ] Copied `backend/env.example` to `backend/.env`
- [ ] Updated all required fields in `.env`:
  - [ ] MONGODB_URI
  - [ ] GEMINI_API_KEY
  - [ ] API_KEY
- [ ] Installed Python dependencies: `pip install -r requirements.txt`
- [ ] Verified Python version (3.10+): `python --version`

---

## ✅ Frontend Configuration

- [ ] Installed Node.js (16+): `node --version`
- [ ] Installed npm dependencies: `npm install`
- [ ] Verified frontend can connect to backend at `http://localhost:8000`

---

## ✅ Data Files Verification

Check that all required data files exist in `backend/data/`:

- [ ] `namaste.csv` - NAMASTE disease codes
- [ ] `icd11_tm2.json` - ICD-11 Traditional Medicine codes
- [ ] `icd11_bio.json` - ICD-11 Biomedical codes
- [ ] `conceptmap.json` - Mapping between coding systems
- [ ] `namaste_merged.json` - Merged NAMASTE data
- [ ] `bundles.json` - FHIR bundles storage
- [ ] `saves.json` - Saved conditions storage
- [ ] `ai_overview.json` - AI insights cache (auto-created)

---

## ✅ Environment Variables

### backend/.env

```
# API Configuration
API_KEY=your-secure-api-key-here

# Authorization
USE_AUTH=True

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu

# ABDM OAuth (optional for production)
ABDM_AUTH_URL=https://abdm-sandbox/auth
ABDM_TOKEN_URL=https://abdm-sandbox/token
ABDM_JWKS_URL=https://abdm-sandbox/jwks
ABDM_ISSUER=https://abdm-sandbox
ABDM_CLIENT_ID=dev-client-id
ABDM_CLIENT_SECRET=dev-client-secret
ABDM_REDIRECT_URI=http://localhost:8000/auth/callback

# Session Encryption
SESSION_ENC_KEY=

# Frontend Origins
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:5174
```

---

## ✅ Running the Application

### Terminal 1: Backend
```bash
cd backend
python start_server.py
# Or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
✓ MongoDB connection successful
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## ✅ Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8000/health
# Expected: {"ok": true}
```

### 2. API Key Validation
```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/terms?q=fever&system=NAMASTE
# Expected: {"count": X, "items": [...]}
```

### 3. MongoDB Connection
Check backend logs for:
```
✓ MongoDB connection successful
```

### 4. AI Insights Generation
```bash
curl -X POST http://localhost:8000/ai/overview \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"code": "BA00", "name": "Fever"}'
# Expected: {"code": "BA00", "name": "Fever", "summary": "..."}
```

### 5. Frontend Access
Open browser and go to `http://localhost:5173`

---

## ✅ Mapping Verification

### Check NAMASTE Codes
```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/terms?q=fever&system=NAMASTE
```

### Check ICD-11 TM2 Codes
```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/terms?q=fever&system=TM2
```

### Check ICD-11 Biomedical Codes
```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/terms?q=fever&system=BIO
```

### Check Concept Mapping
```bash
curl -X POST http://localhost:8000/translate?namaste_code=BA00 \
  -H "x-api-key: your-api-key"
# Expected: {"namaste": "BA00", "tm2": {...}, "biomed": {...}}
```

---

## ✅ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MONGODB_URI, verify IP whitelist in Atlas |
| Gemini API not working | Verify GEMINI_API_KEY, check API is enabled |
| API key validation failed | Ensure x-api-key header matches API_KEY in .env |
| Port 8000 already in use | Use different port: `--port 8001` |
| CORS errors | Check FRONTEND_ORIGINS in .env |
| Data files not found | Verify files exist in `backend/data/` |

---

## ✅ Security Checklist (Production)

- [ ] Use strong API_KEY (generated with secrets module)
- [ ] Set USE_AUTH=True
- [ ] Use production MongoDB cluster (not free tier)
- [ ] Enable HTTPS
- [ ] Restrict FRONTEND_ORIGINS to your domain
- [ ] Use environment variables, not .env file
- [ ] Enable MongoDB IP whitelist (not 0.0.0.0/0)
- [ ] Set up proper logging and monitoring
- [ ] Use strong database passwords
- [ ] Rotate API keys regularly

---

## 📞 Quick Reference

| Component | URL | Port | Status |
|-----------|-----|------|--------|
| Backend API | http://localhost:8000 | 8000 | Check `/health` |
| Frontend | http://localhost:5173 | 5173 | Check browser |
| MongoDB | mongodb+srv://... | 27017 | Check logs |
| Gemini API | https://generativelanguage.googleapis.com | 443 | Check .env |

---

**Last Updated**: April 2026
**Version**: 1.0
