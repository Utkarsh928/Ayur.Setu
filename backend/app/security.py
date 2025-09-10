import os, time, json, base64, hashlib, secrets, threading
from typing import Optional, Dict, Any

import requests
from jose import jwt
from jose.utils import base64url_decode
from cryptography.fernet import Fernet, InvalidToken

from dotenv import load_dotenv

load_dotenv()

# OAuth/OIDC configuration via environment
ABDM_AUTH_URL = os.getenv("ABDM_AUTH_URL", "https://abdm-sandbox/auth")
ABDM_TOKEN_URL = os.getenv("ABDM_TOKEN_URL", "https://abdm-sandbox/token")
ABDM_JWKS_URL = os.getenv("ABDM_JWKS_URL", "https://abdm-sandbox/jwks")
ABDM_ISSUER = os.getenv("ABDM_ISSUER", "https://abdm-sandbox")
ABDM_CLIENT_ID = os.getenv("ABDM_CLIENT_ID", "dev-client-id")
ABDM_CLIENT_SECRET = os.getenv("ABDM_CLIENT_SECRET", "dev-client-secret")
ABDM_REDIRECT_URI = os.getenv("ABDM_REDIRECT_URI", "http://localhost:8000/auth/callback")

# Session/token encryption
SESSION_ENC_KEY = os.getenv("SESSION_ENC_KEY")
if not SESSION_ENC_KEY:
    # For dev, derive a fernet key from a random token and persist in env during process lifetime
    SESSION_ENC_KEY = base64.urlsafe_b64encode(hashlib.sha256(secrets.token_bytes(32)).digest()).decode()
_fernet = Fernet(SESSION_ENC_KEY.encode())

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

_jwks_cache: Dict[str, Any] = {}
_jwks_lock = threading.Lock()


def ensure_sessions_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)


def generate_state() -> str:
    return secrets.token_urlsafe(24)


def generate_nonce() -> str:
    return secrets.token_urlsafe(24)


def generate_code_verifier() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(40)).rstrip(b"=").decode()


def code_challenge_from_verifier(verifier: str) -> str:
    digest = hashlib.sha256(verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()


def encrypt_value(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()


def decrypt_value(token: str) -> Optional[str]:
    try:
        return _fernet.decrypt(token.encode()).decode()
    except (InvalidToken, Exception):
        return None


def _load_sessions() -> Dict[str, Any]:
    ensure_sessions_file()
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def _write_sessions(data: Dict[str, Any]) -> None:
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def create_session(claims: Dict[str, Any], tokens: Dict[str, Any], scopes: str) -> str:
    sessions = _load_sessions()
    session_id = secrets.token_urlsafe(24)
    now = int(time.time())
    access_token = tokens.get("access_token", "")
    refresh_token = tokens.get("refresh_token", "")
    enc_access = encrypt_value(access_token) if access_token else ""
    enc_refresh = encrypt_value(refresh_token) if refresh_token else ""
    sessions[session_id] = {
        "abha_sub": claims.get("sub"),
        "healthId": claims.get("healthId") or claims.get("hid") or claims.get("preferred_username"),
        "name": claims.get("name") or claims.get("given_name"),
        "id_token_claims": claims,
        "access_token": enc_access,
        "refresh_token": enc_refresh,
        "scopes": scopes,
        "created_at": now,
        "expires_at": now + 3600,
    }
    _write_sessions(sessions)
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    if not session_id:
        return None
    sessions = _load_sessions()
    return sessions.get(session_id)


def delete_session(session_id: str) -> None:
    sessions = _load_sessions()
    if session_id in sessions:
        del sessions[session_id]
        _write_sessions(sessions)


def get_decrypted_access_token(session: Dict[str, Any]) -> Optional[str]:
    if not session:
        return None
    enc = session.get("access_token")
    return decrypt_value(enc) if enc else None


def fetch_jwks() -> Dict[str, Any]:
    with _jwks_lock:
        cache = _jwks_cache.get("jwks")
        if cache and cache.get("fetched_at", 0) > time.time() - 3600:
            return cache["data"]
        resp = requests.get(ABDM_JWKS_URL, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        _jwks_cache["jwks"] = {"data": data, "fetched_at": time.time()}
        return data


def verify_id_token(id_token: str, expected_aud: Optional[str] = None, expected_iss: Optional[str] = None, expected_nonce: Optional[str] = None) -> Dict[str, Any]:
    jwks = fetch_jwks()
    unverified = jwt.get_unverified_header(id_token)
    kid = unverified.get("kid")
    key = None
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            key = jwk
            break
    if not key:
        # fallback: try first key
        if jwks.get("keys"):
            key = jwks["keys"][0]
        else:
            raise ValueError("JWKS key not found for token")
    claims = jwt.decode(
        id_token,
        key,
        algorithms=["RS256", "RS512"],
        audience=expected_aud or ABDM_CLIENT_ID,
        issuer=expected_iss or ABDM_ISSUER,
    )
    if expected_nonce and claims.get("nonce") != expected_nonce:
        raise ValueError("Invalid nonce")
    return claims


def exchange_code_for_tokens(code: str, code_verifier: Optional[str] = None) -> Dict[str, Any]:
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": ABDM_REDIRECT_URI,
        "client_id": ABDM_CLIENT_ID,
    }
    # Public client with PKCE or confidential with client_secret
    if code_verifier:
        data["code_verifier"] = code_verifier
    else:
        data["client_secret"] = ABDM_CLIENT_SECRET
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    resp = requests.post(ABDM_TOKEN_URL, data=data, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp.json()


def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": ABDM_CLIENT_ID,
        "client_secret": ABDM_CLIENT_SECRET,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    resp = requests.post(ABDM_TOKEN_URL, data=data, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp.json()


