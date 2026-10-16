# CAREERPROOF — SHARED FRONTEND/BACKEND CONTRACT (FREEZE FIRST)

Status: **proposed implementation contract**, not an existing deployed API. Both agents must read this file BEFORE writing application code. If a change is necessary, update this file and the OpenAPI contract in a deliberate, versioned change; never silently invent a field or endpoint. The frontend and backend must be buildable in separate GitHub repositories and later connected by environment variables.

## 1. Architecture and ownership

- Frontend repository: `careerproof-frontend` — Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui + Lucide + Recharts; owns routes, UI, forms, API client, and *clearly labeled* demo fixtures for disconnected development. It MUST NOT implement a separate skill-analysis engine, fabricate citations, persist backend truth to local browser storage, call GitHub with secret tokens, or claim simulated events are live.
- Backend repository: `careerproof-backend` — Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy/Alembic + PostgreSQL/Supabase + GitHub App + verified GitHub push webhook + durable worker + deterministic code analyzers + bounded LLM explainer. Owns persistence, auth validation, job/repo retrieval, skills, evidence, citations, events, revisions, auditing, and AI safety decisions.
- Shared contract: this file and backend-generated `/openapi.json`; frontend must use generated or hand-maintained typed client identical to schema, backed by contract tests.
- CORS allowlist is configured with `FRONTEND_ORIGIN`. Frontend connects using `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`), without server secrets in browser bundles.
- Authentication: Supabase Auth for the student; browser sends `Authorization: Bearer <Supabase access JWT>` to authenticated backend endpoints. Backend independently validates token signature, issuer, audience and expiry, resolves user, and enforces ownership. Webhook is authenticated by GitHub signature, NOT a student JWT. Use a short-lived signed association state for GitHub App installation flow.
- All user-facing dates are UTC ISO-8601 with `Z`. IDs are UUID strings except GitHub numeric identifiers. No claimed hiring probabilities.

## 2. Canonical enums (DO NOT RENAME)

`skill_status`: `demonstrated` | `partially_demonstrated` | `not_demonstrated_in_reviewed_scope` | `unable_to_assess`

`assessment_state`: `queued` | `analyzing` | `completed` | `failed`

`event_state`: `received` | `queued` | `analyzing` | `updated` | `failed` | `ignored`

`freshness`: `current` | `processing` | `stale` | `unknown`

`evidence_strength`: `implementation` | `application` | `test` | `documentation`

`feature_stage`: `P0_CORE` | `P1_HIGH_VALUE` | `P2_OPTIONAL` | `P3_FUTURE`

UI labels MUST map `not_demonstrated_in_reviewed_scope` to **Not demonstrated in reviewed scope** (never "student lacks skill"), and `unable_to_assess` to **Unable to assess**. High confidence means evidence is clear for a NARROW claim, not overall expertise.

## 3. Shared DTOs (representative, exact field names)

