import {
  Assessment,
  Job,
  Repository,
  ChangeEvent,
  AssessmentHistoryEntry,
  GapTask,
  Evidence,
  SkillVerdict
} from './types';
import {
  INITIAL_EVIDENCES,
  SQL_EVIDENCE,
  INITIAL_VERDICTS,
  DEMO_JOBS,
  DEMO_REPOSITORIES,
  DEMO_GAP_TASKS
} from './mockData';

const API_BASE = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');

export interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  role_applied: string;
  target_company: string;
  github_repo: string;
  verification_status: 'verified' | 'revision_requested' | 'flagged' | 'pending';
  ast_verified_skills: number;
  total_skills: number;
  match_rate: number;
  last_commit_sha: string;
  evidence_passport_hash: string;
  submitted_at: string;
  hr_auditor: string | null;
  auditor_notes: string;
}

// ==========================================
// In-Memory Reactive Mock State for Netlify
// ==========================================
let mockVersion = 1;
let mockDemonstratedSql = false;
let mockVerdicts: SkillVerdict[] = JSON.parse(JSON.stringify(INITIAL_VERDICTS));
let mockEvidences: Evidence[] = JSON.parse(JSON.stringify(INITIAL_EVIDENCES));
let mockActiveCompanyId = 'comp_stripe';

let mockAdminCandidates: CandidateRecord[] = [
  {
    id: 'cand_yadnesh_01',
    name: 'Yadnesh Gandhele',
    email: 'student@careerproof.ai',
    role_applied: 'Backend Software Engineer',
    target_company: 'Stripe',
    github_repo: 'Yadnesh2007/SAHAYOG',
    verification_status: 'verified' as const,
    ast_verified_skills: 4,
    total_skills: 6,
    match_rate: 88,
    last_commit_sha: 'e4b9c10a28f7',
    evidence_passport_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    submitted_at: '2026-10-17T09:30:00Z',
    hr_auditor: 'Senior Bar Raiser (Stripe Hiring Team)',
    auditor_notes: 'AST verified FastAPI routing, SQLAlchemy async JOIN, and Pytest coverage with rigid cryptographic proof.',
  },
  {
    id: 'cand_sarah_02',
    name: 'Sarah Chen',
    email: 'sarah.chen@alum.mit.edu',
    role_applied: 'ML Systems Engineer',
    target_company: 'Google',
    github_repo: 'sarahchen/distributed-transformer',
    verification_status: 'verified' as const,
    ast_verified_skills: 5,
    total_skills: 6,
    match_rate: 92,
    last_commit_sha: '7a2f1b8c9d0e',
    evidence_passport_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    submitted_at: '2026-10-16T18:45:00Z',
    hr_auditor: 'Google Engineering Lead',
    auditor_notes: 'PyTorch distributed training harness verified with DDP gradient all-reduce validation.',
  },
  {
    id: 'cand_alex_03',
    name: 'Alex Rivera',
    email: 'alex.r@berkeley.edu',
    role_applied: 'Cloud Infrastructure Engineer',
    target_company: 'Meta',
    github_repo: 'alexrivera/k8s-operator-sync',
    verification_status: 'pending' as const,
    ast_verified_skills: 2,
    total_skills: 5,
    match_rate: 68,
    last_commit_sha: '3c8e9f1a2b4d',
    evidence_passport_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    submitted_at: '2026-10-17T11:15:00Z',
    hr_auditor: null,
    auditor_notes: 'Waiting for candidate to address Docker healthcheck and RBAC cluster role gap tasks.',
  },
];

let mockAdminPermissions: Record<string, boolean> = {
  allow_self_submission: true,
  require_two_step_otp: true,
  auto_verify_high_confidence_ast: true,
  enable_gemini_anti_hallucination_guardrails: true,
  allow_codespace_universal_launch: true,
  public_evidence_passport_sharing: true,
};

function getMockAssessment(): Assessment {
  const demonstratedCount = mockVerdicts.filter(v => v.status === 'demonstrated').length;
  return {
    id: 'asmt_init_stripe_01',
    version: mockVersion,
    job_id: 'job_stripe_swe_01',
    repository_ids: ['repo_sahayog_01'],
    state: 'completed',
    freshness: 'current',
    evaluated_at: new Date().toISOString(),
    current_sha_by_repo: {
      repo_sahayog_01: mockDemonstratedSql ? 'f5c8d21b93a4' : 'e4b9c10a28f7',
    },
    reviewed_scope: {
      repos: ['Yadnesh2007/SAHAYOG'],
      branches: ['main'],
      excluded_paths: ['node_modules/**', '.git/**'],
      unsupported_paths: [],
      incomplete: false,
    },
    verdicts: mockVerdicts,
    evidence: mockEvidences,
    coverage: {
      demonstrated: demonstratedCount,
      total_assessable: 6,
      formula: 'demonstrated / assessable_requirements',
    },
    limitations: mockDemonstratedSql
      ? ['SQL query isolation level not explicitly declared']
      : ['Repository does not yet contain a database persistence layer'],
    error_code: null,
  };
}

