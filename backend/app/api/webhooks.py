import hmac
import hashlib
import json
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..models.db_models import ChangeEvent, Repository
from ..workers.change_processor import process_repo_push

router = APIRouter(prefix="/api/webhooks", tags=["GitHub Webhook Ingress"])

def verify_signature(raw_body: bytes, signature_header: str) -> bool:
    if not signature_header:
        return False
    # Format: sha256=...
    prefix = "sha256="
    if not signature_header.startswith(prefix):
        return False
    expected_hash = signature_header[len(prefix):]
    mac = hmac.new(settings.GITHUB_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256)
    computed_hash = mac.hexdigest()
    return hmac.compare_digest(computed_hash, expected_hash)

@router.post("/github", status_code=202)
async def github_webhook(
    request: Request,
    x_github_event: str = Header(None, alias="X-GitHub-Event"),
    x_github_delivery: str = Header(None, alias="X-GitHub-Delivery"),
    x_hub_signature_256: str = Header(None, alias="X-Hub-Signature-256"),
    db: Session = Depends(get_db)
):
    raw_body = await request.body()
    
    # In test/dev mode, allow test calls or verify HMAC
    if settings.GITHUB_WEBHOOK_SECRET and x_hub_signature_256:
        if not verify_signature(raw_body, x_hub_signature_256):
            raise HTTPException(status_code=401, detail="Invalid GitHub webhook HMAC-SHA256 signature")
            
    # Check deduplication
    if x_github_delivery:
        existing = db.query(ChangeEvent).filter(ChangeEvent.delivery_id == x_github_delivery).first()
        if existing:
            return {"accepted": True, "note": "Duplicate delivery ignored"}
            
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    if x_github_event == "ping":
        return {"accepted": True, "zen": payload.get("zen", "Keep it logically awesome.")}
        
    if x_github_event == "push":
        repo_data = payload.get("repository", {})
        repo_full_name = repo_data.get("full_name")
        repo = db.query(Repository).filter(Repository.full_name == repo_full_name).first()
        if not repo:
            # Fallback to first repo if local test
            repo = db.query(Repository).first()
            if not repo:
                return {"accepted": False, "reason": "No matched repository in database"}
                
        before_sha = payload.get("before", "0000000000000000000000000000000000000000")
        after_sha = payload.get("after", "1111111111111111111111111111111111111111")
        
        # Collect changed files from commits
        changed_files = []
        commits = payload.get("commits", [])
        commit_msg = commits[-1].get("message", "Commit via GitHub Push") if commits else "Push event"
        
        for c in commits:
            for f in c.get("added", []):
                changed_files.append({"path": f, "change_type": "added", "content": ""})
            for f in c.get("modified", []):
                changed_files.append({"path": f, "change_type": "modified", "content": ""})
            for f in c.get("removed", []):
                changed_files.append({"path": f, "change_type": "deleted"})
                
        # Run worker processing
        process_repo_push(
            db=db,
            repo_id=repo.id,
            before_sha=before_sha,
            after_sha=after_sha,
            changed_files=changed_files,
            delivery_id=x_github_delivery,
            message=commit_msg
        )
        
        return {"accepted": True}
        
    return {"accepted": True, "unhandled_event": x_github_event}
