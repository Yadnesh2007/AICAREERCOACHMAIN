from fastapi import APIRouter

router = APIRouter(tags=["Health & Identity"])

@router.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@router.get("/api/me")
def get_current_user():
    return {
        "id": "usr_dev_yadnesh_01",
        "email": "student@careerproof.ai",
        "display_name": "Yadnesh (Candidate Software Engineer)"
    }
