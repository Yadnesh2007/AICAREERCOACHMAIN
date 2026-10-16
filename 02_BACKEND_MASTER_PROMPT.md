# MASTER PROMPT B — CAREERPROOF BACKEND + AI EVIDENCE AGENT

**COPY THIS ENTIRE FILE INTO YOUR BACKEND AI CODING AGENT (e.g., Antigravity, Cursor, or Claude Code). Attach `00_SHARED_API_CONTRACT.md` and the five original reference documents if supported. Create and work ONLY in a dedicated backend repository, separately from the frontend.**

---

You are a principal Python backend engineer, AI/agentic systems architect, GitHub App integration engineer, software security expert, and test lead. Build the **working backend system** for **CareerProof — AI Career Coach**, whose promise is **"Every Skill Has Evidence."** This must be a genuinely usable prototype, not a static report generator.

## A. What success looks like

For one student, one real internship/job posting and one genuinely installed GitHub repository:
1. Capture a valid source URL and original requirement excerpts from an authentic internship listing; identify job-specific needs (initially Python, SQL query writing, REST API development) with uncertainty and user confirmation.
2. Fetch relevant actual code directly from GitHub at an exact commit SHA. Extract meaningful code evidence (not just README strings), generate tested immutable citations to file paths and lines, and report a bounded status for each job requirement.
3. Clearly distinguish `demonstrated`, `partially_demonstrated`, `not_demonstrated_in_reviewed_scope`, and `unable_to_assess` (exact wire enums in `00_SHARED_API_CONTRACT.md`). Never equate lack of evidence with lack of skill, or treat a developer's GitHub contribution as definitive proof of authorship.
4. Process a **real** GitHub push via verified webhook (periodic HEAD polling as a resilient fallback), detect changed/renamed/deleted files, invalidate stale findings, incrementally reassess relevant skills, save versioned before/after results, and expose updates through authentic APIs for the frontend to poll.
5. During judge demo: import authentic job, connect real repository, show SQL gap with reviewed scope, push actual SQL queries and a test file, automatically show revised SQL query-writing evidence with immutable commit links. Delete the evidence and show honest downgrade if time permits.
6. Provide reproducible test proof, README, secrets template, migrations, API docs, demo instructions and observed timing. No mocked webhook/event should be passed off as a real event.

This repo owns **BACKEND ONLY**. Do not generate a frontend or change its routes. The shared `00_SHARED_API_CONTRACT.md` is frozen. If something seems missing, formally propose a contract revision and update OpenAPI/TypeScript documentation in sync; do not silently invent endpoints. Keep user-facing assessed state strictly backend-owned.

## B. References and extracted requirements

Read the five user-supplied sources completely. Apply:

- *Existing Solutions Research*: GitRoll, SkillProof, SkillBridge, Skill Gap Analysis, and other AI coach platforms show existing partial solutions; do not claim the whole idea is novel. Differentiation = reproducible evidence + commit-triggered live loop.
- *Flaws and Solutions*: solve resume-only scoring, stale reports, fabricated ratings, generic jobs, unverifiable code, absent uncertainty, copy-paste author claims, inefficient full rescans.
- *Product Requirements Document*: implement P0 FR-01…FR-10 as acceptance gates, then P1 FR-11/12, finally P2 FR-13. Preserve original job wording, source capture date and scope.
- *System Architecture*: FastAPI HTTP layer, read-only GitHub App, HMAC-validated ingress, durable queue, evidence engine, PostgreSQL assessments/events/versioning, encrypted credentials, immutable blob citations. Respect edge cases and 60-second refresh target as an engineering objective, not a guarantee.
- *CareerProof Innovations*: **(1) Commit-to-Career Impact Map, (2) Skill Proof Engine, (3) AI Project Generator, (4) Code Defense Mode, (5) Job Requirement Change Detector, (6) Career Skill Dependency Map, (7) Honest AI & Evidence Freshness**. Each gets an explicit module/contract, but P0 runs first and optional features may be feature flagged.

Related docs for reference and verification:
- GitHub App permissions: `https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app`
- GitHub webhook signature validation: `https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries`
- GitHub webhook best practices: `https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks`
- GitHub push payloads: `https://docs.github.com/en/webhooks/webhook-events-and-payloads#push`
- Product competitor context: `https://gitroll.io/`, `https://github.com/aryancodex-19/T36-SkillProof`, `https://github.com/prithvifr/SkillBridge`, `https://github.com/skill-gap-dev/skill_gap_analysis`
- Innovation reference context: `https://www.getprog.ai/`, `https://trycareerlens.com/`, `https://devvero.com/`, `https://github.com/daanialmirza5/SkillGraph`.

