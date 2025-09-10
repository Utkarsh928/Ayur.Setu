
from fastapi import FastAPI, Query, Header, HTTPException, Request
from typing import Optional
import csv, json, os
from fastapi.middleware.cors import CORSMiddleware
import uuid
from copy import deepcopy
from contextlib import asynccontextmanager
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai


# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY", "dev-key")

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    load_data()
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.join(os.path.dirname(__file__), "..", "data")
NAMASTE = []
TM2 = []
BIO = []
MAP = {}

# AI Overview cache file
AI_OVERVIEW_FILE = os.path.join(BASE, "ai_overview.json")

# Pydantic model for AI overview request
class DiseaseRequest(BaseModel):
    code: str
    name: str

def load_data():
    global NAMASTE, TM2, BIO, MAP
    NAMASTE = []
    TM2 = []
    BIO = []
    MAP = {}
    # load namaste.csv
    with open(os.path.join(BASE, "namaste.csv"), encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            NAMASTE.append({"code": row["code"], "display": row["display"], "system": "NAMASTE"})
    # load icd11 tm2
    with open(os.path.join(BASE, "icd11_tm2.json"), encoding="utf-8") as f:
        TM2 = json.load(f)
    # load icd11 bio
    with open(os.path.join(BASE, "icd11_bio.json"), encoding="utf-8") as f:
        BIO = json.load(f)
    # conceptmap
    with open(os.path.join(BASE, "conceptmap.json"), encoding="utf-8") as f:
        cm = json.load(f)
    for m in cm:
        MAP[m["namaste"]] = {"tm2": m.get("tm2"), "biomed": m.get("biomed")}



SAVES_FILE = os.path.join(BASE, "saves.json")

def read_saves():
    with open(SAVES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_saves(items):
    with open(SAVES_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)



def check_key(x_api_key: str):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/health")
def health():
    return {"ok": True}

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
        Summarize this medical condition in 3-4 lines for healthcare professionals & General Users:
        Code: {disease.code}
        Name: {disease.name}
        
        Please provide a clear, concise explanation that helps medical professionals & General Users understand what this condition is, its key characteristics, and its clinical significance. Focus on practical information that would be useful in a clinical setting.
        """
        
        model = genai.GenerativeModel("gemini-1.5-flash")
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
        fallback = {"code": code, "name": name, "summary": f"{name} ({code}) overview not available: AI not configured."}
        # Write to multilingual cache for the requested lang
        if code not in cache or not isinstance(cache.get(code), dict):
            cache[code] = {}
        cache[code][lang] = fallback
        with open(AI_OVERVIEW_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        return fallback

    # Generate with Gemini in requested language
    try:
        prompt = f"""
        Summarize this medical condition in 3-4 lines for healthcare professionals and general users.
        Output language code: {lang}
        Code: {code}
        Name: {name}
        Requirements:
        - Write the entire response in the target language ({lang}).
        - Be concise, clinically accurate, and helpful.
        - Do not include disclaimers or markdown.
        """
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        summary_text = (getattr(response, "text", "") or "").strip()
        result = {"code": code, "name": name, "summary": summary_text}

        # Persist in multilingual cache
        if code not in cache or not isinstance(cache.get(code), dict) or "summary" in cache.get(code, {}):
            cache[code] = {}
        cache[code][lang] = result
        with open(AI_OVERVIEW_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI overview: {str(e)}")
