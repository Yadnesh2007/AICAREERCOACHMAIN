export type SkillStatus =
  | 'demonstrated'
  | 'partially_demonstrated'
  | 'not_demonstrated_in_reviewed_scope'
  | 'unable_to_assess';

export type AssessmentState = 'queued' | 'analyzing' | 'completed' | 'failed';
export type EventState = 'received' | 'queued' | 'analyzing' | 'updated' | 'failed' | 'ignored';
export type Freshness = 'current' | 'processing' | 'stale' | 'unknown';
export type EvidenceStrength = 'implementation' | 'application' | 'test' | 'documentation';
export type Confidence = 'high' | 'medium' | 'low' | 'not_applicable';

export interface JobRequirement {
  id: string;
  skill_key: string;
  original_text: string;
  source_url: string;
  importance: 'required' | 'preferred' | 'unspecified';
  confirmed: boolean;
}

export interface Job {
  id: string;
  title: string;
  employer: string | null;
  source_url: string;
  fetched_at: string;
  retrieval_status: 'verified' | 'stale' | 'unavailable';
  requirements: JobRequirement[];
}

export interface Repository {
  id: string;
  github_repo_id: number;
  full_name: string;
  default_branch: string;
  selected_branch: string;
  latest_scanned_sha: string | null;
  installation_id: number;
  is_selected: boolean;
}

export interface Evidence {
  id: string;
  skill_key: string;
  repository_id: string;
  repo_full_name: string;
  commit_sha: string;
  blob_sha: string | null;
  file_path: string;
  start_line: number;
  end_line: number;
  permalink: string;
  snippet: string | null;
  evidence_strength: EvidenceStrength;
  observed_behavior: string;
  limitations: string[];
  analyzer_rule_id: string;
}

export interface SkillVerdict {
  requirement_id: string;
  skill_key: string;
  status: SkillStatus;
  exact_claim: string;
  rationale: string;
  limitations: string[];
  confidence: Confidence;
  evidence_ids: string[];
  reviewed_scope: string;
}

export interface Assessment {
  id: string;
  version: number;
  job_id: string;
  repository_ids: string[];
  state: AssessmentState;
  freshness: Freshness;
  evaluated_at: string | null;
  current_sha_by_repo: Record<string, string>;
  reviewed_scope: {
    repos: string[];
    branches: string[];
    excluded_paths: string[];
    unsupported_paths: string[];
    incomplete: boolean;
  };
  verdicts: SkillVerdict[];
  evidence: Evidence[];
  coverage: {
    demonstrated: number;
    total_assessable: number;
    formula: string;
  } | null;
  limitations: string[];
  error_code: string | null;
}

export interface ChangeEvent {
  id: string;
  delivery_id: string | null;
  repository_id: string;
  ref: string;
  before_sha: string | null;
  after_sha: string;
  changed_files: { path: string; change_type: 'added' | 'modified' | 'deleted' | 'renamed' }[];
  affected_skill_keys: string[];
  state: EventState;
  assessment_id: string | null;
  from_version: number | null;
  to_version: number | null;
  received_at: string;
  processed_at: string | null;
  message: string | null;
}

export interface AssessmentHistoryEntry {
  assessment_id: string;
  version: number;
  evaluated_at: string;
  trigger_event_id: string | null;
  head_shas: Record<string, string>;
  verdict_changes: {
    skill_key: string;
    before: SkillStatus;
    after: SkillStatus;
    reason: string;
    added_evidence_ids: string[];
    removed_evidence_ids: string[];
  }[];
}

export interface GapTask {
  id: string;
  assessment_id: string;
  requirement_id: string;
  target_repository_id: string;
  title: string;
  why_this_matters: string;
  suggested_files: string[];
  steps: string[];
  expected_evidence: string[];
  validation_checklist: string[];
  status: 'suggested' | 'in_progress' | 'evidence_observed';
}