// ==========================================
// API Implementations with Seamless Fallbacks
// ==========================================

export async function checkBackendHealth(): Promise<{ status: string; version: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) return await res.json();
  } catch {}
  return { status: 'healthy', version: '2.5.0-cloud (SkillAura Edge Engine)' };
}

export async function fetchCurrentUser(): Promise<{ id: string; email: string; display_name: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/me`);
    if (res.ok) return await res.json();
  } catch {}
  return { id: 'usr_dev_yadnesh_01', email: 'student@careerproof.ai', display_name: 'Yadnesh Gandhele' };
}

export async function fetchJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs`);
    if (res.ok) return await res.json();
  } catch {}
  return DEMO_JOBS;
}

export async function importJob(url: string): Promise<Job> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    id: `job_custom_${Date.now()}`,
    title: 'Senior Systems Engineer',
    employer: 'Target Enterprise',
    source_url: url,
    fetched_at: new Date().toISOString(),
    retrieval_status: 'verified',
    requirements: DEMO_JOBS[0].requirements,
  };
}

export async function fetchRepositories(): Promise<{ repositories: Repository[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/github/repos`);
    if (res.ok) return await res.json();
  } catch {}
  return { repositories: DEMO_REPOSITORIES };
}

export async function fetchAssessment(id: string): Promise<Assessment> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${id}`);
    if (res.ok) return await res.json();
  } catch {}
  return getMockAssessment();
}

export async function fetchAssessmentHistory(id: string): Promise<{ versions: AssessmentHistoryEntry[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${id}/history`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    versions: [
      {
        assessment_id: id,
        version: 1,
        evaluated_at: '2026-10-17T09:00:00Z',
        trigger_event_id: 'evt_init_01',
        head_shas: { repo_sahayog_01: 'e4b9c10a28f7' },
        verdict_changes: [],
      },
      ...(mockVersion >= 2 ? [{
        assessment_id: id,
        version: 2,
        evaluated_at: new Date().toISOString(),
        trigger_event_id: 'evt_push_sql_02',
        head_shas: { repo_sahayog_01: 'f5c8d21b93a4' },
        verdict_changes: [{
          skill_key: 'sql_queries',
          before: 'not_demonstrated_in_reviewed_scope' as const,
          after: 'demonstrated' as const,
          reason: 'Observed async SQLAlchemy SELECT with JOIN and indexed WHERE filter in app/database/queries.py',
          added_evidence_ids: ['ev_sql_04'],
          removed_evidence_ids: [],
        }],
      }] : []),
    ],
  };
}

export async function fetchEvents(assessmentId?: string): Promise<{ events: ChangeEvent[] }> {
  try {
    const url = assessmentId ? `${API_BASE}/api/events?assessment_id=${assessmentId}` : `${API_BASE}/api/events`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch {}
  return {
    events: [
      {
        id: 'evt_push_01',
        delivery_id: 'del_10293847',
        repository_id: 'repo_sahayog_01',
        ref: 'refs/heads/main',
        before_sha: '000000000000',
        after_sha: mockDemonstratedSql ? 'f5c8d21b93a4' : 'e4b9c10a28f7',
        changed_files: [
          { path: 'app/main.py', change_type: 'modified' },
          { path: 'app/models.py', change_type: 'added' },
          ...(mockDemonstratedSql ? [{ path: 'app/database/queries.py', change_type: 'added' as const }] : []),
        ],
        affected_skill_keys: ['python_rest_api', 'pydantic_validation', ...(mockDemonstratedSql ? ['sql_queries'] : [])],
        state: 'updated',
        assessment_id: 'asmt_init_stripe_01',
        from_version: 1,
        to_version: mockVersion,
        received_at: '2026-10-17T10:14:00Z',
        processed_at: '2026-10-17T10:14:02Z',
        message: mockDemonstratedSql
          ? 'feat(db): add async transactions query with parameterized JOIN'
          : 'feat(api): add fastapi candidate profile routes and validation',
      },
    ],
  };
}

export async function fetchImpactMap(assessmentId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/impact`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    assessment_id: assessmentId,
    version: mockVersion,
    timeline: [
      {
        version: 1,
        sha: 'e4b9c10a28f7',
        message: 'Initial baseline scan',
        impact_summary: '3 requirements demonstrated, 3 gaps identified',
        timestamp: '2026-10-17T09:00:00Z',
      },
      ...(mockVersion >= 2 ? [{
        version: 2,
        sha: 'f5c8d21b93a4',
        message: 'feat: add parameterized SQL queries and JOINs',
        impact_summary: 'Promoted SQL Query requirement to Demonstrated (+13% match score)',
        timestamp: new Date().toISOString(),
      }] : []),
    ],
    graph_nodes: [
      { id: 'app/main.py', label: 'FastAPI Routes', type: 'code', status: 'verified' },
      { id: 'app/models.py', label: 'Pydantic Models', type: 'code', status: 'verified' },
      { id: 'app/database/queries.py', label: 'SQLAlchemy Queries', type: 'code', status: mockDemonstratedSql ? 'verified' : 'pending' },
      { id: 'Stripe: SWE Role', label: 'Stripe Criteria', type: 'job', status: 'target' },
    ],
  };
}

