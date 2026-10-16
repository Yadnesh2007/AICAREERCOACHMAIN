import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  Github,
  Chrome,
  Shield,
  Zap,
  Award,
} from 'lucide-react';

export interface AuthUser {
  name: string;
  email: string;
  role: 'student' | 'employee' | 'employer';
}

interface AuthPageProps {
  onAuth: (user: AuthUser) => void;
}

const ROLES = [
  {
    id: 'student' as const,
    label: 'Student',
    desc: 'Track your portfolio & close skill gaps',
    icon: GraduationCap,
    color: '#3978E8',
  },
  {
    id: 'employee' as const,
    label: 'Professional',
    desc: 'Benchmark skills for career growth',
    icon: Briefcase,
    color: '#059669',
  },
  {
    id: 'employer' as const,
    label: 'Employer',
    desc: 'Evaluate candidates with evidence',
    icon: Building2,
    color: '#D97706',
  },
];

const FEATURES = [
  { icon: Zap, text: 'Real-time GitHub skill detection' },
  { icon: Shield, text: 'Evidence-backed gap analysis' },
  { icon: Award, text: 'AI-powered career coaching' },
  { icon: CheckCircle2, text: 'Zero hallucination assessments' },
];

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'student' | 'employee' | 'employer'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (mode === 'signup' && password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setIsLoading(false);
    onAuth({ name: name || email.split('@')[0], email, role });
  };

  const handleQuickDemo = () => {
    onAuth({ name: 'Demo User', email: 'demo@skillaura.ai', role: 'student' });
  };

  const inputBase = `w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white transition-all duration-150 outline-none focus:ring-2 focus:ring-[#3978E8]/30`;

  return (
    <div className="min-h-screen bg-[#F3F7FC] flex relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[500px] bg-gradient-to-br from-[#BBD9FF]/50 to-transparent blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-[#FFC66B]/15 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-[-10%] w-[400px] h-[400px] bg-gradient-to-r from-[#3978E8]/8 to-transparent blur-[100px]" />
      </div>

      {/* LEFT HERO PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-gradient-to-br from-[#0E2E72] via-[#1746A2] to-[#2560CC] p-10 relative overflow-hidden z-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-1/2 right-12 w-48 h-48 rounded-full border border-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-11 w-11 rounded-xl bg-[#FFC66B] flex items-center justify-center shadow-lg shadow-[#FFC66B]/30">
              <Sparkles className="h-6 w-6 text-[#0E2E72]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white">
                Skill<span className="text-[#FFC66B]">Aura</span>
              </div>
              <div className="text-[11px] text-[#BBD9FF] font-medium">Sponsored by Worcflow</div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Show What Your<br />
            <span className="text-[#FFC66B]">Portfolio Proves.</span>
          </h1>
          <p className="text-[#BBD9FF] text-base leading-relaxed mb-10">
            AI-powered career coaching that compares your GitHub skills with real job requirements — with evidence, not guesswork.
          </p>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[#FFC66B]" />
                </div>
                <span className="text-sm text-[#C5D8F8] font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-[11px] text-[#BBD9FF] font-semibold uppercase tracking-widest mb-1">Trusted by</p>
            <p className="text-white font-bold text-sm">500+ students & professionals</p>
            <p className="text-[#8EB4E8] text-xs mt-0.5">across 40+ top universities & companies</p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1746A2] to-[#3978E8] flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-[#FFC66B]" />
            </div>
            <span className="text-xl font-black text-[#0F1D38]">
              Skill<span className="text-[#3978E8]">Aura</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE7F5] shadow-[0_8px_40px_-8px_rgba(23,70,162,0.12)] p-8">
            {/* Tab Toggle */}
            <div className="flex items-center bg-[#F3F7FC] rounded-xl p-1 mb-6">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrors({}); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-[#1746A2] shadow-sm border border-[#DDE7F5]'
                      : 'text-[#7A8CA6] hover:text-[#475874]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-black text-[#0F1D38] mb-1">
                  {mode === 'login' ? 'Welcome back' : 'Get started for free'}
                </h2>
                <p className="text-sm text-[#7A8CA6] mb-6">
                  {mode === 'login'
                    ? 'Sign in to access your career assessments.'
                    : 'Create an account to begin your career analysis.'}
                </p>

                {/* Role Selector */}
                {mode === 'signup' && (
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-[#475874] uppercase tracking-wider mb-2">
                      I am a…
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => {
                        const Icon = r.icon;
                        const active = role === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                              active
                                ? 'border-transparent text-white shadow-md'
                                : 'bg-white text-[#475874] border-[#DDE7F5] hover:border-[#BBD9FF]'
                            }`}
                            style={active ? { background: r.color, boxShadow: `0 4px 14px ${r.color}40` } : {}}
                          >
                            <Icon className="h-5 w-5" style={{ color: active ? 'white' : r.color }} />
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[#9AB4D8] mt-1.5 pl-1">
                      {ROLES.find(r => r.id === role)?.desc}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-[#475874] mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AB4D8]" />
                        <input
                          type="text"
                          placeholder="Jane Smith"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className={`${inputBase} pl-10 ${errors.name ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'}`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#475874] mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AB4D8]" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`${inputBase} pl-10 ${errors.email ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#475874]">Password</label>
                      {mode === 'login' && (
                        <button type="button" className="text-xs text-[#3978E8] hover:underline font-medium">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AB4D8]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`${inputBase} pl-10 pr-10 ${errors.password ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AB4D8] hover:text-[#475874] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #1746A2 0%, #3978E8 100%)',
                      boxShadow: '0 4px 18px rgba(23,70,162,0.35)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#E8F0FB]" />
                  <span className="text-[11px] text-[#9AB4D8] font-semibold">or continue with</span>
                  <div className="flex-1 h-px bg-[#E8F0FB]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Github, label: 'GitHub' },
                    { Icon: Chrome, label: 'Google' },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={handleQuickDemo}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-semibold text-[#475874] hover:border-[#BBD9FF] hover:bg-[#F8FAFD] transition-all duration-150"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#F0F5FC] text-center">
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="text-xs text-[#7A8CA6] hover:text-[#3978E8] font-medium transition-colors hover:underline underline-offset-2"
                  >
                    🚀 Skip sign-in — Try demo instantly
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-[11px] text-[#9AB4D8] mt-5">
            By continuing, you agree to SkillAura's{' '}
            <span className="text-[#3978E8] cursor-pointer hover:underline">Terms</span> &{' '}
            <span className="text-[#3978E8] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
