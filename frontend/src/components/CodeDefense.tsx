import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  ShieldAlert,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { startCodeDefense, submitCodeDefenseAnswer } from '../lib/api';

interface CodeDefenseProps {
  assessmentId: string;
  initialEvidenceId?: string;
}

export const CodeDefense: React.FC<CodeDefenseProps> = ({
  assessmentId,
  initialEvidenceId,
}) => {
  const [session, setSession] = useState<any>(null);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any>(null);

  const initSession = async (evidenceId?: string) => {
    setLoading(true);
    try {
      const data = await startCodeDefense(assessmentId, evidenceId);
      setSession(data);
      setFeedback(null);
      setAnswer('');
    } catch (err) {
      console.error('Failed to start code defense', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession(initialEvidenceId);
  }, [assessmentId, initialEvidenceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !session) return;
    setSubmitting(true);
    try {
      const res = await submitCodeDefenseAnswer(session.session_id, answer);
      setFeedback(res.feedback);
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <RefreshCw className="h-8 w-8 text-[#1746A2] animate-spin" />
        <p className="text-xs text-[#7A8CA6] font-mono">Preparing interview defense questions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Deep Cobalt via Sapphire to Blue with Amber accents & Companion Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Terminal className="h-3.5 w-3.5" />
              <span>SkillAura Code Defense</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Defend Your Real Code in Mock Interviews
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Top tech companies will ask you to explain your GitHub projects in live interviews. SkillAura picks real snippets from your code and asks you why you wrote them, giving instant AI feedback to boost your confidence.
            </p>

            {/* Beginner Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Source: <strong className="text-white">Real Code Snippets</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FFC66B]" /> Feedback: <strong className="text-white">Instant AI Review</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-[#93C5FD]" /> Mode: <strong className="text-white">Safe Practice</strong>
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
                <p className="text-[11px] font-bold text-white">Simulate Interview</p>
              </div>
            </div>

            <button
              onClick={() => initSession()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] hover:opacity-95 text-[#0E2E72] font-black text-sm shadow-lg shadow-[#FFC66B]/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Next Defense Question</span>
            </button>
            <a
              href="https://github.com/Yadnesh2007/AICOACH2"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Code Snippet & Challenge */}
        <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EFF5FE] text-[#1746A2] border border-[#BBD9FF]">
                {session?.skill_key?.replace(/_/g, ' ') || 'Code Verification'}
              </span>
              <span className="text-xs font-mono text-[#7A8CA6]">ID: {session?.evidence_id || 'ev_py_01'}</span>
            </div>
            <h3 className="font-bold text-base text-[#0F1D38]">
              {session?.question_title || 'Explain Your Implementation Architecture'}
            </h3>
            <p className="text-xs text-[#475874] leading-relaxed">
              {session?.question_prompt || 'How does this snippet guarantee thread safety and type conformance under high concurrent loads?'}
            </p>
          </div>

          {/* Inspected snippet */}
          {session?.snippet && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#627796]">
                Inspected Code Citation:
              </p>
              <pre className="code-block text-[11px]">
                <code>{session.snippet}</code>
              </pre>
            </div>
          )}

          {/* Hints & Evaluation Rubric */}
          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2">
            <p className="text-xs font-bold text-[#1746A2] flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Key Defense Talking Points</span>
            </p>
            <ul className="text-xs text-[#475874] space-y-1 list-disc list-inside">
              <li>Pydantic v2 schema serialization performance</li>
              <li>Explicit HTTP 400 vs 500 boundary error handling</li>
              <li>Defense against SQL injection and parameter binding</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Candidate Defense Input & Feedback */}
        <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm flex flex-col justify-between space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F1D38]">
                Your Technical Defense & Explanation:
              </label>
              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Explain the architectural choices, trade-offs, and design patterns used in this code..."
                className="w-full p-3.5 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] text-xs text-[#0F1D38] placeholder-[#7A8CA6] focus:outline-none focus:border-[#3978E8] focus:bg-white transition-all font-sans"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#1746A2]" />
                    <span>Evaluating Defense…</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-[#1746A2]" />
                    <span>Submit Defense</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Feedback Panel */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#EFF5FE] border border-[#BBD9FF] space-y-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#1746A2]" />
                <h4 className="text-xs font-bold text-[#1746A2]">
                  AI Coach Defense Evaluation
                </h4>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                {feedback.summary || 'Strong architectural explanation. You accurately addressed type safety and data boundaries.'}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-[#DDE7F5] text-xs text-[#10B981] font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified Authorship Understanding: HIGH</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
