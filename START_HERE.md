# 🏥 Ayur Setu - Start Here

Welcome to Ayur Setu! This document will guide you through the setup process.

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Get MongoDB Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Create a database user
4. Copy the connection string

### 2️⃣ Get Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 3️⃣ Configure Backend
Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=dev-key-12345
```

### 4️⃣ Run Application
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python start_server.py

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 5️⃣ Verify
- Backend: http://localhost:8000/health
- Frontend: http://localhost:5173

---

## 📚 Documentation

### 🚀 Getting Started
- **QUICK_START.md** - 5-minute setup guide
- **SETUP_GUIDE.md** - Complete setup instructions
- **CONFIGURATION_CHECKLIST.md** - Verification checklist

### 🔧 Technical
- **MAPPING_GUIDE.md** - Disease code systems
- **API_DOCUMENTATION.md** - Complete API reference
- **CORRECTIONS_SUMMARY.md** - What was fixed

### 📦 Deployment
- **DEPLOYMENT_CHECKLIST.md** - Production deployment
- **DOCUMENTATION_INDEX.md** - All documentation

---

## 🎯 Choose Your Path

### 👨‍💻 I'm a Developer
1. Read: **QUICK_START.md** (5 min)
2. Read: **API_DOCUMENTATION.md** (40 min)
3. Read: **MAPPING_GUIDE.md** (25 min)
4. Start coding!

### 🔧 I'm a DevOps Engineer
1. Read: **SETUP_GUIDE.md** (30 min)
2. Read: **CONFIGURATION_CHECKLIST.md** (20 min)
3. Read: **DEPLOYMENT_CHECKLIST.md** (30 min)
4. Deploy!

### 📊 I'm a Data Manager
1. Read: **MAPPING_GUIDE.md** (25 min)
2. Read: **CONFIGURATION_CHECKLIST.md** (20 min)
3. Manage data!

### 🚀 I'm in a Hurry
1. Follow: **QUICK_START.md** (5 min)
2. Verify: **CONFIGURATION_CHECKLIST.md** (10 min)
3. Done!

---

## ✅ What You Get

### ✓ Patient Management
- Create and manage patient records
- Track disease codes (NAMASTE, TM2, Biomedical)
- Store diagnosis and treatment information

### ✓ Disease Code Mapping
- Three coding systems integrated
- Automatic mapping between systems
- FHIR-compliant resources

### ✓ AI Insights
- AI-powered disease summaries
- Multi-language support
- Powered by Google Gemini

### ✓ Secure API
- API key authentication
- MongoDB database
- CORS protection

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/.env` | Configuration (MongoDB, API keys) |
| `backend/app/main.py` | Backend API |
| `frontend/src/App.jsx` | Frontend UI |
| `backend/data/` | Disease codes and mappings |

---

## 🐛 Common Issues

### MongoDB Connection Failed
```
Check MONGODB_URI in backend/.env
Verify username and password
Add IP to MongoDB Atlas whitelist
```

### Gemini API Error
```
Check GEMINI_API_KEY in backend/.env
Verify API is enabled in Google Cloud
```

### Port Already in Use
```
Use different port: uvicorn app.main:app --port 8001
```

---

## 📞 Need Help?

1. **Quick answers**: See **QUICK_START.md**
2. **Detailed setup**: See **SETUP_GUIDE.md**
3. **Troubleshooting**: See **SETUP_GUIDE.md** → Troubleshooting
4. **API reference**: See **API_DOCUMENTATION.md**
5. **All docs**: See **DOCUMENTATION_INDEX.md**

---

## 🎓 Learning Resources

### External Links
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google Gemini API](https://makersuite.google.com/app/apikey)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)

### Internal Docs
- **SETUP_GUIDE.md** - Step-by-step setup
- **MAPPING_GUIDE.md** - Disease codes
- **API_DOCUMENTATION.md** - API endpoints
- **DEPLOYMENT_CHECKLIST.md** - Production

---

## 🚀 Next Steps

### Step 1: Setup (15 minutes)
```bash
# Follow QUICK_START.md
```

### Step 2: Verify (5 minutes)
```bash
# Check CONFIGURATION_CHECKLIST.md
```

### Step 3: Learn (1 hour)
```bash
# Read MAPPING_GUIDE.md and API_DOCUMENTATION.md
```

### Step 4: Build (Your time)
```bash
# Start building with the API
```

---

## 📋 Checklist

- [ ] MongoDB account created
- [ ] Gemini API key obtained
- [ ] `backend/.env` configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Health check passes
- [ ] API test successful
- [ ] Ready to build!

---

## 🎉 You're Ready!

Everything is set up and ready to go. Choose your path above and start building!

**Questions?** Check the documentation files listed above.

**Ready to deploy?** See **DEPLOYMENT_CHECKLIST.md**

---

**Happy coding!** 🚀

---

## 📚 Complete Documentation List

1. **START_HERE.md** ← You are here
2. **QUICK_START.md** - 5-minute setup
3. **SETUP_GUIDE.md** - Complete setup
4. **CONFIGURATION_CHECKLIST.md** - Verification
5. **MAPPING_GUIDE.md** - Disease codes
6. **API_DOCUMENTATION.md** - API reference
7. **CORRECTIONS_SUMMARY.md** - What was fixed
8. **DEPLOYMENT_CHECKLIST.md** - Production
9. **DOCUMENTATION_INDEX.md** - All docs

---

**Version**: 1.0 | **Updated**: April 2026
