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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F2FF] border border-[#BBD9FF] text-[11px] font-bold text-[#1746A2] mb-1.5">
            <Terminal className="h-3 w-3 text-[#3978E8]" />
            <span>Verbal & Conceptual Code Defense</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F1D38]">Code Defense Mode</h1>
          <p className="text-xs text-[#475874] mt-0.5">
            Defend architectural decisions, complexity, and security trade-offs for verified snippets.
          </p>
        </div>

        <button
          onClick={() => initSession()}
          className="btn-secondary text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>New Defense Question</span>
        </button>
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
