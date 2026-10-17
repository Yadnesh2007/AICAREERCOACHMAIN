import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  FileCode2,
  ExternalLink,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { fetchPassport } from '../lib/api';

interface EvidencePassportProps {
  assessmentId: string;
  connectedRepoUrl?: string;
  connectedRepoName?: string;
  connectedBranch?: string;
  onOpenConnectRepo?: () => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'demonstrated') return <CheckCircle2 className="h-4 w-4 text-[#10B981]" />;
  if (status === 'not_demonstrated') return <AlertCircle className="h-4 w-4 text-[#EF4444]" />;
  return <Clock className="h-4 w-4 text-[#D97706]" />;
};

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    demonstrated: 'status-demonstrated',
    not_demonstrated: 'status-not-demonstrated',
    partial: 'status-partial',
    unable_to_assess: 'status-unable',
  };
  return (
    <span className={`status-pill ${map[status] || 'status-unable'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const StrengthBadge = ({ strength }: { strength: string }) => {
  const colors: Record<string, string> = {
    implementation: 'bg-[#EFF5FE] text-[#1746A2] border-[#BBD9FF]',
    application: 'bg-[#F0FDF4] text-[#065F46] border-[#A7F3D0]',
    test: 'bg-[#FFF7ED] text-[#92400E] border-[#FCD34D]',
    documentation: 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]',
  };
  const cls = colors[strength] || 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${cls}`}>
      {strength}
    </span>
  );
};

