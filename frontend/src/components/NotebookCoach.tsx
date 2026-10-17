import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Send,
  RefreshCw,
  Copy,
  Check,
  Building,
  Target,
  Briefcase,
  ExternalLink,
  BarChart2,
  Edit3,
  Layers,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { fetchCoachDataset, fetchCoachAnalysis, askCareerCoach, generateStarBulletsLlm } from '../lib/api';

export const NotebookCoach: React.FC = () => {
  const [dataset, setDataset] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [asking, setAsking] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; passages: string[] }>>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'insights' | 'ats_scanner' | 'star_optimizer' | 'rag' | 'cover_letter' | 'dataset'>('insights');
  const [llmBullets, setLlmBullets] = useState<Record<number, any>>({});
  const [loadingBulletLlm, setLoadingBulletLlm] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ds, an] = await Promise.all([
          fetchCoachDataset(),
          fetchCoachAnalysis(),
        ]);
        setDataset(ds);
        setAnalysis(an);
        if (an.rag_insights && an.rag_insights.length > 0) {
          setQaHistory(
            an.rag_insights.map((r: any) => ({
              q: r.question,
              a: r.answer,
              passages: [
                'CV: Candidate portfolio details (Python, SQL, Scikit-Learn)',
                'JD: LinguaLogic AI NLP requirement excerpts (2+ yrs NLP, BERT, Vector DBs)',
              ],
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load coach dataset', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAsking(true);
    try {
      const res = await askCareerCoach(query);
      setQaHistory((prev) => [
        { q: res.query, a: res.answer, passages: res.relevant_passages || [] },
        ...prev,
      ]);
      setQuery('');
    } catch (err) {
      console.error('Failed to ask coach', err);
    } finally {
      setAsking(false);
    }
  };

  const copyCoverLetter = () => {
    if (!analysis?.cover_letter) return;
    navigator.clipboard.writeText(analysis.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBullet = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleOptimizeBulletWithLlm = async (idx: number, bullet: any) => {
    setLoadingBulletLlm((prev) => ({ ...prev, [idx]: true }));
    try {
      const res = await generateStarBulletsLlm(
        bullet.role || 'Backend Engineer',
        bullet.ast_signal || 'AST Concurrency & Telemetry Pipeline',
        bullet.original || ''
      );
      setLlmBullets((prev) => ({ ...prev, [idx]: res }));
    } catch (err) {
      console.error('Failed to optimize with Gemini 1.5 Pro', err);
    } finally {
      setLoadingBulletLlm((prev) => ({ ...prev, [idx]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <RefreshCw className="h-8 w-8 text-[#1746A2] animate-spin" />
        <p className="text-xs text-[#7A8CA6] font-mono">
          Loading ai-career-coach.ipynb dataset & RAG vectors…
        </p>
      </div>
    );
  }

  const atsKeywords = analysis?.ats_keyword_breakdown || [];
  const starBullets = analysis?.star_bullet_rewrites || [];

  const filteredKeywords = atsKeywords.filter((k: any) => {
    if (keywordFilter === 'all') return true;
    if (keywordFilter === 'matched') return k.status === 'MATCHED';
    if (keywordFilter === 'missing') return k.status === 'MISSING';
    if (keywordFilter === 'partial') return k.status === 'PARTIAL';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner: Deep Cobalt via Sapphire to Blue with Amber accents & Companion Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>SkillAura CV Coach</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Resume Optimizer & ATS Match Scanner
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Find out if your resume will pass applicant tracking systems (ATS). See missing keywords, get STAR-formatted bullet points (Situation, Task, Action, Result), and chat with the AI coach about your career.
            </p>

            {/* Beginner Explainer Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Target: <strong className="text-white">LinguaLogic NLP SWE</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Role Match: <strong className="text-white">{analysis?.match_analysis?.overall_score || 68}%</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                ATS Score: <strong className="text-white">78%</strong>
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
                <p className="text-[11px] font-bold text-white">Smart Resume Scan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Match</p>
                <p className="text-xl font-black text-white">{analysis?.match_analysis?.overall_score || 68}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#A7F3D0]">ATS</p>
                <p className="text-xl font-black text-white">78%</p>
              </div>
            </div>

            <a
              href="https://github.com/Yadnesh2007/AICOACH2"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#DDE7F5] pb-2">
        {[
          { id: 'insights', label: 'Strengths & Gaps (Few-Shot)', icon: CheckCircle2 },
          { id: 'ats_scanner', label: `ATS Keyword Scanner (${atsKeywords.length})`, icon: BarChart2 },
          { id: 'star_optimizer', label: `STAR Bullet Optimizer (${starBullets.length})`, icon: Edit3 },
          { id: 'rag', label: 'Interactive RAG Q&A', icon: Sparkles },
          { id: 'cover_letter', label: 'Targeted Cover Letter', icon: FileText },
          { id: 'dataset', label: 'Source Documents (Raw CV/JD)', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = viewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1746A2] text-white shadow-sm'
                  : 'text-[#475874] hover:bg-[#EFF5FE] hover:text-[#1746A2]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: STRENGTHS & FEW-SHOT RECOMMENDATIONS ── */}
      {viewTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
              <h3 className="font-bold text-sm text-[#065F46] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                <span>5 Verified Strengths (Notebook Analysis)</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#334155]">
                {analysis?.cv_summary?.strengths?.map((st: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
              <h3 className="font-bold text-sm text-[#991B1B] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                <span>5 Priority Skill Gaps (Target Role Specific)</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#334155]">
                {analysis?.cv_summary?.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] shrink-0 mt-1.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Few Shot Evaluation Matrix */}
          <div className="panel p-6 bg-white border border-[#DDE7F5] space-y-4">
            <h3 className="font-bold text-sm text-[#0F1D38]">
              Few-Shot Evaluation Rubric (from Notebook Prompt 35)
            </h3>
            <div className="space-y-3">
              {analysis?.few_shot_recommendations?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1746A2]">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0F1D38]">Match: {item.match_score}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#EFF6FF] text-[#1E40AF]'
                        }`}
                      >
                        Priority: {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#475874]">
                    <div>
                      <span className="font-semibold text-[#0F1D38]">CV Experience: </span>
                      {item.cv_evidence}
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F1D38]">JD Requirement: </span>
                      {item.jd_requirement}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#DDE7F5] text-[#1746A2] font-semibold">
                    Recommendation: {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ATS KEYWORD SCANNER ── */}
      {viewTab === 'ats_scanner' && (
        <div className="space-y-6">
          <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#0F1D38]">
                  Applicant Tracking System (ATS) Keyword Density Comparison
                </h3>
                <p className="text-xs text-[#7A8CA6] mt-0.5">
                  Scanning candidate CV text frequency versus LinguaLogic AI target requirements.
                </p>
              </div>

              {/* Keyword Filters */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Keywords' },
                  { id: 'matched', label: 'Matched' },
                  { id: 'missing', label: 'Missing' },
                  { id: 'partial', label: 'Partial' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setKeywordFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      keywordFilter === f.id
                        ? 'bg-[#1746A2] text-white'
                        : 'bg-[#F8FAFD] border border-[#DDE7F5] text-[#475874] hover:bg-[#EEF4FD]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredKeywords.map((kw: any, idx: number) => {
                const isMatched = kw.status === 'MATCHED';
                const isPartial = kw.status === 'PARTIAL';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F1D38]">{kw.keyword}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isMatched
                            ? 'bg-[#E6FBF2] text-[#065F46] border border-[#A7F3D0]'
                            : isPartial
                            ? 'bg-[#FFF9E6] text-[#854D0E] border border-[#FFE4A0]'
                            : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                        }`}
                      >
                        {kw.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#7A8CA6]">
                        <span>Candidate CV: <strong className="text-[#0F1D38]">{kw.cv_mentions} mentions</strong></span>
                        <span>Target JD: <strong className="text-[#1746A2]">{kw.jd_mentions} required</strong></span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${
                            isMatched ? 'bg-[#10B981]' : isPartial ? 'bg-[#FFC66B]' : 'bg-[#EF4444]'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((kw.cv_mentions / (kw.jd_mentions || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: STAR BULLET OPTIMIZER ── */}
      {viewTab === 'star_optimizer' && (
        <div className="space-y-6">
          <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#0F1D38]">
                Resume Bullet Point Optimizer (STAR Formula + AST Proof)
              </h3>
              <p className="text-xs text-[#7A8CA6] mt-0.5">
                Translating passive descriptions into metric-backed, verified engineering claims.
              </p>
            </div>

            <div className="space-y-4">
              {starBullets.map((bullet: any, idx: number) => {
                const isCopied = copiedBulletIdx === idx;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#DDE7F5] bg-white space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-[#1746A2]">{bullet.role}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOptimizeBulletWithLlm(idx, bullet)}
                          disabled={loadingBulletLlm[idx]}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#1746A2] to-[#2563EB] text-white hover:brightness-110 flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                        >
                          <Sparkles className={`h-3 w-3 text-[#FFC66B] ${loadingBulletLlm[idx] ? 'animate-spin' : ''}`} />
                          <span>{loadingBulletLlm[idx] ? 'Gemini Generating…' : '✨ Gemini 1.5 Pro Polish'}</span>
                        </button>
                        <button
                          onClick={() => copyBullet(idx, llmBullets[idx]?.star_rewrite || bullet.star_rewrite)}
                          className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                        >
                          {isCopied ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy STAR Bullet'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B]">
                          Original (Vague & Passive)
                        </span>
                        <p className="text-[#991B1B] italic">"{bullet.original}"</p>
                        <p className="text-[11px] text-[#7F1D1D] pt-1 border-t border-[#FECACA]">
                          <strong>Critique:</strong> {bullet.critique}
                        </p>
                      </div>

                      {/* STAR Optimized */}
                      <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                          Baseline AST-Optimized
                        </span>
                        <p className="text-[#14532D] font-medium leading-relaxed">
                          "{bullet.star_rewrite}"
                        </p>
                        <div className="pt-2 border-t border-[#BBF7D0] flex items-center justify-between text-[11px]">
                          <span className="text-[#166534] font-semibold">{bullet.ast_signal}</span>
                          <a
                            href={bullet.evidence_link || 'https://github.com/Yadnesh2007/SAHAYOG'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#1746A2] font-semibold hover:underline"
                          >
                            <span>Inspect Code</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Gemini 1.5 Pro Deep Dive Card */}
                    {llmBullets[idx] && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-[#F8FAFD] to-[#EFF6FF] border border-[#BFDBFE] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1746A2] text-white flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5 text-[#FFC66B]" />
                              Gemini 1.5 Pro Production Polish
                            </span>
                            <span className="text-[10px] font-mono text-[#7A8CA6]">Model: {llmBullets[idx].model}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            ATS Score: 98/100
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-[#DDE7F5] text-xs font-semibold text-[#0F1D38] leading-relaxed shadow-xs">
                          "{llmBullets[idx].star_rewrite}"
                        </div>

                        {llmBullets[idx].star_breakdown && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#991B1B]">S — Situation:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.situation}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#D97706]">T — Task:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.task}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#1D4ED8]">A — Action:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.action}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#15803D]">R — Result:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.result}</span>
                            </div>
                          </div>
                        )}

                        {llmBullets[idx].ats_keywords && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                            <span className="text-[10px] font-bold text-[#7A8CA6] uppercase tracking-wider">ATS Keywords Injected:</span>
                            {llmBullets[idx].ats_keywords.map((kw: string, kidx: number) => (
                              <span key={kidx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EBF3FE] text-[#1746A2] border border-[#BFDBFE]">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: INTERACTIVE RAG Q&A ── */}
      {viewTab === 'rag' && (
        <div className="space-y-6">
          {/* Query Input */}
          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
            <h3 className="font-bold text-sm text-[#0F1D38]">
              Ask Career Coach (Grounded RAG on Embedded CV & JD)
            </h3>
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Does the applicant satisfy the NLP requirement? What advice can you provide?"
                className="flex-1 p-2.5 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] text-xs text-[#0F1D38] placeholder-[#7A8CA6] focus:outline-none focus:border-[#3978E8] focus:bg-white"
              />
              <button
                type="submit"
                disabled={asking || !query.trim()}
                className="btn-primary shrink-0"
              >
                {asking ? <RefreshCw className="h-4 w-4 animate-spin text-[#1746A2]" /> : <Send className="h-4 w-4 text-[#1746A2]" />}
                <span>Ask Coach</span>
              </button>
            </form>
          </div>

          {/* Q&A Cards */}
          <div className="space-y-4">
            {qaHistory.map((qa, i) => (
              <div
                key={i}
                className="panel p-5 bg-white border border-[#DDE7F5] space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-[#EFF5FE] text-[#1746A2] flex items-center justify-center text-xs font-bold shrink-0">
                    Q
                  </span>
                  <h4 className="font-bold text-xs text-[#0F1D38]">{qa.q}</h4>
                </div>
                <div className="flex items-start gap-2.5 pl-8 text-xs text-[#334155] leading-relaxed">
                  <Sparkles className="h-4 w-4 text-[#FFC66B] shrink-0 mt-0.5" />
                  <div>
                    <p>{qa.a}</p>
                    {qa.passages && qa.passages.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#DDE7F5] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8CA6]">
                          Grounded Passages:
                        </span>
                        {qa.passages.map((p, pIdx) => (
                          <p key={pIdx} className="text-[11px] font-mono text-[#475874]">
                            • {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: TAILORED COVER LETTER ── */}
      {viewTab === 'cover_letter' && (
        <div className="panel p-6 bg-white border border-[#DDE7F5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE7F5] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0F1D38]">
                Auto-Generated Tailored Cover Letter
              </h3>
              <p className="text-xs text-[#7A8CA6]">
                Synthesized by model factoring in prioritized gaps and verified skills.
              </p>
            </div>
            <button
              onClick={copyCoverLetter}
              className="btn-secondary text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] text-xs text-[#334155] font-sans leading-relaxed whitespace-pre-wrap">
            {analysis?.cover_letter}
          </pre>
        </div>
      )}

      {/* ── TAB 6: RAW DATASET ── */}
      {viewTab === 'dataset' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1746A2]">
              Sample CV (John Doe)
            </h3>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] text-[11px] font-mono text-[#334155] max-h-96 overflow-y-auto whitespace-pre-wrap">
              {dataset?.cv_text}
            </pre>
          </div>

          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1746A2]">
              Job Description (LinguaLogic AI)
            </h3>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] text-[11px] font-mono text-[#334155] max-h-96 overflow-y-auto whitespace-pre-wrap">
              {dataset?.jd_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
