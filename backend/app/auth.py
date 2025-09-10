import os, time
from typing import Optional

from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse

from .security import (
    ABDM_AUTH_URL,
    ABDM_CLIENT_ID,
    ABDM_REDIRECT_URI,
    generate_state,
    generate_nonce,
    generate_code_verifier,
    code_challenge_from_verifier,
    exchange_code_for_tokens,
    verify_id_token,
    create_session,
    get_session,
    delete_session,
    refresh_access_token,
    get_decrypted_access_token,
    encrypt_value,
)
from .audit import write_audit

router = APIRouter()
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax").lower()

STATE_CACHE: dict = {}


def _save_state(state: str, data: dict):
    STATE_CACHE[state] = {**data, "created": time.time()}


def _pop_state(state: str) -> Optional[dict]:
    st = STATE_CACHE.pop(state, None)
    return st


@router.get("/login")
def login(next: str = "/"):
    state = generate_state()
    nonce = generate_nonce()
    code_verifier = generate_code_verifier()
    code_challenge = code_challenge_from_verifier(code_verifier)
    _save_state(state, {"next": next, "nonce": nonce, "code_verifier": code_verifier})

    url = (
        f"{ABDM_AUTH_URL}?response_type=code&client_id={ABDM_CLIENT_ID}"
        f"&redirect_uri={ABDM_REDIRECT_URI}"
        f"&scope=openid%20profile%20offline_access&state={state}&nonce={nonce}"
        f"&code_challenge={code_challenge}&code_challenge_method=S256"
    )
    return RedirectResponse(url)


@router.get("/callback")
def callback(code: str, state: str, request: Request):
    saved = _pop_state(state)
    if not saved:
        raise HTTPException(status_code=400, detail="Invalid state")

    tokens = exchange_code_for_tokens(code, code_verifier=saved.get("code_verifier"))
    id_token = tokens.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing id_token")

    claims = verify_id_token(id_token, expected_nonce=saved.get("nonce"))
    scopes = tokens.get("scope") or "openid profile offline_access"

    session_id = create_session(claims, tokens, scopes)
    actor = {
        "abha_sub": claims.get("sub"),
        "healthId": claims.get("healthId") or claims.get("hid"),
        "name": claims.get("name"),
    }
    client_meta = {"ip": request.client.host if request.client else "", "userAgent": request.headers.get("user-agent", "")}
    write_audit("login", actor, consent={"scopes": scopes, "consentTimestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}, request_meta=client_meta, notes="ABHA login")

    redirect_to = saved.get("next") or "/"
    resp = RedirectResponse(redirect_to)
    samesite_value = "none" if COOKIE_SAMESITE == "none" else ("lax" if COOKIE_SAMESITE == "lax" else "strict")
    resp.set_cookie(
        "session_id",
        session_id,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=samesite_value,
        path="/",
    )
    return resp


def get_current_user(request: Request) -> dict:
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    return session


@router.get("/me")
def me(request: Request):
    from .main import get_current_user_conditional
    user = get_current_user_conditional(request)
    print(user)
    return {
        "abha_sub": user.get("abha_sub"),
        "healthId": user.get("healthId"),
        "name": user.get("name"),
        "scopes": user.get("scopes"),
    }


@router.post("/refresh")
def refresh(user=Depends(get_current_user)):
    enc_refresh = user.get("refresh_token")
    # refresh token is encrypted; we stored ciphertext under key 'refresh_token'
    # get decrypted via get_session + decrypt inside security if needed in future
    from .security import decrypt_value, _write_sessions, _load_sessions  # local import to avoid export

    refresh_token = decrypt_value(enc_refresh) if enc_refresh else None
    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token")
    tokens = refresh_access_token(refresh_token)
    access = tokens.get("access_token")
    if not access:
        raise HTTPException(status_code=400, detail="Failed to refresh")

    # update session access token
    sessions = _load_sessions()
    for sid, sess in sessions.items():
        if sess is user:
            sessions[sid]["access_token"] = encrypt_value(access)
            sessions[sid]["expires_at"] = int(time.time()) + 3600
            _write_sessions(sessions)
            break
    return {"ok": True}


@router.post("/logout")
def logout(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id:
        delete_session(session_id)
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("session_id")
    return resp


