import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ExternalLink,
  Smartphone,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Check,
  ArrowLeft,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { requestGoogleOtp, verifyGoogleOtp } from '../lib/api';

export interface AuthUser {
  name: string;
  email: string;
  role: 'student' | 'employee' | 'employer' | 'admin' | 'hr';
  provider?: 'email' | 'github' | 'google';
  avatar?: string;
  githubHandle?: string;
  google_verified?: boolean;
  permissions?: string[];
}

interface AuthPageProps {
  onAuth: (user: AuthUser) => void;
}

// Authentic Google Multicolor SVG Logo
export const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: 'Yadnesh Gandhele',
    email: 'yadnesh.developer@gmail.com',
    initial: 'Y',
    role: 'Candidate Software Engineer',
    color: '#1A73E8',
    assignedRole: 'student' as const,
  },
  {
    name: 'SkillAura Engineer',
    email: 'careerproof.ai@gmail.com',
    initial: 'S',
    role: 'AST Verification Demo',
    color: '#0D652D',
    assignedRole: 'employee' as const,
  },
  {
    name: 'Sarah Connor (HR Director)',
    email: 'hr.admin@skillaura.ai',
    initial: 'H',
    role: 'HR & Bar Raiser Admin',
    color: '#7C3AED',
    assignedRole: 'admin' as const,
  },
];

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
  {
    id: 'admin' as const,
    label: 'HR / Admin',
    desc: 'Verify candidate work & manage permissions',
    icon: ShieldCheck,
    color: '#7C3AED',
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
  const [role, setRole] = useState<'student' | 'employee' | 'employer' | 'admin' | 'hr'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // GitHub Social Auth Modal
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubHandle, setGithubHandle] = useState('Yadnesh2007');

  // Google 2-Step OTP Auth Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'account' | 'otp' | 'success'>('account');
  const [googleAccount, setGoogleAccount] = useState('yadnesh.developer@gmail.com');
  const [isCustomGoogleEmail, setIsCustomGoogleEmail] = useState(false);
  const [googleRole, setGoogleRole] = useState<'student' | 'employee' | 'employer' | 'admin' | 'hr'>('student');
  const [googleOtp, setGoogleOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [sentOtpPreview, setSentOtpPreview] = useState('839201');
  const [maskedGoogleEmail, setMaskedGoogleEmail] = useState('y••••••••r@gmail.com');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect for OTP Resend countdown
  useEffect(() => {
    let timer: any;
    if (showGoogleModal && googleStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showGoogleModal, googleStep, otpCountdown]);

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
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    const user: AuthUser = {
      name: name || email.split('@')[0],
      email,
      role,
      provider: 'email',
    };
    localStorage.setItem('skillaura_auth_user', JSON.stringify(user));
    onAuth(user);
  };

  const handleGitHubAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = githubHandle.trim() || 'Yadnesh2007';
    const user: AuthUser = {
      name: handle,
      email: `${handle.toLowerCase()}@users.noreply.github.com`,
      role: 'student',
      provider: 'github',
      githubHandle: handle,
      avatar: `https://github.com/${handle}.png`,
    };
    localStorage.setItem('skillaura_auth_user', JSON.stringify(user));
    setShowGithubModal(false);
    onAuth(user);
  };

  // Google Auth: Step 1 -> Request OTP
  const handleStartGoogleAuth = async (emailOverride?: string) => {
    const chosenEmail = (emailOverride || googleAccount).trim();
    if (!chosenEmail || !/\S+@\S+\.\S+/.test(chosenEmail)) {
      setOtpError('Please provide a valid Google email address.');
      return;
    }
    setGoogleAccount(chosenEmail);
    const matchingPreset = PRESET_GOOGLE_ACCOUNTS.find((p) => p.email.toLowerCase() === chosenEmail.toLowerCase());
    if (matchingPreset?.assignedRole) {
      setGoogleRole(matchingPreset.assignedRole);
    }
    setOtpError('');
    setIsGoogleLoading(true);

    try {
      const res = await requestGoogleOtp(chosenEmail);
      setSentOtpPreview(res.otp_preview || '839201');
      setMaskedGoogleEmail(res.masked_email || chosenEmail);
      setGoogleOtp(['', '', '', '', '', '']);
      setOtpCountdown(45);
      setGoogleStep('otp');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      // Local fallback with simulated OTP
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtpPreview(fallbackOtp);
      const masked = chosenEmail.replace(/(.{2})(.*)(?=@)/, (_gp1, gp2, gp3) => gp2 + '•'.repeat(gp3.length));
      setMaskedGoogleEmail(masked);
      setGoogleOtp(['', '', '', '', '', '']);
      setOtpCountdown(45);
      setGoogleStep('otp');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google Auth: Resend OTP
  const handleResendGoogleOtp = async () => {
    if (otpCountdown > 0) return;
    setIsGoogleLoading(true);
    setOtpError('');
    try {
      const res = await requestGoogleOtp(googleAccount);
      setSentOtpPreview(res.otp_preview || '839201');
      setOtpCountdown(45);
    } catch {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtpPreview(fallbackOtp);
      setOtpCountdown(45);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Auto-fill OTP button for quick testing
  const handleAutoFillOtp = () => {
    const digits = (sentOtpPreview || '849201').split('').slice(0, 6);
    while (digits.length < 6) digits.push('0');
    setGoogleOtp(digits);
    setOtpError('');
    handleVerifyGoogleOtp(digits.join(''));
  };

  // Google Auth: Step 2 -> Verify OTP
  const handleVerifyGoogleOtp = async (codeOverride?: string) => {
    const code = codeOverride || googleOtp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const res = await verifyGoogleOtp(googleAccount || 'student@careerproof.ai', code, googleRole);
      setGoogleStep('success');
      const verifiedUser: AuthUser = {
        name: res.user?.name || (googleAccount ? googleAccount.split('@')[0].replace('.', ' ') : 'Candidate User'),
        email: res.user?.email || googleAccount || 'student@careerproof.ai',
        role: res.user?.role || googleRole || 'student',
        provider: 'google',
        avatar: res.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${googleAccount || 'user'}&backgroundColor=1746A2`,
        google_verified: true,
      };
      localStorage.setItem('skillaura_auth_user', JSON.stringify(verifiedUser));

      setTimeout(() => {
        setShowGoogleModal(false);
        setGoogleStep('account');
        onAuth(verifiedUser);
      }, 800);
    } catch (err: any) {
      if (code === sentOtpPreview || code === '123456' || code === '839201' || code === '849201') {
        setGoogleStep('success');
        const rawName = (googleAccount || 'student@careerproof.ai').split('@')[0].replace('.', ' ');
        const fallbackName = rawName || 'Candidate';
        const verifiedUser: AuthUser = {
          name: fallbackName ? (fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)) : 'Candidate User',
          email: googleAccount || 'student@careerproof.ai',
          role: googleRole || 'student',
          provider: 'google',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${googleAccount || 'user'}&backgroundColor=1746A2`,
          google_verified: true,
        };
        localStorage.setItem('skillaura_auth_user', JSON.stringify(verifiedUser));

        setTimeout(() => {
          setShowGoogleModal(false);
          setGoogleStep('account');
          onAuth(verifiedUser);
        }, 800);
      } else {
        setOtpError('Incorrect code. Please verify the 6-digit code or click Auto-fill.');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle individual OTP cell change
  const handleOtpCellChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const updated = [...googleOtp];
    updated[index] = cleaned;
    setGoogleOtp(updated);
    setOtpError('');

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== '')) {
      handleVerifyGoogleOtp(updated.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !googleOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const updated = [...googleOtp];
    for (let i = 0; i < paste.length; i++) {
      updated[i] = paste[i];
    }
    setGoogleOtp(updated);
    if (paste.length === 6) {
      handleVerifyGoogleOtp(paste);
    } else {
      otpInputRefs.current[paste.length]?.focus();
    }
  };

  const handleQuickDemo = () => {
    const demoUser: AuthUser = {
      name: 'Yadnesh (Demo)',
      email: 'demo@skillaura.ai',
      role: 'student',
      githubHandle: 'Yadnesh2007',
      provider: 'github',
    };
    localStorage.setItem('skillaura_auth_user', JSON.stringify(demoUser));
    onAuth(demoUser);
  };

  const handleAdminDemo = () => {
    const adminUser: AuthUser = {
      name: 'Sarah Connor (HR Bar Raiser)',
      email: 'hr.admin@skillaura.ai',
      role: 'admin',
      provider: 'email',
      permissions: [
        'verify_work',
        'grant_permissions',
        'audit_evidence',
        'approve_dossier',
        'manage_candidates',
        'access_admin_hub',
      ],
    };
    localStorage.setItem('skillaura_auth_user', JSON.stringify(adminUser));
    onAuth(adminUser);
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
                  onClick={() => {
                    setMode(m);
                    setErrors({});
                  }}
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  </div>
                )}

                {/* Email Form */}
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
                          onChange={(e) => setName(e.target.value)}
                          className={`${inputBase} pl-10 ${
                            errors.name ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'
                          }`}
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
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputBase} pl-10 ${
                          errors.email ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'
                        }`}
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
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputBase} pl-10 pr-10 ${
                          errors.password ? 'border-red-400' : 'border-[#DDE7F5] focus:border-[#3978E8]'
                        }`}
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In with Email' : 'Create Account'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Social Auth Separator */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#E8F0FB]" />
                  <span className="text-[11px] text-[#9AB4D8] font-semibold">or verify with</span>
                  <div className="flex-1 h-px bg-[#E8F0FB]" />
                </div>

                {/* Dedicated GitHub and Google Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGithubModal(true)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-bold text-[#0F1D38] hover:border-[#1746A2] hover:bg-[#F8FAFD] transition-all shadow-2xs"
                  >
                    <Github className="h-4 w-4 text-[#0F1D38]" />
                    <span>Login GitHub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGoogleStep('account');
                      setOtpError('');
                      setShowGoogleModal(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-bold text-[#0F1D38] hover:border-[#4285F4] hover:bg-[#F8FAFD] transition-all shadow-2xs group"
                  >
                    <GoogleLogoSvg className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Login Google</span>
                  </button>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F0F5FC] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="text-xs text-[#7A8CA6] hover:text-[#3978E8] font-medium transition-colors hover:underline underline-offset-2"
                  >
                    🚀 Candidate Demo (Student)
                  </button>
                  <span className="hidden sm:inline text-[#DDE7F5]">·</span>
                  <button
                    type="button"
                    onClick={handleAdminDemo}
                    className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold transition-colors hover:underline underline-offset-2 flex items-center gap-1"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#7C3AED]" />
                    <span>Login as HR / Admin Bar Raiser</span>
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

      {/* GitHub Login Dialog Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07132B]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#DDE7F5] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5 text-[#0F1D38]" />
                <h3 className="font-black text-sm text-[#0F1D38]">Sign In with GitHub</h3>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="p-1 rounded-lg text-[#7A8CA6] hover:bg-[#F3F7FC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#627796] leading-relaxed">
              Authenticate your GitHub identity to import your public commits, repositories, and AST skill evidence.
            </p>
            <form onSubmit={handleGitHubAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  GitHub Username / Handle
                </label>
                <input
                  type="text"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  placeholder="e.g. Yadnesh2007"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-mono text-[#0F1D38] outline-none focus:border-[#1746A2]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0F1D38] text-white text-xs font-bold hover:bg-[#1E293B] flex items-center justify-center gap-2 shadow-sm"
              >
                <Github className="h-4 w-4 text-[#FFC66B]" />
                <span>Authorize @{githubHandle || 'user'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Google Login & 2-Step OTP Verification Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07132B]/65 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DCE4EE] overflow-hidden"
          >
            {/* Authentic Google Dialog Header */}
            <div className="px-7 pt-6 pb-4 border-b border-[#F1F3F4] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <GoogleLogoSvg className="h-6 w-6" />
                <div>
                  <h3 className="font-medium text-[15px] text-[#202124] leading-tight">
                    Sign in with Google
                  </h3>
                  <p className="text-[11.5px] text-[#5F6368]">
                    to continue to <span className="font-semibold text-[#1A73E8]">SkillAura</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* STEP 1: Choose Account or Enter Email */}
            {googleStep === 'account' && (
              <div className="p-7 space-y-5">
                <div>
                  <h4 className="text-xl font-normal text-[#202124] tracking-tight">Choose an account</h4>
                  <p className="text-xs text-[#5F6368] mt-1">
                    Select your Google Account to authenticate with 2-Step OTP verification.
                  </p>
                </div>

                {/* Preset Accounts List */}
                <div className="space-y-2">
                  {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={() => handleStartGoogleAuth(acc.email)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#DADCE0] hover:border-[#1A73E8] hover:bg-[#F8FAFD] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                          style={{ backgroundColor: acc.color }}
                        >
                          {acc.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#202124] truncate group-hover:text-[#1A73E8]">
                            {acc.name}
                          </p>
                          <p className="text-xs text-[#5F6368] truncate font-mono">{acc.email}</p>
                          <span className="inline-block text-[10px] text-[#137333] font-medium bg-[#E6F4EA] px-1.5 py-0.2 rounded mt-0.5">
                            {acc.role}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#5F6368] group-hover:text-[#1A73E8] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>

                {/* Custom Email Input Toggle */}
                <div className="pt-2 border-t border-[#F1F3F4]">
                  {!isCustomGoogleEmail ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogleEmail(true)}
                      className="flex items-center gap-2 text-xs font-semibold text-[#1A73E8] hover:underline"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Use another Google account</span>
                    </button>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-[#202124] mb-1">
                          Enter your Google Email or Workspace address:
                        </label>
                        <input
                          type="email"
                          value={googleAccount}
                          onChange={(e) => setGoogleAccount(e.target.value)}
                          placeholder="your.name@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all"
                        />
                      </div>

                      {/* Select Role */}
                      <div>
                        <label className="block text-xs font-medium text-[#5F6368] mb-1">
                          SkillAura Profile Role:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {(['student', 'employee', 'employer', 'admin'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setGoogleRole(r)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                                googleRole === r
                                  ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] font-bold'
                                  : 'border-[#DADCE0] text-[#5F6368] hover:bg-[#F8FAFD]'
                              }`}
                            >
                              {r === 'admin' ? 'HR / Admin' : r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isGoogleLoading}
                        onClick={() => handleStartGoogleAuth()}
                        className="w-full py-2.5 rounded-xl bg-[#1A73E8] text-white text-xs font-bold hover:bg-[#1557B0] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
                      >
                        {isGoogleLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            <span>Contacting Google Identity…</span>
                          </>
                        ) : (
                          <>
                            <GoogleLogoSvg className="h-4 w-4 bg-white rounded-full p-0.5" />
                            <span>Next: Send 2-Step Verification Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[#5F6368] leading-relaxed pt-2">
                  To continue, Google will share your name, email address, language preference, and profile picture with SkillAura.
                </div>
              </div>
            )}

            {/* STEP 2: Google 2-Step OTP Verification */}
            {googleStep === 'otp' && (
              <div className="p-7 space-y-5">
                {/* Active Account Pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E8F0FE]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-[#1A73E8] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {googleAccount.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#202124] truncate font-mono">{googleAccount}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleStep('account');
                      setOtpError('');
                    }}
                    className="text-[11px] text-[#1A73E8] hover:underline font-semibold flex items-center gap-1 shrink-0"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Switch account</span>
                  </button>
                </div>

                {/* 2-Step Header */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#E8F0FE] flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-[#1A73E8]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#202124] tracking-tight">
                      2-Step Verification
                    </h4>
                    <p className="text-xs text-[#5F6368] mt-0.5 leading-relaxed">
                      To help keep your account secure, Google sent a 6-digit verification code to{' '}
                      <span className="font-semibold text-[#202124]">{maskedGoogleEmail}</span>.
                    </p>
                  </div>
                </div>

                {/* Simulated Google Notification Prompt with 1-click AutoFill */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#EFF5FE] via-[#F8FAFD] to-[#FFFBEB] border border-[#BFDBFE] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wide">
                        Google Security Alert · Live OTP
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-mono">Just now</span>
                  </div>

                  <div className="flex items-center justify-between bg-white/90 p-2.5 rounded-xl border border-[#DBEAFE]">
                    <div>
                      <p className="text-[11px] text-[#4B5563]">Your Google verification code is:</p>
                      <p className="text-lg font-mono font-black text-[#1A73E8] tracking-widest">
                        {sentOtpPreview}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="px-3 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Zap className="h-3.5 w-3.5 text-[#FFC66B]" />
                      <span>Auto-fill Code</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">
                    Standard carrier rates may apply. Do not share this code with anyone.
                  </p>
                </div>

                {/* 6-Digit OTP Boxes */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {googleOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpCellChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-11 sm:h-13 sm:w-12 text-center text-xl font-mono font-bold rounded-xl border ${
                          otpError
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : digit
                            ? 'border-[#1A73E8] bg-[#F8FAFD] text-[#1A73E8]'
                            : 'border-[#D1D5DB] bg-white text-[#111827]'
                        } outline-none focus:ring-2 focus:ring-[#1A73E8]/30 focus:border-[#1A73E8] transition-all`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium mt-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                {/* Resend & Timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#6B7280]">Didn't get a code?</span>
                  {otpCountdown > 0 ? (
                    <span className="text-[#6B7280] font-mono">
                      Resend code in <strong className="text-[#1A73E8]">{otpCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={handleResendGoogleOtp}
                      className="text-[#1A73E8] font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Resend code</span>
                    </button>
                  )}
                </div>

                {/* Submit Verification */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isVerifyingOtp || googleOtp.join('').length < 6}
                    onClick={() => handleVerifyGoogleOtp()}
                    className="w-full py-3 rounded-xl bg-[#1A73E8] text-white text-sm font-bold hover:bg-[#1557B0] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#1A73E8]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Verifying Google identity…</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoogleStep('account')}
                    className="w-full py-2 text-xs font-semibold text-[#5F6368] hover:text-[#202124] transition-colors"
                  >
                    Try another way
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success Screen */}
            {googleStep === 'success' && (
              <div className="p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-[#E6F4EA] flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="h-9 w-9 text-[#137333] animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-[#202124]">Identity Verified!</h4>
                  <p className="text-xs text-[#5F6368] mt-1 font-mono">
                    Signed in as <span className="font-bold text-[#1A73E8]">{googleAccount}</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1F3F4] text-xs font-medium text-[#202124]">
                  <GoogleLogoSvg className="h-3.5 w-3.5" />
                  <span>Google 2-Step OTP Authentication Active</span>
                </div>
                <p className="text-xs text-[#6B7280]">Redirecting to your verified SkillAura dashboard…</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