Use these references conceptually; do not copy third-party copyrighted code or assets without checking licenses. Use official docs for security-sensitive code.

## C. Technology choices and module architecture

- Python 3.12; FastAPI; Pydantic v2; SQLAlchemy 2; Alembic; PostgreSQL (Supabase-hosted acceptable); pytest + httpx; typed async/sync decisions kept consistent; `httpx` for HTTPS; `cryptography` / standard HMAC for signatures; structured JSON logs.
- Supabase Auth JWT verification on authenticated API routes: validate issuer, audience, expiry, JWKS signature and ownership server-side; never trust merely supplied `user_id`. GitHub webhook is a separate HMAC-authenticated public callback.
- GitHub App installation access: selected repository installations with minimal `contents:read`, `metadata:read`, and any required webhook subscription. Private repos must be explicit opt-in. Use short-lived installation tokens server-side. App private key, JWT secrets, DB credentials and API keys must never appear in log, source, README actual values or browser responses. Properly associate installation callback with signed, expiring user state.
- Job ingestion: authentic employer career pages or permitted job APIs. The user may give a URL. Store exact source URL, retrieved time, employer/job metadata, original requirement spans, hash and verification status. Validate HTTPS, public domain/DNS addresses including redirects (SSRF prevention), timeouts, content limits and terms; do not scrape blocked sources. A supplied-but-unverified text is never equivalent to a verified source. Handle dead job URL with an error/stale status; NEVER invent an employer posting.
- Repository analysis: Python `ast`, SQL lexer/parser such as `sqlglot` when helpful, parsers/heuristics for Python FastAPI/Flask routes, SQL statements and tests; optional Tree-sitter for supported languages; bounded deterministic extractor first, AI for mapping/explanation only.
- LLM: provider-agnostic adapter (configure `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`), structured schema-constrained output, bounded input, timeout and cost limits. No model key required to run rule-based baseline tests. Never execute repo code during static analysis; treat code and README text as untrusted data/prompts.
- Durable queue: transactional Postgres-backed `scan_jobs`/`webhook_events` with leasing, retry/backoff and uniqueness for hackathon MVP; optional Redis/Celery *after* it works. Run worker in independently long-lived process (`python -m app.worker`) rather than relying on request-local background tasks in an ephemeral host.
- Folder structure suggestion:
  ```
  careerproof-backend/
    app/main.py                  # FastAPI app, CORS, middleware
    app/api/{auth,github,jobs,assessments,events,innovations}.py
    app/integrations/{github_app,github_api,job_sources,llm}.py
    app/agents/{orchestrator,requirement_agent,evidence_agent,matcher,explanation_agent}.py
    app/analyzers/{selection,python_ast,sql_rules,api_routes,tests,skill_index}.py
    app/workers/{queue,runner,reconcile}.py
    app/models/{db,schemas}.py
    app/core/{config,security,logging,errors}.py
    alembic/ tests/{unit,contract,integration,e2e}/
    docs/{SHARED_API_CONTRACT.md,OPENAPI.md,ARCHITECTURE.md,DEMO.md}
    .env.example README.md pyproject.toml
  ```
- Keep components independently testable and explicitly separate validation/deterministic provenance from LLM output.

## D. Database and provenance: minimum schema

Use migrations, FK constraints, per-user row ownership, safe indexing, snapshots, and transactions.

- `users` — auth_subject UUID, email as authorized.
- `github_installations` — user_id, installation_id, account, permissions snapshot, install state.
- `repositories` — user_id, installation_id, github_repo_id, full_name, branch, selected, latest_seen_sha, latest_verified_sha, last_scan_at.
- `jobs` — user_id, source_url, employer, title, fetched_at, original_text_hash, retrieval_status, original bounded text if terms permit.
- `job_requirements` — job_id, normalized `skill_key`, original excerpt, importance, confirmed, source context.
- `job_versions` — job_id, retrieved_at, content hash, verified source/retrieval state, extracted differences (optional P3).
- `repo_snapshots` — repo_id, exact commit SHA, analyzer_version, path scope and excluded/unsupported paths, timestamp, status.
- `evidence` — snapshot_id, skill_key, repository_id, blob_sha, exact path, start_line, end_line, immutable permalink, observation type, rule ID, reason, limitation, snippet/hash.
- `assessments` — user_id, job_id, version, reviewed repository scope, created/evaluated time, freshness, status, evaluator version, scan success/failure.
- `requirement_verdicts` — assessment_id, requirement_id, exact `skill_status`, bounded claim, rationale, uncertainty, evidence associations.
- `webhook_events` — unique delivery ID, repo_id, ref, before_SHA, after_SHA, status, received/processed timestamps, errors, changed_files, affected_skills.
- `scan_jobs` — queue job state, lease owner/time, retries, idempotency key, trigger.
- `audit_log` — actor, action, affected IDs, time, SHA, sanitized metadata, trace ID.
- `gap_tasks`, `code_defense_sessions`, `skill_graph_edges` — add by priority only.