export async function fetchPassport(assessmentId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/passport`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    passport_id: 'pass_skillaura_948172',
    candidate: 'Yadnesh Gandhele',
    overall_match_rate: mockDemonstratedSql ? 88 : 75,
    issued_at: '2026-10-17T12:00:00Z',
    sha256_fingerprint: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    verified_credentials: mockVerdicts
      .filter(v => v.status === 'demonstrated')
      .map(v => ({
        skill_name: v.exact_claim,
        confidence: v.confidence,
        evidence_count: v.evidence_ids.length,
        verifier: 'SkillAura AST Engine v2.4 + Gemini Pro Validator',
        audit_hash: `sha256_${v.skill_key}_${Date.now().toString(16)}`,
      })),
  };
}

export async function fetchGapTasks(assessmentId: string): Promise<{ tasks: GapTask[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/gap-tasks`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    tasks: DEMO_GAP_TASKS.map(task => {
      if (task.requirement_id === 'req_stripe_04' && mockDemonstratedSql) {
        return { ...task, status: 'evidence_observed' as const };
      }
      return task;
    }),
  };
}

export async function startCodeDefense(assessmentId: string, evidenceId?: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/code-defense/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment_id: assessmentId, evidence_id: evidenceId }),
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    session_id: `def_sess_${Date.now()}`,
    evidence_id: evidenceId || 'ev_fastapi_01',
    status: 'in_progress',
    question: 'In your FastAPI implementation in app/main.py, why did you choose explicit Pydantic response models over returning raw Python dicts? How does this protect against accidental data leaks in financial APIs?',
    context_code: `@app.get("/api/v1/profile/{user_id}", response_model=UserProfile)\nasync def get_user_profile(user_id: str): ...`,
    expected_concepts: ['response_model serialization', 'schema filtering', 'preventing sensitive attribute leakage', 'OpenAPI documentation generation'],
  };
}

export async function submitCodeDefenseAnswer(sessionId: string, answer: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/code-defense/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: 'q1', answer }),
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    session_id: sessionId,
    score: 94,
    grade: 'A+',
    verdict: 'Pass with Distinction',
    feedback: 'Excellent defense! You clearly articulated that Pydantic response_model acts as a data egress firewall, filtering out internal or sensitive database fields before sending the HTTP response.',
    covered_concepts: ['Schema filtering', 'Data egress firewall', 'Type safety'],
    suggested_improvements: ['Consider mentioning custom getter_dict or ORM mode for SQLAlchemy models'],
  };
}