```typescript
export type SkillStatus = 'demonstrated' | 'partially_demonstrated' |
  'not_demonstrated_in_reviewed_scope' | 'unable_to_assess';
export type AssessmentState = 'queued' | 'analyzing' | 'completed' | 'failed';
export type EventState = 'received' | 'queued' | 'analyzing' | 'updated' | 'failed' | 'ignored';
export type Freshness = 'current' | 'processing' | 'stale' | 'unknown';

export interface JobRequirement {
  id: string;
  skill_key: string;             // normalized: python, sql_query_writing, rest_api
  original_text: string;         // excerpt from real job listing
  source_url: string;
  importance: 'required' | 'preferred' | 'unspecified';
  confirmed: boolean;
}
export interface Job {
  id: string; title: string; employer: string | null;
  source_url: string; fetched_at: string; retrieval_status: 'verified'|'stale'|'unavailable';
  requirements: JobRequirement[];
}
export interface Repository {
  id: string; github_repo_id: number; full_name: string;
  default_branch: string; selected_branch: string; latest_scanned_sha: string | null;
  installation_id: number; is_selected: boolean;
}
export interface Evidence {
  id: string; skill_key: string; repository_id: string;
  repo_full_name: string; commit_sha: string; blob_sha: string | null;
  file_path: string; start_line: number; end_line: number;
  permalink: string; // immutable GitHub /blob/<full SHA>/path#Lx-Ly
  snippet: string | null; evidence_strength: 'implementation'|'application'|'test'|'documentation';
  observed_behavior: string; limitations: string[]; analyzer_rule_id: string;
}
export interface SkillVerdict {
  requirement_id: string; skill_key: string; status: SkillStatus;
  exact_claim: string; rationale: string; limitations: string[];
  confidence: 'high'|'medium'|'low'|'not_applicable';
  evidence_ids: string[]; reviewed_scope: string;
}
export interface Assessment {
  id: string; version: number; job_id: string; repository_ids: string[];
  state: AssessmentState; freshness: Freshness;
  evaluated_at: string | null; current_sha_by_repo: Record<string,string>;
  reviewed_scope: { repos: string[]; branches: string[]; excluded_paths: string[];
                    unsupported_paths: string[]; incomplete: boolean };
  verdicts: SkillVerdict[]; evidence: Evidence[];
  coverage: { demonstrated: number; total_assessable: number; formula: string } | null;
  limitations: string[]; error_code: string | null;
}
export interface ChangeEvent {
  id: string; delivery_id: string | null; repository_id: string;
  ref: string; before_sha: string | null; after_sha: string;
  changed_files: { path: string; change_type: 'added'|'modified'|'deleted'|'renamed' }[];
  affected_skill_keys: string[]; state: EventState;
  assessment_id: string | null; from_version: number | null; to_version: number | null;
  received_at: string; processed_at: string | null; message: string | null;
}
export interface AssessmentHistoryEntry {
  assessment_id: string; version: number; evaluated_at: string; trigger_event_id: string | null;
  head_shas: Record<string,string>;
  verdict_changes: { skill_key: string; before: SkillStatus; after: SkillStatus;
                     reason: string; added_evidence_ids: string[]; removed_evidence_ids: string[] }[];
}
export interface GapTask {
  id: string; assessment_id: string; requirement_id: string; target_repository_id: string;
  title: string; why_this_matters: string; suggested_files: string[];
  steps: string[]; expected_evidence: string[]; validation_checklist: string[];
  status: 'suggested'|'in_progress'|'evidence_observed';
}
export interface ApiError { error: { code: string; message: string; details?: unknown }; }
```

`snippet` must be bounded, consent-aware, sanitized and may be omitted for sensitive repositories. `confidence` must never be described as probability of hiring or proof of authorship.

## 4. Canonical P0 endpoints

All paths relative to `NEXT_PUBLIC_API_BASE_URL`. Unless explicitly marked public, require bearer JWT.

| Method | Exact route | Request | Expected response |
|---|---|---|---|
| `GET` | `/health` | — | `{status:"ok",version:"..."}` public |
| `GET` | `/api/me` | — | `{id,email,display_name}` |
| `GET` | `/api/github/install/start` | — | `{install_url}`; server-signed user association state |
| `GET` | `/api/github/installations` | — | `{installations:[{id,account_login,repository_selection}]}` |
| `GET` | `/api/github/repos` | — | `{repositories: Repository[]}`; only installed/authorized repos |
| `PATCH` | `/api/github/repos/{repo_id}` | `{is_selected:boolean,selected_branch:string}` | `Repository` |
| `POST` | `/api/jobs/import` | `{url:string}` | `201 Job`, or error if cannot genuinely verify; no fake posting |
| `GET` | `/api/jobs` | — | `{jobs:Job[]}` |
| `GET` | `/api/jobs/{job_id}` | — | `Job` |
| `PATCH` | `/api/jobs/{job_id}/requirements` | `{requirements:[{id,confirmed,skill_key,importance}]}` | `Job`; preserve original extracted text |
| `POST` | `/api/assessments` | `{job_id:string,repository_ids:string[]}` | `202 {assessment_id,state:"queued"}` |
| `GET` | `/api/assessments/{assessment_id}` | — | `Assessment` |
| `GET` | `/api/assessments/{assessment_id}/history` | — | `{versions:AssessmentHistoryEntry[]}` |
| `GET` | `/api/events` | `?assessment_id=...` | `{events:ChangeEvent[]}` |
| `GET` | `/api/events/{event_id}` | — | `ChangeEvent` |
| `POST` | `/api/webhooks/github` | Signed raw GitHub JSON | `202 {accepted:true}` or invalid signature 401. PUBLIC route; authenticated only via HMAC. |

