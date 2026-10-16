# MASTER PROMPT A — CAREERPROOF FRONTEND

**COPY THIS ENTIRE FILE INTO YOUR FRONTEND AI CODING AGENT (e.g., Antigravity, Cursor, or Claude Code). Attach `00_SHARED_API_CONTRACT.md` and the five original reference documents if the platform supports attachments. Create and work ONLY in a dedicated frontend repository.**

---

You are a senior frontend engineer, product designer, accessibility engineer, and hackathon demo architect. Build a complete, production-shaped, beautiful, responsive FRONTEND for **CareerProof — AI Career Coach**, tagline **"Every Skill Has Evidence."**

## A. Product objective and unbreakable rules

The product compares authentic job/internship requirements with actual code-level evidence found in selected GitHub repositories, identifies honest evidence gaps, then displays automatic reassessment when a real GitHub commit changes relevant code. End-to-end flow:

**Real job source → verified requirements → real connected repository → exact code evidence → evidence-scoped verdicts and gaps → real GitHub push → event processing → automatic updated verdict with commit-level evidence.**

This repo owns **FRONTEND ONLY**. DO NOT generate a new backend or AI assessor, make up endpoints, create fake job sources, counterfeit a GitHub connection, store real tokens in browser, simulate commits in live mode, or implement fake positive skill claims. No vague resume-based claims. The shared `00_SHARED_API_CONTRACT.md` is authoritative. If a backend capability is unavailable, build a clean typed interface and show a truthful disabled/pending integration state; in mock mode, visibly badge the data **"DEMO FIXTURE — NOT LIVE"**. Never label mock events as real GitHub events.

Respect four status values exactly: `demonstrated`, `partially_demonstrated`, `not_demonstrated_in_reviewed_scope`, `unable_to_assess`. Show explicit textual definitions. **Never say "student lacks SQL"** because missing source evidence is not proof of missing ability. Keep evidence confidence separate from ability and from job-hiring odds.

**No endpoints may be invented** beyond the shared contract. In particular, `/api/webhooks/github` is BACKEND-ONLY: the browser never calls or simulates its signed GitHub event payload; it merely observes results from `/api/events` and assessment history. If a data field is absent, render a safe fallback; do not fabricate evidence or citations. The frontend displays source URLs, backend-generated immutable GitHub code permalinks, review scope, timestamps and limitations.

## B. Input references and how to use them

Read all five supplied project documents and preserve their distinctions:

1. *Existing Solutions Research*: GitRoll, SkillProof, SkillBridge, Skill Gap Analysis, and open-source AI Career Coach are comparison/inspiration references. Do NOT claim all competitors lack auto-updates. Core differentiator is a reliable, demonstrable real commit-to-updated-evidence loop.
2. *Flaws and Solutions*: ten problems to address—resume dependence, static reports, unverifiable ratings, generic jobs/advice, no progress history, keyword matching, unclear uncertainty/authorship, unnecessary rescans.
3. *PRD*: FR-01…FR-13, honest four-state verdicts, actual job URL, file+SHA evidence, change events, failure states, 5-minute demo.
4. *System Architecture*: separate Next.js browser + FastAPI API; GitHub App and worker are backend-owned; polling or SSE for event state; exact shared interface; never permit UI mutations of assessment truth.
5. *CareerProof Innovations*: **Commit-to-Career Impact Map, Skill Proof Engine, AI Project Generator, Code Defense Mode, Job Requirement Change Detector, Career Skill Dependency Map, Honest AI & Evidence Freshness**. Make every item visible in product navigation as appropriate; P2/P3 routes may show "Coming after core integration" rather than fake content.

Also consult official GitHub documentation for *GitHub Apps, webhooks, push payloads, immutable blob links*. Borrow design patterns, not copyrighted graphics/code without appropriate licensing. Suggested design inspiration: Linear's information hierarchy, GitHub's code browsing density, Vercel's dark surfaces; create your own original design.

## C. Mandatory implementation stack and independent repo