Integrity: unique GitHub `delivery_id`; unique `(repo_id, commit_sha, analyzer_version)` snapshot; unique `(assessment_id, requirement_id)` verdict; atomic assessment/event update; do not mutate historic assessment versions in place. Guard stale SHA: newer HEAD cannot be overwritten by delayed older events. Deleted/renamed code invalidates old evidence. Reused observations must have valid blob SHA and path/snapshot context.

## E. Canonical API

Implement P0 **exactly** as in `00_SHARED_API_CONTRACT.md`:

`GET /health`;
`GET /api/me`;
`GET /api/github/install/start`;
`GET /api/github/installations`;
`GET /api/github/repos`;
`PATCH /api/github/repos/{repo_id}`;
`POST /api/jobs/import`;
`GET /api/jobs`;
`GET /api/jobs/{job_id}`;
`PATCH /api/jobs/{job_id}/requirements`;
`POST /api/assessments`;
`GET /api/assessments/{assessment_id}`;
`GET /api/assessments/{assessment_id}/history`;
`GET /api/events`;
`GET /api/events/{event_id}`;
`POST /api/webhooks/github`.

Use shared exact DTOs and enums, consistent `ApiError` and typed OpenAPI. Write `tests/contract` to assert JSON schemas and freeze generated OpenAPI. Update only deliberate documented contract changes. Authenticated student routes MUST filter by user-owned job/repo/assessment; webhook must NOT rely on JWT.

Extend as P1/P2/P3 ONLY when core completes: `/api/assessments/{id}/passport`, `/impact`, `/gap-tasks`; `/api/code-defense/sessions`; `/api/assessments/{id}/skill-map`; `/api/jobs/{id}/versions`, `/recheck`; resume suggestions, as spelled in shared contract.

## F. Real job requirements: implement carefully

1. Verify allowed HTTPS URL and URL resolution; defend against DNS rebinding and redirects to internal addresses (revalidate every hop), private IP literal, metadata service addresses, huge documents, login wall and hostile HTML.
2. Fetch only when permitted. Prefer employer-hosted structured job page or compliant API; normalize employer/title, original requirement spans, skills, required/preferred distinction and fetched timestamp. Never present generated job text as scraped fact.
3. Normalize semantic aliases (`SQL`, `SQL query writing`; `REST API`, `HTTP endpoint development`), but keep original sentence and link so reviewer can confirm/correct extraction.
4. Store job version and extraction confidence separately; if unavailable, error with `JOB_SOURCE_UNAVAILABLE` and invite another authentic URL. Do not silently fall back to generic LLM-invented requirements.
5. P3: if terms allow recheck, compare snapshots and version requirements when original source changes. If inaccessible, mark stale; never invent a new requirement.

## G. Github connection and static evidence engine

1. Register/document proper GitHub App setup; install in selected repository under explicit user consent. Do not require write permissions to repositories; your app should never push student code.
2. Fetch repository default/scoped branch HEAD and file tree; analyze a bounded file allowlist at exact commit and store coverage manifest. Exclude `.env*`, credential/token/key files, oversized/binary/generated/vendor content, lockfiles and other sensitive paths. Never execute fetched source code.
3. Extract *specific operations*, NOT technology mentions. Initial skill coverage:
   - **Python implementation**: meaningful function/class/control/data processing logic at path/line; tests enhance context. An import or language histogram alone is insufficient.
   - **SQL query writing**: actual SELECT/WHERE/JOIN/INSERT/UPDATE operations, preferably parameterized query use integrated into code; report only specific query-writing demonstrated, not DBA/performance/mastery.
   - **REST API implementation**: actual FastAPI/Flask routes or equivalent HTTP method handlers, request/response handling and validation. Framework dependency alone isn't enough.
   - **Testing**: real test structure and meaningful target assertions; test existence does not guarantee passing unless validated and safe test execution is specifically configured. Static analysis must not execute untrusted repos.