Frontend automatically polls `GET /api/assessments/{id}` and `GET /api/events?assessment_id=...` every 3–5 seconds *while activity is pending*; uses backoff in background tabs. WebSockets/SSE are optional optimization, not required for correctness. There is NO user-controlled endpoint that simply sets an assessment status or forges a GitHub event.

## 5. P1 / P2 / P3 extension endpoints (implement only after P0 passes)

| Stage | Method | Exact route | Meaning |
|---|---|---|---|
| P1 | `GET` | `/api/assessments/{id}/passport` | Exportable source-cited skills/evidence data; may serve JSON first |
| P1 | `GET` | `/api/assessments/{id}/impact` | Before/after affected skills and commit-impact visualization |
| P1 | `POST` | `/api/assessments/{id}/gap-tasks` | Generate grounded task suggestions; require repo/requirement permission |
| P1 | `GET` | `/api/assessments/{id}/gap-tasks` | `{tasks:GapTask[]}` |
| P2 | `POST` | `/api/code-defense/sessions` | `{assessment_id,evidence_id}` => question session tied to real evidence |
| P2 | `POST` | `/api/code-defense/sessions/{id}/answers` | `{question_id,answer}` => feedback (separate understanding signal) |
| P2 | `GET` | `/api/assessments/{id}/skill-map` | `{nodes:[...],edges:[...]}` grounded in selected job requirements |
| P2 | `GET` | `/api/jobs/{id}/versions` | Job listing versions and retrieval status |
| P2 | `POST` | `/api/jobs/{id}/recheck` | Queue compliant refresh, not fabricated text |
| P3 | `POST` | `/api/assessments/{id}/resume-suggestions` | Suggestions only from validated evidence |

## 6. Reference error codes / wire rules

- Return consistent `ApiError` with `401 AUTH_REQUIRED`, `403 REPOSITORY_FORBIDDEN`, `404 NOT_FOUND`, `409 STALE_VERSION`, `413 SCAN_LIMIT`, `422 INPUT_INVALID`, `429 RATE_LIMITED`, `502 JOB_SOURCE_UNAVAILABLE`, `503 GITHUB_UNAVAILABLE`, `503 LLM_UNAVAILABLE` when appropriate; FastAPI validation may use 422 with equivalent envelope.
- A failed or partial scan preserves the previous validated snapshot and marks freshness stale; it cannot silently declare absence.
- Evidence permalinks are constructed server-side from verified owner/repo, exact SHA, canonical path and confirmed line range; frontend never constructs them or trusts fabricated output.
- Original job listing URL, observed date and requirement excerpt are required for every job requirement.
- No client-side SDK directly writes assessment truth or events into Supabase tables.
- `GET` records always reflect the database state. Fixture responses can exist only inside frontend dev-only mock adapter, never be passed off as live.
- Contract tests verify exact spelling of fields and enums; add mock handlers mirroring this schema.

## 7. Integration sequence and handoff

1. Both repos receive identical copy of this document (`docs/SHARED_API_CONTRACT.md`). Backend establishes Pydantic models and OpenAPI; frontend establishes TypeScript DTOs/API client/mock transport.
2. Frontend develops with `NEXT_PUBLIC_DATA_MODE=mock`, clearly displays "Demo data — not connected", and uses representative data following this contract; backend develops against real APIs and a standalone Swagger UI.
3. Backend shares deployed `API_BASE_URL`, generated OpenAPI JSON, test-user authentication arrangement, CORS allowlist, GitHub App setup guide, and a safe demo repository.
4. Frontend switches `NEXT_PUBLIC_DATA_MODE=live` and `NEXT_PUBLIC_API_BASE_URL=<backend origin>`; use real Supabase Auth JWT and typed client. No API shape refactor should be necessary.
5. Integration acceptance: import real job -> select real repo -> P0 assessment -> push real SQL code -> auto receive and process -> updated status and immutable GitHub line citation -> event history. Verify duplicate webhook, deleted SQL evidence, error state.

## 8. Source basis

From user's five attachments: `AI_Career_Coach_Existing_Solutions_Research`, `AI_Career_Coach_Flaws_and_Solutions`, `AI_Career_Coach_PRD`, `AI_Career_Coach_System_Architecture`, `CareerProof_AI_Career_Coach_Innovations`. Extra exact API names/DTO detail in this file are **new proposed integration decisions**, not claimed as verbatim source requirements.