- Next.js (current stable App Router), React, TypeScript strict mode; Tailwind CSS; shadcn/ui / Radix primitives; Lucide icons; Recharts for evidence coverage; React Flow only if skill graph is implemented; Motion/Framer Motion for subtle non-essential animations; React Hook Form + Zod for forms; TanStack Query for remote state; `fetch` typed API adapter; Supabase Auth session client. Use package versions compatible with installed runtime. Prefer no unnecessary heavy dependencies.
- Project root is `careerproof-frontend/`; README and `.env.example`, `docs/SHARED_API_CONTRACT.md`, `src/lib/api`, `src/types`, `src/components`, `src/app`, `src/mocks`, and tests.
- Config: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_DATA_MODE=mock|live`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put `SUPABASE_SERVICE_ROLE_KEY`, GitHub App key, webhook secret or LLM API keys here.
- Implement keyboard navigation, ARIA labels, WCAG-style contrast, reduced-motion support, mobile/tablet/desktop layouts, skeleton/empty/error/loading states. Use `next/font` or legally available fonts such as Inter + a monospace font, with sensible fallback.

## D. Visual direction — DARK HYBRID, polished but useful

Build a premium developer-centric UI; don't make a generic "AI generated purple cards" dashboard. Theme: near-black `#090B10`, sidebar `#0F131B`, elevated panels `#151B26`, borders `#283346`, primary text `#ECF2FA`, secondary `#99A7B9`, emphasis cyan/teal `#2ADAC0` plus restrained indigo `#7689F7`; reserve green/amber/red for substantive verdict/failure states and provide text/icons alongside color. Fine grain, very subtle gradients and grid-lines where helpful, no distracting animation. Consistent 8px spacing scale, 10–16px radii, meaningful typography, informative hover states.

Layout: left collapsible sidebar + compact top status bar + content grid; on small screens use slide-out navigation. Include a persistent compact status panel: `GitHub connected?`, `Job sourced?`, `Last scan SHA`, `last updated`, `current/stale`, queued webhook progress. No faked "Connected" indicator when API is unavailable.

**Core pages / route map:**

1. `/` or `/welcome`: Hero + truthful product promise, show sample workflow and primary CTA; optional public landing, with original visuals.
2. `/auth/sign-in`: Secure Supabase login, redirect management; no hardcoded credentials.
3. `/onboarding`: 3-step wizard: GitHub App install → choose explicitly authorized repositories/branch → import real job URL; permissions explained.
4. `/dashboard`: Target role card with employer, exact source URL and retrieved date; requirements overview; evidence coverage formula and legend (NOT probability of hiring); cards for demonstrated, partial, not demonstrated in scope, unable to assess; active change status; useful next action; review-scope caveat.
5. `/jobs`: Real job import form and saved jobs; fetch/parse results, user verifies requirement extraction, preserves exact requirement text and original source URL; broken/dead sources display clear error.
6. `/repositories`: App installations, selected real repositories, scan branch/SHA, allowlist/scope/exclusions, scanning state; GitHub source links.
7. `/assessments/[id]`: Requirement-by-requirement matrix with status, specific bounded claim, rationale, what is still unproven, evidence count, proof depth dimensions (implementation, application, tests, docs), confidence displayed as evidence confidence only.
8. `/assessments/[id]/evidence`: Searchable Skill Evidence Passport; cards show exact repository, path, line range, commit, code snippet when authorized, observed behavior, limitations, original job excerpt; "Open code on GitHub" opens backend-provided permalink.
9. `/assessments/[id]/impact`: **Commit-to-Career Impact Map**; realtime chronological event statuses `received→queued→analyzing→updated|failed|ignored`, changed-file list, affected skills, before/after statuses, reason, evidence added/removed, link to trigger SHA. Make the visual effect of a SQL commit unmistakable.
10. `/assessments/[id]/history`: Immutable assessment versions, useful diffs, progress chart/status transitions, freshness and scan timestamps; show evidence removals and downgraded statuses as clearly as promotions.
11. `/assessments/[id]/gap-lab`: **Gap-to-Code / AI Project Generator**; one task per missing requirement, work in selected existing repo, implementation checklist, expected evidence and validation steps; optionally suggest *Student Placement Tracker* relational schema, queries, app integration and tests. Never guarantee completing task establishes mastery.
12. `/assessments/[id]/skill-map`: **Career Skill Dependency Map**; directed graph of role requirements and explicitly stated prerequisites; node status linked to evidence. P2: if unavailable show future-feature explainer, not pretend completed.
13. `/assessments/[id]/code-defense`: **Code Defense Mode**; pick a validated code evidence item, ask about actual code and design decisions, submit answer, show supportive grounded feedback; keep explanation signal distinct from source code skill status and authorship. P2 gated.
14. `/jobs/[id]/history`: **Job Requirement Change Detector**; versioned original excerpts, source refresh timestamps, additions/removals; P3 gated and truthful about inaccessible job sites.
15. `/settings`: Account, access scopes, selected repo policies, privacy/LLM disclosures, disconnect/logout; no security credentials visible.
16. `/demo-proof`: Judge-friendly proof dossier listing the exact real job URL, real repo URL, initial assessment, code permalinks, actual commit SHA, event timeline, changed verdict and caveats; in mock mode must say sample demonstration.

