# Ayur Setu - API Documentation

Complete API reference for the Ayur Setu backend.

---

## 🔐 Authentication

All endpoints (except `/health`) require the `x-api-key` header:

```bash
curl -H "x-api-key: your-api-key" http://localhost:8000/endpoint
```

**API Key**: Set in `backend/.env` as `API_KEY`

---

## 📍 Base URL

```
http://localhost:8000
```

---

## 🏥 Patient Management

### Create/Update Patient
```
POST /patients
Content-Type: application/json

{
  "patient_id": "optional-id",
  "name": "John Doe",
  "condition": "Fever",
  "disease_name": "Fever"
}
```

**Response** (201):
```json
{
  "patient_id": "generated-id-or-provided"
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{
    "name": "John Doe",
    "condition": "Fever"
  }'
```

---

### Get All Patients
```
GET /patients
```

**Response** (200):
```json
[
  {
    "patient_id": "patient-123",
    "name": "John Doe",
    "condition": "Fever",
    "disease_name": "Fever",
    "codes": {...},
    "_createdAt": "2026-04-04T10:30:00"
  }
]
```

**Example**:
```bash
curl -H "x-api-key: dev-key-12345" http://localhost:8000/patients
```

---

### Get Patient Details
```
GET /patients/{patient_id}
```

**Response** (200):
```json
{
  "patient": {
    "patient_id": "patient-123",
    "name": "John Doe",
    "condition": "Fever",
    "codes": {
      "namaste": {"code": "N-0001", "display": "Fever", "system": "NAMASTE"},
      "tm2": {"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"},
      "biomed": {"code": "R50", "display": "Fever", "system": "ICD11-BIO"}
    }
  },
  "diagnosis": {...},
  "treatment": {...}
}
```

**Example**:
```bash
curl -H "x-api-key: dev-key-12345" http://localhost:8000/patients/patient-123
```

---

## 🔬 Disease Codes

### Set Patient Disease Codes
```
POST /patients/{patient_id}/codes
Content-Type: application/json
x-api-key: your-api-key

{
  "namaste_code": "N-0001",
  "disease_name": "Fever"
}
```

**Response** (200):
```json
{
  "patient": {...},
  "codes": {
    "namaste": {"code": "N-0001", "display": "Fever", "system": "NAMASTE"},
    "tm2": {"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"},
    "biomed": {"code": "R50", "display": "Fever", "system": "ICD11-BIO"}
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/patients/patient-123/codes \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{
    "namaste_code": "N-0001",
    "disease_name": "Fever"
  }'
```

---

## 🔍 Search & Mapping

### Universal Search
```
GET /search?q={query}
```

**Query Parameters**:
- `q` (required): Search term (min 1 character)
- `x-api-key` (required): API key in header

**Response** (200):
```json
{
  "count": 3,
  "items": [
    {"code": "N-0001", "display": "Fever", "system": "NAMASTE"},
    {"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"},
    {"code": "R50", "display": "Fever", "system": "ICD11-BIO"}
  ]
}
```

**Example**:
```bash
curl -H "x-api-key: dev-key-12345" "http://localhost:8000/search?q=fever"
```

---

### Search by System
```
GET /terms?q={query}&system={system}
```

**Query Parameters**:
- `q` (required): Search term
- `system` (optional): `NAMASTE`, `TM2`, or `BIO` (searches all if not specified)
- `x-api-key` (required): API key in header

**Response** (200):
```json
{
  "count": 1,
  "items": [
    {"code": "N-0001", "display": "Fever", "system": "NAMASTE"}
  ]
}
```

**Examples**:
```bash
# Search NAMASTE only
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/terms?q=fever&system=NAMASTE"

# Search TM2 only
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/terms?q=fever&system=TM2"

# Search all systems
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/terms?q=fever"
```

---

### Get Code Mapping
```
POST /translate?namaste_code={code}
```

**Query Parameters**:
- `namaste_code` (required): NAMASTE code to translate
- `x-api-key` (required): API key in header

