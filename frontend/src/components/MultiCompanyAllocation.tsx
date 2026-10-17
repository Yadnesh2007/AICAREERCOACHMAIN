import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  DollarSign,
  MapPin,
  ArrowRight,
  Check,
} from 'lucide-react';
import { fetchCompanyMatches } from '../lib/api';

interface MultiCompanyAllocationProps {
  onSelectTargetCompany?: (company: string, role: string, url: string, companyId?: string) => void;
  activeCompany?: string;
  selectedCompanyId?: string;
}

export const MultiCompanyAllocation: React.FC<MultiCompanyAllocationProps> = ({
  onSelectTargetCompany,
  activeCompany = 'Stripe',
  selectedCompanyId: propSelectedId,
}) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(propSelectedId || 'comp_stripe');

  useEffect(() => {
    if (propSelectedId) {
      setSelectedCompanyId(propSelectedId);
    } else if (activeCompany && companies.length > 0) {
      const match = companies.find(
        (c) => c.company.toLowerCase() === activeCompany.toLowerCase()
      );
      if (match) setSelectedCompanyId(match.id);
    }
  }, [propSelectedId, activeCompany, companies]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await fetchCompanyMatches();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load multi-company matches', err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const matchRate = c.match_rate ?? c.match_percentage ?? 75;
    if (filterTier === 'all') return true;
    if (filterTier === 'high_match') return matchRate >= 80;
    if (filterTier === 'fintech') return ['Stripe', 'Razorpay'].some(n => c.company?.includes(n));
    if (filterTier === 'big_tech') return ['Google', 'Meta', 'Amazon', 'Microsoft'].some(n => c.company?.includes(n));
    return true;
  });

  const handleSelect = (c: any) => {
    setSelectedCompanyId(c.id);
    if (onSelectTargetCompany) {
      onSelectTargetCompany(c.company, c.role, c.genuine_url || c.job_url || 'https://stripe.com/jobs', c.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-7 shadow-xl shadow-[#1746A2]/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FFC66B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Multi-Company Job Allocation</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Across 8+ Tech Leaders</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Skill & Code Match Beyond Stripe
            </h2>
            <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
              Based on your demonstrated AST code signatures, we cross-evaluate your portfolio against open requisitions at <strong>Google, Meta, Razorpay, Amazon, Datadog, Microsoft, and Swiggy</strong>.
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
              <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Real-Time Allocation</p>
              <p className="text-xs font-black text-white">8 Target Employers</p>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-5 flex flex-wrap gap-2 relative z-10">
          {[
            { id: 'all', label: 'All 8 Companies' },
            { id: 'high_match', label: 'High Match (>80%)' },
            { id: 'fintech', label: 'FinTech & Payments' },
            { id: 'big_tech', label: 'Tier-1 Big Tech' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTier === tab.id
                  ? 'bg-white text-[#0E2E72] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#1746A2] border-t-transparent animate-spin" />
          <p className="text-xs text-[#7A8CA6]">Cross-evaluating requirements across tech companies…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCompanies.map((c) => {
            const isSelected = selectedCompanyId === c.id;
            const matchRate = c.match_rate ?? c.match_percentage ?? 75;
            const matchedSkills: string[] = c.matched_skills || c.skills_matched || [];
            const missingSkills: string[] = c.missing_skills || c.skills_missing || [];
            const salary = c.salary || c.salary_range || 'Competitive';
            const genuineUrl = c.genuine_url || c.job_url || '#';

            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -3 }}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-[#1746A2] shadow-xl shadow-[#1746A2]/10 bg-gradient-to-b from-white to-[#F6FAFF]'
                    : 'border-[#DDE7F5] shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Logo & Match % */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1746A2] to-[#3978E8] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                        {c.logo_text || (c.company || 'CO').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-[#0F1D38] text-sm leading-tight">{c.company || 'Company'}</h3>
                        <p className="text-[11px] text-[#7A8CA6] font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{c.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-black ${
                          matchRate >= 85
                            ? 'text-[#10B981]'
                            : matchRate >= 70
                            ? 'text-[#1746A2]'
                            : 'text-[#D97706]'
                        }`}
                      >
                        {matchRate}%
                      </div>
                      <span className="text-[10px] text-[#7A8CA6] font-semibold block -mt-1">
                        Skill Fit
                      </span>
                    </div>
                  </div>

                  {/* Role Title */}
                  <div>
                    <h4 className="font-bold text-xs text-[#1746A2] leading-snug">{c.role}</h4>
                    <p className="text-[11px] text-[#475874] flex items-center gap-1 mt-1 font-mono">
                      <DollarSign className="h-3 w-3 text-[#10B981]" />
                      <span>{salary}</span>
                    </p>
                  </div>

                  {/* Skills Matched */}
                  <div className="space-y-1.5 pt-2 border-t border-[#EDF2F9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified Skills ({matchedSkills.length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] text-[10px] font-semibold border border-[#A7F3D0]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Gaps / Missing */}
                  {missingSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Recommended Gaps ({missingSkills.length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((s: string) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#92400E] text-[10px] font-semibold border border-[#FDE68A]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-[#EDF2F9] space-y-2">
                  <button
                    onClick={() => handleSelect(c)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1746A2] text-white shadow-sm'
                        : 'bg-[#EFF5FE] text-[#1746A2] hover:bg-[#DCEBFF] border border-[#BBD9FF]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Active Target Company</span>
                      </>
                    ) : (
                      <>
                        <span>Select as Target Goal</span>
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>

                  <a
                    href={genuineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-[10px] text-[#7A8CA6] hover:text-[#1746A2] font-semibold transition-colors"
                  >
                    View Official Career Page ↗
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
