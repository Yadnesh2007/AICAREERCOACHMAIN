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
import { fetchGapTasks, generateCodeRemediationLlm } from '../lib/api';
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
  const [llmPatches, setLlmPatches] = useState<Record<string, any>>({});
  const [loadingPatchTaskId, setLoadingPatchTaskId] = useState<string | null>(null);

  const handleGenerateLlmPatch = async (task: GapTask) => {
    setLoadingPatchTaskId(task.id);
    try {
      const res = await generateCodeRemediationLlm(
        task.id,
        task.title,
        task.suggested_files?.[0] || 'app/main.py'
      );
      setLlmPatches((prev) => ({ ...prev, [task.id]: res }));
      setExpandedCodeTaskId(task.id);
    } catch (err) {
      console.error('Failed to generate LLM code remediation', err);
    } finally {
      setLoadingPatchTaskId(null);
    }
  };

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
      {/* Header Banner - Matching 1st Page Hero Banner with Amber Accents & Companion Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Sparkles className="h-3.5 w-3.5 text-[#FFC66B]" />
              <span>SkillAura Gap Lab</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Skill Gap Solutions & Blueprints
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Don't worry if you're missing a skill! Each blueprint below gives you production-ready code examples with explanations. Click <strong>"1-Click Auto-Resolve"</strong> or copy the code into your repository to turn missing skills into verified proofs.
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
                <ShieldCheck className="h-3 w-3 text-[#93C5FD]" /> Target Role: <strong className="text-white">Stripe SWE</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Attached Reference Image Preview Badge */}
            <div className="hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-white/20 shrink-0">
              <img
                src="/career-companion.png"
                alt="SkillAura Companion"
                className="h-11 w-10 object-cover rounded-xl shadow-md border border-white/25"
              />
              <div className="text-left">
                <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Career Companion</p>
                <p className="text-[11px] font-bold text-white">1-Click Blueprints</p>
              </div>
            </div>

            <button
              disabled={isSimulating}
              onClick={() => onSimulatePush('add_sql')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] hover:opacity-95 text-[#0E2E72] font-black text-sm shadow-lg shadow-[#FFC66B]/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#0E2E72]" />
                  <span>Verifying via AST Engine…</span>
                </>
              ) : (
                <>
                  <GitCommit className="h-4 w-4 text-[#0E2E72]" />
                  <span>Auto-Resolve SQL Gap</span>
                </>
              )}
            </button>

            <a
              href="https://github.com/Yadnesh2007/AICOACH2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub (AICOACH2)</span>
            </a>
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

                  <button
                    disabled={loadingPatchTaskId === task.id}
                    onClick={() => handleGenerateLlmPatch(task)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#1746A2] to-[#2563EB] hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    title="Synthesize production code patch using Gemini 1.5 Pro AST code reasoning"
                  >
                    {loadingPatchTaskId === task.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                        <span>Synthesizing…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-[#FFC66B]" />
                        <span>✨ Gemini Patch</span>
                      </>
                    )}
                  </button>

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

              {/* Gemini 1.5 Pro Synthesized AST Code Patch */}
              {llmPatches[task.id] && (
                <div className="rounded-xl border border-[#3978E8]/40 bg-[#07132B] p-4 text-[#DCEBFF] space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[#1746A2] text-white flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-[#FFC66B]" />
                      </div>
                      <span className="text-xs font-bold text-white">Gemini 1.5 Pro AST Code Patch</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                      AST Compliant: Ready to Commit
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/10">
                    {llmPatches[task.id].architectural_explanation}
                  </p>
                  <pre className="p-3.5 rounded-lg bg-[#0A1628] text-xs font-mono text-[#38BDF8] overflow-x-auto border border-[#1E293B] leading-relaxed">
                    <code>{llmPatches[task.id].remediation_code}</code>
                  </pre>
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