**Response** (200):
```json
{
  "namaste": "N-0001",
  "tm2": {
    "code": "TM2-MA00",
    "display": "Fever (Traditional)",
    "system": "ICD11-TM2"
  },
  "biomed": {
    "code": "R50",
    "display": "Fever",
    "system": "ICD11-BIO"
  }
}
```

**Example**:
```bash
curl -X POST -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/translate?namaste_code=N-0001"
```

---

## 📋 Diagnosis Management

### Create/Update Diagnosis
```
POST /patients/{patient_id}/diagnosis
Content-Type: application/json
x-api-key: your-api-key

{
  "earlier_meds": "Paracetamol",
  "current_meds": "Aspirin",
  "doctor_names": "Dr. Smith",
  "hospital_names": "City Hospital"
}
```

**Response** (200):
```json
{
  "patient_id": "patient-123",
  "diagnosis": {
    "earlier_meds": "Paracetamol",
    "current_meds": "Aspirin",
    "doctor_names": "Dr. Smith",
    "hospital_names": "City Hospital"
  },
  "_updatedAt": "2026-04-04T10:30:00"
}
```

---

### Get Diagnosis
```
GET /patients/{patient_id}/diagnosis
```

**Response** (200):
```json
{
  "earlier_meds": "Paracetamol",
  "current_meds": "Aspirin",
  "doctor_names": "Dr. Smith",
  "hospital_names": "City Hospital"
}
```

---

## 💊 Treatment Management

### Create/Update Treatment
```
POST /patients/{patient_id}/treatment
Content-Type: application/json
x-api-key: your-api-key

{
  "items": [
    {
      "drug": "Paracetamol",
      "dosage": "500mg",
      "time": "Twice daily",
      "remark": "After meals"
    }
  ],
  "note": "Continue for 5 days"
}
```

**Response** (200):
```json
{
  "patient_id": "patient-123",
  "treatment": {
    "items": [...],
    "note": "Continue for 5 days"
  },
  "_updatedAt": "2026-04-04T10:30:00"
}
```

---

### Get Treatment
```
GET /patients/{patient_id}/treatment
```

**Response** (200):
```json
{
  "items": [
    {
      "drug": "Paracetamol",
      "dosage": "500mg",
      "time": "Twice daily",
      "remark": "After meals"
    }
  ],
  "note": "Continue for 5 days"
}
```

---

### Get Summary
```
GET /patients/{patient_id}/summary
```

**Response** (200):
```json
{
  "patient": {...},
  "diagnosis": {...},
  "treatment": {...}
}
```

---

## 🤖 AI Insights

### Generate AI Overview
```
POST /ai/overview
Content-Type: application/json
x-api-key: your-api-key

{
  "code": "N-0001",
  "name": "Fever"
}
```

**Response** (200):
```json
{
  "code": "N-0001",
  "name": "Fever",
  "summary": "Fever is an elevated body temperature... [detailed AI-generated summary]"
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/ai/overview \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{
    "code": "N-0001",
    "name": "Fever"
  }'
```

---

### Get AI Overview (with Language Support)
```
GET /api/ai-overview?code={code}&name={name}&lang={lang}
```

**Query Parameters**:
- `code` (required): Disease code
- `name` (required): Disease name
- `lang` (optional): Language code (default: `en`)
- `x-api-key` (required): API key in header

**Response** (200):
```json
{
  "code": "N-0001",
  "name": "Fever",
  "summary": "Fever is an elevated body temperature..."
}
```

**Examples**:
```bash
# English
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/api/ai-overview?code=N-0001&name=Fever&lang=en"

# Hindi
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/api/ai-overview?code=N-0001&name=Fever&lang=hi"

# Spanish
curl -H "x-api-key: dev-key-12345" \
  "http://localhost:8000/api/ai-overview?code=N-0001&name=Fever&lang=es"
```

---

## 📦 FHIR Resources

### Create Condition (FHIR)
```
POST /problemlist/condition?namaste_code={code}
```

