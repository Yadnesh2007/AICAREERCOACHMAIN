import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.database import get_db
from ..models.db_models import (
    Assessment, RequirementVerdict, Evidence, Repository, Job, JobRequirement, AssessmentHistoryEntryModel
)
from ..models.schemas import (
    AssessmentDto, SkillVerdictDto, EvidenceDto, ReviewedScopeDto, CoverageDto,
    CreateAssessmentRequest, AssessmentHistoryEntryDto, VerdictChangeDto
)
from ..analyzers.engine import EvidenceEngine

router = APIRouter(prefix="/api/assessments", tags=["Assessments & Verdicts"])
engine_instance = EvidenceEngine()

@router.post("", status_code=202)
def create_assessment(body: CreateAssessmentRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == body.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    assessment_id = str(uuid.uuid4())
    repos = db.query(Repository).filter(Repository.id.in_(body.repository_ids)).all()
    repo_names = [r.full_name for r in repos]
    shas = {r.id: r.latest_scanned_sha or "a1b2c3d4e5f6" for r in repos}
    
    # Create assessment
    assessment = Assessment(
        id=assessment_id,
        user_id="usr_dev_yadnesh_01",
        version=1,
        job_id=body.job_id,
        repository_ids=body.repository_ids,
        state="completed",
        freshness="current",
        evaluated_at=datetime.utcnow().isoformat() + "Z",
        current_sha_by_repo=shas,
        reviewed_scope={
            "repos": repo_names,
            "branches": [r.selected_branch for r in repos],
            "excluded_paths": [".env*", "*.lock", "vendor/", "node_modules/"],
            "unsupported_paths": [],
            "incomplete": False
        },
        limitations=[
            "Verifiable static analysis strictly bounds claims to inspected files.",
            "Absence of evidence does NOT declare absence of student ability."
        ]
    )
    db.add(assessment)
    
    # Calculate verdicts based on current evidences
    all_evs = db.query(Evidence).filter(Evidence.repository_id.in_(body.repository_ids)).all()
    ev_dicts = [
        {
            "id": e.id,
            "skill_key": e.skill_key,
            "file_path": e.file_path,
            "start_line": e.start_line,
            "end_line": e.end_line,
            "permalink": e.permalink,
            "snippet": e.snippet,
            "observed_behavior": e.observed_behavior,
            "evidence_strength": e.evidence_strength,
            "limitations": e.limitations or [],
            "analyzer_rule_id": e.analyzer_rule_id
        }
        for e in all_evs
    ]
    
    req_dicts = [{"id": r.id, "skill_key": r.skill_key} for r in job.requirements]
    primary_sha = list(shas.values())[0] if shas else "a1b2c3d"
    
    verdicts = engine_instance.calculate_verdicts(
        requirements=req_dicts,
        evidences=ev_dicts,
        repo_names=repo_names,
        commit_sha=primary_sha
    )
    
    for v in verdicts:
        rv = RequirementVerdict(
            id=str(uuid.uuid4()),
            assessment_id=assessment_id,
            requirement_id=v["requirement_id"],
            skill_key=v["skill_key"],
            status=v["status"],
            exact_claim=v["exact_claim"],
            rationale=v["rationale"],
            limitations=v["limitations"],
            confidence=v["confidence"],
            evidence_ids=v["evidence_ids"],
            reviewed_scope=v["reviewed_scope"]
        )
        db.add(rv)
        
    demonstrated_count = sum(1 for v in verdicts if v["status"] == "demonstrated")
    assessment.coverage = {
        "demonstrated": demonstrated_count,
        "total_assessable": len(verdicts),
        "formula": f"{demonstrated_count}/{len(verdicts)} requirements demonstrated by verified code evidence"
    }
    
    # Initial history entry
    hist = AssessmentHistoryEntryModel(
        id=str(uuid.uuid4()),
        assessment_id=assessment_id,
        version=1,
        evaluated_at=datetime.utcnow().isoformat() + "Z",
        trigger_event_id=None,
        head_shas=shas,
        verdict_changes=[]
    )
    db.add(hist)
    
    db.commit()
    return {"assessment_id": assessment_id, "state": "queued"}

@router.get("/{assessment_id}", response_model=AssessmentDto)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    # Get all evidence for the repositories in this assessment
    evidences = db.query(Evidence).filter(Evidence.repository_id.in_(a.repository_ids or [])).all()
    
    verdicts = db.query(RequirementVerdict).filter(RequirementVerdict.assessment_id == assessment_id).all()
    
    scope_data = a.reviewed_scope or {}
    
    return AssessmentDto(
        id=a.id,
        version=a.version,
        job_id=a.job_id,
        repository_ids=a.repository_ids or [],
        state=a.state,
        freshness=a.freshness,
        evaluated_at=a.evaluated_at,
        current_sha_by_repo=a.current_sha_by_repo or {},
        reviewed_scope=ReviewedScopeDto(
            repos=scope_data.get("repos", []),
            branches=scope_data.get("branches", []),
            excluded_paths=scope_data.get("excluded_paths", []),
            unsupported_paths=scope_data.get("unsupported_paths", []),
            incomplete=scope_data.get("incomplete", False)
        ),
        verdicts=[
            SkillVerdictDto(
                requirement_id=v.requirement_id,
                skill_key=v.skill_key,
                status=v.status,
                exact_claim=v.exact_claim,
                rationale=v.rationale,
                limitations=v.limitations or [],
                confidence=v.confidence,
                evidence_ids=v.evidence_ids or [],
                reviewed_scope=v.reviewed_scope
            )
            for v in verdicts
        ],
        evidence=[
            EvidenceDto(
                id=e.id,
                skill_key=e.skill_key,
                repository_id=e.repository_id,
                repo_full_name=e.repo_full_name,
                commit_sha=e.commit_sha,
                blob_sha=e.blob_sha,
                file_path=e.file_path,
                start_line=e.start_line,
                end_line=e.end_line,
                permalink=e.permalink,
                snippet=e.snippet,
                evidence_strength=e.evidence_strength,
                observed_behavior=e.observed_behavior,
                limitations=e.limitations or [],
                analyzer_rule_id=e.analyzer_rule_id
            )
            for e in evidences
        ],
        coverage=CoverageDto(**a.coverage) if a.coverage else None,
        limitations=a.limitations or [],
        error_code=a.error_code
    )

@router.get("/{assessment_id}/history")
def get_assessment_history(assessment_id: str, db: Session = Depends(get_db)):
    entries = db.query(AssessmentHistoryEntryModel).filter(
        AssessmentHistoryEntryModel.assessment_id == assessment_id
    ).order_by(AssessmentHistoryEntryModel.version.desc()).all()
    
    return {
        "versions": [
            AssessmentHistoryEntryDto(
                assessment_id=e.assessment_id,
                version=e.version,
                evaluated_at=e.evaluated_at,
                trigger_event_id=e.trigger_event_id,
                head_shas=e.head_shas or {},
                verdict_changes=[
                    VerdictChangeDto(**vc) for vc in (e.verdict_changes or [])
                ]
            )
            for e in entries
        ]
    }
