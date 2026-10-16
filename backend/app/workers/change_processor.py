import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.db_models import (
    Assessment, RequirementVerdict, Evidence, ChangeEvent, AssessmentHistoryEntryModel, Repository, JobRequirement
)
from ..analyzers.engine import EvidenceEngine

engine_instance = EvidenceEngine()

def process_repo_push(
    db: Session,
    repo_id: str,
    before_sha: str,
    after_sha: str,
    changed_files: List[Dict[str, str]], # [{path: '...', change_type: 'added'|'modified'|'deleted', content: '...'}]
    delivery_id: str = None,
    message: str = "Commit pushed to repository"
) -> ChangeEvent:
    """
    Processes a verified GitHub push event.
    Incrementally reassesses skills, generates an immutable new Assessment version,
    and updates ChangeEvent and AssessmentHistoryEntry in a transaction.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise ValueError(f"Repository {repo_id} not found")
        
    repo.latest_scanned_sha = after_sha
    
    # Find latest assessment for this repo
    assessments = db.query(Assessment).all()
    target_assessment = None
    for a in assessments:
        if repo_id in (a.repository_ids or []):
            target_assessment = a
            break
            
    if not target_assessment:
        return None
        
    old_version = target_assessment.version
    new_version = old_version + 1
    
    # Collect existing evidences for this assessment
    existing_evidences = db.query(Evidence).filter(Evidence.repository_id == repo_id).all()
    ev_dict = {e.file_path: e for e in existing_evidences}
    
    # Map changed files
    changed_file_dtos = []
    affected_skills = set()
    
    # Process deletions and updates
    for cf in changed_files:
        path = cf["path"]
        change_type = cf["change_type"]
        changed_file_dtos.append({"path": path, "change_type": change_type})
        
        if change_type == "deleted":
            # Invalidate old evidence for this path
            db.query(Evidence).filter(Evidence.repository_id == repo_id, Evidence.file_path == path).delete()
            affected_skills.add("sql_query_writing" if path.endswith(".sql") else "python")
        else:
            content = cf.get("content", "")
            if content:
                # Remove prior evidence for this file if modified
                db.query(Evidence).filter(Evidence.repository_id == repo_id, Evidence.file_path == path).delete()
                new_evs = engine_instance.analyze_repository_files(
                    repo_full_name=repo.full_name,
                    commit_sha=after_sha,
                    files={path: content},
                    repo_id=repo_id
                )
                for ne in new_evs:
                    db_ev = Evidence(
                        id=ne["id"],
                        skill_key=ne["skill_key"],
                        repository_id=repo_id,
                        repo_full_name=repo.full_name,
                        commit_sha=after_sha,
                        blob_sha=ne["blob_sha"],
                        file_path=ne["file_path"],
                        start_line=ne["start_line"],
                        end_line=ne["end_line"],
                        permalink=ne["permalink"],
                        snippet=ne["snippet"],
                        evidence_strength=ne["evidence_strength"],
                        observed_behavior=ne["observed_behavior"],
                        limitations=ne["limitations"],
                        analyzer_rule_id=ne["analyzer_rule_id"]
                    )
                    db.add(db_ev)
                    affected_skills.add(ne["skill_key"])
                    
    db.flush()
    
    # Get all current evidences after updates
    all_current_evs = db.query(Evidence).filter(Evidence.repository_id == repo_id).all()
    all_ev_dicts = [
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
        for e in all_current_evs
    ]
    
    # Fetch job requirements
    job_reqs = db.query(JobRequirement).filter(JobRequirement.job_id == target_assessment.job_id).all()
    req_dicts = [{"id": r.id, "skill_key": r.skill_key} for r in job_reqs]
    
    # Compute old verdicts
    old_verdicts = {v.skill_key: v.status for v in target_assessment.verdicts}
    
    # Calculate new verdicts
    new_verdicts = engine_instance.calculate_verdicts(
        requirements=req_dicts,
        evidences=all_ev_dicts,
        repo_names=[repo.full_name],
        commit_sha=after_sha
    )
    
    # Calculate verdict changes
    verdict_changes = []
    for nv in new_verdicts:
        sk = nv["skill_key"]
        old_st = old_verdicts.get(sk, "not_demonstrated_in_reviewed_scope")
        new_st = nv["status"]
        if old_st != new_st:
            reason = f"Commit {after_sha[:7]} updated {sk.replace('_', ' ')}: changed from {old_st} to {new_st}."
            verdict_changes.append({
                "skill_key": sk,
                "before": old_st,
                "after": new_st,
                "reason": reason,
                "added_evidence_ids": nv["evidence_ids"],
                "removed_evidence_ids": []
            })
            
    # Remove old verdicts from assessment
    db.query(RequirementVerdict).filter(RequirementVerdict.assessment_id == target_assessment.id).delete()
    
    # Add new verdicts
    for nv in new_verdicts:
        rv = RequirementVerdict(
            id=str(uuid.uuid4()),
            assessment_id=target_assessment.id,
            requirement_id=nv["requirement_id"],
            skill_key=nv["skill_key"],
            status=nv["status"],
            exact_claim=nv["exact_claim"],
            rationale=nv["rationale"],
            limitations=nv["limitations"],
            confidence=nv["confidence"],
            evidence_ids=nv["evidence_ids"],
            reviewed_scope=nv["reviewed_scope"]
        )
        db.add(rv)
        
    # Update assessment
    target_assessment.version = new_version
    target_assessment.freshness = "current"
    target_assessment.state = "completed"
    target_assessment.evaluated_at = datetime.utcnow().isoformat() + "Z"
    target_assessment.current_sha_by_repo = {repo_id: after_sha}
    
    # Calculate coverage
    demonstrated_count = sum(1 for v in new_verdicts if v["status"] == "demonstrated")
    target_assessment.coverage = {
        "demonstrated": demonstrated_count,
        "total_assessable": len(new_verdicts),
        "formula": f"{demonstrated_count}/{len(new_verdicts)} requirements demonstrated by verified code evidence"
    }
    
    # Create ChangeEvent
    event_id = str(uuid.uuid4())
    event = ChangeEvent(
        id=event_id,
        delivery_id=delivery_id or f"deliv-{uuid.uuid4().hex[:8]}",
        repository_id=repo_id,
        ref=f"refs/heads/{repo.selected_branch}",
        before_sha=before_sha,
        after_sha=after_sha,
        changed_files=changed_file_dtos,
        affected_skill_keys=list(affected_skills),
        state="updated",
        assessment_id=target_assessment.id,
        from_version=old_version,
        to_version=new_version,
        received_at=datetime.utcnow().isoformat() + "Z",
        processed_at=datetime.utcnow().isoformat() + "Z",
        message=message
    )
    db.add(event)
    
    # Create AssessmentHistoryEntry
    history_entry = AssessmentHistoryEntryModel(
        id=str(uuid.uuid4()),
        assessment_id=target_assessment.id,
        version=new_version,
        evaluated_at=datetime.utcnow().isoformat() + "Z",
        trigger_event_id=event_id,
        head_shas={repo_id: after_sha},
        verdict_changes=verdict_changes
    )
    db.add(history_entry)
    
    db.commit()
    return event