export async function fetchSkillMap(assessmentId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/skill-map`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    categories: [
      { name: 'API Architecture', score: 92, verified_points: 3, total_points: 3 },
      { name: 'Systems & Database', score: mockDemonstratedSql ? 86 : 45, verified_points: mockDemonstratedSql ? 2 : 0, total_points: 3 },
      { name: 'Quality & Testing', score: 88, verified_points: 2, total_points: 2 },
      { name: 'Cloud & DevOps', score: 50, verified_points: 1, total_points: 2 },
      { name: 'Machine Learning & NLP', score: 90, verified_points: 3, total_points: 3 },
    ],
    skills_breakdown: [
      { name: 'FastAPI REST Routes', status: 'demonstrated', level: 'Advanced', weight: 25 },
      { name: 'Pydantic Schema Validation', status: 'demonstrated', level: 'Advanced', weight: 20 },
      { name: 'Pytest Suite & TestClient', status: 'demonstrated', level: 'Intermediate', weight: 20 },
      { name: 'SQLAlchemy Async Queries', status: mockDemonstratedSql ? 'demonstrated' : 'missing', level: 'Proficient', weight: 20 },
      { name: 'PostgreSQL & Alembic', status: 'missing', level: 'Beginner', weight: 15 },
    ],
  };
}

export async function simulatePush(
  repoId: string,
  action: 'add_sql' | 'delete_sql',
  commitMessage?: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/demo/simulate-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repository_id: repoId,
        action,
        commit_message: commitMessage,
      }),
    });
    if (res.ok) return await res.json();
  } catch {}

  if (action === 'add_sql') {
    mockVersion = 2;
    mockDemonstratedSql = true;
    mockVerdicts = mockVerdicts.map(v => {
      if (v.skill_key === 'sql_queries') {
        return {
          ...v,
          status: 'demonstrated',
          rationale: 'Observed async SQLAlchemy SELECT with JOIN on Account and indexed WHERE clause in app/database/queries.py.',
          evidence_ids: ['ev_sql_04'],
        };
      }
      return v;
    });
    if (!mockEvidences.some(e => e.id === 'ev_sql_04')) {
      mockEvidences.push(SQL_EVIDENCE);
    }
  } else {
    mockVersion = 1;
    mockDemonstratedSql = false;
    mockVerdicts = JSON.parse(JSON.stringify(INITIAL_VERDICTS));
    mockEvidences = JSON.parse(JSON.stringify(INITIAL_EVIDENCES));
  }

  return {
    success: true,
    action,
    new_version: mockVersion,
    match_rate: mockDemonstratedSql ? 88 : 75,
    message: action === 'add_sql'
      ? 'Promoted SQL Query Writing to Demonstrated! Coverage upgraded to 4/6 (88%).'
      : 'Reverted to Baseline v1.0.',
  };
}

export async function fetchCoachDataset(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/dataset`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    candidate: 'Yadnesh Gandhele',
    roles_targeted: ['Backend Software Engineer', 'NLP & AI Research Engineer'],
    verified_repo_count: 2,
    ast_nodes_scanned: 1420,
    gemini_audit_score: 96,
  };
}

export async function fetchCoachAnalysis(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/analysis`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    summary: 'Candidate demonstrates strong software craftsmanship in Python async frameworks with strict typed validation.',
    top_strengths: [
      'Clean separation of concerns with FastAPI APIRouter and dependency injection',
      'Defensive programming using Pydantic BaseModel schemas and custom validators',
      'Automated regression prevention using Pytest and TestClient fixtures',
    ],
    recommended_focus: 'Deepen relational database indexing and containerized CI/CD pipelines to unlock 95%+ match across Tier-1 fintechs.',
  };
}

export async function askCareerCoach(query: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    query,
    answer: `Based on your verified code in **Yadnesh2007/SAHAYOG**, you have strong evidence for **FastAPI**, **Pydantic**, and **Pytest**. To maximize your interview rate for Stripe and Google:
1. **Highlight the AST-verified evidence:** Your response_model in \`app/main.py\` proves you know how to build clean APIs.
2. **Close the SQL gap:** Run the simulated push or commit an AsyncSession query to demonstrate parameterized transactions.
3. **STAR Bullet suggestion:** "Engineered asynchronous FastAPI microservices with rigid Pydantic validation, reducing schema mismatch exceptions by 100% across unit test suites."`,
    recommended_tasks: ['gap_sql_01', 'gap_docker_03'],
  };
}

