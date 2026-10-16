import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  GitCommit,
  Sparkles,
  Zap,
  ListTodo,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Github,
} from 'lucide-react';
import { fetchGapTasks } from '../lib/api';
import { GapTask } from '../lib/types';

interface GapLabProps {
  assessmentId: string;
  onSimulatePush: (action: 'add_sql' | 'delete_sql') => void;
  isSimulating: boolean;
}

const STARTER_SNIPPETS: Record<string, string> = {
  gap_sql_01: `-- database/queries.sql: Parameterized Relational Placement Matching
SELECT 
    s.id AS student_id,
    s.full_name,
    j.title AS job_title,
    j.employer,
    COUNT(e.id) AS verified_evidence_count
FROM students s
INNER JOIN job_applications a ON s.id = a.student_id
INNER JOIN jobs j ON a.job_id = j.id
LEFT JOIN student_evidence e ON s.id = e.student_id
WHERE a.status = :application_status
  AND j.is_active = TRUE
GROUP BY s.id, s.full_name, j.title, j.employer
HAVING COUNT(e.id) >= :min_evidence_threshold
ORDER BY verified_evidence_count DESC;`,

  gap_redis_02: `# app/middleware/rate_limiter.py: Token Bucket Redis Rate Limiter
import time
from fastapi import Request, HTTPException
import redis.asyncio as redis

redis_pool = redis.ConnectionPool.from_url("redis://localhost:6379/0", decode_responses=True)

async def check_rate_limit(request: Request, client_id: str, limit: int = 100, window: int = 60):
    client = redis.Redis(connection_pool=redis_pool)
    current_key = f"rate_limit:{client_id}:{int(time.time() // window)}"
    try:
        current_count = await client.incr(current_key)
        if current_count == 1:
            await client.expire(current_key, window)
        if current_count > limit:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in 60s.")
    except redis.RedisError:
        # Graceful fallback: allow request if Redis cluster is down
        return True`,

  gap_docker_03: `# Dockerfile: Production Multi-Stage Build with Non-Root Security
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim as runner
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --group appuser
COPY --from=builder /root/.local /home/appuser/.local
COPY . .
ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,

  gap_test_04: `# tests/test_api_integration.py: Async Integration & Error Boundary Tests
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_candidate_profile_not_found_boundary():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/profile/invalid_nonexistent_id")
    assert response.status_code in [400, 404]

@pytest.mark.asyncio
async def test_update_profile_malformed_payload():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/profile/usr_01/update", json={"invalid_field": 123})
    assert response.status_code == 422`,

  gap_rag_05: `# app/ai/vector_store.py: Semantic Vector Retrieval with ChromaDB
import chromadb
from typing import List, Dict

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="candidate_experience")

