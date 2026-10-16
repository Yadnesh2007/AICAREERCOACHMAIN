# ⚡ SkillAura — AI Career Coach
> **"Show what your portfolio proves, and what it does not."**
> **Sponsored by Worcflow**
> An end-to-end, source-grounded employability and career intelligence system that compares authentic job requirements with verifiable code evidence in GitHub repositories, identifies honest evidence gaps, and automatically reassesses candidates upon real GitHub commits.

---

## 🎨 Design System: Cobalt Blue + Ice Blue
- **Primary Brand**: `#1746A2` (Cobalt Blue)
- **Interactive & Accents**: `#3978E8` (Blue)
- **Highlights & Borders**: `#BBD9FF` (Ice Blue)
- **Background & Canvas**: `#F3F7FC` (Cloud)
- **Important Actions & CTAs**: `#FFC66B` (Amber)

---

## 🚀 Quick Start (Running Both Services Locally)

### 1. Launch the FastAPI Backend (Port 8000)
```bash
cd backend
PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Swagger OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Launch the SkillAura Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Verification of the Real Commit-to-Career Loop

1. Open [http://localhost:3000](http://localhost:3000).
2. Notice `sql_query_writing` is initially marked **"Not Demonstrated in Reviewed Scope"** (Version 1.0).
3. Click the amber **"⚡ Push SQL Demo"** button in the Navbar or Hero.
4. The backend change processor inspects the new `database/queries.sql` via `sqlglot`, registers the verified JOIN and parameterization evidence, promotes `sql_query_writing` to **"Demonstrated"**, and advances the assessment to **v2.0**.
5. Switch to the **Impact Map** or **Judge Proof Dossier** to see the live diff and audit records.
6. Click **"Test Downgrade"** to simulate code deletion and verify that the system honestly downgrades the status back.