4. Build evidence via parsers/rules; for each observation record `skill_key`, exact behavior, file, line range, blob SHA, scan commit, rule ID, strength dimension (`implementation|application|test|documentation`), limitations and verified immutable GitHub permalink (`https://github.com/{owner}/{repo}/blob/{SHA}/{encoded_path}#Lx-Ly`). Resolve/canonicalize actual source and verify line bounds; NEVER let the LLM invent an owner, SHA, path or line.
5. Maintain evidence index mapping path/blob to observed skill keys and requirements. When a requirement needs multiple operations, qualify narrowly. For ambiguous findings produce partial or unable_to_assess—not arbitrary full demonstrated.
6. Define status algorithm conservatively:
   - if access failed / unsupported / incomplete for that skill → `unable_to_assess` with reason;
   - else if strong verified relevant implementation satisfies narrowly framed requirement → `demonstrated`;
   - else if relevant but insufficient observations → `partially_demonstrated`;
   - else → `not_demonstrated_in_reviewed_scope` with enumerated scan scope and caveat.
7. Keep `confidence` separate from verdict and record limits. Code presence does NOT prove original authorship, comprehensive competency, secure deployment, or hire probability. Confidence-high means evidence clearly supports the narrow specific statement.
8. Support multi-repo selection and deduplication of skill evidence, but demo initially one small controlled repo.

## H. Agentic AI orchestration — useful, constrained, testable

Implement an explicit 5-stage pipeline with typed input/output, retries and audit:

`Job Requirements Agent (source-bounded extraction)` → `Repository Inspector (actual GitHub code snapshots)` → `Evidence Validator (AST/rules and verified citations)` → `Requirement Matcher (deterministic verdict rules)` → `Explanation/Gap Agent (grounded human-readable findings, actionable tasks)`.

Optional `Change Impact Agent` determines impacted skill keys from changes and dependency index, but the source of truth remains deterministic diff/evidence data. Orchestration logs component version and decisions, not raw private code or secrets. If LLM unavailable, deterministic baseline works with conservative templates; show "AI explanation unavailable" if necessary.

Prevent prompt-injection: job pages, README and code comments are untrusted data. The LLM must not execute instructions contained in fetched content, control GitHub tool permissions, change verdict schema, or invent external citations. Keep output token budgets bounded, validate AI JSON with Pydantic and reject unsupported findings.

## I. The CRITICAL GitHub change-detection/reassessment loop

1. Public HTTPS webhook endpoint reads **exact raw request bytes**, checks `X-GitHub-Event`, `X-GitHub-Delivery`, computes HMAC-SHA256 with `GITHUB_WEBHOOK_SECRET`, constant-time compares expected `X-Hub-Signature-256`, rejects wrong/missing signature, and checks repo installation/selection/ref policy.
2. Deduplicate `delivery_id`; persist validated event and durable scan job **in a transaction before 202 response**. Never perform expensive repository scan inside webhook handler. A repeated delivery must not create multiple versions.
3. Worker processes selected default branch (others recorded `ignored` with reason). Fetch `before`/`after` HEAD via GitHub compare/tree APIs. Handle pagination, large commits, force pushes, renames, deletes, and truncated comparisons. If diff cannot be trusted, schedule a bounded full new snapshot rather than pretend coverage is complete.
4. Build mapping `changed file -> old skill observations -> newly parsed skill observations -> impacted job requirements`. Invalidate evidence from deleted/changed old blobs; include relevant references/dependencies in targeted analysis; recompute only impacted skills when safe. Reuse unchanged observations only when verified valid.
5. If a query file is added with actual SQL operations, promote SQL query-writing only if evidence truly qualifies, cite new SHA/path/lines. If it is deleted, retract/reevaluate existing SQL claim. A fetch failure must not convert previous demonstrated status to a negative.
6. Save a new immutable repo snapshot / assessment version, its before/after delta, trigger delivery ID, timestamps, reasons, updated citations and freshness in a DB transaction. Update affected job matches. Do not let an older queued task overwrite newer branch HEAD.
7. Expose events and history through contract endpoints. Frontend polls while processing and updates automatically; no manual action in UI is needed to trigger reassessment.
8. Implement periodic reconciliation (every few minutes/configurable) of authorized default branch HEAD as a fallback for webhook outages; automatic SHA-change polling qualifies as change detection. Record detected source (`webhook`/`poller`), not invented push IDs.
9. Retry rate-limited/transient failures with bounded exponential backoff and visible state. Fail closed on signature issues. Retain previous verified assessment if new scan unsuccessful and mark current assessment stale/failed.

