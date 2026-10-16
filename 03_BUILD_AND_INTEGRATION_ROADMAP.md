# CAREERPROOF — STEP-BY-STEP BUILD, INTEGRATION, JUDGING ROADMAP

This document accompanies the **two independent master prompts**. Execute in the specified sequence. All features are proposed work until actually coded and verified. "Demo data" can aid UI development but is NOT a valid substitute for the final real GitHub/job demonstration.

## 0. What's in the bundle

1. `00_SHARED_API_CONTRACT.md` — the immutable cross-repository agreement for endpoints, request/response JSON, status enums, security boundaries and handoff.
2. `01_FRONTEND_MASTER_PROMPT.md` — complete prompt for frontend AI coding agent.
3. `02_BACKEND_MASTER_PROMPT.md` — complete prompt for backend AI coding agent.
4. `03_BUILD_AND_INTEGRATION_ROADMAP.md` — this execution guide and acceptance checklist.
5. `04_SOURCE_TRACEABILITY.md` — which product requirements came from which attached reference.

## 1. Why keep frontend/backend separate?

- Distinct repositories: `careerproof-frontend` (Next.js UI) and `careerproof-backend` (FastAPI, GitHub/AI/DB/worker).
- Shared API definitions written first. Frontend can safely render typed mock DTOs while backend develops authentic providers and jobs.
- Integrated later using `NEXT_PUBLIC_API_BASE_URL` and the Supabase Auth JWT. GitHub App and LLM secrets stay backend only.
- No need to merge source trees to connect; they communicate over HTTPS. If desired, use a separate deployment/infra repo later, but keep histories independent.

## 2. Practical sequence to use the prompts

**Step 1: Create two empty GitHub repositories** (or two separate local workspaces) and preserve their distinct git histories. Never grant an agent permission to modify unrelated projects.

**Step 2: Copy `00_SHARED_API_CONTRACT.md` unchanged into both repos under `docs/SHARED_API_CONTRACT.md`.** This is the single authoritative proposed contract.

**Step 3: Open frontend repo in coding agent.** Paste the entire `01_FRONTEND_MASTER_PROMPT.md`, attach contract + reference documents. Ask it to build phases F0–F5 before extras. Tell it to use `NEXT_PUBLIC_DATA_MODE=mock` until backend is ready. It should never say mock GitHub events are live.

**Step 4: Open backend repo in a *separate* coding agent session.** Paste entire `02_BACKEND_MASTER_PROMPT.md` and attach same contract/docs. Backend should finish B0–B5 (real job, real GitHub, signed push, persistent evidence) before optional agents.

**Step 5: Configure real external dependencies yourself where human consent is necessary.** Create Supabase project and tables via migrations; register GitHub App and install it to a repo you control; choose permissions minimum read metadata/contents, subscribe to `push`; set webhook destination to your PUBLIC HTTPS backend (`https://<your-api-host>/api/webhooks/github`); set long random webhook secret on GitHub and backend. Obtain LLM API key only if needed; never paste private keys into public chat, git or frontend environment variables.

**Step 6: Backend developer gives frontend developer four deliverables:** deployed HTTPS API root, `/openapi.json`, auth setup instructions, and a test account/repo/job path (without passwords or other secrets). Update `FRONTEND_ORIGIN` on backend and `NEXT_PUBLIC_API_BASE_URL` on frontend, select `NEXT_PUBLIC_DATA_MODE=live` and use a real Supabase Auth session.

**Step 7: API contract verification.** Confirm enums/field names and endpoints in both repos match `00_SHARED_API_CONTRACT.md`; resolve incompatibilities through documented change, then regenerate typed frontend client as appropriate. Run cross-repo integration tests; no mock adapter allowed for live proof.

**Step 8: Real full demo.** Choose a real internship posting, import requirements, connect an actual repository, record first assessment, PUSH actual SQL code, wait for real signed GitHub event and worker, observe new evidence and verdict automatically, open immutable GitHub code link. Check deletion downgrade separately if feasible.

**Step 9: Freeze, rehearse and record.** Save anonymized screenshots/screen recording, actual job URL, GitHub repo and commit link, event status, before/after assessment version, measured processing time and a concise Q&A script. Review logs for secrets; ensure README works from clean machine.

## 3. Suggested realistic hackathon time allocation (24 hours, adaptable)

| Time block | Highest-value work | Exit proof |
|---|---|---|
| Hour 0–2 | Two repos, shared contract, DB/Auth/App setup, frontend shell | Auth and documented repo tree, endpoints compile |
| Hour 2–6 | Backend job source + GitHub read; frontend onboarding/jobs/repositories | Real job source and real selected repo visible |
| Hour 6–10 | Code analyzers + evidence database + assessment UI | File/SHA/line citations work; scoped SQL gap shown |
| Hour 10–15 | Signed webhook, durable worker, diff, incremental reassess + live UI updates | One real SQL push updates a verdict automatically |
| Hour 15–18 | History, failure handling, deletion/dedupe tests, impact UI | Changes and errors auditable; no false claims |
| Hour 18–21 | AI Project Generator + passport + visual polish (only if P0 green) | Targeted task cites requirement and scope |
| Hour 21–24 | Deploy, end-to-end test, README, rehearsal, Q&A | Five-minute repeatable judges' demonstration |