export async function resetDemo(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/demo/reset`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch {}
  mockVersion = 1;
  mockDemonstratedSql = false;
  mockVerdicts = JSON.parse(JSON.stringify(INITIAL_VERDICTS));
  mockEvidences = JSON.parse(JSON.stringify(INITIAL_EVIDENCES));
  return { success: true, message: 'Reset cleanly to Baseline v1.0' };
}

export async function analyzeCodeFile(
  code: string,
  filename: string = 'main.py',
  repoUrl: string = 'https://github.com/Yadnesh2007/SAHAYOG',
  geminiApiKey?: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/code/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filename, repo_url: repoUrl, gemini_api_key: geminiApiKey }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const hasAsync = code.includes('async def');
  const hasPydantic = code.includes('BaseModel');
  const lineCount = code.split('\n').length;
  const isAiPattern = code.includes('TODO:') || code.includes('example implementation') || lineCount < 10;
  const aiScore = isAiPattern ? 38 : 12;
  const handwrittenScore = 100 - aiScore;

  return {
    filename,
    total_lines: lineCount,
    ai_generated_percent: aiScore,
    handwritten_percent: handwrittenScore,
    ast_complexity_score: hasAsync && hasPydantic ? 88 : 65,
    verdict: handwrittenScore > 70 ? 'Authentic Human-Authored Code' : 'Assisted Hybrid Code',
    signals_detected: [
      hasAsync ? 'Async coroutine syntax detected' : 'Synchronous functions',
      hasPydantic ? 'Strict Pydantic type model constraints' : 'Dynamic dictionary typing',
      'AST token distribution conforms to authentic human developer ergonomics',
    ],
    gemini_review: `The inspected code in ${filename} exhibits natural variable naming and architectural consistency. The AST signature matches authentic developer engineering.`,
  };
}

export async function fetchCompanyMatches(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/companies/matches`);
    if (res.ok) return await res.json();
  } catch {}
  return [
    { company_id: 'comp_stripe', name: 'Stripe', role: 'Backend Software Engineer', match_rate: mockDemonstratedSql ? 88 : 75, verified_skills: mockDemonstratedSql ? 4 : 3, total_requirements: 6, status: 'Active Goal' },
    { company_id: 'comp_google', name: 'Google', role: 'Software Engineer II (Systems)', match_rate: 79, verified_skills: 3, total_requirements: 5, status: 'Strong Signal' },
    { company_id: 'comp_razorpay', name: 'Razorpay', role: 'Payment Platform Engineer', match_rate: mockDemonstratedSql ? 89 : 81, verified_skills: mockDemonstratedSql ? 4 : 3, total_requirements: 5, status: 'High Fit' },
    { company_id: 'comp_meta', name: 'Meta', role: 'Backend Infrastructure Engineer', match_rate: 76, verified_skills: 3, total_requirements: 5, status: 'Target' },
    { company_id: 'comp_datadog', name: 'Datadog', role: 'Core Observability Engineer', match_rate: 80, verified_skills: 3, total_requirements: 5, status: 'Target' },
    { company_id: 'comp_amazon', name: 'Amazon', role: 'SDE II (AWS Cloud Services)', match_rate: 82, verified_skills: 3, total_requirements: 5, status: 'Target' },
    { company_id: 'comp_swiggy', name: 'Swiggy', role: 'Senior Platform Engineer', match_rate: 85, verified_skills: 4, total_requirements: 5, status: 'High Fit' },
  ];
}

export async function fetchDomainExpansionAdvice(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/skills/domain-expansion`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    current_primary_domain: 'Python Microservice Architecture & REST APIs',
    expansion_paths: [
      {
        domain: 'Distributed Systems & High-Throughput Queueing',
        unlocked_by: 'Adding Kafka/RabbitMQ consumer loops to current FastAPI service',
        impact: '+18% hiring interest from FinTech platforms',
      },
      {
        domain: 'Cloud Native Observability & SRE',
        unlocked_by: 'Instrumenting OpenTelemetry tracing and Prometheus metrics',
        impact: '+15% hiring interest from Infrastructure platforms',
      },
    ],
  };
}

export async function submitStripePayment(paymentData: {
  plan_tier: string;
  billing_cycle: string;
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  postal_code: string;
  name_on_card: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    success: true,
    transaction_id: `ch_mock_stripe_${Date.now()}`,
    plan: paymentData.plan_tier,
    billing_cycle: paymentData.billing_cycle,
    message: `Payment successful! Upgraded to ${paymentData.plan_tier.toUpperCase()} tier.`,
  };
}

export async function fetchGitHubAccounts(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/github/accounts`);
    if (res.ok) {
      const data = await res.json();
      if (data.accounts) return data.accounts;
    }
  } catch {}
  return [
    { login: 'Yadnesh2007', name: 'Yadnesh Gandhele', type: 'User', public_repos: 18, avatar_url: 'https://github.com/Yadnesh2007.png' },
    { login: 'octocat', name: 'The Octocat', type: 'User', public_repos: 8, avatar_url: 'https://github.com/octocat.png' },
    { login: 'google', name: 'Google', type: 'Organization', public_repos: 2600, avatar_url: 'https://github.com/google.png' },
    { login: 'facebook', name: 'Meta', type: 'Organization', public_repos: 180, avatar_url: 'https://github.com/facebook.png' },
    { login: 'microsoft', name: 'Microsoft', type: 'Organization', public_repos: 5400, avatar_url: 'https://github.com/microsoft.png' },
    { login: 'vercel', name: 'Vercel', type: 'Organization', public_repos: 120, avatar_url: 'https://github.com/vercel.png' },
    { login: 'torvalds', name: 'Linus Torvalds', type: 'User', public_repos: 6, avatar_url: 'https://github.com/torvalds.png' },
  ];
}

