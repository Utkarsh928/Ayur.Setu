from fastapi import FastAPI, Query, Header, HTTPException, Request
from typing import Optional
import csv, json, os
from fastapi.middleware.cors import CORSMiddleware
import uuid
from copy import deepcopy
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
from datetime import datetime


# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY", "dev-key")

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)

# Define BASE and global variables BEFORE lifespan
BASE = os.path.join(os.path.dirname(__file__), "..", "data")
NAMASTE = []
TM2 = []
BIO = []
MAP = {}
client = None
db = None
patients_col = None
diagnoses_col = None
treatments_col = None

# AI Overview cache file
AI_OVERVIEW_FILE = os.path.join(BASE, "ai_overview.json")
SAVES_FILE = os.path.join(BASE, "saves.json")

def load_data():
    global NAMASTE, TM2, BIO, MAP
    NAMASTE = []
    TM2 = []
    BIO = []
    MAP = {}
    try:
        # load namaste.csv
        namaste_path = os.path.join(BASE, "namaste.csv")
        print(f"Loading NAMASTE from {namaste_path}")
        with open(namaste_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                NAMASTE.append({"code": row["code"], "display": row["display"], "system": "NAMASTE"})
        print(f"✓ Loaded {len(NAMASTE)} NAMASTE codes")
        
        # load icd11 tm2
        tm2_path = os.path.join(BASE, "icd11_tm2.json")
        print(f"Loading TM2 from {tm2_path}")
        with open(tm2_path, encoding="utf-8") as f:
            TM2 = json.load(f)
        print(f"✓ Loaded {len(TM2)} TM2 codes")
        
        # load icd11 bio
        bio_path = os.path.join(BASE, "icd11_bio.json")
        print(f"Loading BIO from {bio_path}")
        with open(bio_path, encoding="utf-8") as f:
            BIO = json.load(f)
        print(f"✓ Loaded {len(BIO)} BIO codes")
        
        # conceptmap
        cm_path = os.path.join(BASE, "conceptmap.json")
        print(f"Loading concept map from {cm_path}")
        with open(cm_path, encoding="utf-8") as f:
            cm = json.load(f)
        for m in cm:
            MAP[m["namaste"]] = {"tm2": m.get("tm2"), "biomed": m.get("biomed")}
        print(f"✓ Loaded {len(MAP)} concept mappings")
    except Exception as e:
        print(f"✗ Error loading data: {e}")
        import traceback
        traceback.print_exc()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, patients_col, diagnoses_col, treatments_col
    # Startup
    load_data()
    
    # Get MongoDB URI from environment variables
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        print("⚠ MONGODB_URI not set. Running in offline mode (MongoDB features disabled)")
        client = None
        db = None
        patients_col = None
        diagnoses_col = None
        treatments_col = None
    else:
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Verify connection
            client.admin.command('ping')
            print("✓ MongoDB connection successful")
            db = client["ayur_setu"]
            patients_col = db["patients"]
            diagnoses_col = db["diagnoses"]
            treatments_col = db["treatments"]
        except Exception as e:
            print(f"⚠ MongoDB connection failed: {e}")
            print("⚠ Running in offline mode (MongoDB features disabled)")
            client = None
            db = None
            patients_col = None
            diagnoses_col = None
            treatments_col = None

    # ensure bundles file exists
    bundles_file = os.path.join(BASE, "bundles.json")
    if not os.path.exists(bundles_file):
        with open(bundles_file, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
    # ensure saves file exists
    saves_file = os.path.join(BASE, "saves.json")
    if not os.path.exists(saves_file):
        with open(saves_file, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
    yield
    # Shutdown (if needed)

app = FastAPI(title="AYUSH Dual Coding Service (Starter)", lifespan=lifespan)

# Allow React frontend - reads from FRONTEND_ORIGINS env var
_raw_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






# ✅ Flexible models for new patient workflow
class TreatmentItem(BaseModel):
    drug: str
    dosage: str
    time: str
    remark: str = ""

class Diagnosis(BaseModel):
    earlier_meds: str = ""
    current_meds: str = ""
    doctor_names: str = ""
    hospital_names: str = ""

class TreatmentAdvice(BaseModel):
    items: List[TreatmentItem] = []
    note: str = ""

# ✅ Endpoint to add/update a patient (flexible)
@app.post("/patients")
async def add_patient(request: Request):
    data = await request.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Invalid payload")
    pid = data.get("patient_id") or uuid.uuid4().hex[:8]
    data["patient_id"] = pid
    if not data.get("name"):
        data["name"] = "Unnamed"
    data.setdefault("condition", "")
    data.setdefault("_createdAt", datetime.utcnow().isoformat())
    patients_col.update_one({"patient_id": pid}, {"$set": data}, upsert=True)
    return {"patient_id": pid}

# ✅ Endpoint to get all patients
@app.get("/patients")
async def get_patients():
    try:
        # fetch all documents from patients collection
        patients = list(patients_col.find({}, {"_id": 0}))
        return patients
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# ✅ Get patient details (detail view)
@app.get("/patients/{patient_id}")
def get_patient_details(patient_id: str):
    patient = patients_col.find_one({"patient_id": patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    diag = diagnoses_col.find_one({"patient_id": patient_id}, {"_id": 0}) or {}
    treat = treatments_col.find_one({"patient_id": patient_id}, {"_id": 0}) or {}
    return {"patient": patient, "diagnosis": diag.get("diagnosis", {}), "treatment": treat.get("treatment", {}), "codes": patient.get("codes", {})}

# ✅ Set disease codes by NAMASTE; auto map TM2 and BIO using existing MAP
class CodeSetRequest(BaseModel):
    namaste_code: str
    disease_name: str = ""

@app.post("/patients/{patient_id}/codes")
def set_patient_codes(patient_id: str, payload: CodeSetRequest):
    patient = patients_col.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    nm = next((n for n in NAMASTE if n["code"] == payload.namaste_code), None)
    if not nm:
        raise HTTPException(status_code=404, detail="Unknown NAMASTE code")
    mapping = MAP.get(payload.namaste_code, {})
    tm2 = mapping.get("tm2")
    biomed = mapping.get("biomed")
    codes = {
        "namaste": {"code": nm["code"], "display": nm["display"], "system": "NAMASTE"},
        "tm2": None,
        "biomed": None,
    }
    if tm2:
        t = next((t for t in TM2 if t["code"] == tm2), None)
        if t:
            codes["tm2"] = {"code": t["code"], "display": t.get("display", ""), "system": "ICD11-TM2"}
    if biomed:
        b = next((b for b in BIO if b["code"] == biomed), None)
        if b:
            codes["biomed"] = {"code": b["code"], "display": b.get("display", ""), "system": "ICD11-BIO"}
    patients_col.update_one({"patient_id": patient_id}, {"$set": {"codes": codes, "disease_name": payload.disease_name}})
    out = patients_col.find_one({"patient_id": patient_id}, {"_id": 0})
    return {"patient": out, "codes": codes}

# ✅ Create/Update Diagnosis
@app.post("/patients/{patient_id}/diagnosis")
async def upsert_diagnosis(patient_id: str, diagnosis: Diagnosis):
    payload = {"patient_id": patient_id, "diagnosis": diagnosis.dict(), "_updatedAt": datetime.utcnow().isoformat()}
    diagnoses_col.update_one({"patient_id": patient_id}, {"$set": payload}, upsert=True)
    return payload

@app.get("/patients/{patient_id}/diagnosis")
def get_diagnosis(patient_id: str):
    doc = diagnoses_col.find_one({"patient_id": patient_id}, {"_id": 0})
    return doc.get("diagnosis", {}) if doc else {}

# ✅ Create/Update Treatment Advice
@app.post("/patients/{patient_id}/treatment")
async def upsert_treatment(patient_id: str, treatment: TreatmentAdvice):
    payload = {"patient_id": patient_id, "treatment": treatment.dict(), "_updatedAt": datetime.utcnow().isoformat()}
    treatments_col.update_one({"patient_id": patient_id}, {"$set": payload}, upsert=True)
    return payload

@app.get("/patients/{patient_id}/treatment")
def get_treatment(patient_id: str):
    doc = treatments_col.find_one({"patient_id": patient_id}, {"_id": 0})
    return doc.get("treatment", {}) if doc else {}

# ✅ Combined summary for Service tab
@app.get("/patients/{patient_id}/summary")
def get_summary(patient_id: str):
    patient = patients_col.find_one({"patient_id": patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    diagnosis = diagnoses_col.find_one({"patient_id": patient_id}, {"_id": 0}) or {}
    treatment = treatments_col.find_one({"patient_id": patient_id}, {"_id": 0}) or {}
    return {"patient": patient, "diagnosis": diagnosis.get("diagnosis", {}), "treatment": treatment.get("treatment", {})}

BASE = os.path.join(os.path.dirname(__file__), "..", "data")

# AI Overview cache file
AI_OVERVIEW_FILE = os.path.join(BASE, "ai_overview.json")

# Pydantic model for AI overview request
class DiseaseRequest(BaseModel):
    code: str
    name: str
@app.get("/search")
def universal_search(q: str = Query(..., min_length=1), x_api_key: str = Header(None)):
    """Universal search across NAMASTE, TM2, BIO, and AI overview cache."""
    check_key(x_api_key)
    ql = q.lower()
    results = []
    # Search NAMASTE
    results += [
        {"code": t["code"], "display": t["display"], "system": "NAMASTE"}
        for t in NAMASTE
        if ql in t["display"].lower() or ql in t["code"].lower()
    ]
    # Search TM2
    results += [
        {"code": t["code"], "display": t["display"], "system": "ICD11-TM2"}
        for t in TM2
        if ql in t["display"].lower() or ql in t["code"].lower()
    ]
    # Search BIO
    results += [
        {"code": t["code"], "display": t["display"], "system": "ICD11-BIO"}
        for t in BIO
        if ql in t["display"].lower() or ql in t["code"].lower()
    ]
    '''# Search AI Overview cache
    if os.path.exists(AI_OVERVIEW_FILE):
        try:
            with open(AI_OVERVIEW_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
            for code, entry in cache.items():
                # entry can be multilingual or flat
                if isinstance(entry, dict) and "summary" in entry:
                    # flat
                    if ql in entry.get("name", "").lower() or ql in code.lower():
                        results.append({
                            "code": code,
                            "display": entry.get("name", ""),
                            "system": "AI-OVERVIEW",
                            "summary": entry.get("summary", "")
                        })
                elif isinstance(entry, dict):
                    # multilingual
                    for lang, val in entry.items():
                        if isinstance(val, dict) and (ql in val.get("name", "").lower() or ql in code.lower()):
                            results.append({
                                "code": code,
                                "display": val.get("name", ""),
                                "system": f"AI-OVERVIEW-{lang}",
                                "summary": val.get("summary", "")
                            })
        except Exception:
            pass'''
    
    return {"count": len(results[:50]), "items": results[:50]}

def read_saves():
    with open(SAVES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_saves(items):
    with open(SAVES_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)



def check_key(x_api_key: str):
    # Allow requests without API key in development mode
    if x_api_key is None:
        return  # Allow requests without key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/health")
def health():
    return {
        "ok": True,
        "namaste_count": len(NAMASTE),
        "tm2_count": len(TM2),
        "bio_count": len(BIO),
        "map_count": len(MAP)
    }

@app.get("/terms")
def terms(q: str = Query(..., min_length=1), system: Optional[str] = Query(None), x_api_key: str = Header(None)):
    # simple search across NAMASTE/TM2/BIO
    check_key(x_api_key)
    ql = q.lower()
    results = []
    if system in (None, "NAMASTE"):
        results += [t for t in NAMASTE if ql in t["display"].lower() or ql in t["code"].lower()]
    if system in (None, "TM2"):
        results += [{"code": t["code"], "display": t["display"], "system":"ICD11-TM2"} for t in TM2 if ql in t["display"].lower() or ql in t["code"].lower()]
    if system in (None, "BIO"):
        results += [{"code": t["code"], "display": t["display"], "system":"ICD11-BIO"} for t in BIO if ql in t["display"].lower() or ql in t["code"].lower()]
    return {"count": len(results[:50]), "items": results[:50]}

@app.post("/translate")
def translate(namaste_code: str, x_api_key: str = Header(None)):
    check_key(x_api_key)
    m = MAP.get(namaste_code)
    #print(m)
    if not m:
        raise HTTPException(status_code=404, detail="No mapping found")
    out = {"namaste": namaste_code}
    if m.get("tm2"):
        out["tm2"] = next((t for t in TM2 if t["code"] == m["tm2"]), None)
    if m.get("biomed"):
        out["biomed"] = next((t for t in BIO if t["code"] == m["biomed"]), None)
    return out

@app.post("/problemlist/condition")
def make_condition(namaste_code: str, patient_id: str = "example-patient", x_api_key: str = Header(None)):
    check_key(x_api_key)
    nm = next((n for n in NAMASTE if n["code"] == namaste_code), None)
    if not nm:
        raise HTTPException(status_code=404, detail="Unknown NAMASTE code")
    mapping = MAP.get(namaste_code, {})
    tm2 = next((t for t in TM2 if t["code"] == mapping.get("tm2")), None)
    bio = next((b for b in BIO if b["code"] == mapping.get("biomed")), None)

    coding = [{"system":"urn:oid:1.2.356.10000.ayush.namaste","code": nm["code"],"display": nm["display"]}]
    if tm2: coding.append({"system":"http://id.who.int/icd/release/11/mms","code": tm2["code"],"display": tm2.get("display", "TM2")})
    if bio: coding.append({"system":"http://id.who.int/icd/release/11/mms","code": bio["code"],"display": bio.get("display", "Biomed")})

    condition = {
      "name":f"{patient_id}",
      "resourceType":"Condition",
      "id": f"cond-{uuid.uuid4().hex[:8]}",
      "clinicalStatus":{"coding":[{"system":"http://terminology.hl7.org/CodeSystem/condition-clinical","code":"active"}]},
      "verificationStatus":{"coding":[{"system":"http://terminology.hl7.org/CodeSystem/condition-ver-status","code":"confirmed"}]},
      "category":[{"coding":[{"system":"http://terminology.hl7.org/CodeSystem/condition-category","code":"problem-list-item"}]}],
      "code":{"coding": coding, "text": nm["display"]},
      "subject":{"reference": f"Patient/{patient_id}"}
    }

    # persist
    items = read_saves()
    items.append(condition)
    write_saves(items)

    return condition #Condition JSON object that follows the FHIR standard.

@app.post("/bundle")
async def bundle_upload(request: Request, x_api_key: str = Header(None)):
    check_key(x_api_key)
    bundle = await request.json()
    # basic validation
    entry_count = len(bundle.get("entry", [])) if isinstance(bundle.get("entry", []), list) else 0
    bundles_file = os.path.join(BASE, "bundles.json")
    with open(bundles_file, "r+", encoding="utf-8") as f:
        data = json.load(f)
        audit_id = f"audit-{len(data)+1}"
        data.append({"auditId": audit_id, "bundle": bundle})
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()
    return {"status":"accepted", "entries": entry_count, "auditId": audit_id}

@app.get("/saves")
def list_saves(x_api_key: str = Header(None)):
    check_key(x_api_key)
    return read_saves()

@app.get("/saves/{cid}")
def get_save(cid: str, x_api_key: str = Header(None)):
    check_key(x_api_key)
    items = read_saves()
    for it in items:
        if it.get("id") == cid:
            return it
    raise HTTPException(status_code=404, detail="Not found")

@app.put("/saves/{cid}")
async def update_save(cid: str, request: Request, x_api_key: str = Header(None)):
    check_key(x_api_key)
    payload = await request.json()

    if not isinstance(payload, dict) or payload.get("resourceType") != "Condition":
        raise HTTPException(status_code=400, detail="Payload must be a FHIR Condition resource")

    items = read_saves()
    found = False
    for idx, it in enumerate(items):
        if it.get("id") == cid:
            # keep the same id if caller forgot to include or changed it
            new_obj = deepcopy(payload)
            new_obj["id"] = cid
            items[idx] = new_obj
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Not found")

    write_saves(items)
    return items[idx]

@app.delete("/saves/{cid}")
def delete_save(cid: str, x_api_key: str = Header(None)):
    check_key(x_api_key)
    items = read_saves()
    new_items = [it for it in items if it.get("id") != cid]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Not found")
    write_saves(new_items)
    return {"deleted": cid}

@app.post("/ai/overview")
async def get_ai_overview(disease: DiseaseRequest, x_api_key: str = Header(None)):
    """Generate AI overview for a disease/condition using Gemini API"""
    check_key(x_api_key)
    
    # Check if Gemini API is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise HTTPException(status_code=503, detail="Gemini API not configured. Please set GEMINI_API_KEY in .env file.")
    
    # Load cache
    cache = {}
    if os.path.exists(AI_OVERVIEW_FILE):
        try:
            with open(AI_OVERVIEW_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            cache = {}
    
    # Check cache first
    if disease.code in cache:
        return cache[disease.code]
    
    try:
        # Generate AI summary using Gemini
        prompt = f"""
Summarize this medical condition in 3–4 lines for both healthcare professionals and general users:
ICD Code: {disease.code}
Namaste Code: {disease.namaste_code}
Name: {disease.name}

Please provide:
1. A brief explanation of the condition, including its definition and clinical significance.
2. The common causes or reasons why this condition occurs.
3. Typical signs and symptoms experienced by patients.
4. Commonly prescribed or recommended medicines/treatments for this condition.
5. Precautions or lifestyle modifications patients should follow to manage or prevent worsening of the condition.

Ensure the explanation is clear, concise, and accessible to both medical professionals and the general public. Focus on practical information useful in a clinical or caregiving context.
"""

        
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        summary = response.text.strip()
        
        # Create result object
        result = {
            "code": disease.code,
            "name": disease.name,
            "summary": summary
        }
        
        # Save to cache
        cache[disease.code] = result
        with open(AI_OVERVIEW_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI overview: {str(e)}")

@app.get("/api/ai-overview")
def ai_overview_get(
    lang: str = Query("en", min_length=2, max_length=5),
    code: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    x_api_key: str = Header(None),
):
    """Return AI Overview JSON in requested language. Falls back to English-like stub if AI not configured."""
    check_key(x_api_key)

    # Load cache (can store multilingual as { code: { lang: result } } or legacy flat { code: result })
    cache = {}
    if os.path.exists(AI_OVERVIEW_FILE):
        try:
            with open(AI_OVERVIEW_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            cache = {}

    if not code or not name:
        return {}

    # If multilingual cached
    existing = cache.get(code)
    if isinstance(existing, dict) and lang in existing and isinstance(existing[lang], dict) and existing[lang].get("summary"):
        return existing[lang]
    # If legacy cached and English requested
    if isinstance(existing, dict) and existing.get("summary") and lang == "en":
        return existing

    # If Gemini not configured, return a stub in place
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        yt_query = (name or code).replace(" ", "+")
        youtube_link = f"https://www.youtube.com/results?search_query={yt_query}+disease+treatment"
        fallback = {"code": code, "name": name, "summary": f"{name} ({code}) overview not available: AI not configured.", "youtube_link": youtube_link}
        # Write to multilingual cache for the requested lang
        if code not in cache or not isinstance(cache.get(code), dict):
            cache[code] = {}
        cache[code][lang] = fallback
        with open(AI_OVERVIEW_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        return fallback

    # Generate with Gemini in requested language
    try:
        prompt = f"""You are a medical expert. A user has selected the following disease/condition from a healthcare system.

Code: {code}
Name: {name}
Language: {lang}

Please answer the following 4 questions clearly and in the language specified by the language code "{lang}":

1. WHAT IS THIS? - Explain what this disease/condition is in simple terms that both doctors and patients can understand.
2. WHY DOES IT HAPPEN? - Explain the common causes and risk factors.
3. HOW TO CURE / TREAT IT? - Describe the standard treatments, medicines, therapies (both Ayurvedic and modern if applicable), and lifestyle changes.
4. PREVENTION - Any precautions or preventive measures.

Format your response with clear headings for each section.
Do not include disclaimers. Be concise, accurate, and helpful.
Write the entire response in the language corresponding to code "{lang}" (en=English, hi=Hindi, bn=Bengali, te=Telugu, mr=Marathi).
"""
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        summary_text = (getattr(response, "text", "") or "").strip()
        # Generate a YouTube search link for this condition
        yt_query = name.replace(" ", "+")
        youtube_link = f"https://www.youtube.com/results?search_query={yt_query}+disease+treatment"
        result = {"code": code, "name": name, "summary": summary_text, "youtube_link": youtube_link}

        # Persist in multilingual cache
        if code not in cache or not isinstance(cache.get(code), dict) or "summary" in cache.get(code, {}):
            cache[code] = {}
        cache[code][lang] = result
        with open(AI_OVERVIEW_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI overview: {str(e)}")

# ─────────────────────────────────────────
# AYUR CHATBOT
# ─────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []   # [{role:"user"|"model", text:"..."}]

AYUR_SYSTEM_PROMPT = """You are Ayur, a friendly and knowledgeable AI health assistant built into the Ayur Setu platform.

Your role:
- Help AYUSH doctors understand disease codes (NAMASTE, ICD-11 TM2, ICD-11 Biomed)
- Help patients understand their Ayurvedic diagnosis in simple language
- Answer questions about Ayurvedic diseases, symptoms, causes, treatments, and prevention
- Guide doctors on how to use the Ayur Setu platform (search, patient management, FHIR records)
- Provide general Ayurvedic health tips and lifestyle advice

Rules:
- Always be warm, clear, and helpful
- For patients: use simple non-technical language
- For doctors: you can use clinical/Ayurvedic terminology
- Never diagnose or prescribe — always recommend consulting a qualified doctor for serious conditions
- If asked about a specific disease code (like N-0001), explain what it means
- Keep responses concise but complete — use bullet points when listing symptoms/treatments
- You are NOT a general chatbot — stay focused on Ayurveda, AYUSH medicine, and the Ayur Setu platform
- If someone asks something completely unrelated to health or the platform, politely redirect them

Always start your first message with a warm greeting mentioning you are Ayur.
"""

@app.post("/chat")
async def ayur_chat(payload: ChatMessage, x_api_key: str = Header(None)):
    """Ayur chatbot endpoint — powered by Gemini"""
    check_key(x_api_key)

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise HTTPException(status_code=503, detail="AI not configured.")

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Build conversation history for Gemini (compatible with 0.3.2)
        history = []
        # Always inject system prompt as first user/model exchange
        history.append({"role": "user",  "parts": [AYUR_SYSTEM_PROMPT]})
        history.append({"role": "model", "parts": ["Understood! I am Ayur, your Ayurvedic health assistant. I'm ready to help doctors and patients with Ayurvedic knowledge, disease codes, and the Ayur Setu platform."]})

        for msg in payload.history:
            role = msg.get("role", "user")
            text = msg.get("text", "")
            if role and text:
                history.append({"role": role, "parts": [text]})

        chat = model.start_chat(history=history)
        response = chat.send_message(payload.message)
        reply = (getattr(response, "text", "") or "").strip()

        return {"reply": reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