Route exact layout can nest according to Next.js conventions. Ensure nav and breadcrumbs are consistent. Keep P2/P3 behind feature flags so they do NOT impair P0.

## E. Required UI components and behavior

- `AppShell`, `Sidebar`, `TopBar`, `SourceLinkBadge`, `RepositorySelector`, `JobImportWizard`, `RequirementReviewTable`, `ScopeDisclosure`, `EvidenceStatusBadge`, `SkillVerdictCard`, `EvidenceSourceCard`, `CodeEvidenceViewer`, `ScanProgress`, `ChangeImpactTimeline`, `BeforeAfterSkillDiff`, `FreshnessIndicator`, `ProofDepthPanel`, `GapToCodeTaskCard`, `JobRequirementVersionDiff`, `SkillDependencyGraph`, `CodeDefensePanel`, `JudgeDemoChecklist`, `LoadingSkeleton`, `ErrorState`, `ConnectionModeBanner`.
- Each status includes accessible icon + readable text + tooltip/explanation. Examples: `SQL query writing — Not demonstrated in reviewed scope` with `Analyzed repo: owner/repo, main @ <SHA>; files excluded ...`; **not** "SQL: Failed".
- Clicking an evidence row must reveal code provenance, backend-permalink, observed behavior and limitations; only display `snippet` if API supplies it. Do not build GitHub link from a mutable branch name.
- Coverage optional: disclose e.g. `count(demonstrated)/count(assessable requirements)`; exclude `unable_to_assess` from denominator and show exclusions; explicitly "Portfolio evidence coverage — not hiring likelihood." Could omit aggregate score entirely if misleading.
- Real-time updates: React Query poll while events/assessments are pending using 3–5s intervals; display actual elapsed processing state; stop or slow polling after settle; refresh relevant queries when new assessment version appears. Never require the student to click "Reassess" after a real push; optional retry only when backend supports it.
- In `NEXT_PUBLIC_DATA_MODE=mock` use seeded consistent sample DTOs for Python, SQL query writing, REST API and *clearly labeled DEMO DATA*; backend mode consumes `/api/*` only. Mock examples must never be automatically substituted for failed live API calls.
- On auth failure, show sign-in; on 403 explain installation permissions; on 429 queue/rate-limit status; on unsupported/incomplete source show `unable_to_assess` and no misleading negative verdict.
- All forms validate; loading, disabled and optimistic states must match actual API operations; no inert buttons.

## F. Feature priority hierarchy

**P0 — must finish and test:** auth, real GitHub connect/select, real job import + source, initial assessment, evidence details with SHA URLs, honest gaps/failure states, signed-webhook-driven event *display*, automatic UI refresh after backend change, immutable history, demo proof view.

**P1 — build once P0 passes:** polished Commit-to-Career Impact Map, evidence proof depth, Honest AI/Evidence Freshness explanations, Skill Evidence Passport export, project-specific gap tasks / AI Project Generator.

**P2 — build without compromising P0:** Code Defense Mode; interactive skill dependency graph; evidence-backed resume suggestions (optional). If API not built, keep routes as explicitly future, no fabricated data.

**P3 — defer unless everything stable:** real job requirement change detection and job-version diffs, extensive provider-based job discovery, collaboration/recruiter tools.

Do not mistake 16 attractive pages for functional completeness. Prioritize working data flows and justified UI states.

## G. Exact phased build procedure (implement and test in order)

**Phase F0 — Analyze contract / structure**
1. Inspect current repo; do not overwrite existing code blindly. Copy shared contract into `docs/`.
2. Produce a simple architecture tree and screen wireframe specification.
3. Define all TypeScript DTOs and status/UX semantics identical to `00_SHARED_API_CONTRACT.md`; document planned API calls by route.
4. Implement API transport layer with Bearer JWT, parsed error envelope, request abort, retries only for safe idempotent GETs, and a switchable mock/live adapter.
5. Gate: TypeScript compiles; mock fixtures pass runtime Zod validation.