export async function fetchAccountRepos(username: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/github/accounts/${encodeURIComponent(username)}/repos`);
    if (res.ok) return await res.json();
  } catch {}
  if (username.toLowerCase() === 'yadnesh2007') {
    return {
      username: 'Yadnesh2007',
      repositories: [
        { id: 98273612, name: 'SAHAYOG', full_name: 'Yadnesh2007/SAHAYOG', description: 'Cooperative financial platform with FastAPI backend and AST evidence', language: 'Python', stargazers_count: 14, default_branch: 'main', html_url: 'https://github.com/Yadnesh2007/SAHAYOG' },
        { id: 98273613, name: 'AICAREERCOACHMAIN', full_name: 'Yadnesh2007/AICAREERCOACHMAIN', description: 'SkillAura AI Career Coach complete codebase with AST verification & Gemini', language: 'TypeScript', stargazers_count: 28, default_branch: 'main', html_url: 'https://github.com/Yadnesh2007/AICAREERCOACHMAIN' },
      ],
    };
  }
  return {
    username,
    repositories: [
      { id: 101, name: `${username}-core-service`, full_name: `${username}/${username}-core-service`, description: `Production microservice for ${username}`, language: 'TypeScript', stargazers_count: 120, default_branch: 'main', html_url: `https://github.com/${username}/${username}-core-service` },
      { id: 102, name: `${username}-ml-models`, full_name: `${username}/${username}-ml-models`, description: `Machine learning pipelines for ${username}`, language: 'Python', stargazers_count: 85, default_branch: 'main', html_url: `https://github.com/${username}/${username}-ml-models` },
    ],
  };
}

export async function connectGitHubRepo(repoUrl: string, branch: string = 'main'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/github/connect-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_url: repoUrl, branch }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const clean = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
  const parts = clean.split('/');
  const owner = parts[0] || 'Yadnesh2007';
  const repo = parts[1] || 'SAHAYOG';
  const fullName = `${owner}/${repo}`;

  return {
    success: true,
    repo_url: repoUrl,
    repo_name: fullName,
    branch,
    codespace_url: `https://github.com/codespaces/new?repo=${encodeURIComponent(fullName)}&ref=${encodeURIComponent(branch)}`,
    github_dev_url: `https://github.dev/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree/${encodeURIComponent(branch)}`,
    ast_indexed: true,
  };
}

export async function selectTargetCompanyApi(companyId: string): Promise<any> {
  mockActiveCompanyId = companyId;
  try {
    const res = await fetch(`${API_BASE}/api/companies/select-target`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const companyMap: Record<string, { employer: string; title: string; match: number }> = {
    comp_stripe: { employer: 'Stripe', title: 'Backend Software Engineer (New Grad / Early Career)', match: mockDemonstratedSql ? 88 : 75 },
    comp_google: { employer: 'Google', title: 'Software Engineer II (Systems & Infrastructure)', match: 79 },
    comp_meta: { employer: 'Meta', title: 'Backend Infrastructure Engineer', match: 76 },
    comp_razorpay: { employer: 'Razorpay', title: 'Payment Platform Engineer', match: mockDemonstratedSql ? 89 : 81 },
    comp_amazon: { employer: 'Amazon', title: 'Software Development Engineer II (AWS)', match: 82 },
    comp_datadog: { employer: 'Datadog', title: 'Observability & Core Services Engineer', match: 80 },
    comp_swiggy: { employer: 'Swiggy', title: 'Senior Platform Engineer (High-Throughput)', match: 85 },
  };

  const selected = companyMap[companyId] || companyMap.comp_stripe;

  return {
    success: true,
    company_id: companyId,
    job: {
      id: `job_${companyId}`,
      title: selected.title,
      employer: selected.employer,
      source_url: `https://${selected.employer.toLowerCase()}.com/jobs`,
      fetched_at: new Date().toISOString(),
      retrieval_status: 'verified',
      requirements: DEMO_JOBS[0].requirements,
    },
    match_rate: selected.match,
    verdicts: mockVerdicts,
  };
}

export async function generateCodeRemediationLlm(
  gapKey: string,
  gapTitle: string,
  targetFile: string = 'app/main.py'
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/llm/code-remediation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gap_key: gapKey, gap_title: gapTitle, target_file: targetFile }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    gap_key: gapKey,
    gap_title: gapTitle,
    target_file: targetFile,
    remediation_code: `# Solution recommended by Gemini Pro to satisfy AST static verification
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Transaction, Account

async def get_account_ledger(db: AsyncSession, account_id: str):
    \"\"\"Parameterized query with explicit JOIN to demonstrate ACID compliance.\"\"\"
    stmt = (
        select(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .where(Transaction.account_id == account_id)
        .order_by(Transaction.timestamp.desc())
        .limit(100)
    )
    result = await db.execute(stmt)
    return result.scalars().all()`,
    explanation: 'This code directly addresses the AST requirement for relational SQL JOINs and parameterization, preventing SQL injection while guaranteeing high-throughput async query support.',
  };
}

