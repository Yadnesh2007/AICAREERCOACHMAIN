import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Database,
  Cloud,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { fetchDomainExpansionAdvice } from '../lib/api';

export const DomainExpansionAdvisor: React.FC = () => {
  const [adviceData, setAdviceData] = useState<any | null>(null);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('domain_data_eng');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAdvice = async () => {
      try {
        const data = await fetchDomainExpansionAdvice();
        setAdviceData(data);
        if (data?.domains?.length > 0) {
          setSelectedDomainId(data.domains[0].id);
        }
      } catch (err) {
        console.error('Failed to load domain expansion advice', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdvice();
  }, []);

  const getDomainIcon = (id: string = '') => {
    if (id.includes('data')) return Database;
    if (id.includes('ai') || id.includes('llm')) return BrainCircuit;
    if (id.includes('cloud') || id.includes('devops')) return Cloud;
    if (id.includes('fintech')) return CreditCard;
    return ShieldCheck;
  };

  const domainsList: any[] = adviceData?.domains || [];
  const selectedDomain =
    domainsList.find((d) => d.id === selectedDomainId) || domainsList[0] || null;

  const currentSkills: string[] = adviceData?.current_core_skills || [
    'Python 3.11+ Core & Async',
    'Relational SQL & Joins',
    'FastAPI Web Services',
    'Docker Containerization',
    'HMAC Cryptographic Security',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Gradient with Career Companion Badge */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-7 shadow-xl shadow-[#1746A2]/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FFC66B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Compass className="h-3.5 w-3.5" />
              <span>Cross-Domain Skill Advisor</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Expand Beyond Your Current Role</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Unlock High-Growth Adjacent Domains
            </h2>
            <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
              Your verified skills in <strong>Python, SQL, REST APIs, and System Design</strong> give you an instant head start in specialized engineering disciplines. See how little effort it takes to bridge into <strong>Data Engineering, AI/LLM Ops, or Cloud Systems</strong>.
            </p>
          </div>

          {/* Attached Companion Phone Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-3.5 rounded-2xl border border-white/20 shrink-0">
            <img
              src="/career-companion.png"
              alt="SkillAura Companion"
              className="h-12 w-11 object-cover rounded-xl shadow-md border border-white/20"
            />
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Skill Transferability</p>
              <p className="text-xs font-black text-white">Up to 90% Match</p>
            </div>
          </div>
        </div>

        {/* Current Core Competencies strip */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-[11px] font-bold text-[#FFC66B] uppercase tracking-wider mr-1">
            Your Established Baseline:
          </span>
          {currentSkills.map((s: string) => (
            <span
              key={s}
              className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/20 text-[11px] font-medium text-white"
            >
              ✓ {s}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#1746A2] border-t-transparent animate-spin" />
          <p className="text-xs text-[#7A8CA6]">Computing skill overlap matrices…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Domain Selection Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475874] block mb-1">
              Recommended Engineering Disciplines:
            </span>
            {domainsList.map((d: any) => {
              const Icon = getDomainIcon(d.id);
              const isSelected = selectedDomainId === d.id;
              const title = d.title || d.domain || 'Engineering Discipline';
              const bridgeSkills: string[] = d.bridge_skills_to_learn || d.bridge_skills || [];
              const score = d.transferability_score || 80;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomainId(d.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-2 border-[#1746A2] shadow-lg shadow-[#1746A2]/10 scale-[1.01]'
                      : 'bg-white border-[#DDE7F5] hover:bg-[#F8FAFD] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#1746A2] to-[#3978E8] text-white shadow-md'
                          : 'bg-[#EFF5FE] text-[#1746A2]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#0F1D38] leading-snug truncate">{title}</h4>
                      <p className="text-[11px] text-[#7A8CA6] font-mono mt-0.5">
                        +{bridgeSkills.length} Bridge Skills Needed
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black ${
                        score >= 80 ? 'text-[#10B981]' : 'text-[#1746A2]'
                      }`}
                    >
                      {score}%
                    </span>
                    <span className="text-[10px] text-[#7A8CA6] block font-semibold">
                      Overlap
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Advisor Card (7 cols) */}
          {selectedDomain && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDE7F5] shadow-sm p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDF2F9]">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-black uppercase tracking-wider mb-1">
                    <TrendingUp className="h-3 w-3 text-[#10B981]" />
                    <span>{selectedDomain.transferability_score}% Skill Transferability</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0F1D38]">
                    {selectedDomain.title || selectedDomain.domain}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#7A8CA6] uppercase font-bold block">
                    Target Compensation
                  </span>
                  <span className="text-sm font-mono font-black text-[#10B981]">
                    {selectedDomain.salary_benchmark || selectedDomain.salary_upside || '$145k - $190k'}
                  </span>
                </div>
              </div>

              {/* Why it fits rationale / actionable advice */}
              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-1.5">
                <span className="text-[11px] font-bold text-[#1746A2] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>Why Your Current Skills Fit:</span>
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {selectedDomain.actionable_advice || selectedDomain.why_it_fits || 'Your established code proofs transfer seamlessly.'}
                </p>
              </div>

              {/* Shared Skills vs Bridge Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Already Possessed */}
                <div className="p-4 rounded-xl bg-[#ECFDF5]/50 border border-[#A7F3D0] space-y-2">
                  <span className="text-xs font-bold text-[#065F46] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                    <span>Skills You Already Have:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDomain.current_transferable_skills || selectedDomain.shared_skills || []).map(
                      (s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-white text-[#065F46] text-[11px] font-semibold border border-[#A7F3D0] shadow-2xs"
                        >
                          ✓ {s}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Bridge Skills to Learn */}
                <div className="p-4 rounded-xl bg-[#EFF5FE] border border-[#BBD9FF] space-y-2">
                  <span className="text-xs font-bold text-[#1746A2] uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight className="h-3.5 w-3.5 text-[#3978E8]" />
                    <span>Bridge Skills to Acquire:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDomain.bridge_skills_to_learn || selectedDomain.bridge_skills || []).map(
                      (s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-white text-[#1746A2] text-[11px] font-bold border border-[#BBD9FF] shadow-2xs"
                        >
                          + {s}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Difficulty to Bridge Badge */}
              <div className="flex items-center justify-between text-xs bg-[#F8FAFD] p-3 rounded-xl border border-[#DDE7F5]">
                <span className="text-[#627796] font-semibold">Estimated Effort to Transition:</span>
                <span className="font-bold text-[#1746A2] bg-white px-2.5 py-0.5 rounded border border-[#BBD9FF]">
                  {selectedDomain.difficulty_to_bridge || 'Low (2-3 weeks)'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