## J. Innovative features — implement progressively without fake behavior

**P1: Commit-to-Career Impact Map backend**
- `GET /api/assessments/{id}/impact` returns old/new skill verdicts, precise commit/diff provenance, observed changes and evidence added/removed. Build from persisted version data, not post-hoc LLM story.

**P1: Skill Proof Engine**
- Evaluate four dimensions: `implementation`, `application`, `test`, `documentation`. Each comes from actual observed artifacts; stronger proof can raise confidence for a *narrow* claim. No auto-award of expertise from keywords, file name or package.

**P1: AI Project Generator / Gap-to-Code Tasks**
- For each requirement with insufficient evidence, recommend a concrete project improvement in a selected EXISTING repo, include task steps and what file/test artifacts would demonstrate it. Example SQL: schema/migration, SELECT/INSERT/UPDATE with parameterization, API integration, tests, clear README. Task is advisory, NOT an automatic commit; later genuine GitHub changes are evaluated by same engine.

**P1: Honest AI, Evidence Freshness and Passport**
- Exportable source-cited passport with review scope, timestamps, evaluator version, partial/unknown caveats. Show coverage formula explicitly if implemented and NEVER conflate with hiring probability. Maintain stale/pending state after incoming commits until verified.

**P2: Code Defense Mode**
- Generate questions only grounded in selected actual evidence item, covering behavior, design tradeoffs and edge cases; feedback cites code. Responses are a separate explanation/practice signal; weak answers are not proof of non-authorship or incompetence.

**P2: Career Skill Dependency Map**
- Versioned edges from curated/attributed prerequisite definitions, not arbitrary LLM certainty. Skill nodes link to job requirement IDs, verdicts and evidence IDs, updated when underlying skills change.

**P3: Job Requirement Change Detector**
- Refresh permitted authentic job source safely, diff real captured requirement versions, explain added/removed requirement and re-evaluate gaps. Preserve old snapshots, fail visibly when blocked, do not scrape forbidden websites or fabricate changes.

**P3: Evidence-based Resume Suggestions, career research, learning roadmap**
- Only cite verified skill evidence; phrase gaps carefully. Never claim it creates valid credentials, verifies authorship or guarantees an interview.

## K. Exact phase-by-phase coding instructions

**Phase B0 — Preflight + immutable contract**
- Inspect existing repo; preserve code/history. Read all attached sources, copy shared contract to docs. Create dependency plan, risk list, module tree and OpenAPI/Pydantic DTO models identical to shared contract. Make tests for exact enum spelling. Run imports/tests.

**Phase B1 — Foundation/Auth/DB**
- Set up FastAPI, CORS, JWT verification, config/secrets, Postgres models and Alembic migrations, user ownership checks, consistent errors, `/health`; DB connect/retry, no unprotected data endpoints; `.env.example`. Test unauthorized and cross-user requests.

**Phase B2 — Real GitHub App integration**
- Create installation start flow, bind install to user by signed state; list permitted repos; select branch and repo; retrieve tree and exact SHA; test real API errors/permissions. No use of long-lived personal tokens where App installation is possible. Create setup guide for public HTTPS callback.

**Phase B3 — Authentic job source integration**
- Implement safe HTTPS fetch or permitted jobs API, genuine requirement extraction with original spans, review/confirm and persistence. Test valid fixture HTTP pages ONLY for code tests; demo must use an actual available employer URL.

**Phase B4 — Evidence agent and initial assessments**
- Implement file exclusions/bounds, Python AST/SQL/REST extraction, exact line-cited evidence and narrow rule-based matcher; optional LLM explanation with typed grounded JSON; version one assessment and coverage metadata. Test positive, partial, absent and unavailable separately. Show actual code links.

**Phase B5 — Real webhook and durable worker (MUST PASS)**
- Implement verified raw-body signature, event idempotency, repo/ref filtering, durable queue, changed-file detection, stale evidence invalidation, deletions/renames, per-repo ordering, persisted history, polling fallback. Start worker as independent process. Test an actual push updates persisted SQL verdict with no manual refresh. This is the primary hackathon exit gate.

