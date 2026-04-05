# Ayur Setu - Quick Start Guide

Get up and running in 5 minutes!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get MongoDB Connection String (2 min)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a free M0 cluster
4. Create a database user
5. Click "Connect" → "Drivers" → Copy connection string
6. Replace `<username>` and `<password>` with your credentials

### Step 2: Get Gemini API Key (1 min)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 3: Configure .env (1 min)
Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=dev-key-12345
```

### Step 4: Install & Run (1 min)

**Terminal 1 - Backend**:
```bash
cd backend
pip install -r requirements.txt
python start_server.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Verify It Works

1. **Backend Health**: http://localhost:8000/health
2. **Frontend**: http://localhost:5173
3. **API Test**:
   ```bash
   curl -H "x-api-key: dev-key-12345" http://localhost:8000/terms?q=fever&system=NAMASTE
   ```

---

## 📋 What You Just Set Up

| Component | Purpose | Status |
|-----------|---------|--------|
| MongoDB | Patient data storage | ✓ Connected |
| Gemini AI | AI insights generation | ✓ Configured |
| Backend API | Core business logic | ✓ Running |
| Frontend | User interface | ✓ Running |

---

## 🔑 Key Files

- `backend/.env` - Configuration (MongoDB, API keys)
- `backend/data/` - Disease codes and mappings
- `frontend/src/` - React components
- `SETUP_GUIDE.md` - Detailed setup instructions
- `MAPPING_GUIDE.md` - Coding system documentation

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| MongoDB connection failed | Check MONGODB_URI in .env |
| Gemini API error | Verify GEMINI_API_KEY in .env |
| Port 8000 in use | Use `--port 8001` in backend |
| npm install fails | Delete `node_modules` and `package-lock.json`, try again |

---

## 📚 Next Steps

1. Read `SETUP_GUIDE.md` for detailed configuration
2. Read `MAPPING_GUIDE.md` to understand disease codes
3. Check `CONFIGURATION_CHECKLIST.md` to verify everything
4. Explore the API at http://localhost:8000/docs (Swagger UI)

---

## 🎯 API Quick Reference

```bash
# Search diseases
curl -H "x-api-key: dev-key-12345" \
  http://localhost:8000/terms?q=fever&system=NAMASTE

# Create patient
curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "condition": "Fever"}'

# Get AI insights
curl -X POST http://localhost:8000/ai/overview \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{"code": "N-0001", "name": "Fever"}'
```

---

**Ready to go!** 🎉

For detailed information, see:
- `SETUP_GUIDE.md` - Complete setup instructions
- `CONFIGURATION_CHECKLIST.md` - Verification checklist
- `MAPPING_GUIDE.md` - Disease code systems
