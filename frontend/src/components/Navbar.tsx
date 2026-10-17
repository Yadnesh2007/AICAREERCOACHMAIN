import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  Map,
  Award,
  Beaker,
  Terminal,
  Network,
  FileCheck2,
  LayoutDashboard,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  BookOpen,
  LogOut,
  RotateCcw,
  Crown,
  Zap,
  FolderGit2,
  Cpu,
  Github,
} from 'lucide-react';
import { AuthUser, GoogleLogoSvg } from './AuthPage';
import { PlanType } from './SubscriptionModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendConnected: boolean;
  onSimulatePush: (action: 'add_sql' | 'delete_sql') => void;
  isSimulating: boolean;
  version: number;
  authUser: AuthUser;
  onLogout: () => void;
  onResetDemo?: () => void;
  subscriptionPlan: PlanType;
  onOpenPricing: () => void;
  onOpenConnectRepo?: () => void;
  onOpenCodeInspector?: () => void;
  connectedRepoName?: string;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'impact', label: 'Impact Map', icon: Map },
  { id: 'passport', label: 'Evidence', icon: Award },
  { id: 'gaplab', label: 'Gap Lab', icon: Beaker },
  { id: 'defense', label: 'Code Defense', icon: Terminal },
  { id: 'skillmap', label: 'Skill Graph', icon: Network },
  { id: 'coach', label: 'CV Coach', icon: BookOpen },
  { id: 'dossier', label: 'Judge Dossier', icon: FileCheck2, highlight: true },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  onSimulatePush,
  isSimulating,
  version,
  authUser,
  onLogout,
  onResetDemo,
  subscriptionPlan,
  onOpenPricing,
  onOpenConnectRepo,
  onOpenCodeInspector,
  connectedRepoName,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DDE7F5] shadow-[0_2px_12px_rgba(23,70,162,0.04)]">
        {/* Top Accent Strip with Cobalt & Amber */}
        <div className="h-1 bg-gradient-to-r from-[#1746A2] via-[#3978E8] to-[#FFC66B]" />

        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 xl:px-6">
          <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3">

            {/* Brand Logo & Name: SkillAura */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 group text-left shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1746A2] to-[#3978E8] flex items-center justify-center text-white shadow-md shadow-[#1746A2]/25 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-[#FFC66B]" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[16px] sm:text-[17px] font-black tracking-tight text-[#0F1D38]">
                    Skill<span className="text-[#3978E8]">Aura</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F2FF] text-[#1746A2] border border-[#BBD9FF]">
                    v{version}.0
                  </span>
                </div>
                <p className="text-[9.5px] text-[#7A8CA6] font-medium hidden 2xl:block">
                  AI Career Coach <span className="text-[#1746A2] font-semibold">· Sponsored by Worcflow</span>
                </p>
              </div>
            </button>

            {/* Nav Tabs — fits 8 tabs cleanly with flexible layout and no scrollbar */}
            <nav className="hidden lg:flex items-center gap-0.5 min-w-0 flex-1 justify-center px-1 overflow-x-auto no-scrollbar scroll-smooth">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-tab flex items-center gap-1 text-[11px] px-1.5 xl:px-2 py-1.5 shrink-0 transition-all ${
                      isActive ? 'active font-bold text-[#1746A2] bg-[#EEF4FD]' : 'text-[#475874] hover:bg-[#F3F7FC]'
                    } ${
                      item.highlight && !isActive
                        ? 'text-[#1746A2] font-bold bg-[#EFF5FE] border border-[#BBD9FF] rounded-lg'
                        : 'rounded-lg'
                    }`}
                  >
                    <Icon className={`h-3 w-3 shrink-0 ${isActive ? 'text-[#1746A2]' : item.highlight ? 'text-[#3978E8]' : 'text-[#7A8CA6]'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.highlight && (
                      <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-[#FFC66B] text-[#854D0E] uppercase tracking-wide shrink-0">
                        Proof
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Connect GitHub Repo */}
              {onOpenConnectRepo && (
                <button
                  onClick={onOpenConnectRepo}
                  title={`Linked: ${connectedRepoName || 'Connect GitHub Repository'}`}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#DDE7F5] bg-[#F8FAFD] hover:bg-[#EEF4FD] text-[#0F1D38] text-[11px] font-semibold transition-all shrink-0"
                >
                  <Github className="h-3.5 w-3.5 text-[#0F1D38]" />
                  <span className="hidden 2xl:inline max-w-[95px] truncate">
                    {connectedRepoName || 'Connect Repo'}
                  </span>
                </button>
              )}

              {/* Code & File AI Scanner Modal Trigger */}
              {onOpenCodeInspector && (
                <button
                  onClick={onOpenCodeInspector}
                  title="Upload code (.pdf, .py, .sql) to scan % AI vs. Handwritten"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#BBD9FF] bg-[#EFF5FE] hover:bg-[#DCEBFF] text-[#1746A2] text-[11px] font-bold transition-all shrink-0"
                >
                  <Cpu className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span className="hidden xl:inline">AI % Audit</span>
                </button>
              )}

              {/* Subscription Plans & Active Tier Badge */}
              <button
                onClick={onOpenPricing}
                title="View Subscription Plans & Add-ons (Free, Pro, Ultra)"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#BBD9FF] bg-[#EFF5FE] hover:bg-[#DCEBFF] transition-all shrink-0"
              >
                <Crown className={`h-3.5 w-3.5 ${subscriptionPlan === 'ultra' ? 'text-[#7C3AED]' : subscriptionPlan === 'pro' ? 'text-[#D97706]' : 'text-[#3978E8]'}`} />
                <span className="text-[10.5px] font-bold text-[#1746A2] hidden xl:inline">
                  {subscriptionPlan.toUpperCase()}
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72]">
                  {subscriptionPlan === 'free' ? 'Upgrade' : 'Active'}
                </span>
              </button>

              {/* Reset to v1.0 button */}
              {onResetDemo && (
                <button
                  onClick={onResetDemo}
                  title="Reset to v1.0 initial baseline (6 requirements, 3 gaps)"
                  className="p-1.5 rounded-lg border border-[#DDE7F5] bg-[#F8FAFD] hover:bg-[#E8F2FF] text-[#475874] hover:text-[#1746A2] text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#1746A2]" />
                  <span className="hidden 2xl:inline">Reset v1.0</span>
                </button>
              )}

              {/* Push Simulation Amber Button */}
              <motion.button
                disabled={isSimulating}
                onClick={() => onSimulatePush('add_sql')}
                whileTap={{ scale: 0.96 }}
                className="btn-primary text-[11px] px-2.5 py-1.5 shrink-0 shadow-sm"
                title="Pushes SQL queries to repository and triggers live AST reassessment"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#1746A2]" />
                    <span className="hidden sm:inline">Analyzing…</span>
                  </>
                ) : (
                  <>
                    <GitCommit className="h-3.5 w-3.5 text-[#1746A2]" />
                    <span>⚡ Push Demo</span>
                  </>
                )}
              </motion.button>

              {/* User Avatar + Logout — with Google 2FA indicator */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#DDE7F5] shrink-0">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1746A2] to-[#3978E8] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                    {authUser.name.charAt(0).toUpperCase()}
                  </div>
                  {authUser.provider === 'google' && (
                    <div
                      className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full p-0.5 shadow-xs border border-[#BFDBFE] flex items-center justify-center"
                      title="Google 2-Step OTP Verified"
                    >
                      <GoogleLogoSvg className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="hidden 2xl:block">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[#0F1D38] leading-tight truncate max-w-[120px]">{authUser.name}</p>
                    {authUser.provider === 'google' && (
                      <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-[#E8F0FE] text-[#1A73E8] border border-[#BFDBFE]">
                        Google 2FA
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A8CA6] capitalize leading-tight">{authUser.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-[#7A8CA6] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-all duration-150 shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-[#475874] hover:bg-[#F3F7FC] shrink-0"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-[#DDE7F5] px-4 py-4 space-y-1 shadow-lg"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive
                      ? 'bg-[#EFF5FE] text-[#1746A2]'
                      : 'text-[#475874] hover:bg-[#F3F7FC]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-[#EDF2F9]">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenPricing();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold bg-[#EFF5FE] text-[#1746A2] border border-[#BBD9FF]"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#D97706]" />
                  <span>Subscription Plans (Free / Pro / Ultra)</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72]">
                  {subscriptionPlan.toUpperCase()}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