**Phase B6 — Reliability + audit tests**
- Test duplicate webhook delivery, invalid/missing signature, deleted SQL queries, unsupported/unreadable file, huge/diff truncated commit, force push, GitHub 429, LLM timeout, job URL unavailable, stale-head races and cross-user data restrictions. Fix failures, add observability and safe error text.

**Phase B7 — High-value innovations**
- Implement persisted impact map, evidence passport export, gap-to-code agent and honest freshness reporting. Add P1 endpoints and contract tests; keep P0 green.

**Phase B8 — Optional innovations**
- Implement Code Defense, skill dependency graph, authentic job requirement refresh, evidence-backed resume recommendations in this order as time allows. Feature flag routes; never return apparently-real fabricated content.

**Phase B9 — Deployment, integration & demo delivery**
- Compose local development config (Postgres, API, worker) in Docker Compose if useful; do not require enormous model downloads. Add cloud deployment notes: public HTTPS API+worker, GitHub webhook URL, backend CORS for frontend, Supabase migration, health monitoring, sample scoped job/repo demo. Output README, OpenAPI JSON, `.env.example`, test report, architecture diagram, 5-minute demo script, FAQ and explicit handoff to frontend. Test end-to-end with one REAL externally reachable GitHub event and a REAL job source.

For each phase: implement code, run tests, fix errors, report files changed, checks that passed/failed, and readiness gate. Continue in order unless external secrets, auth approvals, GitHub App installation, deployment, destructive DB actions or user authorization is required; ask user instead of inventing credentials or claiming success. Avoid commits/pushes without permission.

## L. Security, correctness and deployability checklist

- [ ] JWT verified with trusted JWKS and per-user ownership; installation callback bound to signed user state.
- [ ] GitHub read-only App; protected private keys/installation tokens; explicit repo access selection.
- [ ] HMAC verified over raw body; delivery ID unique and idempotent; no heavy webhook inline work.
- [ ] HTTPS, SSRF defense on job URLs, redirect/DNS checks, no private IP access, content cap and policy compliance.
- [ ] No secret/private/generated/binary files leaked to LLM; no arbitrary repo code executed.
- [ ] Exact source commit and path/line citation validation; no AI-created GitHub URLs.
- [ ] SQL claim is specific; no unsupported mastery, authorship or hire-chance claim.
- [ ] Missing evidence is scoped; scan failure is `unable_to_assess`; stale runs preserve previous truth.
- [ ] Commit deletion retracts evidence; duplicate push does not duplicate versions; stale task cannot overwrite newer version.
- [ ] Authentication/CORS/error shape matches shared contract; API tests and OpenAPI are generated.
- [ ] At least one actual public job URL + one actual GitHub repo + one verifiable push + resulting live reassessment documented.

## M. Mandatory reproducibility tests and demonstration

Write `tests/e2e/test_demo_loop.py` with deterministic test doubles for fast CI AND a separate documented *manual real-world smoke procedure*:

1. Read an actual available internship listing requiring Python/SQL/REST or comparable evidence categories and preserve source URL/date.
2. Connect a real, small GitHub repo under an authorized GitHub App installation.
3. Assess selected default branch HEAD with working Python/API code and **no SQL query-writing evidence**; expect `not_demonstrated_in_reviewed_scope` with stated scope.
4. Make/commit/push REAL file such as `database/queries.sql` with actual parameterized query-writing example AND a test to this repo under human user control; never autopush to someone else's repo.
5. Inspect actual delivered signed push event, changed files and queued job; poll API until new version. Expect SQL query-writing `demonstrated` (only if parser's observations qualify), with immutable SHA file/line citation; Python and REST unchanged unless truly affected.
6. Optionally remove SQL code in a second REAL commit; observe downgrade and audit history.
7. Capture event delivery ID, measured elapsed time, old/new SHA, job URL, evidence permalinks, old/new verdict and reviewer-safe limitations. If rate-limited/unavailable, report failure plainly and how to recover; do not substitute artificial proof.

Suggested judge script: 0:00–0:40 real listing → 0:40–1:30 authorized GitHub repo → 1:30–2:15 initial skill evidence/gap → 2:15–3:15 real SQL push → 3:15–4:15 automatic event and updated evidence → 4:15–5:00 limitations/innovation. Be ready for 3-minute Q&A: hallucinations, copied code, deletion, webhook signatures, GitHub permissions, job source freshness, and scaling.

**START NOW with Phase B0, then build the full P0 path in order.** Make real backend code and test it. Do not stop after architecture slides, static JSON samples or a pretend push demonstration.
