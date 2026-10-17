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
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { submitStripePayment } from '../lib/api';

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
  const [step, setStep] = useState<'select' | 'stripe_checkout' | 'success'>('select');

  // Stripe form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Alex Morgan');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2028');
  const [cvc, setCvc] = useState('123');
  const [postalCode, setPostalCode] = useState('94103');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const handlePlanClick = (tier: PlanType) => {
    setSelectedTier(tier);
    if (tier === 'free') {
      onSelectPlan('free');
      setTimeout(onClose, 300);
    } else {
      setStep('stripe_checkout');
      setStripeError(null);
    }
  };

  const handleAutofillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardName('Yadnesh Candidate');
    setExpMonth('09');
    setExpYear('2028');
    setCvc('999');
    setPostalCode('94107');
    setStripeError(null);
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const handleStripePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStripeError(null);
    setIsProcessing(true);

    try {
      const receipt = await submitStripePayment({
        plan_tier: selectedTier,
        billing_cycle: billingCycle,
        card_number: cardNumber.replace(/\s+/g, ''),
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
        postal_code: postalCode,
        name_on_card: cardName,
      });

      setPaymentReceipt(receipt);
      onSelectPlan(selectedTier);
      setStep('success');
    } catch (err: any) {
      setStripeError(err.message || 'Payment processing failed. Please check your card details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishSuccess = () => {
    setStep('select');
    onClose();
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

  const planObj = PLANS.find((p) => p.id === selectedTier) || PLANS[1];
  const payableAmount = billingCycle === 'monthly' ? planObj.priceMonthly : planObj.priceYearly;

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
                <span>
                  {step === 'stripe_checkout'
                    ? 'Stripe Payment Gateway · 256-bit SSL'
                    : step === 'success'
                    ? 'Subscription Confirmed'
                    : 'SkillAura Subscription & Plans'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {step === 'stripe_checkout'
                  ? `Complete Subscription for ${planObj.name}`
                  : step === 'success'
                  ? 'Payment Successful & Plan Activated!'
                  : 'Choose the Right Plan for Your Career Growth'}
              </h2>
              <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
                {step === 'stripe_checkout'
                  ? 'Directly securely processed through Stripe Payments. Instant activation upon authorization.'
                  : step === 'success'
                  ? 'Your transaction has been processed. All pro features and real-time AST gap blueprints are ready.'
                  : 'Unlock full access to automated code analysis, ready-to-use gap solutions, and AI mock interview practice.'}
              </p>
            </div>

            {/* Billing Toggle (Only on Plan Selection screen) */}
            {step === 'select' && (
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
            )}
          </div>

          {/* STEP 1: SELECT PLAN */}
          {step === 'select' && (
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
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] text-[11px] font-black uppercase tracking-wider shadow-md">
                        {plan.badge}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        {!plan.popular && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#3978E8] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF]">
                            {plan.badge}
                          </span>
                        )}
                        <h3 className="text-xl font-black text-[#0F1D38] mt-2">{plan.name}</h3>
                        <p className="text-xs text-[#627796] mt-1 leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="pt-2 border-t border-[#EDF2F9]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-[#0F1D38]">{price}</span>
                          <span className="text-xs text-[#7A8CA6] font-medium">{plan.period}</span>
                        </div>
                        {billingCycle === 'yearly' && plan.id !== 'free' && (
                          <p className="text-[11px] text-[#10B981] font-bold mt-0.5">Billed annually (Save $48/yr)</p>
                        )}
                      </div>

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

                    <div className="pt-6 mt-6 border-t border-[#EDF2F9]">
                      <button
                        onClick={() => handlePlanClick(plan.id)}
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
                        ) : plan.id === 'free' ? (
                          <span>Downgrade to Free</span>
                        ) : (
                          <>
                            <span>Pay with Stripe ({price})</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: STRIPE PAYMENTS CHECKOUT FORM */}
          {step === 'stripe_checkout' && (
            <div className="p-6 sm:p-8 bg-[#F8FAFD] space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-xs text-[#1746A2] hover:underline font-bold flex items-center gap-1"
                >
                  ← Back to Plans
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#627796] flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-[#10B981]" /> Powered by Stripe
                  </span>
                  <button
                    type="button"
                    onClick={handleAutofillTestCard}
                    className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#EFF5FE] text-[#1746A2] border border-[#BBD9FF] hover:bg-[#DCEBFF] transition-colors"
                  >
                    ⚡ Autofill Test Card (4242)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Summary Column */}
                <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-[#DDE7F5] shadow-sm space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1746A2] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF]">
                    Order Summary
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[#0F1D38]">{planObj.name}</h3>
                    <p className="text-xs text-[#7A8CA6] capitalize mt-0.5">{billingCycle} Billing</p>
                  </div>

                  <div className="pt-3 border-t border-[#EDF2F9] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#627796]">Subtotal:</span>
                      <span className="font-bold text-[#0F1D38]">{payableAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#627796]">Tax (0%):</span>
                      <span className="font-bold text-[#0F1D38]">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#EDF2F9] text-sm">
                      <span className="font-bold text-[#0F1D38]">Total Due Now:</span>
                      <span className="font-black text-[#1746A2]">{payableAmount}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EDF2F9] space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#10B981] font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Cancel anytime with 1-click
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#10B981] font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> 14-day money-back guarantee
                    </div>
                  </div>
                </div>

                {/* Stripe Credit Card Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#DDE7F5] shadow-sm">
                  <form onSubmit={handleStripePay} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1.5">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-medium text-[#0F1D38] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#334155]">Card Number</label>
                        <span className="text-[10px] font-bold text-[#1746A2] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF]">
                          {getCardBrand(cardNumber)}
                        </span>
                      </div>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8CA6]" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono font-medium text-[#0F1D38] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#334155] mb-1.5">MM</label>
                        <input
                          type="text"
                          value={expMonth}
                          onChange={(e) => setExpMonth(e.target.value)}
                          placeholder="12"
                          maxLength={2}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono text-center text-[#0F1D38] outline-none focus:border-[#2563EB]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#334155] mb-1.5">YYYY</label>
                        <input
                          type="text"
                          value={expYear}
                          onChange={(e) => setExpYear(e.target.value)}
                          placeholder="2028"
                          maxLength={4}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono text-center text-[#0F1D38] outline-none focus:border-[#2563EB]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#334155] mb-1.5">CVC</label>
                        <input
                          type="password"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono text-center text-[#0F1D38] outline-none focus:border-[#2563EB]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1.5">
                        Postal / ZIP Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="94103"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono text-[#0F1D38] outline-none focus:border-[#2563EB]"
                        required
                      />
                    </div>

                    {stripeError && (
                      <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{stripeError}</span>
                      </div>
                    )}

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] font-black text-xs hover:opacity-95 shadow-md shadow-[#F59E0B]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-[#0E2E72]" />
                            <span>Contacting Stripe Gateway…</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 text-[#0E2E72]" />
                            <span>Authorize & Pay {payableAmount} with Stripe</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT SUCCESS RECEIPT */}
          {step === 'success' && paymentReceipt && (
            <div className="p-8 bg-[#F8FAFD] space-y-6 text-center max-w-xl mx-auto">
              <div className="h-16 w-16 rounded-full bg-[#ECFDF5] border-2 border-[#10B981] text-[#10B981] flex items-center justify-center mx-auto shadow-lg shadow-[#10B981]/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#0F1D38]">
                  Payment Authorized by Stripe!
                </h3>
                <p className="text-xs text-[#475874] mt-1">
                  Your subscription to <strong>{planObj.name}</strong> is now active.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#DDE7F5] shadow-sm text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#627796]">PaymentIntent ID:</span>
                  <code className="font-mono font-bold text-[#1746A2]">{paymentReceipt.payment_intent_id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#627796]">Stripe Charge Token:</span>
                  <code className="font-mono text-[#0F1D38]">{paymentReceipt.charge_token}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#627796]">Amount Charged:</span>
                  <span className="font-bold text-[#10B981]">${paymentReceipt.amount_charged} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#627796]">Status:</span>
                  <span className="font-black text-[#10B981] uppercase tracking-wider text-[11px] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    {paymentReceipt.status}
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinishSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1746A2] to-[#2563EB] text-white font-bold text-xs hover:opacity-95 shadow-md transition-all"
              >
                Start Using {planObj.name} Features
              </button>
            </div>
          )}

          {/* Bottom Guarantees & Support */}
          <div className="bg-white border-t border-[#DDE7F5] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#627796]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" /> 14-day money-back guarantee
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-4 w-4 text-[#F59E0B]" /> Instant access upon authorization
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0F1D38] font-bold">Need assistance?</span>
              <a
                href="mailto:support@skillaura.ai"
                className="text-[#1746A2] hover:underline font-semibold"
              >
                Contact Billing Support →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