def query_relevant_experience(query_text: str, top_k: int = 3) -> List[Dict]:
    results = collection.query(query_texts=[query_text], n_results=top_k)
    return [
        {"doc": doc, "meta": meta, "dist": dist}
        for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0])
        if dist < 0.45
    ]`,
};

export const GapLab: React.FC<GapLabProps> = ({
  assessmentId,
  onSimulatePush,
  isSimulating,
}) => {
  const [tasks, setTasks] = useState<GapTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedCodeTaskId, setExpandedCodeTaskId] = useState<string | null>('gap_sql_01');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetchGapTasks(assessmentId);
        if (res.tasks && res.tasks.length > 0) {
          setTasks(res.tasks);
        }
      } catch (err) {
        console.error('Failed to load gap tasks', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [assessmentId]);

  const handleCopyCode = (taskId: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'sql') return t.id.includes('sql');
    if (filter === 'redis') return t.id.includes('redis');
    if (filter === 'docker') return t.id.includes('docker');
    if (filter === 'test') return t.id.includes('test');
    if (filter === 'rag') return t.id.includes('rag');
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner - Matching Premium Deep Cobalt to Vibrant Sapphire with Amber Accents */}
      <div className="panel p-6 sm:p-8 bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white shadow-xl shadow-[#1746A2]/20 border border-white/10 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#FFC66B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-[#FFC66B] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#FFC66B]" />
              <span>Targeted Skill Remediation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Gap Lab · Enterprise Code Solutions
            </h1>
            <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
              Every identified gap below maps to unverified job requirements. Complete these engineering tasks to convert <span className="font-semibold text-white">Not in Scope</span> verdicts into verified code evidence.
            </p>

            {/* Quick Metrics Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <Beaker className="h-3 w-3 text-[#FFC66B]" /> Blueprints: <strong className="text-white">5 Active</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-[#6EE7B7]" /> Auto-Resolver: <strong className="text-white">1-Click AST</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-[#93C5FD]" /> Target Roles: <strong className="text-white">Stripe SWE</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="https://github.com/Yadnesh2007/AICOACH2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all shadow-sm backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub (AICOACH2)</span>
            </a>

            <button
              disabled={isSimulating}
              onClick={() => onSimulatePush('add_sql')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] hover:from-[#F5B754] hover:to-[#D97706] text-[#0F1D38] text-xs font-extrabold shadow-lg shadow-[#D97706]/25 transition-all flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#0F1D38]" />
                  <span>Verifying via AST Engine…</span>
                </>
              ) : (
                <>
                  <GitCommit className="h-4 w-4 text-[#0F1D38]" />
                  <span>Auto-Resolve SQL Gap (Push Demo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All Actionable Gaps (${tasks.length})` },
          { id: 'sql', label: 'Relational SQL' },
          { id: 'redis', label: 'Redis Caching' },
          { id: 'docker', label: 'Docker Containerization' },
          { id: 'test', label: 'Integration Testing' },
          { id: 'rag', label: 'RAG & Vector AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#1746A2] text-white shadow-sm'
                : 'bg-white border border-[#DDE7F5] text-[#475874] hover:bg-[#F3F7FC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {filteredTasks.map((task) => {
          const isExpanded = expandedCodeTaskId === task.id;
          const starterCode = STARTER_SNIPPETS[task.id];
          const isCopied = copiedTaskId === task.id;

          return (
            <div
              key={task.id}
              className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-6 hover:border-[#BBD9FF] transition-all"
            >
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFF5E5] text-[#854D0E] border border-[#FFE4A0]">
                      Actionable Gap
                    </span>
                    <span className="text-xs font-mono text-[#7A8CA6]">ID: {task.id}</span>
                    <span className="text-xs font-mono text-[#1746A2] font-semibold">
                      Req: {task.requirement_id}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F1D38]">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#475874] leading-relaxed">
                    {task.why_this_matters}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-[#EFF5FE] text-[#1746A2] border border-[#BBD9FF]">
                    {task.status.replace(/_/g, ' ')}
                  </span>
                  {task.id === 'gap_sql_01' && (
                    <button
                      disabled={isSimulating}
                      onClick={() => onSimulatePush('add_sql')}
                      className="px-3 py-1.5 rounded-lg bg-[#FFC66B] hover:bg-[#F5B754] text-[#1746A2] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>⚡ Auto-Commit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Steps and Validation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Steps */}
                <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1746A2] flex items-center gap-1.5">
                    <ListTodo className="h-3.5 w-3.5" />
                    <span>Recommended Engineering Steps</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-[#334155]">
                    {task.steps.map((st, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="h-4 w-4 rounded-full bg-[#1746A2] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Validation checklist */}
                <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Validation Criteria for AST Engine</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-[#334155]">
                    {task.validation_checklist.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Starter Implementation Drawer */}
              {starterCode && (
                <div className="rounded-xl border border-[#DDE7F5] overflow-hidden bg-[#0D1527]">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#090F1C] border-b border-[#1E293B]">
                    <button
                      onClick={() =>
                        setExpandedCodeTaskId(isExpanded ? null : task.id)
                      }
                      className="flex items-center gap-2 text-xs font-mono font-bold text-[#E2E8F0] hover:text-[#FFC66B] transition-colors"
                    >
                      <Code2 className="h-4 w-4 text-[#3978E8]" />
                      <span>Starter Implementation & Parser Blueprint</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-[#7A8CA6]" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-[#7A8CA6]" />
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyCode(task.id, starterCode)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-[#10B981]" />
                          <span className="text-[#10B981]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 overflow-x-auto text-xs font-mono text-[#E2E8F0] leading-relaxed"
                      >
                        <pre>
                          <code>{starterCode}</code>
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Target File Footnote */}
              <div className="p-3 rounded-lg bg-[#EFF5FE] border border-[#BBD9FF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#1746A2] font-mono">
                  <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Target Files:</span>
                  <a
                    href="https://github.com/Yadnesh2007/SAHAYOG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#334155] hover:text-[#1746A2] hover:underline flex items-center gap-1"
                  >
                    <span>{task.suggested_files.join(', ')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {task.id === 'gap_sql_01' && (
                  <button
                    disabled={isSimulating}
                    onClick={() => onSimulatePush('add_sql')}
                    className="text-xs font-bold text-[#1746A2] hover:text-[#3978E8] hover:underline transition-colors shrink-0"
                  >
                    Auto-Commit Suggested File & Reassess →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
