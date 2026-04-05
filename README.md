# 🌿 Ayur Setu — आयुर सेतु

> **Bridging Ayurveda with Modern Medicine using AI**

Ayur Setu is an AI-powered digital platform that maps traditional Ayurvedic disease codes (NAMASTE) to international medical standards (ICD-11 TM2 & Biomed), enabling AYUSH doctors to manage patients, generate FHIR-compliant records, and get multilingual AI health insights.

---

## ✨ Features

- 🔍 **Smart Search** — Search NAMASTE, ICD-11 TM2 & Biomed codes instantly with voice support
- 🤖 **AI Overview** — Gemini AI explains any disease (causes, symptoms, treatment, prevention) in 5 Indian languages
- 🔊 **Voice Readout** — ElevenLabs TTS reads AI summaries and chatbot replies aloud
- 🌿 **Ayur Chatbot** — 24/7 AI assistant for doctors and patients
- 👥 **Patient Management** — Add patients, record diagnosis, treatment advice
- 📄 **FHIR R4 Records** — Generate ABDM-compliant digital health records
- 🌐 **Multilingual** — English, Hindi, Bengali, Telugu, Marathi
- 🌙 **Dark Mode** — Full dark/light theme support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Bootstrap 5 |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Database | MongoDB Atlas |
| AI | Google Gemini 2.5 Flash |
| Voice | ElevenLabs TTS (+ browser fallback) |
| Standards | NAMASTE, ICD-11, FHIR R4, ABDM |

---

## 📁 Project Structure

```
Ayur-Setu/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI routes + Gemini AI + chatbot
│   │   ├── auth.py          # ABDM OAuth
│   │   ├── security.py      # Session encryption, PKCE
│   │   └── audit.py         # Hash-chained audit log
│   ├── data/
│   │   ├── namaste.csv      # NAMASTE disease codes
│   │   ├── icd11_tm2.json   # ICD-11 TM2 codes
│   │   ├── icd11_bio.json   # ICD-11 Biomed codes
│   │   └── conceptmap.json  # NAMASTE → ICD-11 mappings
│   ├── requirements.txt
│   ├── start_server.py
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app + home page
│   │   ├── Search.jsx       # Search + AI overview
│   │   ├── Patients.jsx     # Patient management
│   │   ├── AyurChat.jsx     # Chatbot
│   │   ├── translations.js  # Multilingual strings
│   │   └── hooks/
│   │       └── useElevenLabs.jsx  # TTS hook
│   ├── public/
│   │   ├── bg1.jpg          # Botanical background
│   │   └── bg2.jpg
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key — [Get here](https://aistudio.google.com/app/apikey)
- ElevenLabs API key (optional) — [Get here](https://elevenlabs.io)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Utkarsh928/Ayur.Setu.git
cd Ayur.Setu
```

---

### 2. Backend Setup

```bash
cd backend
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Create your `.env` file:**
```bash
cp env.example .env
```

**Edit `backend/.env` and fill in your values:**
```env
API_KEY=your-secure-api-key-here

GEMINI_API_KEY=your_gemini_api_key_here

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

SESSION_ENC_KEY=   # leave blank to auto-generate
```

**Start the backend:**
```bash
python start_server.py
```

Backend runs at → `http://127.0.0.1:8000`

**Verify it works:**
```
http://127.0.0.1:8000/health
```
You should see:
```json
{"ok": true, "namaste_count": 500, "tm2_count": ..., "bio_count": ...}
```

---

### 3. Frontend Setup

```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Create `frontend/.env`:**
```env
VITE_API_BASE=http://127.0.0.1:8000
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

> **Note:** ElevenLabs is optional. If not set, the app automatically uses the browser's built-in voice.

**Start the frontend:**
```bash
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🔑 API Keys Guide

| Key | Where to get | Required |
|-----|-------------|----------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) | ✅ Yes |
| `MONGODB_URI` | [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) | ✅ Yes |
| `API_KEY` | Any random string you choose | ✅ Yes |
| `VITE_ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) | ⚡ Optional |

---

## 🧪 Testing the App

| Feature | How to test |
|---------|------------|
| Search | Go to Search tab → type `Shwasa` |
| AI Overview | Click any NAMASTE result → AI card appears |
| Voice | Click 🔊 Listen on any AI card or chatbot reply |
| Chatbot | Click 🌿 button (bottom right) → ask anything |
| Patients | Go to Patients tab → Add New Patient |
| FHIR | Search → select result → Save Condition → FHIR tab |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/search?q=shwasa` | Universal search |
| POST | `/translate?namaste_code=N-0007` | Map NAMASTE → ICD-11 |
| GET | `/api/ai-overview?code=N-0007&name=Shwasa&lang=en` | AI disease overview |
| POST | `/chat` | Ayur chatbot |
| POST | `/patients` | Add/update patient |
| GET | `/patients` | List all patients |
| POST | `/problemlist/condition` | Create FHIR Condition |
| GET | `/saves` | List saved conditions |

---

## 🐳 Docker (Optional)

**Backend:**
```bash
cd backend
docker build -t ayursetu-backend .
docker run -p 8000:8000 --env-file .env ayursetu-backend
```

**Frontend:**
```bash
cd frontend
docker build -t ayursetu-frontend .
docker run -p 5173:5173 ayursetu-frontend
```

---

## 📜 License

MIT License — free to use, modify and distribute.

---

## 🙏 Built with

- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Gemini](https://ai.google.dev/)
- [ElevenLabs](https://elevenlabs.io/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [React](https://react.dev/)
- [FHIR R4](https://hl7.org/fhir/)

---

*Ayur Setu — Bridging 5000 years of Ayurvedic wisdom with modern digital healthcare.*
