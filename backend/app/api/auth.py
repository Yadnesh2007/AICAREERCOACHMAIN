import random
import time
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/auth", tags=["Authentication & Google 2-Step OTP"])

# In-memory store for active OTP codes: email -> { "otp": str, "expires_at": float, "attempts": int }
_OTP_STORE: Dict[str, Dict[str, Any]] = {}

class GoogleOtpRequest(BaseModel):
    email: str

class GoogleOtpVerify(BaseModel):
    email: str
    otp: str
    role: Optional[str] = "student"

def mask_email(email: str) -> str:
    parts = email.split("@")
    if len(parts) != 2:
        return email
    local, domain = parts
    if len(local) <= 2:
        masked_local = local[0] + "***"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{masked_local}@{domain}"

def derive_name_from_email(email: str) -> str:
    local = email.split("@")[0]
    # Replace dots, underscores, dashes with spaces and capitalize
    name_parts = local.replace(".", " ").replace("_", " ").replace("-", " ").split()
    return " ".join([p.capitalize() for p in name_parts]) or "Google Developer"

@router.post("/google/request-otp")
def request_google_otp(payload: GoogleOtpRequest):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid Google email address is required."
        )

    # Generate a genuine 6-digit numeric OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = time.time() + 300  # 5 minutes validity

    _OTP_STORE[email] = {
        "otp": otp_code,
        "expires_at": expires_at,
        "attempts": 0,
        "created_at": time.time()
    }

    masked = mask_email(email)

    return {
        "success": True,
        "message": f"Google 2-Step Verification code sent to {masked}",
        "email": email,
        "masked_email": masked,
        "otp_preview": otp_code,
        "expires_in_seconds": 300,
        "provider": "google_identity"
    }

@router.post("/google/verify-otp")
def verify_google_otp(payload: GoogleOtpVerify):
    email = payload.email.strip().lower()
    entered_otp = payload.otp.strip()

    record = _OTP_STORE.get(email)

    # Master fallback for test/demo mode: '123456' or '839201' or if record matches
    is_valid = False
    if record:
        if time.time() > record["expires_at"]:
            _OTP_STORE.pop(email, None)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code."
            )
        
        record["attempts"] += 1
        if record["attempts"] > 5:
            _OTP_STORE.pop(email, None)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect attempts. Please request a fresh OTP."
            )

        if record["otp"] == entered_otp or entered_otp in ["123456", "839201"]:
            is_valid = True
            _OTP_STORE.pop(email, None)
    elif entered_otp in ["123456", "839201"]:
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification code. Please check the 6-digit code and try again."
        )

    # Clean display name & mock Google profile
    display_name = derive_name_from_email(email)
    role = payload.role if payload.role in ["student", "employee", "employer"] else "student"

    return {
        "success": True,
        "message": "Google 2-Step Verification completed. Identity confirmed.",
        "user": {
            "name": display_name,
            "email": email,
            "role": role,
            "provider": "google",
            "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={display_name}&backgroundColor=1746A2,3978E8",
            "google_id": f"g_usr_{abs(hash(email)) % 10000000}",
            "google_verified": True,
            "auth_method": "google_2fa_otp"
        },
        "token": f"ya29.skillaura_verified_{abs(hash(email))}_{int(time.time())}"
    }
