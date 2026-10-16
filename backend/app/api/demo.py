import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.db_models import Repository
from ..models.schemas import SimulatePushRequest
from ..workers.change_processor import process_repo_push

router = APIRouter(prefix="/api/demo", tags=["Demo & Judging Accelerator"])

SQL_QUERIES_SAMPLE = """-- Candidate Portfolio: Student Placement Tracker Queries
-- Verified Relational Schema & Parameterized Queries

-- 1. Candidate job application matching with multiple JOINs and conditional filtering
SELECT 
    s.id AS student_id,
    s.full_name,
    j.title AS job_title,
    j.employer,
    COUNT(e.id) AS verified_evidence_count
FROM students s
INNER JOIN job_applications a ON s.id = a.student_id
INNER JOIN jobs j ON a.job_id = j.id
LEFT JOIN student_evidence e ON s.id = e.student_id
WHERE a.status = :application_status
  AND j.is_active = TRUE
GROUP BY s.id, s.full_name, j.title, j.employer
HAVING COUNT(e.id) >= :min_evidence_threshold
ORDER BY verified_evidence_count DESC;

-- 2. Parameterized insertion of newly assessed candidate qualification
INSERT INTO student_qualifications (student_id, skill_key, status, evaluated_at)
VALUES (:student_id, :skill_key, :status, CURRENT_TIMESTAMP);
"""

@router.post("/simulate-push")
def simulate_push(body: SimulatePushRequest, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == body.repository_id).first()
    if not repo:
        repo = db.query(Repository).first()
        if not repo:
            raise HTTPException(status_code=404, detail="No repository available to push to")
            
    before_sha = repo.latest_scanned_sha or "e4b9c10a28f7"
    after_sha = uuid.uuid4().hex[:12]
    
    if body.action == "add_sql":
        changed_files = [
            {
                "path": "database/queries.sql",
                "change_type": "added",
                "content": SQL_QUERIES_SAMPLE
            },
            {
                "path": "tests/test_queries.py",
                "change_type": "added",
                "content": "def test_candidate_query():\n    assert True, 'Query structure valid'\n"
            }
        ]
        msg = body.commit_message or "feat(database): add relational placement tracker queries with parameterized JOINs"
    else:
        changed_files = [
            {
                "path": "database/queries.sql",
                "change_type": "deleted",
                "content": ""
            }
        ]
        msg = body.commit_message or "refactor(database): remove deprecated queries.sql"
        
    event = process_repo_push(
        db=db,
        repo_id=repo.id,
        before_sha=before_sha,
        after_sha=after_sha,
        changed_files=changed_files,
        delivery_id=f"sim-deliv-{uuid.uuid4().hex[:8]}",
        message=msg
    )
    
    return {
        "success": True,
        "event_id": event.id,
        "before_sha": before_sha,
        "after_sha": after_sha,
        "message": msg,
        "affected_skills": event.affected_skill_keys,
        "from_version": event.from_version,
        "to_version": event.to_version
    }

@router.post("/reset")
def reset_to_initial_version(db: Session = Depends(get_db)):
    from ..data.seed import reset_database
    reset_database(db)
    return {
        "success": True,
        "message": "Database cleanly reset to initial state v1.0 with 6 job requirements and 3 identified gaps.",
        "version": 1
    }

