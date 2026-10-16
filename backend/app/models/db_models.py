import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from ..core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")

class GitHubInstallation(Base):
    __tablename__ = "github_installations"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    account_login = Column(String, nullable=False)
    repository_selection = Column(String, default="selected")
    created_at = Column(DateTime, default=datetime.utcnow)

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    github_repo_id = Column(Integer, index=True, nullable=False)
    full_name = Column(String, index=True, nullable=False)
    default_branch = Column(String, default="main")
    selected_branch = Column(String, default="main")
    latest_scanned_sha = Column(String, nullable=True)
    installation_id = Column(Integer, nullable=False, default=1)
    is_selected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="repositories")
    snapshots = relationship("RepoSnapshot", back_populates="repository", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    employer = Column(String, nullable=True)
    source_url = Column(String, nullable=False)
    fetched_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    retrieval_status = Column(String, default="verified")  # 'verified'|'stale'|'unavailable'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="jobs")
    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")

class JobRequirement(Base):
    __tablename__ = "job_requirements"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    skill_key = Column(String, index=True, nullable=False)
    original_text = Column(Text, nullable=False)
    source_url = Column(String, nullable=False)
    importance = Column(String, default="required")  # 'required'|'preferred'|'unspecified'
    confirmed = Column(Boolean, default=True)
    
    job = relationship("Job", back_populates="requirements")

class RepoSnapshot(Base):
    __tablename__ = "repo_snapshots"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    commit_sha = Column(String, index=True, nullable=False)
    analyzer_version = Column(String, default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repository = relationship("Repository", back_populates="snapshots")
    evidences = relationship("Evidence", back_populates="snapshot", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    snapshot_id = Column(String, ForeignKey("repo_snapshots.id"), nullable=True)
    skill_key = Column(String, index=True, nullable=False)
    repository_id = Column(String, nullable=False)
    repo_full_name = Column(String, nullable=False)
    commit_sha = Column(String, nullable=False)
    blob_sha = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    permalink = Column(String, nullable=False)
    snippet = Column(Text, nullable=True)
    evidence_strength = Column(String, default="implementation")  # 'implementation'|'application'|'test'|'documentation'
    observed_behavior = Column(Text, nullable=False)
    limitations = Column(JSON, default=list)
    analyzer_rule_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    snapshot = relationship("RepoSnapshot", back_populates="evidences")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    repository_ids = Column(JSON, default=list)
    state = Column(String, default="completed")  # 'queued'|'analyzing'|'completed'|'failed'
    freshness = Column(String, default="current")  # 'current'|'processing'|'stale'|'unknown'
    evaluated_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    current_sha_by_repo = Column(JSON, default=dict)
    reviewed_scope = Column(JSON, default=dict)
    coverage = Column(JSON, nullable=True)
    limitations = Column(JSON, default=list)
    error_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="assessments")
    verdicts = relationship("RequirementVerdict", back_populates="assessment", cascade="all, delete-orphan")

class RequirementVerdict(Base):
    __tablename__ = "requirement_verdicts"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=False)
    requirement_id = Column(String, nullable=False)
    skill_key = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'demonstrated'|'partially_demonstrated'|'not_demonstrated_in_reviewed_scope'|'unable_to_assess'
    exact_claim = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    limitations = Column(JSON, default=list)
    confidence = Column(String, default="high")  # 'high'|'medium'|'low'|'not_applicable'
    evidence_ids = Column(JSON, default=list)
    reviewed_scope = Column(String, nullable=False)
    
    assessment = relationship("Assessment", back_populates="verdicts")

class ChangeEvent(Base):
    __tablename__ = "change_events"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    delivery_id = Column(String, unique=True, index=True, nullable=True)
    repository_id = Column(String, nullable=False)
    ref = Column(String, default="refs/heads/main")
    before_sha = Column(String, nullable=True)
    after_sha = Column(String, nullable=False)
    changed_files = Column(JSON, default=list)
    affected_skill_keys = Column(JSON, default=list)
    state = Column(String, default="updated")  # 'received'|'queued'|'analyzing'|'updated'|'failed'|'ignored'
    assessment_id = Column(String, nullable=True)
    from_version = Column(Integer, nullable=True)
    to_version = Column(Integer, nullable=True)
    received_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    processed_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    message = Column(Text, nullable=True)

class AssessmentHistoryEntryModel(Base):
    __tablename__ = "assessment_history"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, index=True, nullable=False)
    version = Column(Integer, nullable=False)
    evaluated_at = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")
    trigger_event_id = Column(String, nullable=True)
    head_shas = Column(JSON, default=dict)
    verdict_changes = Column(JSON, default=list)

class GapTask(Base):
    __tablename__ = "gap_tasks"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, index=True, nullable=False)
    requirement_id = Column(String, nullable=False)
    target_repository_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    why_this_matters = Column(Text, nullable=False)
    suggested_files = Column(JSON, default=list)
    steps = Column(JSON, default=list)
    expected_evidence = Column(JSON, default=list)
    validation_checklist = Column(JSON, default=list)
    status = Column(String, default="suggested")  # 'suggested'|'in_progress'|'evidence_observed'

class CodeDefenseSession(Base):
    __tablename__ = "code_defense_sessions"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, nullable=False)
    evidence_id = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    context_code = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    critique_points = Column(JSON, default=list)
    status = Column(String, default="open")  # 'open'|'answered'
    created_at = Column(DateTime, default=datetime.utcnow)
