import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ExternalLink,
  GitBranch,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  FileCode2,
  Terminal,
  Activity,
  Layers,
  RefreshCw,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  BookOpen,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
  Github,
  Cpu,
  Upload,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Assessment, Job, Evidence, SkillVerdict } from '../lib/types';
import { PlanType } from './SubscriptionModal';
import { MultiCompanyAllocation } from './MultiCompanyAllocation';
import { DomainExpansionAdvisor } from './DomainExpansionAdvisor';

interface DashboardProps {
  assessment: Assessment | null;
  job: Job | null;
  onSimulatePush: (action: 'add_sql' | 'delete_sql') => void;
  isSimulating: boolean;
  onOpenCodeDefense: (evidenceId: string) => void;
  subscriptionPlan?: PlanType;
  onOpenPricing?: () => void;
  onOpenCodeInspector?: () => void;
  onOpenConnectRepo?: () => void;
  onSelectTargetCompany?: (company: string, role: string, url: string, companyId?: string) => void;
  selectedCompanyId?: string;
  connectedRepoUrl?: string;
  connectedRepoName?: string;
  connectedBranch?: string;
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'demonstrated':
      return {
        label: 'Demonstrated',
        icon: CheckCircle2,
        className: 'status-demonstrated',
        dot: '#10B981',
      };
    case 'partially_demonstrated':
      return {
        label: 'Partial',
        icon: AlertTriangle,
        className: 'status-partial',
        dot: '#D97706',
      };
    case 'not_demonstrated_in_reviewed_scope':
      return {
        label: 'Not in Scope',
        icon: XCircle,
        className: 'status-not-demonstrated',
        dot: '#EF4444',
      };
    default:
      return {
        label: 'Unable to Assess',
        icon: HelpCircle,
        className: 'status-unable',
        dot: '#3978E8',
      };
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <span className={`status-pill ${cfg.className}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
  i: number;
}> = ({ label, value, sub, accent, i }) => (
  <motion.div
    custom={i}
    initial="hidden"
    animate="show"
    variants={fadeUp}
    className="metric-card"
  >
    <p className="metric-label">{label}</p>
    <div className={`metric-number ${accent ? 'text-[#1746A2]' : 'text-[#0F1D38]'}`}>{value}</div>
    {sub && <div className="text-[12px] text-[#7A8CA6] font-mono mt-0.5">{sub}</div>}
  </motion.div>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-2 border-[#DDE7F5]" />
      <div className="absolute inset-0 rounded-full border-t-2 border-[#1746A2] animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-[#0F1D38]">Syncing repository snapshot</p>
      <p className="text-xs text-[#7A8CA6] font-mono mt-0.5">Fetching verdicts & verified code evidence…</p>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({
  assessment,
  job,
  onSimulatePush,
  isSimulating,
  onOpenCodeDefense,
  subscriptionPlan = 'free',
  onOpenPricing,
  onOpenCodeInspector,
  onOpenConnectRepo,
  onSelectTargetCompany,
  selectedCompanyId = 'comp_stripe',
  connectedRepoUrl,
  connectedRepoName = 'Yadnesh2007/SAHAYOG',
  connectedBranch = 'main',
}) => {
  const [expandedVerdict, setExpandedVerdict] = useState<string | null>(null);

  if (!assessment || !job) {
    return <LoadingState />;
  }

  const demonstratedCount = assessment.verdicts.filter(
    (v) => v.status === 'demonstrated'
  ).length;
  const partialCount = assessment.verdicts.filter(
    (v) => v.status === 'partially_demonstrated'
  ).length;
  const missingCount = assessment.verdicts.filter(
    (v) => v.status === 'not_demonstrated_in_reviewed_scope'
  ).length;
  const total = assessment.verdicts.length;
  const coveragePercent = Math.round((demonstratedCount / (total || 1)) * 100);

  const chartData = [
    { name: 'Demonstrated', count: demonstratedCount, fill: '#10B981' },
    { name: 'Partial', count: partialCount, fill: '#FFC66B' },
    { name: 'Missing Signal', count: missingCount, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* ── HERO BANNER: Cobalt Blue + Ice Blue + Amber ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#1746A2]/15"
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#BBD9FF]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SkillAura Career Intelligence</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Every Skill Backed by Real GitHub Evidence
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              We check your real code files against real job requirements for <span className="text-white font-semibold">{job.title}</span> at <span className="text-white font-semibold">{job.employer}</span>. Clear skill proofs, zero guesswork, and automatic updates when you push code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-w-full lg:max-w-2xl justify-start lg:justify-end shrink-0">
            {/* Attached Reference Image Preview Badge */}
            <div className="hidden 2xl:flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 pr-2.5 rounded-xl border border-white/20 shrink-0">
              <img
                src="/career-companion.png"
                alt="SkillAura Companion"
                className="h-9 w-8 object-cover rounded-lg shadow-sm border border-white/25"
              />
              <div className="text-left">
                <p className="text-[8.5px] uppercase font-bold text-[#FFC66B]">Career Companion</p>
                <p className="text-[10px] font-bold text-white">Every Skill Verified</p>
              </div>
            </div>

            {/* Code & Document Upload (% AI vs Handwritten) */}
            {onOpenCodeInspector && (
              <button
                onClick={onOpenCodeInspector}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                title="Upload .pdf, .py, .sql, etc. to inspect % AI vs. Handwritten code"
              >
                <Cpu className="h-3.5 w-3.5 text-[#FFC66B]" />
                <span>AI % Audit</span>
              </button>
            )}

            {/* Direct GitHub Codespace Launcher */}
            <a
              href={`https://github.com/codespaces/new?repo=${encodeURIComponent(connectedRepoName || 'Yadnesh2007/SAHAYOG')}&ref=${encodeURIComponent(connectedBranch || 'main')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[#0E2E72] hover:bg-[#1746A2] border border-[#FFC66B]/30 text-[#FFC66B] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              title={`Launch GitHub Codespace for ${connectedRepoName || 'active repository'}`}
            >
              <Zap className="h-3.5 w-3.5 fill-current text-[#FFC66B]" />
              <span>⚡ Codespace</span>
            </a>

            {/* Connect GitHub Repo Button */}
            {onOpenConnectRepo && (
              <button
                onClick={onOpenConnectRepo}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                title={`Connected: ${connectedRepoName || 'Connect GitHub Repository'}`}
              >
                <Github className="h-3.5 w-3.5 text-white" />
                <span>{connectedRepoName || 'Connect Repo'}</span>
              </button>
            )}

            <button
              disabled={isSimulating}
              onClick={() => onSimulatePush('add_sql')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] hover:opacity-95 text-[#0E2E72] font-black text-xs shadow-md shadow-[#FFC66B]/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0"
              title="Adds SQL code to repo to trigger automatic skill leveling"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0E2E72]" />
                  <span>Checking Code…</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 fill-current text-[#0E2E72]" />
                  <span>⚡ Try Demo: Add Code</span>
                </>
              )}
            </button>
            <button
              disabled={isSimulating}
              onClick={() => onSimulatePush('delete_sql')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
              title="Simulates removing code to see how skill gaps update honestly"
            >
              <span>Test Removal</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── BEGINNER DEVELOPER GUIDE CALLOUT ── */}
      <div className="bg-gradient-to-r from-[#EFF5FE] to-[#F6FAFF] border border-[#BBD9FF] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-[#1746A2] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Lightbulb className="h-5 w-5 text-[#FFC66B]" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0E2E72]">Beginner Guide: How SkillAura Evaluates Your Code</h3>
              <span className="text-[11px] font-semibold text-[#1746A2] bg-white px-2 py-0.5 rounded border border-[#BBD9FF]">
                100% Reliable Checks
              </span>
            </div>
            <p className="text-xs text-[#334155] leading-relaxed">
              Unlike generic career quizzes or AI chatbots that guess, SkillAura inspects your real GitHub repositories using <strong>code syntax trees (AST)</strong>. 
              When you write functions, queries, or API routes, you earn verified skill citations with direct GitHub links that you can share with tech recruiters.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-[#DDE7F5] flex items-center gap-2 text-xs font-semibold text-[#0F1D38]">
                <span className="h-5 w-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-[11px] font-black shrink-0">1</span>
                <span>Code Scanned Line-by-Line</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DDE7F5] flex items-center gap-2 text-xs font-semibold text-[#0F1D38]">
                <span className="h-5 w-5 rounded-full bg-[#3978E8]/20 text-[#3978E8] flex items-center justify-center text-[11px] font-black shrink-0">2</span>
                <span>Exact Employer Match</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DDE7F5] flex items-center gap-2 text-xs font-semibold text-[#0F1D38]">
                <span className="h-5 w-5 rounded-full bg-[#F59E0B]/20 text-[#D97706] flex items-center justify-center text-[11px] font-black shrink-0">3</span>
                <span>1-Click Gap Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          i={0}
          label="Skills Matched"
          value={`${coveragePercent}%`}
          sub={`${demonstratedCount} of ${total} verified in code`}
          accent
        />
        <MetricCard
          i={1}
          label="Code Proofs Found"
          value={assessment.evidence.length}
          sub="Verified code citations"
        />
        <MetricCard
          i={2}
          label="Skills to Learn"
          value={missingCount}
          sub="Missing from scope"
        />
        <MetricCard
          i={3}
          label="Current Version"
          value={`v${assessment.version}.0`}
          sub="Updated in real time"
        />
      </div>

      {/* ── TWO COLUMN MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Requirements & Verdicts (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F1D38]">Skill Assessment Matrix</h2>
              <p className="text-xs text-[#7A8CA6]">
                Each verdict is derived from deterministic AST checks across reviewed branches.
              </p>
            </div>
            <a
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1746A2] hover:text-[#3978E8] bg-[#EFF5FE] px-2.5 py-1.5 rounded-lg border border-[#BBD9FF] transition-colors"
            >
              <span>Job Source Link</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-3">
            {assessment.verdicts.map((verdict) => {
              const isOpen = expandedVerdict === verdict.requirement_id;
              const relatedEvs = assessment.evidence.filter((e) =>
                verdict.evidence_ids.includes(e.id)
              );

              return (
                <div
                  key={verdict.requirement_id}
                  className={`verdict-row ${isOpen ? 'open' : ''}`}
                >
                  <div
                    onClick={() =>
                      setExpandedVerdict(isOpen ? null : verdict.requirement_id)
                    }
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-[#FAFBFD] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-xl bg-[#EFF5FE] border border-[#DDE7F5] flex items-center justify-center text-[#1746A2] shrink-0 font-mono text-xs font-bold">
                        {(verdict.skill_key || 'SK').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#0F1D38]">
                            {(verdict.skill_key || 'Skill').replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <StatusBadge status={verdict.status} />
                        </div>
                        <p className="text-xs text-[#475874] mt-0.5 line-clamp-1">
                          {verdict.exact_claim || 'Verified competency'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#7A8CA6] hidden sm:block">
                        {relatedEvs.length} citation{relatedEvs.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-[#1746A2]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#7A8CA6]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Proof Details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-[#DDE7F5] bg-[#F8FAFD] p-5 space-y-4"
                      >
                        {/* Verbatim Employer Requirement */}
                        {(() => {
                          const req = job.requirements.find(
                            (r) => r.id === verdict.requirement_id || r.skill_key === verdict.skill_key
                          );
                          if (!req) return null;
                          return (
                            <div className="bg-[#EFF5FE] border border-[#BBD9FF] rounded-xl p-3.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#1746A2] uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-[#3978E8]" />
                                  <span>Verbatim Employer Requirement ({job.employer})</span>
                                </span>
                                <a
                                  href={req.source_url || job.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#3978E8] hover:text-[#1746A2] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                                >
                                  <span>Genuine Job Source</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <p className="text-xs text-[#0F1D38] italic font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-[#DDE7F5]">
                                "{req.original_text}"
                              </p>
                            </div>
                          );
                        })()}

                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#1746A2]">
                            Deterministic AST Evaluation Rationale
                          </p>
                          <p className="text-xs text-[#334155] leading-relaxed">
                            {verdict.rationale}
                          </p>
                        </div>

                        {/* Evidence Snippets */}
                        {relatedEvs.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#1746A2]">
                              Verifiable Code Citations ({relatedEvs.length})
                            </p>
                            {relatedEvs.map((ev) => (
                              <div
                                key={ev.id}
                                className="bg-white border border-[#DDE7F5] rounded-xl p-3.5 space-y-2.5 shadow-sm"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-[#0F1D38] font-mono">
                                    <FileCode2 className="h-3.5 w-3.5 text-[#3978E8]" />
                                    <span className="font-semibold">{ev.file_path}</span>
                                    <span className="text-[#7A8CA6]">
                                      #L{ev.start_line}-L{ev.end_line}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCodeDefense(ev.id);
                                      }}
                                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFC66B]/20 text-[#854D0E] border border-[#FFC66B] hover:bg-[#FFC66B]/30 transition-colors"
                                    >
                                      Defend in Interview
                                    </button>
                                    <a
                                      href={ev.permalink}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[#3978E8] hover:text-[#1746A2] inline-flex items-center gap-1 font-mono text-[11px]"
                                    >
                                      <span>GitHub Permalink</span>
                                      <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>

                                <div className="text-xs text-[#475874] bg-[#EFF5FE] px-2.5 py-1.5 rounded-lg border border-[#DDE7F5]">
                                  <span className="font-semibold text-[#1746A2]">Observed Behavior: </span>
                                  {ev.observed_behavior}
                                </div>

                                {ev.snippet && (
                                  <pre className="code-block text-[11px]">
                                    <code>{ev.snippet}</code>
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-[#FFF5E5] border border-[#FFE4A0] rounded-xl p-3.5 text-xs text-[#854D0E] space-y-1">
                            <p className="font-bold">Honest Evidence Absence Caveat:</p>
                            <p>
                              No code matching this requirement was found in the reviewed scope. A missing signal is not proof of a lack of skill, but indicates no verifiable repository artifact is currently linked.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Target Job & Chart (1 col) */}
        <div className="space-y-6">
          {/* Subscription Tier Card — Styled with Cobalt & Amber and attached Companion Image */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-5 shadow-xl shadow-[#0E2E72]/20 border border-white/20 space-y-3.5">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#FFC66B]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-[#FFC66B]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFC66B]">
                  YOUR PLAN: {subscriptionPlan.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 uppercase tracking-wide">
                {subscriptionPlan === 'free' ? 'Free Tier' : 'Active Member'}
              </span>
            </div>

            {/* Attached Reference Image Feature Box */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/15 relative z-10">
              <img
                src="/career-companion.png"
                alt="SkillAura Career Companion"
                className="h-16 w-14 object-cover rounded-lg shadow-md shrink-0 border border-white/20"
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white">
                  {subscriptionPlan === 'free'
                    ? 'SkillAura Free Starter'
                    : subscriptionPlan === 'pro'
                    ? 'SkillAura Pro Active'
                    : 'SkillAura Ultra Active'}
                </h4>
                <p className="text-[11px] text-[#DCEBFF] leading-snug">
                  {subscriptionPlan === 'free'
                    ? 'Unlock real-time commit analysis, 5+ gap blueprints, and AI mock defense interviews.'
                    : 'All advanced code AST blueprints and mock interview defense modules unlocked.'}
                </p>
              </div>
            </div>

            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] font-black text-xs hover:opacity-95 shadow-md shadow-[#FFC66B]/25 flex items-center justify-center gap-2 transition-all active:scale-95 relative z-10"
              >
                <span>{subscriptionPlan === 'free' ? 'View Plans & Upgrade' : 'Manage Subscription'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Target Position Card */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#1746A2] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#1746A2]/20">
                {job.employer ? job.employer.slice(0, 2).toUpperCase() : 'JB'}
              </div>
              <div>
                <h3 className="font-bold text-[#0F1D38] text-sm">{job.title}</h3>
                <p className="text-xs text-[#7A8CA6] font-medium">{job.employer || 'Target Enterprise'}</p>
              </div>
            </div>

            <div className="border-t border-[#DDE7F5] pt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#7A8CA6]">Genuine Job Posting:</span>
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1746A2] hover:text-[#3978E8] hover:underline inline-flex items-center gap-1"
                >
                  <span>{job.employer} Live Listing</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8CA6]">Retrieval Status:</span>
                <span className="font-semibold text-[#10B981] capitalize flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                  <span>{job.retrieval_status}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8CA6]">Evidence Freshness:</span>
                <span className="font-bold text-[#1746A2] uppercase tracking-wide text-[10px] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF]">
                  {assessment.freshness}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8CA6]">Requirements Indexed:</span>
                <span className="font-mono font-semibold text-[#0F1D38]">
                  {job.requirements.length} Genuine Skills
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8CA6]">Target Repositories:</span>
                <span className="font-mono font-semibold text-[#1746A2]">
                  {assessment.reviewed_scope.repos.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8CA6]">Reviewed Branch:</span>
                <span className="font-mono text-[#0F1D38]">
                  {assessment.reviewed_scope.branches?.join(', ') || 'main'}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#0F1D38]">Skill Proof Distribution</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#627796' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#627796' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DDE7F5',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(23,70,162,0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-[#DDE7F5] pt-3 text-[11px] text-[#475874] space-y-1">
              <p className="font-bold text-[#1746A2]">Commit-to-Career Verification Loop</p>
              <p>
                Click <strong>"Demonstrate SQL Push"</strong> above to see the change detection engine reassess the repository in real time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MULTI-COMPANY JOB ALLOCATION SECTION ── */}
      <div className="pt-4 border-t border-[#DDE7F5]">
        <MultiCompanyAllocation
          onSelectTargetCompany={onSelectTargetCompany}
          activeCompany={job.employer}
          selectedCompanyId={selectedCompanyId}
        />
      </div>

      {/* ── CROSS-DOMAIN SKILL EXPANSION ADVISOR SECTION ── */}
      <div className="pt-4 border-t border-[#DDE7F5]">
        <DomainExpansionAdvisor />
      </div>
    </div>
  );
};