Core feature sequence outranks timeline. If behind, DROP P2/P3 innovations rather than ship fake integrations.

## 4. Features by obligation

**P0 / required by hackathon:** authentic source-cited job requirements; selected real GitHub repos; actual source inspection; file/line/SHA citations; honest status and scoped gaps; repo-change detection; automatic reassessment and history; README and demo proof.

**P1 / compelling execution:** Commit-to-Career Impact Map, Skill Proof Engine implementation/application/test/docs dimensions, evidence freshness/uncertainty, skill passport, AI Gap-to-Code/Project Generator.

**P2 / optional originality:** grounded Code Defense Mode, skill dependency graph, evidence-backed resume suggestions.

**P3 / stretch:** job requirement change detection; broad compliant live job discovery, collaboration/recruiter features.

All seven named innovation concepts from `CareerProof_AI_Career_Coach_Innovations.pdf` have assigned frontend and backend implementation responsibilities. The remaining features from the research PDFs (live skill tracker, evidence passport, progress timeline and job-specific portfolio improvements) are mapped into these categories.

## 5. Real source/job selection

Choose a current publicly accessible software/backend internship listing from an employer career site or permitted job API. Verify that you can genuinely preserve its original URL and requirement excerpt. If the listing does not require SQL, do **not** pretend it does; either use a relevant genuine listing or demonstrate another real gap and code change. Job-scraping restrictions are a product constraint, not something to circumvent.

## 6. Safe and repeatable SQL scenario

- Initial checked-in repo should contain meaningful Python route or service code but no real SQL query-writing implementation in selected scope.
- Job source really specifies the relevant skill; extracted requirement is confirmed.
- Baseline verdict: `sql_query_writing = not_demonstrated_in_reviewed_scope`; state scope / excluded paths / SHA.
- Student creates actual code (`database/queries.sql` / app db access + real tests), commits to selected default branch and pushes to GitHub.
- GitHub webhook signed delivery arrives, processed exactly once; worker collects diff and changed files; code parser validates query operations; database records a new assessment version.
- UI automatically renders SQL query writing as `demonstrated` **only if qualifying source evidence was actually found**; show code permalink and narrow claim. No assumption of production SQL mastery.
- Optional negative test: remove relevant SQL file, push, observe claim withdrawal/downgrade.

## 7. Launch acceptance checklist (mark PASS/FAIL, not assumptions)

- [ ] Real employer source URL, timestamp, verbatim requirement excerpts shown.
- [ ] Authorized GitHub App installation for a real selected repository/branch.
- [ ] Baseline positive claim has a working immutable blob SHA + line permalink.
- [ ] Baseline absence worded `Not demonstrated in reviewed scope` with exact scan scope.
- [ ] `Unable to assess` visible on intentionally inaccessible/unscannable cases, not "No skill".
- [ ] Actual signed GitHub push event is stored; unsigned payload rejected.
- [ ] Duplicate delivery does not create duplicate reassessments.
- [ ] Added SQL evidence produces a new version automatically, WITHOUT clicking manual refresh.
- [ ] Deleted or renamed evidence invalidates stale observations; errors retain last verified truth.
- [ ] New SQL verdict links to actual new code, commit SHA, path and line range.
- [ ] Frontend never uses fixture data in live mode or shows fake connection states.
- [ ] Mobile + desktop UI accessible; README and environment templates are usable.
- [ ] Automated tests run and recorded; observed webhook-to-UI time measured.
- [ ] Judge demo and 3-minute Q&A rehearsed.

## 8. Five-minute pitch and Q&A

| Time | Judges see |
|---|---|
| 0:00–0:40 | Real internship source and specific required skills |
| 0:40–1:30 | GitHub App connected to actual repo, source scope and code links |
| 1:30–2:15 | Evidence passport and honest SQL gap |
| 2:15–3:15 | Real commit adding SQL queries/tests and GitHub push |
| 3:15–4:15 | Automatic event detection and changed assessment with citations |
| 4:15–5:00 | Timeline, uncertainty, evidence-based innovation and conclusion |

Prepare for: "How do you prevent LLM hallucinations?", "What if student copied code?", "How do you authenticate GitHub webhooks?", "Can a deleted skill be downgraded?", "Is the job source real?", "How do you scale for many users?". Ground answers in actual implementation, not intentions.

## 9. Sample commands (adjust to generated project)

Frontend typical:
```
cp .env.example .env.local
npm install
npm run dev
npm run build
npm run lint
```

Backend typical:
```
cp .env.example .env
python -m venv .venv
# activate .venv for your OS
pip install -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
# in separate terminal/process:
python -m app.worker
pytest -q
```

Commands are templates to be adapted to generated lockfiles and package configuration, not proof of an existing implementation.
