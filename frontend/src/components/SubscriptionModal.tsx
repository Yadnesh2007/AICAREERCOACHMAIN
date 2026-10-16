import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  X,
  Zap,
  Crown,
  ShieldCheck,
  Rocket,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export type PlanType = 'free' | 'pro' | 'ultra';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<PlanType>(currentPlan);

  if (!isOpen) return null;

  const handleSelect = (tier: PlanType) => {
    setSelectedTier(tier);
    onSelectPlan(tier);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const PLANS = [
    {
      id: 'free' as PlanType,
      name: 'Free Starter',
      badge: 'Beginner Friendly',
      description: 'Perfect for students learning to code and building their first GitHub portfolio.',
      priceMonthly: '$0',
      priceYearly: '$0',
      period: 'forever',
      accentColor: '#3978E8',
      buttonVariant: 'secondary',
      popular: false,
      features: [
        '1 Linked GitHub Repository',
        'Basic Code Syntax & AST Scanner',
        '3 Verified Skill Badges',
        'Single Job Requirement Comparison',
        'Public Skill Evidence Links',
        'Standard Community Discord Support',
      ],
      limitations: [
        'No real-time webhook reassessment',
        'Limited to 1 AI Gap Blueprint',
        'No mock interview defense coaching',
      ],
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro Career',
      badge: 'Most Popular ⭐',
      description: 'Accelerate your job search with live GitHub push updates and 1-click code fixes.',
      priceMonthly: '$19',
      priceYearly: '$15',
      period: 'per month',
      accentColor: '#F59E0B',
      buttonVariant: 'primary',
      popular: true,
      features: [
        'Unlimited GitHub Repositories',
        'Instant Push Reassessment (Sub-second)',
        'All 5+ AI Gap Lab Code Blueprints',
        '1-Click Code Remediation Generator',
        'ATS Resume Scanner & STAR Optimizer',
        'AI Mock Interview Code Defense Practice',
        'Exportable Verifiable JSON & PDF Dossiers',
        'Priority Technical Support',
      ],
      limitations: [],
    },
    {
      id: 'ultra' as PlanType,
      name: 'Ultra Accelerator',
      badge: 'Career Guarantee 🚀',
      description: 'The ultimate toolkit for serious job seekers aiming for top tier tech companies.',
      priceMonthly: '$49',
      priceYearly: '$39',
      period: 'per month',
      accentColor: '#7C3AED',
      buttonVariant: 'ultra',
      popular: false,
      features: [
        'Everything in Pro included',
        '1-on-1 AI Career Coach with custom roadmap',
        'Company-Specific Mock Interviews (Stripe, Google)',
        'Personal Custom Domain (yourname.skillaura.dev)',
        'Cryptographic Tamper-Proof Credentials (HMAC)',
        'Direct Recruiter Talent Pool Matching',
        '24/7 Dedicated Mentor & Code Review Access',
        'Lifetime Evidence Passport Hosting',
      ],
      limitations: [],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#07132B]/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#DDE7F5] overflow-hidden z-10 my-8"
        >
          {/* Top Banner Gradient */}
          <div className="bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#FFC66B]/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-[#38BDF8]/15 blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FFC66B]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>SkillAura Subscription & Plans</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Choose the Right Plan for Your Career Growth
              </h2>
              <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
                Unlock full access to automated code analysis, ready-to-use gap solutions, and AI mock interview practice.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#0E2E72] shadow-sm'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#FFC66B] text-[#0E2E72] shadow-sm'
                    : 'text-white hover:text-white/80'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-[#0E2E72] text-[#FFC66B] rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F8FAFD]">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    plan.popular
                      ? 'bg-white border-2 border-[#F59E0B] shadow-xl shadow-[#F59E0B]/10 scale-[1.02]'
                      : 'bg-white border border-[#DDE7F5] shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Popular Floating Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] text-[11px] font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      {!plan.popular && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#3978E8] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF]">
                          {plan.badge}
                        </span>
                      )}
                      <h3 className="text-xl font-black text-[#0F1D38] mt-2">{plan.name}</h3>
                      <p className="text-xs text-[#627796] mt-1 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-[#EDF2F9]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-[#0F1D38]">{price}</span>
                        <span className="text-xs text-[#7A8CA6] font-medium">{plan.period}</span>
                      </div>
                      {billingCycle === 'yearly' && plan.id !== 'free' && (
                        <p className="text-[11px] text-[#10B981] font-bold mt-0.5">Billed annually (Save $48/yr)</p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#1746A2]">What's Included:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#334155] leading-tight">
                            <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.limitations.length > 0 && (
                        <div className="pt-2 border-t border-dashed border-[#E2E8F0] space-y-1.5">
                          {plan.limitations.map((limit, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-[#94A3B8] leading-tight list-none">
                              <X className="h-3.5 w-3.5 text-[#CBD5E1] shrink-0 mt-0.5" />
                              <span>{limit}</span>
                            </li>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6 mt-6 border-t border-[#EDF2F9]">
                    <button
                      onClick={() => handleSelect(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-[#E2E8F0] text-[#64748B] cursor-default'
                          : plan.popular
                          ? 'bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] hover:opacity-95 shadow-md shadow-[#F59E0B]/20 active:scale-95'
                          : plan.buttonVariant === 'ultra'
                          ? 'bg-gradient-to-r from-[#1746A2] to-[#7C3AED] text-white hover:opacity-95 shadow-md shadow-[#7C3AED]/20 active:scale-95'
                          : 'bg-[#EFF5FE] hover:bg-[#DCEBFF] text-[#1746A2] border border-[#BBD9FF] active:scale-95'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Current Active Plan</span>
                        </>
                      ) : (
                        <>
                          <span>Choose {plan.name}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Guarantees & Support */}
          <div className="bg-white border-t border-[#DDE7F5] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#627796]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" /> 14-day money-back guarantee
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-4 w-4 text-[#F59E0B]" /> Instant access upon selection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0F1D38] font-bold">Need a team license?</span>
              <a
                href="mailto:support@skillaura.ai"
                className="text-[#1746A2] hover:underline font-semibold"
              >
                Contact University/Campus Sales →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
