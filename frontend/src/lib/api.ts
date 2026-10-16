import {
  Assessment,
  Job,
  Repository,
  ChangeEvent,
  AssessmentHistoryEntry,
  GapTask
} from './types';

const API_BASE = ''; // empty string proxies via Vite to http://localhost:8000

export async function checkBackendHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchCurrentUser(): Promise<{ id: string; email: string; display_name: string }> {
  const res = await fetch(`${API_BASE}/api/me`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/api/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function importJob(url: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to import job listing');
  }
  return res.json();
}

export async function fetchRepositories(): Promise<{ repositories: Repository[] }> {
  const res = await fetch(`${API_BASE}/api/github/repos`);
  if (!res.ok) throw new Error('Failed to fetch repositories');
  return res.json();
}

export async function fetchAssessment(id: string): Promise<Assessment> {
  const res = await fetch(`${API_BASE}/api/assessments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch assessment');
  return res.json();
}

export async function fetchAssessmentHistory(id: string): Promise<{ versions: AssessmentHistoryEntry[] }> {
  const res = await fetch(`${API_BASE}/api/assessments/${id}/history`);
  if (!res.ok) throw new Error('Failed to fetch assessment history');
  return res.json();
}

export async function fetchEvents(assessmentId?: string): Promise<{ events: ChangeEvent[] }> {
  const url = assessmentId ? `${API_BASE}/api/events?assessment_id=${assessmentId}` : `${API_BASE}/api/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch change events');
  return res.json();
}

export async function fetchImpactMap(assessmentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/impact`);
  if (!res.ok) throw new Error('Failed to fetch impact map');
  return res.json();
}

export async function fetchPassport(assessmentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/passport`);
  if (!res.ok) throw new Error('Failed to fetch passport');
  return res.json();
}

export async function fetchGapTasks(assessmentId: string): Promise<{ tasks: GapTask[] }> {
  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/gap-tasks`);
  if (!res.ok) throw new Error('Failed to fetch gap tasks');
  return res.json();
}

export async function startCodeDefense(assessmentId: string, evidenceId?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/code-defense/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment_id: assessmentId, evidence_id: evidenceId }),
  });
  if (!res.ok) throw new Error('Failed to start code defense session');
  return res.json();
}

export async function submitCodeDefenseAnswer(sessionId: string, answer: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/code-defense/sessions/${sessionId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: 'q1', answer }),
  });
  if (!res.ok) throw new Error('Failed to submit defense answer');
  return res.json();
}

export async function fetchSkillMap(assessmentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/skill-map`);
  if (!res.ok) throw new Error('Failed to fetch skill map');
  return res.json();
}

export async function simulatePush(
  repoId: string,
  action: 'add_sql' | 'delete_sql',
  commitMessage?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/demo/simulate-push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repository_id: repoId,
      action,
      commit_message: commitMessage,
    }),
  });
  if (!res.ok) throw new Error('Failed to simulate push');
  return res.json();
}

export async function fetchCoachDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/coach/dataset`);
  if (!res.ok) throw new Error('Failed to fetch coach dataset');
  return res.json();
}

export async function fetchCoachAnalysis(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/coach/analysis`);
  if (!res.ok) throw new Error('Failed to fetch coach analysis');
  return res.json();
}

export async function askCareerCoach(query: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/coach/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to query career coach');
  return res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}


