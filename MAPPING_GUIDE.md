# Ayur Setu - Mapping Guide

This guide explains the three coding systems used in Ayur Setu and how they map to each other.

---

## 📚 Three Coding Systems

### 1. NAMASTE (Traditional Indian Medicine)
- **Full Name**: National AYUSH Multidimensional Standardized Terminology and Enumeration
- **Purpose**: Standardized coding for traditional Indian medicine conditions
- **File**: `backend/data/namaste.csv`
- **Format**: CSV with columns: `code`, `display`
- **Example**:
  ```
  code,display
  N-0001,Fever
  N-0002,Cough
  N-0003,Joint Pain
  ```

### 2. ICD-11 TM2 (Traditional Medicine)
- **Full Name**: ICD-11 Traditional Medicine Module
- **Purpose**: WHO's standardized coding for traditional medicine conditions
- **File**: `backend/data/icd11_tm2.json`
- **Format**: JSON array with `code` and `display`
- **Example**:
  ```json
  [
    {"code": "TM2-MA00", "display": "Fever (Traditional)"},
    {"code": "TM2-UR10", "display": "Cough (Traditional)"}
  ]
  ```

### 3. ICD-11 BIO (Biomedical)
- **Full Name**: ICD-11 Biomedical Classification
- **Purpose**: WHO's standardized coding for biomedical/modern medicine conditions
- **File**: `backend/data/icd11_bio.json`
- **Format**: JSON array with `code` and `display`
- **Example**:
  ```json
  [
    {"code": "R50", "display": "Fever"},
    {"code": "R05", "display": "Cough"}
  ]
  ```

---

## 🔗 Concept Mapping

The **Concept Map** links NAMASTE codes to their equivalent ICD-11 codes in both TM2 and Biomedical systems.

### File: `backend/data/conceptmap.json`

**Structure**:
```json
[
  {
    "namaste": "N-0001",
    "tm2": "TM2-MA00",
    "biomed": "DA64"
  },
  {
    "namaste": "N-0002",
    "tm2": "TM2-UR10",
    "biomed": "5A11"
  }
]
```

### How It Works

When a user selects a NAMASTE code (e.g., `N-0001`):

1. **Backend looks up the mapping**:
   ```
   N-0001 → TM2-MA00 (Traditional Medicine)
   N-0001 → DA64 (Biomedical)
   ```

2. **Retrieves full details** from respective files:
   - NAMASTE: `{"code": "N-0001", "display": "Fever", "system": "NAMASTE"}`
   - TM2: `{"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"}`
   - BIO: `{"code": "DA64", "display": "Fever (Biomedical)", "system": "ICD11-BIO"}`

3. **Stores in patient record**:
   ```json
   {
     "patient_id": "patient-123",
     "codes": {
       "namaste": {"code": "N-0001", "display": "Fever", "system": "NAMASTE"},
       "tm2": {"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"},
       "biomed": {"code": "DA64", "display": "Fever (Biomedical)", "system": "ICD11-BIO"}
     }
   }
   ```

---

## 📋 Data File Formats

### NAMASTE CSV Format

**File**: `backend/data/namaste.csv`

```csv
code,display
N-0001,Fever
N-0002,Cough
N-0003,Joint Pain
N-0004,Headache
N-0005,Indigestion
N-0006,Obesity
N-0007,Asthma
N-0008,Anemia
N-0009,High Fever
N-0010,Hemorrhoids
```

**Requirements**:
- Must have `code` and `display` columns
- Code should be unique
- Display should be human-readable condition name

### ICD-11 TM2 JSON Format

**File**: `backend/data/icd11_tm2.json`

```json
[
  {
    "code": "TM2-MA00",
    "display": "Fever (Traditional Medicine)"
  },
  {
    "code": "TM2-UR10",
    "display": "Cough (Traditional Medicine)"
  },
  {
    "code": "TM2-VT01",
    "display": "Joint Pain (Traditional Medicine)"
  }
]
```

**Requirements**:
- Must be a JSON array
- Each object must have `code` and `display`
- Code should follow ICD-11 TM2 format

### ICD-11 BIO JSON Format

**File**: `backend/data/icd11_bio.json`

```json
[
  {
    "code": "R50",
    "display": "Fever"
  },
  {
    "code": "R05",
    "display": "Cough"
  },
  {
    "code": "M79",
    "display": "Joint Pain"
  }
]
```

**Requirements**:
- Must be a JSON array
- Each object must have `code` and `display`
- Code should follow ICD-11 Biomedical format

### Concept Map JSON Format

**File**: `backend/data/conceptmap.json`

```json
[
  {
    "namaste": "N-0001",
    "tm2": "TM2-MA00",
    "biomed": "R50"
  },
  {
    "namaste": "N-0002",
    "tm2": "TM2-UR10",
    "biomed": "R05"
  }
]
```

**Requirements**:
- Must be a JSON array
- Each object must have `namaste`, `tm2`, and `biomed` fields
- All codes must exist in their respective files
- NAMASTE codes must be unique

---

## 🔄 API Endpoints for Mapping