**Phase F1 — Foundation and design system**
1. Scaffold Next.js, style tokens, typography, icon system, shadcn/ui primitives, layout/shell/nav/responsive breakpoints.
2. Build accessible badges, evidence/code cards, skeletons and errors; create first class dark theme, no disconnected click targets.
3. Gate: main shell, storybook-like component gallery or test route at desktop and mobile; no overflow.

**Phase F2 — Auth and onboarding**
1. Integrate Supabase Auth safely, login/logout/session refresh; protected routes.
2. Build GitHub App install CTA only from backend-returned `install_url`; repo installation and selection UI.
3. Build authentic job URL import and confirmation flow using shared routes; warn when source cannot be verified.
4. Gate: in live mode interactions call real contract; mock mode clearly labeled.

**Phase F3 — Jobs + repository pages**
1. Render selectable repositories and branch/SHA, scope/exclusions and connection health.
2. Render job requirements preserving source URL, quote, date, checked state and empty/unavailable errors.
3. Gate: user can choose job/repository pair; no secrets or invented data exposed.

**Phase F4 — Skill Assessment / Passport**
1. Assessment create -> queued status -> poll -> completed/failed.
2. Requirement matrix, proof-depth dimensions, evidence detail pages with clickable backend URLs, limitations and caveat.
3. Gate: demonstrated / partial / not demonstrated / unable to assess display correctly with consistent labels; evidence links are immutable and valid for fixture samples.

**Phase F5 — Live commit-to-career impact (THE CRITICAL FEATURE)**
1. Build event timeline from `/api/events` and assessment history diff from `/api/assessments/{id}/history`.
2. Display GitHub commit, changed source files, affected skills, old/new states, evidence added/removed, timestamps and audit detail.
3. Automatically refresh UI when backend creates new assessment after real webhook. Show progress states and graceful failures.
4. Gate: a real SQL commit flows through backend -> frontend without a manual report refresh; deletion can retract a skill claim. In disconnected mock test show an explicit simulated event, not fake GitHub integration.

**Phase F6 — High-value innovations**
1. Add source-grounded gap-to-code challenge/task generator UI and evidence checklist.
2. Add skill passport export (JSON or printable UI), progress/timeline comparisons, freshness/uncertainty explanations.
3. Gate: tasks reference real requirement IDs, selected repo, expected verifiable code artifacts.

**Phase F7 — Optional innovations**
1. Implement code defense, skill dependency graph, job requirement change history only if matching backend endpoints are ready.
2. Wire optional resume suggestions ONLY to validated evidence; otherwise hide behind feature flag.
3. Gate: no mock feature presented as live capability; no deterioration in P0 tests.

**Phase F8 — QA / integration / demo**
1. Run ESLint, TypeScript checks, tests, production build. Add frontend unit tests, accessibility checks, API contract tests, Playwright E2E for mock fixtures and live integration when backend available.
2. Run through responsive/keyboard audits and check all visible buttons/links.
3. Build `README.md`, `.env.example`, integration handoff, deployment instructions, 5-min demo script and Q&A notes.
4. Deliver: repo tree, implemented features grouped P0/P1/P2, commands, screenshots/previews if available, known limitations, exact backend env fields required, and concrete proof of tests; do NOT claim functionality that was not tested.

## H. Handoff and non-negotiable gates

- Keep all frontend git history in frontend repo; DO NOT clone backend code into frontend or create a second API server.
- Start in mock mode for parallel development and switch using env variables; frontend API contract MUST NOT change when backend is connected.
- In live mode use actual installed GitHub App and real employer source through backend; do not create local simulated assessments to trick UI.
- Demonstrate four verdicts, correct unsupported states, real evidence permalinks, case-sensitive enums, before/after version changes, repo selected scope and timestamp.
- If backend is unavailable: report exact missing endpoints/fields and stop those integration tests; don't silently substitute fake results.
- Work autonomously phase by phase; after each phase run tests and report complete/blocked status. Pause only for external credentials, auth approvals, GitHub App installation, deployment or destructive actions. Do not publish secrets or push without user authorization.

**START NOW with Phase F0, then move forward in the written order.** Build working code, not merely an architecture proposal or screenshot. Prefer a smaller thoroughly integrated system to an oversized fake demo.