export const EvidencePassport: React.FC<EvidencePassportProps> = ({
  assessmentId,
  connectedRepoUrl,
  connectedRepoName = 'Yadnesh2007/SAHAYOG',
  connectedBranch = 'main',
  onOpenConnectRepo,
}) => {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStrength, setFilterStrength] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadPassport = async () => {
      try {
        const data = await fetchPassport(assessmentId);
        setPassport(data);
      } catch (err) {
        console.error('Failed to load passport', err);
      } finally {
        setLoading(false);
      }
    };
    loadPassport();
  }, [assessmentId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && !passport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[#1746A2] border-t-transparent animate-spin" />
        <p className="text-xs text-[#7A8CA6] font-mono">Generating verified evidence passport…</p>
      </div>
    );
  }

  const verdicts: any[] = passport?.verdicts || [];

  // Flatten all citations across all verdicts into evidence items
  const allEvidence: any[] = verdicts.flatMap((v) =>
    (v.citations || []).map((c: any, ci: number) => ({
      id: `${v.skill_key}-${ci}`,
      skill_key: v.skill_key,
      verdict_status: v.verdict_status || v.status,
      confidence: v.confidence,
      observed_behavior: c.behavior || v.exact_claim,
      evidence_strength: c.strength || 'implementation',
      file_path: c.file,
      lines: c.lines,
      permalink: c.permalink,
      repo: c.repo,
    }))
  );

  const strengths = ['all', 'implementation', 'application', 'test', 'documentation'];
  const filtered =
    filterStrength === 'all' ? allEvidence : allEvidence.filter((e) => e.evidence_strength === filterStrength);

  return (
    <div className="space-y-8">
      {/* Top Banner: Deep Cobalt via Sapphire to Blue with Amber accents & Companion Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SkillAura Evidence Passport</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Your Shareable Developer Skill Credentials
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Every badge below is linked directly to a real GitHub code snippet with exact file line numbers. Share this verifiable passport with recruiters, hiring managers, or on your LinkedIn profile.
            </p>

            {/* Quick Metrics Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Code Proofs: <strong className="text-white">{allEvidence.length} Citations</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Target: <strong className="text-white">{passport?.employer || 'Stripe'} {passport?.job_title || 'Software Engineer'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Status: <strong className="text-white">v{passport?.version || 1}.0 Live</strong>
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
                <p className="text-[11px] font-bold text-white">Audited Proofs</p>
              </div>
            </div>

            <button
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passport, null, 2));
                const a = document.createElement('a');
                a.setAttribute('href', dataStr);
                a.setAttribute('download', `skill_passport_${assessmentId}.json`);
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] hover:opacity-95 text-[#0E2E72] font-black text-sm shadow-lg shadow-[#FFC66B]/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Export Verified JSON</span>
            </button>
            {/* Quick Launch Codespace */}
            <a
              href={`https://github.com/codespaces/new?repo=${encodeURIComponent(connectedRepoName || 'Yadnesh2007/SAHAYOG')}&ref=${encodeURIComponent(connectedBranch || 'main')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-[#0E2E72] hover:bg-[#1746A2] text-[#FFC66B] font-black text-sm transition-all flex items-center justify-center gap-2 border border-[#FFC66B]/30 shadow-md shadow-[#0E2E72]/40 shrink-0"
              title={`Launch GitHub Codespace for ${connectedRepoName || 'connected repository'}`}
            >
              <Zap className="h-4 w-4 fill-current text-[#FFC66B]" />
              <span>⚡ Open Codespace</span>
            </a>

            <a
              href={connectedRepoUrl || 'https://github.com/Yadnesh2007/SAHAYOG'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
              title={`View ${connectedRepoName || 'connected repository'} on GitHub`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>{connectedRepoName || 'GitHub Repo'}</span>
            </a>

            {onOpenConnectRepo && (
              <button
                type="button"
                onClick={onOpenConnectRepo}
                className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFC66B] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                title="Switch connected account or repository"
              >
                <span>Switch Repo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verdict Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {verdicts.map((v) => (
          <div key={v.skill_key} className="metric-card !p-4 !gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7A8CA6]">
                {(v.skill_key || 'Skill').replace(/_/g, ' ')}
              </span>
              <StatusIcon status={v.status || v.verdict_status} />
            </div>
            <StatusPill status={v.status || v.verdict_status || 'unable_to_assess'} />
            <p className="text-[10px] text-[#6B7E9C] leading-snug">{v.rationale ? `${v.rationale.slice(0, 60)}…` : 'Verified by AST static analysis.'}</p>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#627796] shrink-0">Filter Proof Level:</span>
        {strengths.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStrength(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
              filterStrength === st
                ? 'bg-[#1746A2] text-white shadow-sm'
                : 'bg-white text-[#445674] border border-[#DDE7F5] hover:bg-[#F3F7FC]'
            }`}
          >
            {st === 'all' ? `All (${allEvidence.length})` : st}
          </button>
        ))}
      </div>

      {/* Evidence Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed border-[#C8D8EF] bg-[#F8FAFD]">
          <div className="h-14 w-14 rounded-2xl bg-[#E8F2FF] flex items-center justify-center">
            <Award className="h-7 w-7 text-[#3978E8]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#0D1B36]">No evidence for this filter</p>
            <p className="text-xs text-[#7A8CA6] mt-1">Try a different strength level or push new code</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ev, idx) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="panel p-5 space-y-3.5 bg-white"
            >
              {/* Top row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EFF5FE] text-[#1746A2] border border-[#BBD9FF]">
                  {ev.skill_key.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <StrengthBadge strength={ev.evidence_strength} />
                  <span className="text-[10px] text-[#7A8CA6] font-mono bg-[#F3F7FC] px-1.5 py-0.5 rounded border border-[#DDE7F5]">
                    {ev.confidence} confidence
                  </span>
                </div>
              </div>

              {/* Behavior */}
              <p className="text-xs text-[#334155] leading-relaxed">{ev.observed_behavior}</p>

              {/* File citation */}
              <div className="p-2.5 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#0D1B36] min-w-0">
                  <FileCode2 className="h-3.5 w-3.5 text-[#3978E8] shrink-0" />
                  <span className="font-semibold truncate">{ev.file_path}</span>
                  <span className="text-[#7A8CA6] shrink-0">{ev.lines}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(ev.permalink, ev.id)}
                    className="p-1 rounded hover:bg-[#E8F2FF] text-[#1746A2]"
                    title="Copy permalink"
                  >
                    {copiedId === ev.id ? (
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <a
                    href={ev.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-[#E8F2FF] text-[#1746A2]"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Repo */}
              <p className="text-[10px] text-[#7A8CA6] font-mono">
                📦 {ev.repo}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