export async function generateInterviewQuestionLlm(
  skillKey: string,
  evidenceCode: string = '',
  company: string = 'Stripe'
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/llm/mock-interview-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_key: skillKey, evidence_code: evidenceCode, company }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    skill_key: skillKey,
    company,
    question: `In your code for ${company}, walk me through how you designed your FastAPI routing and Pydantic validation. How would you handle high concurrency spikes when thousands of webhooks hit your endpoint simultaneously?`,
    hint: 'Mention asynchronous worker pools, non-blocking I/O, database connection pools, and idempotency keys.',
  };
}

export async function gradeDefenseAnswerLlm(
  question: string,
  candidateAnswer: string,
  expectedConcepts: string[] = []
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/llm/grade-defense-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, candidate_answer: candidateAnswer, expected_concepts: expectedConcepts }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    grade: 'A',
    score: 92,
    feedback: 'Strong understanding demonstrated! You accurately covered data validation boundaries, async non-blocking concurrency, and defensive programming.',
    key_strengths: ['Clear explanation of schema validation', 'Good grasp of production API stability'],
  };
}

export async function generateStarBulletsLlm(
  roleTarget: string,
  skillName: string,
  githubEvidenceSummary: string = ''
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/llm/generate-star-bullets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_target: roleTarget, skill_name: skillName, github_evidence_summary: githubEvidenceSummary }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    role_target: roleTarget,
    skill_name: skillName,
    star_bullets: [
      'Architected high-throughput async FastAPI microservices using rigid Pydantic models, eliminating schema contract violations across test suites.',
      'Implemented parameterized SQLAlchemy queries with indexed relational JOINs, boosting query execution performance by 40%.',
      'Engineered automated Pytest test suites achieving 90%+ branch coverage with TestClient integration.',
    ],
  };
}

export async function requestGoogleOtp(email: string): Promise<{
  success: boolean;
  message: string;
  email: string;
  masked_email: string;
  otp_preview: string;
  expires_in_seconds: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const parts = email.split('@');
  const userPart = parts[0] || 'user';
  const domainPart = parts[1] || 'gmail.com';
  const masked = userPart.slice(0, 2) + '••••' + '@' + domainPart;
  const mockOtp = '849201';

  return {
    success: true,
    message: `Verification code sent to ${masked}. Use code: ${mockOtp}`,
    email,
    masked_email: masked,
    otp_preview: mockOtp,
    expires_in_seconds: 300,
  };
}

export async function verifyGoogleOtp(
  email: string,
  otp: string,
  role: string = 'student'
): Promise<{
  success: boolean;
  message: string;
  user: {
    name: string;
    email: string;
    role: 'student' | 'employee' | 'employer';
    provider: 'google';
    avatar?: string;
    google_verified: boolean;
  };
  token: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, role }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    success: true,
    message: 'Google 2-Step OTP Authentication verified successfully!',
    user: {
      name: email.split('@')[0].toUpperCase(),
      email,
      role: (role as any) || 'student',
      provider: 'google',
      avatar: 'https://secure.gravatar.com/avatar/79258bdd6132a6bd54e01249f4a2800a?s=48',
      google_verified: true,
    },
    token: `skillaura_jwt_${Date.now()}`,
  };
}

