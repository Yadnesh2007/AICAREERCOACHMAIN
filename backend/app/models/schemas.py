from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

SkillStatus = Literal[
    'demonstrated',
    'partially_demonstrated',
    'not_demonstrated_in_reviewed_scope',
    'unable_to_assess'
]

AssessmentState = Literal['queued', 'analyzing', 'completed', 'failed']
EventState = Literal['received', 'queued', 'analyzing', 'updated', 'failed', 'ignored']
Freshness = Literal['current', 'processing', 'stale', 'unknown']
EvidenceStrength = Literal['implementation', 'application', 'test', 'documentation']
Confidence = Literal['high', 'medium', 'low', 'not_applicable']

class JobRequirementDto(BaseModel):
    id: str
    skill_key: str
    original_text: str
    source_url: str
    importance: Literal['required', 'preferred', 'unspecified'] = 'required'
    confirmed: bool = True

class JobDto(BaseModel):
    id: str
    title: str
    employer: Optional[str] = None
    source_url: str
    fetched_at: str
    retrieval_status: Literal['verified', 'stale', 'unavailable'] = 'verified'
    requirements: List[JobRequirementDto] = []

class RepositoryDto(BaseModel):
    id: str
    github_repo_id: int
    full_name: str
    default_branch: str = "main"
    selected_branch: str = "main"
    latest_scanned_sha: Optional[str] = None
    installation_id: int = 1
    is_selected: bool = True

class EvidenceDto(BaseModel):
    id: str
    skill_key: str
    repository_id: str
    repo_full_name: str
    commit_sha: str
    blob_sha: Optional[str] = None
    file_path: str
    start_line: int
    end_line: int
    permalink: str
    snippet: Optional[str] = None
    evidence_strength: EvidenceStrength = 'implementation'
    observed_behavior: str
    limitations: List[str] = []
    analyzer_rule_id: str

class SkillVerdictDto(BaseModel):
    requirement_id: str
    skill_key: str
    status: SkillStatus
    exact_claim: str
    rationale: str
    limitations: List[str] = []
    confidence: Confidence = 'high'
    evidence_ids: List[str] = []
    reviewed_scope: str

class ReviewedScopeDto(BaseModel):
    repos: List[str] = []
    branches: List[str] = []
    excluded_paths: List[str] = []
    unsupported_paths: List[str] = []
    incomplete: bool = False

class CoverageDto(BaseModel):
    demonstrated: int
    total_assessable: int
    formula: str

class AssessmentDto(BaseModel):
    id: str
    version: int = 1
    job_id: str
    repository_ids: List[str] = []
    state: AssessmentState = 'completed'
    freshness: Freshness = 'current'
    evaluated_at: Optional[str] = None
    current_sha_by_repo: Dict[str, str] = {}
    reviewed_scope: ReviewedScopeDto
    verdicts: List[SkillVerdictDto] = []
    evidence: List[EvidenceDto] = []
    coverage: Optional[CoverageDto] = None
    limitations: List[str] = []
    error_code: Optional[str] = None

class ChangedFileDto(BaseModel):
    path: str
    change_type: Literal['added', 'modified', 'deleted', 'renamed']

class ChangeEventDto(BaseModel):
    id: str
    delivery_id: Optional[str] = None
    repository_id: str
    ref: str
    before_sha: Optional[str] = None
    after_sha: str
    changed_files: List[ChangedFileDto] = []
    affected_skill_keys: List[str] = []
    state: EventState = 'updated'
    assessment_id: Optional[str] = None
    from_version: Optional[int] = None
    to_version: Optional[int] = None
    received_at: str
    processed_at: Optional[str] = None
    message: Optional[str] = None

class VerdictChangeDto(BaseModel):
    skill_key: str
    before: SkillStatus
    after: SkillStatus
    reason: str
    added_evidence_ids: List[str] = []
    removed_evidence_ids: List[str] = []

class AssessmentHistoryEntryDto(BaseModel):
    assessment_id: str
    version: int
    evaluated_at: str
    trigger_event_id: Optional[str] = None
    head_shas: Dict[str, str] = {}
    verdict_changes: List[VerdictChangeDto] = []

class GapTaskDto(BaseModel):
    id: str
    assessment_id: str
    requirement_id: str
    target_repository_id: str
    title: str
    why_this_matters: str
    suggested_files: List[str] = []
    steps: List[str] = []
    expected_evidence: List[str] = []
    validation_checklist: List[str] = []
    status: Literal['suggested', 'in_progress', 'evidence_observed'] = 'suggested'

# Request bodies
class JobImportRequest(BaseModel):
    url: str

class UpdateRequirementsRequest(BaseModel):
    requirements: List[Dict[str, Any]]

class PatchRepoRequest(BaseModel):
    is_selected: Optional[bool] = None
    selected_branch: Optional[str] = None

class CreateAssessmentRequest(BaseModel):
    job_id: str
    repository_ids: List[str]

class CodeDefenseAnswerRequest(BaseModel):
    question_id: str
    answer: str

class SimulatePushRequest(BaseModel):
    repository_id: str
    branch: Optional[str] = "main"
    action: Literal['add_sql', 'delete_sql'] = 'add_sql'
    commit_message: Optional[str] = None
