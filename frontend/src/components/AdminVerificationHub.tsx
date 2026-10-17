import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flag,
  UserCheck,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  Github,
  Sparkles,
  RefreshCw,
  Cpu,
  FileCheck2,
  Award,
  ChevronRight,
  Sliders,
  Check,
  Eye,
  Clock,
  Building,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  fetchAdminCandidates,
  verifyCandidateWork,
  fetchAdminPermissions,
  updateAdminPermissions,
} from '../lib/api';
import { AuthUser } from './AuthPage';

interface AdminVerificationHubProps {
  authUser: AuthUser;
  onNavigateToTab?: (tab: string) => void;
}

export const AdminVerificationHub: React.FC<AdminVerificationHubProps> = ({
  authUser,
  onNavigateToTab,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    code_defense: true,
    ai_audit_scanner: true,
    cv_coach_export: true,
    custom_job_target: true,
    ultra_tier_sandbox: true,
    judge_dossier_public: true,
  });
  const [candidatePermissions, setCandidatePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'pending' | 'flagged'>('all');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand_yadnesh_01');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [candRes, permRes] = await Promise.all([
        fetchAdminCandidates().catch(() => ({ candidates: [] })),
        fetchAdminPermissions().catch(() => ({ system_permissions: {}, candidate_permissions: {} })),
      ]);

      if (candRes.candidates && candRes.candidates.length > 0) {
        setCandidates(candRes.candidates);
        const initialNotes: Record<string, string> = {};
        candRes.candidates.forEach((c: any) => {
          initialNotes[c.id] = c.notes || '';
        });
        setNotesState(initialNotes);
      } else {
        // Fallback default candidates if offline
        const fallbackCandidates = [
          {
            id: 'cand_yadnesh_01',
            name: 'Yadnesh Gandhele',
            email: 'yadnesh.developer@gmail.com',
            role_target: 'Software Engineer & Data Infrastructure',
            company_target: 'Stripe / Tech Core',
            repo_name: 'Yadnesh2007/SAHAYOG',
            repo_url: 'https://github.com/Yadnesh2007/SAHAYOG',
            ast_evidence: 'PostgreSQL connection pooling, ACID transaction guardrails, pydantic schemas',
            ai_percentage: 18.5,
            handwritten_percentage: 81.5,
            skill_match_percentage: 91,
            status: 'verified',
            verified_by: 'HR Bar Raiser Committee',
            verified_at: '2026-10-16T18:45:00Z',
            badge: 'Certified Authentic Proof',
            notes: 'Verified via AST commit inspect: high handwritten logic with rigorous error boundary tests.',
            permissions: {
              code_defense: true,
              ai_audit_scanner: true,
              cv_coach_export: true,
              custom_job_target: true,
              ultra_tier_sandbox: true,
            },
          },
          {
            id: 'cand_alex_02',
            name: 'Alex Rivera',
            email: 'alex.rivera@techpulse.io',
            role_target: 'Full-Stack Systems Engineer',
            company_target: 'Google Cloud Platform',
            repo_name: 'alexrivera/distributed-cache',
            repo_url: 'https://github.com/Yadnesh2007/SAHAYOG',
            ast_evidence: 'Distributed LRU cache, Raft consensus protocol, concurrent locks',
            ai_percentage: 31.2,
            handwritten_percentage: 68.8,
            skill_match_percentage: 84,
            status: 'pending',
            verified_by: null,
            verified_at: null,
            badge: 'Pending Verification',
            notes: 'Requires review of Raft consensus edge test coverage.',
            permissions: {
              code_defense: true,
              ai_audit_scanner: true,
              cv_coach_export: false,
              custom_job_target: true,
              ultra_tier_sandbox: false,
            },
          },
          {
            id: 'cand_john_03',
            name: 'John Doe',
            email: 'john.doe@lingua.ai',
            role_target: 'NLP Data Scientist',
            company_target: 'LinguaLogic AI',
            repo_name: 'johndoe/nlp-embeddings',
            repo_url: 'https://github.com/Yadnesh2007/SAHAYOG',
            ast_evidence: 'Vector embeddings, Transformer fine-tuning, Tokenizer benchmarks',
            ai_percentage: 42.0,
            handwritten_percentage: 58.0,
            skill_match_percentage: 76,
            status: 'revision_requested',
            verified_by: 'Staff AI Reviewer',
            verified_at: '2026-10-15T12:00:00Z',
            badge: 'Revision Requested',
            notes: 'AST inspection identified template code without p99 latency benchmarks.',
            permissions: {
              code_defense: true,
              ai_audit_scanner: true,
              cv_coach_export: true,
              custom_job_target: false,
              ultra_tier_sandbox: false,
            },
          },
        ];
        setCandidates(fallbackCandidates);
      }

      if (permRes.system_permissions) {
        setPermissions((prev) => ({ ...prev, ...permRes.system_permissions }));
      }
      if (permRes.candidate_permissions) {
        setCandidatePermissions(permRes.candidate_permissions);
      }
    } catch (err) {
      console.error('Failed to load admin verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (
    candidateId: string,
    newStatus: 'verified' | 'revision_requested' | 'flagged' | 'pending'
  ) => {
    setActionLoading((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const note = notesState[candidateId] || '';
      const auditor = authUser.name || 'HR Bar Raiser';
      const res = await verifyCandidateWork(candidateId, newStatus, note, auditor);

      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, ...res.candidate } : c))
      );

      const statusLabels: Record<string, string> = {
        verified: 'Certified & Approved Proof',
        revision_requested: 'Revision Requested',
        flagged: 'Flagged for Audit',
        pending: 'Reset to Pending',
      };

      showToast(`Candidate status updated: ${statusLabels[newStatus]}!`, 'success');
    } catch (err: any) {
      // Offline fallback mutation
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === candidateId) {
            const badgeMap: Record<string, string> = {
              verified: 'Certified Authentic Proof',
              revision_requested: 'Revision Requested',
              flagged: 'Flagged for Audit',
              pending: 'Pending Verification',
            };
            return {
              ...c,
              status: newStatus,
              badge: badgeMap[newStatus],
              verified_by: authUser.name || 'HR Bar Raiser',
              verified_at: new Date().toISOString(),
              notes: notesState[candidateId] || c.notes,
            };
          }
          return c;
        })
      );
      showToast(`Candidate updated locally (${newStatus}).`, 'info');
    } finally {
      setActionLoading((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  const handleToggleGlobalPermission = async (key: string) => {
    const nextVal = !permissions[key];
    const updated = { ...permissions, [key]: nextVal };
    setPermissions(updated);

    try {
      await updateAdminPermissions({ [key]: nextVal });
      showToast(`Global permission '${key}' ${nextVal ? 'Granted' : 'Revoked'}.`, 'success');
    } catch {
      showToast(`Permission '${key}' updated in local state.`, 'info');
    }
  };

  const handleToggleCandidatePermission = async (candidateId: string, permKey: string) => {
    const currentCandidate = candidates.find((c) => c.id === candidateId);
    const candPerms = currentCandidate?.permissions || {};
    const nextVal = !candPerms[permKey];
    const updatedPerms = { ...candPerms, [permKey]: nextVal };

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, permissions: updatedPerms } : c))
    );

    try {
      await updateAdminPermissions({ [permKey]: nextVal }, candidateId);
      showToast(`Permission '${permKey}' updated for ${currentCandidate?.name || 'candidate'}.`, 'success');
    } catch {
      showToast(`Permission '${permKey}' toggled locally.`, 'info');
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const verifiedCount = candidates.filter((c) => c.status === 'verified').length;
  const pendingCount = candidates.filter((c) => c.status === 'pending').length;
  const flaggedCount = candidates.filter((c) => c.status === 'flagged' || c.status === 'revision_requested').length;

  const PERMISSION_DEFINITIONS = [
    {
      key: 'code_defense',
      name: 'Interactive Code Defense Session',
      desc: 'Allow candidates to defend their code against AST counter-factual questions in real time.',
      icon: ShieldCheck,
      color: '#3978E8',
    },
    {
      key: 'ai_audit_scanner',
      name: 'AI Code & Document Scanner',
      desc: 'Grant access to upload code (.py, .pdf, .sql) for Gemini 1.5 % AI vs Handwritten analysis.',
      icon: Cpu,
      color: '#7C3AED',
    },
    {
      key: 'cv_coach_export',
      name: 'CV Document Export & Cover Letter Generator',
      desc: 'Allow exporting generated STAR bullet rewrites and tailored cover letters.',
      icon: FileText,
      color: '#059669',
    },
    {
      key: 'custom_job_target',
      name: 'Custom Job Target URL Importer',
      desc: 'Permit candidate to import custom job descriptions and calibrate AST criteria dynamically.',
      icon: Sliders,
      color: '#D97706',
    },
    {
      key: 'ultra_tier_sandbox',
      name: 'Ultra Tier AST Sandbox & Concurrency Tests',
      desc: 'Access to high-concurrency benchmarks, load simulation tests, and multi-repo indexing.',
      icon: Sparkles,
      color: '#E11D48',
    },
    {
      key: 'judge_dossier_public',
      name: 'Public Judge Dossier Sharing & QR Seal',
      desc: 'Generate immutable verification links and Bar Raiser QR certification seals.',
      icon: Award,
      color: '#10B981',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-[#10B981] text-white'
                : toast.type === 'error'
                ? 'bg-[#EF4444] text-white'
                : 'bg-[#1746A2] text-white'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOPMOST HERO PANEL: Unified Cobalt to Amber Style with HR Bar Raiser Purple Accents */}
      <div className="rounded-2xl border border-[#DDE7F5] bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#7C3AED]/30 to-[#FFC66B]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full bg-gradient-to-tr from-[#3978E8]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#7C3AED] text-white shadow-sm border border-white/20">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFC66B]" />
                HR & Admin Command Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-[#FFC66B] border border-white/15">
                Bar Raiser Authority
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/30">
                Live Verification
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Candidate Work Verification & Access Permissions
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
              Review code submitted by candidates, audit AST static validation and AI % vs. handwritten code,
              certify authentic evidence, and grant or revoke project permissions across the platform.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={loadAdminData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('dossier')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFC66B] hover:bg-[#FBBF24] text-[#0E2E72] text-xs font-bold transition-all shadow-md"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-[#0E2E72]" />
                <span>View Judge Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-blue-200 font-medium">Total Candidates</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{candidates.length}</p>
            <p className="text-[10px] text-blue-200/80 mt-0.5">AST Indexed in Pipeline</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-[#A7F3D0] font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#10B981]" /> Certified Authentic
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#6EE7B7] mt-0.5">{verifiedCount}</p>
            <p className="text-[10px] text-blue-200/80 mt-0.5">Bar Raiser Approved</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-[#FDE68A] font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#FFC66B]" /> Pending Review
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#FFC66B] mt-0.5">{pendingCount}</p>
            <p className="text-[10px] text-blue-200/80 mt-0.5">Awaiting Audit</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-[#FCA5A5] font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-[#EF4444]" /> Revision / Flagged
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#FCA5A5] mt-0.5">{flaggedCount}</p>
            <p className="text-[10px] text-blue-200/80 mt-0.5">Action Required</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: CANDIDATE WORK VERIFICATION */}
      <div className="rounded-2xl border border-[#DDE7F5] bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE7F5]">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#1746A2]" />
              <h2 className="text-lg font-bold text-[#0F1D38]">Candidate Work Verification & Evidence Audits</h2>
            </div>
            <p className="text-xs text-[#5A6E85] mt-0.5">
              Bar Raiser verification: Verify repository commits, AST evidence, and AI % audit for each user.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] rounded-xl border border-[#DDE7F5] text-xs font-bold">
            {(['all', 'verified', 'pending', 'flagged'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-[#1746A2] text-white shadow-xs'
                    : 'text-[#475874] hover:bg-white hover:text-[#1746A2]'
                }`}
              >
                {filter === 'flagged' ? 'Flagged / Revision' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate List Cards */}
        <div className="space-y-4">
          {filteredCandidates.map((cand) => {
            const isYadnesh = cand.name.toLowerCase().includes('yadnesh');
            const isVerified = cand.status === 'verified';
            const isPending = cand.status === 'pending';
            const isRevision = cand.status === 'revision_requested';
            const isFlagged = cand.status === 'flagged';

            return (
              <div
                key={cand.id}
                className={`rounded-xl border transition-all p-5 ${
                  isVerified
                    ? 'border-[#A7F3D0] bg-[#F0FDF4]/50'
                    : isRevision || isFlagged
                    ? 'border-[#FECACA] bg-[#FEF2F2]/40'
                    : 'border-[#DDE7F5] bg-[#F8FAFD]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Candidate Identity */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${
                        isVerified
                          ? 'bg-gradient-to-br from-[#059669] to-[#10B981]'
                          : isRevision || isFlagged
                          ? 'bg-gradient-to-br from-[#DC2626] to-[#EF4444]'
                          : 'bg-gradient-to-br from-[#1746A2] to-[#3978E8]'
                      }`}
                    >
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#0F1D38]">{cand.name}</h3>
                        <span className="text-xs text-[#7A8CA6]">({cand.email})</span>
                        {isYadnesh && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2FF] text-[#1746A2] border border-[#BBD9FF]">
                            Active Project Author
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 ${
                            isVerified
                              ? 'bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]'
                              : isRevision
                              ? 'bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]'
                              : isFlagged
                              ? 'bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]'
                              : 'bg-[#E1EFFE] text-[#1E429F] border border-[#B4C6FC]'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="h-3 w-3 text-[#059669]" />
                          ) : isRevision ? (
                            <AlertTriangle className="h-3 w-3 text-[#D97706]" />
                          ) : isFlagged ? (
                            <Flag className="h-3 w-3 text-[#DC2626]" />
                          ) : (
                            <Clock className="h-3 w-3 text-[#1C64F2]" />
                          )}
                          {cand.badge || cand.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#5A6E85]">
                        <span className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-[#7A8CA6]" />
                          Target: <strong className="text-[#0F1D38]">{cand.company_target}</strong> ({cand.role_target})
                        </span>
                        <span>·</span>
                        <a
                          href={cand.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#1746A2] hover:underline font-mono font-semibold"
                        >
                          <Github className="h-3.5 w-3.5" />
                          {cand.repo_name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Evidence & AI % Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-[#DDE7F5] text-xs">
                      <span className="text-[#7A8CA6] block text-[10px] font-semibold">Code Authorship</span>
                      <div className="flex items-center gap-1 font-mono font-bold mt-0.5">
                        <span className="text-[#10B981]">{cand.handwritten_percentage}% Handwritten</span>
                        <span className="text-[#DDE7F5]">/</span>
                        <span className="text-[#EF4444]">{cand.ai_percentage}% AI</span>
                      </div>
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-lg border border-[#DDE7F5] text-xs">
                      <span className="text-[#7A8CA6] block text-[10px] font-semibold">AST Match</span>
                      <span className="text-xs font-bold text-[#1746A2]">{cand.skill_match_percentage}% Aligned</span>
                    </div>
                  </div>
                </div>

                {/* AST Evidence Details */}
                <div className="mt-3.5 pt-3 border-t border-[#E5EDF7] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-bold text-[#475874] uppercase tracking-wide">
                      AST Function-Level Evidence Verified:
                    </p>
                    <p className="text-xs font-mono text-[#0F1D38] bg-white px-2.5 py-1.5 rounded-md border border-[#DDE7F5] mt-1">
                      {cand.ast_evidence}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#475874] uppercase tracking-wide">
                      Bar Raiser Seal:
                    </p>
                    <p className="text-xs text-[#5A6E85] mt-1">
                      {cand.verified_by ? (
                        <span>
                          Verified by <strong className="text-[#0F1D38]">{cand.verified_by}</strong> on{' '}
                          {new Date(cand.verified_at || Date.now()).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[#D97706] italic">Pending auditor signature</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Auditor Notes Input & Verification Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#E5EDF7] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add HR Bar Raiser audit notes..."
                      value={notesState[cand.id] ?? ''}
                      onChange={(e) =>
                        setNotesState((prev) => ({ ...prev, [cand.id]: e.target.value }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDE7F5] bg-white focus:outline-none focus:ring-2 focus:ring-[#1746A2]/20"
                    />
                  </div>

                  {/* Verification Status Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      disabled={actionLoading[cand.id]}
                      onClick={() => handleVerify(cand.id, 'verified')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        isVerified
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]'
                      }`}
                      title="Certify work as authentic AST evidence"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isVerified ? 'Certified Proof' : 'Certify & Approve'}</span>
                    </button>

                    <button
                      disabled={actionLoading[cand.id]}
                      onClick={() => handleVerify(cand.id, 'revision_requested')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        isRevision
                          ? 'bg-[#D97706] text-white shadow-sm'
                          : 'bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      }`}
                      title="Request candidate add more unit test proofs or AST coverage"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      disabled={actionLoading[cand.id]}
                      onClick={() => handleVerify(cand.id, 'flagged')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        isFlagged
                          ? 'bg-[#EF4444] text-white shadow-sm'
                          : 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                      }`}
                      title="Flag candidate for excessive AI boilerplate or missing tests"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      <span>Flag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PLATFORM CAPABILITY & PERMISSIONS MATRIX */}
      <div className="rounded-2xl border border-[#DDE7F5] bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE7F5]">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#7C3AED]" />
              <h2 className="text-lg font-bold text-[#0F1D38]">User Permissions & Access Control Matrix</h2>
            </div>
            <p className="text-xs text-[#5A6E85] mt-0.5">
              Enable or restrict platform tools and evidence-defense capabilities for users and candidates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7A8CA6]">Configure permissions for:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#DDE7F5] bg-[#F8FAFD] text-[#0F1D38] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            >
              <option value="global">🌐 System-Wide (All Users)</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  👤 {c.name} ({c.role_target.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERMISSION_DEFINITIONS.map((perm) => {
            const Icon = perm.icon;
            const isGlobal = selectedCandidateId === 'global';
            const selectedCand = candidates.find((c) => c.id === selectedCandidateId);
            const isEnabled = isGlobal
              ? !!permissions[perm.key]
              : !!(selectedCand?.permissions?.[perm.key] ?? permissions[perm.key]);

            return (
              <div
                key={perm.key}
                className={`rounded-xl border p-4 transition-all ${
                  isEnabled
                    ? 'border-[#BBD9FF] bg-[#EFF5FE]/40'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${perm.color}15`, color: perm.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F1D38]">{perm.name}</h4>
                      <span className="text-[10px] font-mono text-[#7A8CA6]">{perm.key}</span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => {
                      if (isGlobal) {
                        handleToggleGlobalPermission(perm.key);
                      } else {
                        handleToggleCandidatePermission(selectedCandidateId, perm.key);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-[#5A6E85] mt-3 leading-relaxed">{perm.desc}</p>

                <div className="mt-3 pt-2.5 border-t border-[#DDE7F5] flex items-center justify-between text-[11px]">
                  <span className="text-[#7A8CA6]">Scope:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      isEnabled ? 'text-[#059669]' : 'text-[#64748B]'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <Unlock className="h-3 w-3" /> Granted & Active
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Restricted
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