### 1. Search Across All Systems
```bash
GET /search?q=fever&x-api-key=your-api-key
```

**Response**:
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

### 2. Search by System
```bash
GET /terms?q=fever&system=NAMASTE&x-api-key=your-api-key
```

**Response**:
```json
{
  "count": 1,
  "items": [
    {"code": "N-0001", "display": "Fever", "system": "NAMASTE"}
  ]
}
```

### 3. Get Mapping for a Code
```bash
POST /translate?namaste_code=N-0001&x-api-key=your-api-key
```

**Response**:
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

### 4. Set Patient Codes
```bash
POST /patients/{patient_id}/codes
Content-Type: application/json
x-api-key: your-api-key

{
  "namaste_code": "N-0001",
  "disease_name": "Fever"
}
```

**Response**:
```json
{
  "patient": {
    "patient_id": "patient-123",
    "name": "John Doe",
    "codes": {
      "namaste": {"code": "N-0001", "display": "Fever", "system": "NAMASTE"},
      "tm2": {"code": "TM2-MA00", "display": "Fever (Traditional)", "system": "ICD11-TM2"},
      "biomed": {"code": "R50", "display": "Fever", "system": "ICD11-BIO"}
    }
  },
  "codes": {...}
}
```

---

## 🎯 Mapping Examples

### Example 1: Fever
```
NAMASTE:   N-0001 → Fever
TM2:       TM2-MA00 → Fever (Traditional Medicine)
Biomedical: R50 → Fever
```

### Example 2: Cough
```
NAMASTE:   N-0002 → Cough
TM2:       TM2-UR10 → Cough (Traditional Medicine)
Biomedical: R05 → Cough
```

### Example 3: Joint Pain
```
NAMASTE:   N-0003 → Joint Pain
TM2:       TM2-VT01 → Joint Pain (Traditional Medicine)
Biomedical: M79 → Joint Pain
```

---

## ✅ Validation Rules

### For NAMASTE Codes
- Must be unique
- Format: `N-XXXX` (recommended)
- Display name should be clear and descriptive

### For ICD-11 TM2 Codes
- Must be unique
- Format: `TM2-XXXX` (recommended)
- Should follow WHO ICD-11 TM2 standards

### For ICD-11 BIO Codes
- Must be unique
- Format: ICD-11 biomedical format (e.g., `R50`, `M79`)
- Should follow WHO ICD-11 standards

### For Concept Mapping
- Each NAMASTE code should have exactly one TM2 mapping
- Each NAMASTE code should have exactly one Biomedical mapping
- All referenced codes must exist in their respective files
- No orphaned mappings (codes that don't exist in source files)

---

## 🔍 Troubleshooting Mapping Issues

### Issue: Code not found in search
**Solution**: 
1. Verify code exists in the respective data file
2. Check spelling and case sensitivity
3. Ensure file is properly formatted JSON/CSV

### Issue: Mapping returns null
**Solution**:
1. Check conceptmap.json for the NAMASTE code
2. Verify TM2 and Biomedical codes exist in their files
3. Ensure no typos in codes

### Issue: Patient codes not set correctly
**Solution**:
1. Verify NAMASTE code exists
2. Check conceptmap.json has mapping for that code
3. Ensure MongoDB is connected
4. Check API key is valid

---

## 📊 Data Validation Script

To validate your mapping files, use this Python script:

```python
import json
import csv

# Load data
with open('backend/data/namaste.csv') as f:
    namaste = {row['code']: row['display'] for row in csv.DictReader(f)}

with open('backend/data/icd11_tm2.json') as f:
    tm2 = {item['code']: item['display'] for item in json.load(f)}

with open('backend/data/icd11_bio.json') as f:
    bio = {item['code']: item['display'] for item in json.load(f)}

with open('backend/data/conceptmap.json') as f:
    mapping = json.load(f)

# Validate
errors = []
for m in mapping:
    if m['namaste'] not in namaste:
        errors.append(f"NAMASTE code not found: {m['namaste']}")
    if m['tm2'] not in tm2:
        errors.append(f"TM2 code not found: {m['tm2']}")
    if m['biomed'] not in bio:
        errors.append(f"Biomedical code not found: {m['biomed']}")

if errors:
    print("Validation errors:")
    for error in errors:
        print(f"  - {error}")
else:
    print("✓ All mappings are valid!")
```

---

## 📝 Adding New Mappings

### Step 1: Add to NAMASTE CSV
```csv
N-0011,New Condition
```

### Step 2: Add to ICD-11 TM2 JSON
```json
{"code": "TM2-NEW01", "display": "New Condition (Traditional)"}
```

### Step 3: Add to ICD-11 BIO JSON
```json
{"code": "Z99", "display": "New Condition (Biomedical)"}
```

### Step 4: Add to Concept Map
```json
{
  "namaste": "N-0011",
  "tm2": "TM2-NEW01",
  "biomed": "Z99"
}
```

### Step 5: Restart Backend
```bash
python start_server.py
```

---

**Last Updated**: April 2026
**Version**: 1.0
