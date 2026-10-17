import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ImpactMap } from './components/ImpactMap';
import { EvidencePassport } from './components/EvidencePassport';
import { GapLab } from './components/GapLab';
import { CodeDefense } from './components/CodeDefense';
import { SkillMap } from './components/SkillMap';
import { DemoProofDossier } from './components/DemoProofDossier';
import { NotebookCoach } from './components/NotebookCoach';
import { AuthPage, AuthUser } from './components/AuthPage';
import { SubscriptionModal, PlanType } from './components/SubscriptionModal';
import { ConnectRepoModal } from './components/ConnectRepoModal';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { Assessment, Job } from './lib/types';
import { 
  checkBackendHealth, 
  fetchAssessment, 
  fetchJobs, 
  simulatePush,
  resetDemo 
} from './lib/api';
import { Sparkles, Shield, CheckCircle2, LogOut, User, Crown } from 'lucide-react';

const pageTransition: any = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
};

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('skillaura_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isConnectRepoOpen, setIsConnectRepoOpen] = useState<boolean>(false);
  const [isCodeInspectorOpen, setIsCodeInspectorOpen] = useState<boolean>(false);
  const [connectedRepoUrl, setConnectedRepoUrl] = useState<string>('https://github.com/Yadnesh2007/SAHAYOG');
  const [connectedRepoName, setConnectedRepoName] = useState<string>('Yadnesh2007/SAHAYOG');
  const [subscriptionPlan, setSubscriptionPlan] = useState<PlanType>(() => {
    return (localStorage.getItem('skillaura_plan') as PlanType) || 'free';
  });

  const handleSelectPlan = (plan: PlanType) => {
    setSubscriptionPlan(plan);
    localStorage.setItem('skillaura_plan', plan);
    setToastMessage(`🎉 Upgraded to ${plan.toUpperCase()} Plan! All corresponding features unlocked.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleRepoConnected = (repoUrl: string, repoName: string, branch: string) => {
    setConnectedRepoUrl(repoUrl);
    setConnectedRepoName(repoName);
    setToastMessage(`🔗 Linked GitHub Repo: ${repoName} (${branch}). AST evidence indexed!`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleSelectTargetCompany = (company: string, role: string, url: string) => {
    if (job) {
      setJob({
        ...job,
        employer: company,
        title: role,
        source_url: url,
      });
      setToastMessage(`🎯 Active Goal Target switched to: ${role} at ${company}!`);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  // Sync data from backend
  const syncData = async () => {
    try {
      await checkBackendHealth();
      setIsBackendConnected(true);

      const [jobsData, asmtData] = await Promise.all([
        fetchJobs(),
        fetchAssessment('asmt_init_stripe_01')
      ]);

      if (jobsData.length > 0) setJob(jobsData[0]);
      
      setAssessment(prev => {
        if (prev && asmtData.version > prev.version) {
          setToastMessage(`⚡ Version ${asmtData.version}.0: Reassessment automatically promoted SQL query writing!`);
          setTimeout(() => setToastMessage(null), 6000);
        }
        return asmtData;
      });
    } catch (err) {
      console.warn('Backend sync check failed', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    syncData();
    let interval: any = null;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (!document.hidden) syncData();
      }, 6000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncData();
        startPolling();
      } else if (interval) {
        clearInterval(interval);
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [assessment?.version]);

  const handleSimulatePush = async (action: 'add_sql' | 'delete_sql') => {
    if (!assessment) return;
    setIsSimulating(true);
    try {
      const repoId = assessment.repository_ids[0] || 'repo_sahayog_01';
      await simulatePush(repoId, action);
      await syncData();
      if (action === 'add_sql') {
        setActiveTab('impact'); // Transition to impact map to showcase live diff
      }
    } catch (err) {
      console.error('Simulate push error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDemo = async () => {
    setIsSimulating(true);
    try {
      await resetDemo();
      await syncData();
      setToastMessage('🔄 Cleanly reset to Baseline v1.0 (6 requirements, 3 gaps identified).');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to reset demo', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleOpenCodeDefense = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setActiveTab('defense');
  };

  // Show auth gate if not logged in
  if (!authUser) {
    return <AuthPage onAuth={setAuthUser} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F5FC] text-[#0D1B36] relative selection:bg-[#BBD9FF] selection:text-[#0E2E72]">
      {/* Background radial ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#BBD9FF]/35 via-transparent to-transparent blur-[130px]" />
        <div className="absolute top-[30%] right-[-8%] w-[500px] h-[500px] bg-gradient-to-l from-[#3978E8]/8 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-8%] left-[-8%] w-[500px] h-[500px] bg-gradient-to-r from-[#FFC66B]/12 to-transparent blur-[150px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-[#3978E8]/30 shadow-2xl flex items-center gap-3 text-xs bg-white text-[#0F1D38]"
            style={{
              boxShadow: '0 12px 36px -4px rgba(23,70,162,0.18), 0 0 0 1px rgba(23,70,162,0.1)'
            }}
          >
            <div className="h-8 w-8 rounded-lg bg-[#FFC66B]/20 border border-[#FFC66B] flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#D97706]" />
            </div>
            <div>
              <p className="font-bold text-[#0F1D38]">{toastMessage}</p>
              <p className="text-[11px] text-[#475874] mt-0.5">AST static engine verified JOINs and parameterization.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        onSimulatePush={handleSimulatePush}
        onResetDemo={handleResetDemo}
        isSimulating={isSimulating}
        version={assessment?.version || 1}
        authUser={authUser}
        onLogout={() => {
          localStorage.removeItem('skillaura_auth_user');
          setAuthUser(null);
        }}
        subscriptionPlan={subscriptionPlan}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenConnectRepo={() => setIsConnectRepoOpen(true)}
        onOpenCodeInspector={() => setIsCodeInspectorOpen(true)}
        connectedRepoName={connectedRepoName}
      />

      {/* Subscription & Pricing Modal (with Stripe Payments Gateway) */}
      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentPlan={subscriptionPlan}
        onSelectPlan={handleSelectPlan}
      />

      {/* GitHub Repository Connect Modal */}
      <ConnectRepoModal
        isOpen={isConnectRepoOpen}
        onClose={() => setIsConnectRepoOpen(false)}
        onRepoConnected={handleRepoConnected}
        currentRepoUrl={connectedRepoUrl}
      />

      {/* Code & Document Inspector (% AI vs Handwritten) */}
      <CodeInspectorModal
        isOpen={isCodeInspectorOpen}
        onClose={() => setIsCodeInspectorOpen(false)}
        repoUrl={connectedRepoUrl}
      />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" {...pageTransition}>
              <Dashboard
                assessment={assessment}
                job={job}
                onSimulatePush={handleSimulatePush}
                isSimulating={isSimulating}
                onOpenCodeDefense={handleOpenCodeDefense}
                subscriptionPlan={subscriptionPlan}
                onOpenPricing={() => setIsPricingOpen(true)}
                onOpenCodeInspector={() => setIsCodeInspectorOpen(true)}
                onOpenConnectRepo={() => setIsConnectRepoOpen(true)}
                onSelectTargetCompany={handleSelectTargetCompany}
                connectedRepoUrl={connectedRepoUrl}
              />
            </motion.div>
          )}

          {activeTab === 'impact' && (
            <motion.div key="impact" {...pageTransition}>
              <ImpactMap
                assessmentId={assessment?.id || 'asmt_init_stripe_01'}
                onSimulatePush={handleSimulatePush}
                isSimulating={isSimulating}
              />
            </motion.div>
          )}

          {activeTab === 'passport' && (
            <motion.div key="passport" {...pageTransition}>
              <EvidencePassport
                assessmentId={assessment?.id || 'asmt_init_stripe_01'}
              />
            </motion.div>
          )}

          {activeTab === 'gaplab' && (
            <motion.div key="gaplab" {...pageTransition}>
              <GapLab
                assessmentId={assessment?.id || 'asmt_init_stripe_01'}
                onSimulatePush={handleSimulatePush}
                isSimulating={isSimulating}
              />
            </motion.div>
          )}

          {activeTab === 'defense' && (
            <motion.div key="defense" {...pageTransition}>
              <CodeDefense
                assessmentId={assessment?.id || 'asmt_init_stripe_01'}
                initialEvidenceId={selectedEvidenceId}
              />
            </motion.div>
          )}

          {activeTab === 'skillmap' && (
            <motion.div key="skillmap" {...pageTransition}>
              <SkillMap
                assessmentId={assessment?.id || 'asmt_init_stripe_01'}
              />
            </motion.div>
          )}

          {activeTab === 'coach' && (
            <motion.div key="coach" {...pageTransition}>
              <NotebookCoach />
            </motion.div>
          )}

          {activeTab === 'dossier' && (
            <motion.div key="dossier" {...pageTransition}>
              <DemoProofDossier
                assessment={assessment!}
                job={job!}
                onSimulatePush={handleSimulatePush}
                isSimulating={isSimulating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#DDE7F5] bg-white py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#7A8CA6]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1746A2]" />
            <span className="text-[#0F1D38] font-bold tracking-tight">SkillAura</span>
            <span>· AI Career Coach</span>
            <span className="text-[#3978E8] font-semibold bg-[#E8F2FF] px-2 py-0.5 rounded border border-[#BBD9FF]">
              Sponsored by Worcflow
            </span>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="ml-2 text-[11px] font-bold text-[#1746A2] hover:text-[#3978E8] bg-[#EFF5FE] px-2 py-0.5 rounded border border-[#BBD9FF] transition-colors"
            >
              Subscription Plans (Free / Pro / Ultra)
            </button>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] text-[#475874]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Automated Code Checker (AST)
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#3978E8]" /> Zero Hallucinations
            </span>
            <span>Immutable GitHub Permalinks</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