**Query Parameters**:
- `namaste_code` (required): NAMASTE code
- `patient_id` (optional): Patient ID (default: "example-patient")
- `x-api-key` (required): API key in header

**Response** (200):
```json
{
  "name": "patient-123",
  "resourceType": "Condition",
  "id": "cond-abc123",
  "clinicalStatus": {...},
  "verificationStatus": {...},
  "category": [...],
  "code": {
    "coding": [
      {"system": "urn:oid:1.2.356.10000.ayush.namaste", "code": "N-0001", "display": "Fever"},
      {"system": "http://id.who.int/icd/release/11/mms", "code": "TM2-MA00", "display": "Fever (Traditional)"},
      {"system": "http://id.who.int/icd/release/11/mms", "code": "R50", "display": "Fever"}
    ],
    "text": "Fever"
  },
  "subject": {"reference": "Patient/patient-123"}
}
```

---

### Upload FHIR Bundle
```
POST /bundle
Content-Type: application/json
x-api-key: your-api-key

{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [...]
}
```

**Response** (200):
```json
{
  "status": "accepted",
  "entries": 5,
  "auditId": "audit-1"
}
```

---

## 💾 Saves Management

### List All Saves
```
GET /saves
```

**Response** (200):
```json
[
  {
    "id": "cond-abc123",
    "resourceType": "Condition",
    ...
  }
]
```

---

### Get Specific Save
```
GET /saves/{cid}
```

**Response** (200):
```json
{
  "id": "cond-abc123",
  "resourceType": "Condition",
  ...
}
```

---

### Update Save
```
PUT /saves/{cid}
Content-Type: application/json
x-api-key: your-api-key

{
  "resourceType": "Condition",
  ...
}
```

**Response** (200):
```json
{
  "id": "cond-abc123",
  "resourceType": "Condition",
  ...
}
```

---

### Delete Save
```
DELETE /saves/{cid}
```

**Response** (200):
```json
{
  "deleted": "cond-abc123"
}
```

---

## ✅ Health Check

### Check Backend Status
```
GET /health
```

**Response** (200):
```json
{
  "ok": true
}
```

**Example**:
```bash
curl http://localhost:8000/health
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid payload"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid API key"
}
```

### 404 Not Found
```json
{
  "detail": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to generate AI overview: [error message]"
}
```

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (Invalid API key) |
| 404 | Not Found |
| 500 | Internal Server Error |
| 503 | Service Unavailable (Gemini API not configured) |

---

## 🔗 Interactive API Documentation

Once the backend is running, visit:
```
http://localhost:8000/docs
```

This opens the Swagger UI with interactive API documentation.

---

## 📝 Example Workflows

### Workflow 1: Create Patient with Disease Codes
```bash
# 1. Create patient
PATIENT_ID=$(curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{"name": "John Doe"}' | jq -r '.patient_id')

# 2. Set disease codes
curl -X POST http://localhost:8000/patients/$PATIENT_ID/codes \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{"namaste_code": "N-0001", "disease_name": "Fever"}'

# 3. Get patient details
curl -H "x-api-key: dev-key-12345" \
  http://localhost:8000/patients/$PATIENT_ID
```

### Workflow 2: Add Diagnosis and Treatment
```bash
# 1. Add diagnosis
curl -X POST http://localhost:8000/patients/$PATIENT_ID/diagnosis \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{
    "earlier_meds": "None",
    "current_meds": "Paracetamol",
    "doctor_names": "Dr. Smith",
    "hospital_names": "City Hospital"
  }'

# 2. Add treatment
curl -X POST http://localhost:8000/patients/$PATIENT_ID/treatment \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-12345" \
  -d '{
    "items": [
      {
        "drug": "Paracetamol",
        "dosage": "500mg",
        "time": "Twice daily",
        "remark": "After meals"
      }
    ],
    "note": "Continue for 5 days"
  }'

# 3. Get summary
curl -H "x-api-key: dev-key-12345" \
  http://localhost:8000/patients/$PATIENT_ID/summary
```

---

**Last Updated**: April 2026
**Version**: 1.0
