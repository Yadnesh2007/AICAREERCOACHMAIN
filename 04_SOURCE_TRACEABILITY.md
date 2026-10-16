# CAREERPROOF — REFERENCE ANALYSIS AND FEATURE TRACEABILITY

This package was drafted from the five **user-attached documents**. These materials describe a proposed design, not already running code. The technical schema and API names in the bundle are **new specific integration proposals**, aligned with (not copied from) the project architecture planning.

| Attachment | Material adopted into the prompts | Helpful original pages |
|---|---|---|
| `AI_Career_Coach_Existing_Solutions_Research(1).pdf` | Competitor baselines GitRoll/SkillProof/SkillBridge/Skill Gap Analysis; do not misstate novelty; source-cited live GitHub update; five-minute demo outline | pp. 1–4, especially pp. 2–3 |
| `AI_Career_Coach_Flaws_and_Solutions(1).pdf` | Ten common design flaws and fixes, four-state evidence language, SQL before/after example, Next.js + FastAPI + GitHub App + PostgreSQL stack, priority ordering | pp. 1–4, especially pp. 1–3 |
| `AI_Career_Coach_PRD(1).docx` | P0 FR-01–FR-10, P1 FR-11/12 and optional FR-13, strict status semantics, no fictitious job source or manual-only updates, performance targets, events/history/acceptance gates | throughout, especially requirements and test metrics |
| `AI_Career_Coach_System_Architecture(1).docx` | Application layers, signed webhook + durable enqueue + worker, immutable citations, database tables, proposed REST API paths, edge-case and privacy controls, test matrix | throughout, especially API/schema, reliability and security sections |
| `CareerProof_AI_Career_Coach_Innovations.pdf` | Product name/tagline, Commit-to-Career Impact Map (p4), Skill Proof Engine (p5), AI Project Generator (p6), Code Defense Mode (p7), Job Requirement Change Detector (p8), Skill Dependency Map (p9), Honest AI/Evidence Freshness (p10), prioritization (p12), 5-min demo (p13) and further reference links (p16) | pp. 2–16 |

## Innovation mapping — no idea omitted

| Innovation from attachment | Frontend responsibilities | Backend responsibilities | Stage |
|---|---|---|---|
| Commit-to-Career Impact Map | Live event progress, before/after skill delta, commit links | GitHub event provenance, assessment version diff | P0 loop + P1 enhanced visualization |
| Skill Proof Engine | Status, proof-depth facets, evidence passport | Source parsers, narrow requirements, validated citations/rules | P0 + P1 |
| AI Project Generator | Gap Lab task UI/checklist | Targeted evidence-grounded recommendation agent | P1 |
| Code Defense Mode | Source-grounded Q&A interface | Question generator + feedback evidence checks; separate signal | P2 |
| Job Requirement Change Detector | Job version history/diff UI | Compliant source recheck + saved requirement versions | P3 |
| Career Skill Dependency Map | Interactive role/skill graph | Curated skill edges + evidence/requirement mapping | P2 |
| Honest AI & Evidence Freshness | Scope and freshness always visible, plain uncertainty | Separate confidence/status, scope, timestamps, stale invalidation | P0 + P1 |

## Reference websites listed in attachments

Competitive landscape / conceptual comparison:
- GitRoll: https://gitroll.io/
- SkillProof: https://github.com/aryancodex-19/T36-SkillProof
- SkillBridge: https://github.com/prithvifr/SkillBridge
- Skill Gap Analysis: https://github.com/skill-gap-dev/skill_gap_analysis
- AI Career Coach: https://github.com/DhanshreeD866/AI-Career-Coach
- Prog.AI: https://www.getprog.ai/
- TryCareerLens: https://trycareerlens.com/
- Devvero: https://devvero.com/
- Resume + GitHub + Job Analyzer: https://github.com/JaweriaAsif745/Resume-github-job-analyzer
- SkillGraph: https://github.com/daanialmirza5/SkillGraph

Technical source references:
- GitHub webhook creation: https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks
- GitHub webhook signature validation: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
- GitHub webhook events/payloads: https://docs.github.com/en/webhooks/webhook-events-and-payloads
- GitHub webhook best practices: https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
- GitHub App permissions: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app

Treat third-party feature summaries as publicly described rather than independently verified; review any open-source project license and attribution requirements before reuse. Do NOT claim the feature does not exist elsewhere merely because the reference did not document it.
