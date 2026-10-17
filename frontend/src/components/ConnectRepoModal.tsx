import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  X,
  CheckCircle2,
  GitBranch,
  FolderGit2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { connectGitHubRepo } from '../lib/api';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepoConnected: (repoUrl: string, repoName: string, branch: string) => void;
  currentRepoUrl?: string;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  onRepoConnected,
  currentRepoUrl = 'https://github.com/Yadnesh2007/SAHAYOG',
}) => {
  const [repoUrl, setRepoUrl] = useState(currentRepoUrl);
  const [branch, setBranch] = useState('main');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      const data = await connectGitHubRepo(repoUrl.trim(), branch.trim());
      setSuccessData(data);
      onRepoConnected(repoUrl.trim(), data.repository, branch.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickSelect = (url: string) => {
    setRepoUrl(url);
    setError(null);
  };

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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#DDE7F5] overflow-hidden z-10 my-8"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-[#FFC66B]/15 blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Github className="h-4 w-4 text-[#FFC66B]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFC66B]">
                GitHub Repository Verification
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connect Your Codebase
            </h2>
            <p className="text-xs text-[#DCEBFF] mt-1 leading-relaxed">
              SkillAura validates public or authorized GitHub repos to generate zero-hallucination skill evidence with direct commit permalinks.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {successData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#10B981] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#065F46]">
                      Repository Connected & Verified!
                    </h3>
                    <p className="text-xs text-[#047857]">
                      Indexed {successData.indexed_files_count} files across branch <strong>{successData.branch}</strong>. Commit hash: <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] font-mono">{successData.latest_commit}</code>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#627796]">Repository:</span>
                    <a
                      href={successData.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#1746A2] hover:underline flex items-center gap-1"
                    >
                      {successData.repository}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627796]">Evidence Engine:</span>
                    <span className="font-semibold text-[#10B981] flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> AST Parser Ready
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1746A2] to-[#2563EB] text-white font-bold text-xs hover:opacity-95 shadow-md transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    GitHub Repository URL or <code className="text-[#1746A2]">owner/repo</code>
                  </label>
                  <div className="relative">
                    <FolderGit2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8CA6]" />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-mono text-[#0F1D38] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Default Branch
                  </label>
                  <div className="relative">
                    <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8CA6]" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-mono text-[#0F1D38] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Quick Select Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#627796]">Quick Sample Repositories:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSelect('https://github.com/Yadnesh2007/SAHAYOG')}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#BBD9FF] bg-[#EFF5FE] text-[#1746A2] font-medium hover:bg-[#DCEBFF] transition-colors"
                    >
                      ⭐ Yadnesh2007/SAHAYOG (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelect('https://github.com/Yadnesh2007/AICOACH2')}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#DDE7F5] bg-[#F8FAFD] text-[#475874] font-medium hover:bg-[#EEF4FD] transition-colors"
                    >
                      Yadnesh2007/AICOACH2
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#DC2626]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] font-black text-xs hover:opacity-95 shadow-md shadow-[#F59E0B]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-[#0E2E72]" />
                        <span>Verifying & Indexing Repository…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-[#0E2E72]" />
                        <span>Connect & Verify Repository</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
