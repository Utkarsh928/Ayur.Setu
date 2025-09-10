import os, json, time, hashlib
from typing import Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
AUDIT_FILE = os.path.join(DATA_DIR, "audit_log.json")


def ensure_audit_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)


def _read_audit() -> list:
    ensure_audit_file()
    with open(AUDIT_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def _write_audit(items: list) -> None:
    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def _hash_entry(prev_hash: str, entry: Dict[str, Any]) -> str:
    payload = json.dumps({"prev": prev_hash, "entry": entry}, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def write_audit(action: str, actor: Dict[str, Any], resource: Optional[Dict[str, Any]] = None, consent: Optional[Dict[str, Any]] = None, request_meta: Optional[Dict[str, Any]] = None, notes: str = "") -> Dict[str, Any]:
    items = _read_audit()
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    audit_id = f"audit-{len(items)+1:06d}"
    base = {
        "auditId": audit_id,
        "action": action,
        "actor": actor or {},
        "resource": resource or {},
        "consent": consent or {},
        "request": request_meta or {},
        "timestamp": ts,
        "notes": notes,
    }
    prev_hash = items[-1].get("hash") if items else "genesis"
    entry_hash = _hash_entry(prev_hash, base)
    base["hashPrev"] = prev_hash
    base["hash"] = entry_hash
    items.append(base)
    _write_audit(items)
    return base


