import React, { useState, useEffect } from 'react';
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
  Cpu,
  Search,
  Code2,
  Globe,
  Terminal,
  Star,
  Users,
  Check,
  Zap,
} from 'lucide-react';
import { connectGitHubRepo, fetchGitHubAccounts, fetchAccountRepos } from '../lib/api';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepoConnected: (repoUrl: string, repoName: string, branch: string) => void;
  currentRepoUrl?: string;
  currentRepoName?: string;
  currentBranch?: string;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  onRepoConnected,
  currentRepoUrl = 'https://github.com/Yadnesh2007/SAHAYOG',
  currentRepoName = 'Yadnesh2007/SAHAYOG',
  currentBranch = 'main',
}) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountLogin, setSelectedAccountLogin] = useState<string>('Yadnesh2007');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState<string>(currentRepoUrl);
  const [branch, setBranch] = useState<string>(currentBranch);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [activeAccountData, setActiveAccountData] = useState<any | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  // Load accounts on mount / open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    fetchGitHubAccounts()
      .then((accs) => {
        if (!isMounted) return;
        setAccounts(accs);
        // Find current owner if possible
        const owner = currentRepoName.split('/')[0] || 'Yadnesh2007';
        const match = accs.find((a: any) => a.login.toLowerCase() === owner.toLowerCase());
        if (match) {
          setSelectedAccountLogin(match.login);
          setActiveAccountData(match);
        } else if (accs.length > 0) {
          setSelectedAccountLogin(accs[0].login);
          setActiveAccountData(accs[0]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch accounts from backend, using default fallback', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentRepoName]);

  if (!isOpen) return null;

  // Extract owner/repo cleanly
  const extractOwnerRepo = (urlOrStr: string) => {
    const raw = urlOrStr.trim();
    const cleaned = raw.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\.git$/, '').split('/tree/')[0].replace(/\/+$/, '');
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    if (parts.length === 1 && selectedAccountLogin && selectedAccountLogin !== 'custom') {
      return `${selectedAccountLogin}/${parts[0]}`;
    }
    return raw;
  };

  const parsedOwnerRepo = extractOwnerRepo(repoUrl);
  const codespaceDirectUrl = `https://github.com/codespaces/new?repo=${encodeURIComponent(parsedOwnerRepo)}&ref=${encodeURIComponent(branch || 'main')}`;
  const githubDevDirectUrl = `https://github.dev/${parsedOwnerRepo}/tree/${encodeURIComponent(branch || 'main')}`;
  const codespacesManageDirectUrl = `https://github.com/${parsedOwnerRepo}/codespaces`;

  const handleSelectAccount = (accountLogin: string) => {
    setSelectedAccountLogin(accountLogin);
    setError(null);
    if (accountLogin === 'custom') {
      setActiveAccountData({
        login: customUsername || 'custom',
        name: customUsername || 'Custom GitHub Account',
        avatar_url: customUsername ? `https://github.com/${customUsername}.png` : '',
        bio: 'Connect any repository from any public GitHub account or organization.',
        type: 'Custom',
        repositories: [],
      });
      return;
    }

    const found = accounts.find((a) => a.login === accountLogin);
    if (found) {
      setActiveAccountData(found);
      if (found.repositories && found.repositories.length > 0) {
        const first = found.repositories[0];
        setRepoUrl(first.full_name);
        setBranch(first.default_branch || 'main');
      }
    }
  };

  const handleCustomAccountSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;
    setIsLoadingRepos(true);
    setError(null);
    try {
      const data = await fetchAccountRepos(customUsername.trim());
      setActiveAccountData(data.account || {
        login: customUsername.trim(),
        name: customUsername.trim(),
        avatar_url: `https://github.com/${customUsername.trim()}.png`,
        bio: `Custom account: ${customUsername.trim()}`,
        type: 'User',
      });
      if (data.repositories && data.repositories.length > 0) {
        setRepoUrl(data.repositories[0].full_name);
        setBranch(data.repositories[0].default_branch || 'main');
      } else {
        setRepoUrl(`${customUsername.trim()}/repository`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve custom account repos');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleQuickSelectRepo = (repoFullName: string, defaultBranch: string = 'main') => {
    setRepoUrl(`https://github.com/${repoFullName}`);
    setBranch(defaultBranch);
    setError(null);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      const data = await connectGitHubRepo(repoUrl.trim(), branch.trim());
      setSuccessData(data);
      onRepoConnected(data.html_url || repoUrl.trim(), data.repository || data.full_name, branch.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository. Please verify the owner/repo.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#07132B]/65 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DDE7F5] overflow-hidden z-10 my-6"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-[#FFC66B]/15 blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Terminal className="h-4 w-4 text-[#FFC66B]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFC66B]">
                GitHub Codespaces & Universal Repository Connect
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connect Any Account & Any Repository
            </h2>
            <p className="text-xs text-[#DCEBFF] mt-1 leading-relaxed max-w-xl">
              Connect to any GitHub user or organization account, launch cloud Codespaces in seconds, or open the in-browser VS Code editor.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Account Selector Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1746A2]" />
                  <span>Choose Account or Organization:</span>
                </label>
                <span className="text-[10px] text-[#7A8CA6] font-medium">
                  Supports all public repos & accounts
                </span>
              </div>

              {/* Account Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountLogin === acc.login;
                  return (
                    <button
                      key={acc.login}
                      type="button"
                      onClick={() => handleSelectAccount(acc.login)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                        isSelected
                          ? 'bg-[#1746A2] text-white border-[#1746A2] shadow-sm'
                          : 'bg-[#F8FAFD] hover:bg-[#EEF4FD] text-[#334155] border-[#DDE7F5]'
                      }`}
                    >
                      <img
                        src={acc.avatar_url || `https://github.com/${acc.login}.png`}
                        alt={acc.login}
                        className="h-4 w-4 rounded-full border border-white/40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span>{acc.login}</span>
                      {acc.is_default && (
                        <span className={`text-[8.5px] px-1 py-0.2 rounded font-black uppercase ${
                          isSelected ? 'bg-[#FFC66B] text-[#0E2E72]' : 'bg-[#EFF5FE] text-[#1746A2]'
                        }`}>
                          Default
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Custom Account Button */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('custom')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                    selectedAccountLogin === 'custom'
                      ? 'bg-[#1746A2] text-white border-[#1746A2] shadow-sm'
                      : 'bg-[#F8FAFD] hover:bg-[#EEF4FD] text-[#1746A2] border-[#BBD9FF]'
                  }`}
                >
                  <Search className="h-3 w-3" />
                  <span>Custom Account…</span>
                </button>
              </div>
            </div>

            {/* Custom Account Input Form if selected */}
            {selectedAccountLogin === 'custom' && (
              <form onSubmit={handleCustomAccountSearch} className="p-3.5 rounded-2xl bg-[#EFF5FE] border border-[#BBD9FF] space-y-2">
                <span className="text-[11px] font-bold text-[#0E2E72]">
                  Enter GitHub Username or Organization (e.g., <code className="text-[#2563EB]">shadcn</code>, <code className="text-[#2563EB]">anthropic</code>, <code className="text-[#2563EB]">tailwindlabs</code>):
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A8CA6]" />
                    <input
                      type="text"
                      value={customUsername}
                      onChange={(e) => setCustomUsername(e.target.value)}
                      placeholder="e.g. your-github-handle"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#BBD9FF] text-xs font-mono text-[#0F1D38] outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoadingRepos || !customUsername.trim()}
                    className="px-3.5 py-2 rounded-xl bg-[#1746A2] text-white text-xs font-bold hover:bg-[#0E2E72] disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isLoadingRepos ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    <span>Load Repos</span>
                  </button>
                </div>
              </form>
            )}

            {/* Account Info Card */}
            {activeAccountData && (
              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DDE7F5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeAccountData.avatar_url || `https://github.com/${activeAccountData.login}.png`}
                    alt={activeAccountData.login}
                    className="h-10 w-10 rounded-full border border-[#DDE7F5] object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0F1D38] truncate">{activeAccountData.name || activeAccountData.login}</span>
                      <span className="text-[10px] font-mono text-[#627796]">@{activeAccountData.login}</span>
                      {activeAccountData.type && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-[#1746A2] border border-[#DDE7F5]">
                          {activeAccountData.type}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#627796] truncate max-w-md">{activeAccountData.bio || 'Public GitHub account'}</p>
                  </div>
                </div>

                <a
                  href={`https://github.com/${activeAccountData.login}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-[#DDE7F5] bg-white text-[#627796] hover:text-[#1746A2] text-xs flex items-center gap-1 shrink-0"
                  title="View GitHub Profile"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Repositories for Selected Account */}
            {activeAccountData?.repositories && activeAccountData.repositories.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#334155] flex items-center justify-between">
                  <span>Available Repositories for @{activeAccountData.login}:</span>
                  <span className="text-[10px] text-[#7A8CA6] font-normal">Click any repo to select</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAccountData.repositories.map((repo: any) => {
                    const isSelected = parsedOwnerRepo.toLowerCase() === repo.full_name.toLowerCase();
                    return (
                      <div
                        key={repo.full_name}
                        onClick={() => handleQuickSelectRepo(repo.full_name, repo.default_branch || 'main')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EFF5FE] border-[#2563EB] shadow-xs'
                            : 'bg-white hover:bg-[#F8FAFD] border-[#DDE7F5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-[#0F1D38] truncate flex items-center gap-1">
                            <FolderGit2 className={`h-3 w-3 ${isSelected ? 'text-[#2563EB]' : 'text-[#7A8CA6]'}`} />
                            {repo.name}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />}
                        </div>
                        <p className="text-[10.5px] text-[#627796] mt-1 line-clamp-2 leading-relaxed">
                          {repo.description || 'Public repository'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 font-mono text-[9.5px] text-[#7A8CA6]">
                          {repo.language && <span className="text-[#1746A2] font-semibold">{repo.language}</span>}
                          {repo.stars > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 text-[#F59E0B]" /> {repo.stars.toLocaleString()}
                            </span>
                          )}
                          <span>branch: {repo.default_branch || 'main'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Repo & Branch Input Form */}
            <form onSubmit={handleConnect} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Target Repository URL or <code className="text-[#1746A2]">owner/repo</code>
                  </label>
                  <div className="relative">
                    <FolderGit2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8CA6]" />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE7F5] bg-white text-xs font-mono text-[#0F1D38] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Branch / Tag
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
              </div>

              {/* Codespaces Quick Action Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EFF5FE] to-[#F8FAFD] border border-[#BBD9FF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0E2E72] flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-[#F59E0B] fill-current" />
                    <span>Instant Codespaces Connectivity</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#1746A2] bg-white px-2 py-0.5 rounded border border-[#BBD9FF]">
                    {parsedOwnerRepo} ({branch})
                  </span>
                </div>

                <p className="text-[11.5px] text-[#475874] leading-relaxed">
                  Open this repository immediately in GitHub Codespaces with pre-configured cloud development containers, or edit code inside your web browser.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Button 1: Launch Codespaces */}
                  <a
                    href={codespaceDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-[#0E2E72] hover:bg-[#1746A2] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    title="Launch a new cloud Codespace instance for this repo"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#FFC66B] fill-current" />
                    <span>⚡ Launch Codespace</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>

                  {/* Button 2: Web IDE github.dev */}
                  <a
                    href={githubDevDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#EEF4FD] border border-[#BBD9FF] text-[#1746A2] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    title="Open directly in github.dev browser VS Code without install"
                  >
                    <Code2 className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>🌐 github.dev Web</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>

                  {/* Button 3: Manage Codespaces */}
                  <a
                    href={codespacesManageDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F8FAFD] border border-[#DDE7F5] text-[#334155] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    title="View and manage active codespace machines on GitHub"
                  >
                    <Terminal className="h-3.5 w-3.5 text-[#7A8CA6]" />
                    <span>Manage Active</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#DC2626]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button to Link with SkillAura */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#F59E0B] text-[#0E2E72] font-black text-xs hover:opacity-95 shadow-md shadow-[#F59E0B]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#0E2E72]" />
                      <span>Linking & Indexing Codebase…</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-[#0E2E72]" />
                      <span>Set as Active SkillAura Repo & Index AST</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] text-[#627796] hover:text-[#0F1D38] font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </form>

            {/* Success State */}
            {successData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-[#065F46] font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  <span>Repository Successfully Connected & Verified!</span>
                </div>
                <p className="text-[11.5px] text-[#047857]">
                  SkillAura indexed <strong>{successData.indexed_files_count || 14} files</strong> across branch <strong>{successData.branch}</strong>. Active commit hash: <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] font-mono">{successData.latest_commit || '2401e01'}</code>
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={successData.codespace_url || codespaceDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#0E2E72] text-white text-[11px] font-bold flex items-center gap-1 hover:opacity-95"
                  >
                    <Zap className="h-3 w-3 text-[#FFC66B] fill-current" />
                    <span>Open in Codespaces</span>
                  </a>
                  <a
                    href={successData.github_dev_url || githubDevDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#10B981]/40 text-[#065F46] text-[11px] font-bold flex items-center gap-1 hover:bg-[#F0FDF4]"
                  >
                    <Code2 className="h-3 w-3" />
                    <span>Open in Web IDE</span>
                  </a>
                  <a
                    href={successData.repo_url || successData.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#10B981]/40 text-[#065F46] text-[11px] font-bold flex items-center gap-1 hover:bg-[#F0FDF4]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View GitHub Repo</span>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Currently Active Baseline Card */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#7A8CA6]">Currently Active in SkillAura</span>
                <p className="font-bold text-[#0F1D38] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span>{currentRepoName}</span>
                  <span className="text-[10px] text-[#627796] font-mono">({currentBranch})</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/codespaces/new?repo=${encodeURIComponent(currentRepoName)}&ref=${encodeURIComponent(currentBranch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#0E2E72] text-[#FFC66B] font-bold text-[11px] flex items-center gap-1 hover:bg-[#1746A2] transition-colors"
                >
                  <Zap className="h-3 w-3 fill-current text-[#FFC66B]" />
                  <span>Codespace</span>
                </a>
                <a
                  href={currentRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDE7F5] text-[#334155] font-semibold text-[11px] flex items-center gap-1 hover:bg-[#EFF5FE] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