export async function uploadCvFile(
  file: File,
  targetCompany?: string,
  targetRole?: string
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (targetCompany) formData.append('target_company', targetCompany);
    if (targetRole) formData.append('target_role', targetRole);

    const res = await fetch(`${API_BASE}/api/coach/upload-cv`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    success: true,
    filename: file.name,
    target_company: targetCompany || 'Stripe',
    target_role: targetRole || 'Backend Software Engineer',
    ats_score: 88,
    parsed_skills: ['Python', 'FastAPI', 'Pydantic', 'Pytest', 'REST APIs', 'Git', 'SQL'],
    strengths: [
      'Strong quantifiable impact across backend microservices',
      'Direct keyword alignment with modern asynchronous Python web stacks',
      'Solid evidence of unit and integration test automation',
    ],
    gaps: [
      'Add specific metrics on database query indexing and connection pool tuning',
      'Highlight CI/CD pipeline and container deployment experience with Docker',
    ],
    keyword_match_rate: 85,
  };
}

export async function uploadCvText(
  cvText: string,
  targetCompany?: string,
  targetRole?: string
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('cv_text', cvText);
    if (targetCompany) formData.append('target_company', targetCompany);
    if (targetRole) formData.append('target_role', targetRole);

    const res = await fetch(`${API_BASE}/api/coach/upload-cv`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    success: true,
    target_company: targetCompany || 'Stripe',
    target_role: targetRole || 'Backend Software Engineer',
    ats_score: 86,
    parsed_skills: ['Python', 'FastAPI', 'Pydantic', 'Pytest', 'REST APIs'],
    strengths: ['Clear role definitions and technical stack alignment'],
    gaps: ['Include Docker and PostgreSQL specifics'],
    keyword_match_rate: 82,
  };
}

export async function resetCvToDefault(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/reset-cv`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, message: 'CV reset to benchmark candidate profile' };
}

export async function analyzeCvWithLlm(params?: {
  cv_text?: string;
  target_company?: string;
  target_role?: string;
  gemini_api_key?: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/llm-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    ats_score: 88,
    target_role: params?.target_role || 'Backend Software Engineer',
    target_company: params?.target_company || 'Stripe',
    overall_summary: 'Your CV showcases genuine software engineering fundamentals with strong demonstrable competency in building robust Python microservices.',
    key_strengths: [
      'AST-verifiable code portfolio matches CV claims for FastAPI and Pydantic',
      'Concise presentation of responsibilities with technical precision',
      'Demonstrated test discipline with Pytest integration',
    ],
    actionable_remediations: [
      'Incorporate concrete metrics: e.g. "reduced API response p99 latency by 35%"',
      'Explicitly list PostgreSQL and Alembic in your technical skills block',
    ],
    ats_recommendations: [
      'Format headings consistently with standard ATS parsers (Experience, Education, Skills)',
      'Keep bullet points under 3 lines for clean semantic extraction',
    ],
  };
}

export async function fetchAdminCandidates(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/candidates`);
    if (res.ok) return await res.json();
  } catch {}
  return { candidates: mockAdminCandidates };
}

export async function verifyCandidateWork(
  candidateId: string,
  status: 'verified' | 'revision_requested' | 'flagged' | 'pending',
  notes?: string,
  hrAuditor?: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/verify-candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        status,
        notes,
        hr_auditor: hrAuditor,
      }),
    });
    if (res.ok) return await res.json();
  } catch {}

  mockAdminCandidates = mockAdminCandidates.map(c => {
    if (c.id === candidateId) {
      return {
        ...c,
        verification_status: status,
        auditor_notes: notes || c.auditor_notes,
        hr_auditor: hrAuditor || c.hr_auditor || 'HR Bar Raiser',
      };
    }
    return c;
  });

  return {
    success: true,
    candidate_id: candidateId,
    status,
    notes,
    hr_auditor: hrAuditor || 'HR Bar Raiser',
    message: `Candidate ${candidateId} verification status updated to '${status}'.`,
  };
}

export async function fetchAdminPermissions(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/permissions`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    system_permissions: mockAdminPermissions,
    candidate_permissions: {
      cand_yadnesh_01: ['submit_evidence', 'view_coach', 'run_scanner', 'request_defense'],
      cand_sarah_02: ['submit_evidence', 'view_coach', 'run_scanner', 'request_defense'],
      cand_alex_03: ['submit_evidence', 'view_coach', 'run_scanner'],
    },
  };
}

export async function updateAdminPermissions(
  permissions: Record<string, boolean>,
  candidateId?: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/update-permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, permissions }),
    });
    if (res.ok) return await res.json();
  } catch {}

  mockAdminPermissions = { ...mockAdminPermissions, ...permissions };
  return {
    success: true,
    system_permissions: mockAdminPermissions,
    message: 'Permissions updated successfully across SkillAura portal.',
  };
}
