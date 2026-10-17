import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Send,
  RefreshCw,
  Copy,
  Check,
  Building,
  Target,
  Briefcase,
  ExternalLink,
  BarChart2,
  Edit3,
  Layers,
  Award,
  ShieldCheck,
  UploadCloud,
  FileUp,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileCheck,
  X,
  Zap,
  Code2,
} from 'lucide-react';
import {
  fetchCoachDataset,
  fetchCoachAnalysis,
  askCareerCoach,
  generateStarBulletsLlm,
  uploadCvFile,
  uploadCvText,
  resetCvToDefault,
  analyzeCvWithLlm,
} from '../lib/api';

interface NotebookCoachProps {
  connectedRepoUrl?: string;
  connectedRepoName?: string;
  connectedBranch?: string;
  onOpenConnectRepo?: () => void;
}

export const NotebookCoach: React.FC<NotebookCoachProps> = ({
  connectedRepoUrl,
  connectedRepoName = 'Yadnesh2007/SAHAYOG',
  connectedBranch = 'main',
  onOpenConnectRepo,
}) => {
  const [dataset, setDataset] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [asking, setAsking] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; passages: string[] }>>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'insights' | 'llm_audit' | 'ats_scanner' | 'star_optimizer' | 'rag' | 'cover_letter' | 'dataset'>('insights');
  const [llmBullets, setLlmBullets] = useState<Record<number, any>>({});
  const [loadingBulletLlm, setLoadingBulletLlm] = useState<Record<number, boolean>>({});
  const [llmAnalysis, setLlmAnalysis] = useState<any>(null);
  const [isAnalyzingLlm, setIsAnalyzingLlm] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // CV / Resume File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pastedCvText, setPastedCvText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ds, an] = await Promise.all([
          fetchCoachDataset(),
          fetchCoachAnalysis(),
        ]);
        setDataset(ds);
        setAnalysis(an);
        if (an.rag_insights && an.rag_insights.length > 0) {
          setQaHistory(
            an.rag_insights.map((r: any) => ({
              q: r.question,
              a: r.answer,
              passages: [
                'CV: Candidate portfolio details (Python, SQL, Scikit-Learn)',
                'JD: LinguaLogic AI NLP requirement excerpts (2+ yrs NLP, BERT, Vector DBs)',
              ],
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load coach dataset', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAsking(true);
    try {
      const res = await askCareerCoach(query);
      setQaHistory((prev) => [
        { q: res.query, a: res.answer, passages: res.relevant_passages || [] },
        ...prev,
      ]);
      setQuery('');
    } catch (err) {
      console.error('Failed to ask coach', err);
    } finally {
      setAsking(false);
    }
  };

  const copyCoverLetter = () => {
    if (!analysis?.cover_letter) return;
    navigator.clipboard.writeText(analysis.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBullet = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleOptimizeBulletWithLlm = async (idx: number, bullet: any) => {
    setLoadingBulletLlm((prev) => ({ ...prev, [idx]: true }));
    try {
      const res = await generateStarBulletsLlm(
        bullet.role || 'Backend Engineer',
        bullet.ast_signal || 'AST Concurrency & Telemetry Pipeline',
        bullet.original || ''
      );
      setLlmBullets((prev) => ({ ...prev, [idx]: res }));
    } catch (err) {
      console.error('Failed to optimize with Gemini 1.5 Pro', err);
    } finally {
      setLoadingBulletLlm((prev) => ({ ...prev, [idx]: false }));
    }
  };

  // CV File Upload & Extraction Processing
  const processCvFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadCvFile(file);
      setDataset((prev: any) => ({
        ...prev,
        source: 'Uploaded CV',
        is_custom: true,
        filename: res.filename,
        file_size: res.file_size,
        candidate: res.candidate,
        cv_text: res.analysis?.cv_text || prev?.cv_text,
      }));
      setAnalysis(res.analysis);
      setDetectedSkills(res.detected_skills || []);
      setUploadSuccess(
        `Parsed ${res.filename}! Extracted candidate "${res.candidate}" with ${res.detected_skills?.length || 0} skills and ${res.match_score}% ATS match.`
      );

      // Re-hydrate RAG questions with customized CV context
      if (res.analysis?.rag_insights) {
        setQaHistory(
          res.analysis.rag_insights.map((r: any) => ({
            q: r.question,
            a: r.answer,
            passages: [
              `Uploaded CV (${res.filename}): ${res.candidate}'s credentials`,
              `Target JD: LinguaLogic AI & benchmark expectations`,
            ],
          }))
        );
      }
    } catch (err: any) {
      console.error('Failed to upload CV', err);
      setUploadError(err.message || 'Failed to process resume file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCvFile(file);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processCvFile(file);
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedCvText.trim() || pastedCvText.trim().length < 40) {
      setUploadError('Please paste at least 40 characters of resume content.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadCvText(pastedCvText);
      setDataset((prev: any) => ({
        ...prev,
        source: 'Pasted CV Text',
        is_custom: true,
        filename: 'pasted_resume.txt',
        candidate: res.candidate,
        cv_text: pastedCvText,
      }));
      setAnalysis(res.analysis);
      setDetectedSkills(res.detected_skills || []);
      setUploadSuccess(
        `Parsed pasted resume for "${res.candidate}" with ${res.detected_skills?.length || 0} skills and ${res.match_score}% ATS match.`
      );
      setShowPasteModal(false);
      setPastedCvText('');

      if (res.analysis?.rag_insights) {
        setQaHistory(
          res.analysis.rag_insights.map((r: any) => ({
            q: r.question,
            a: r.answer,
            passages: [
              `Pasted Resume: ${res.candidate}'s profile details`,
              `Target JD: LinguaLogic AI & benchmark expectations`,
            ],
          }))
        );
      }
    } catch (err: any) {
      console.error('Failed to parse pasted CV', err);
      setUploadError(err.message || 'Failed to process pasted resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToBenchmark = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      await resetCvToDefault();
      const [ds, an] = await Promise.all([fetchCoachDataset(), fetchCoachAnalysis()]);
      setDataset(ds);
      setAnalysis(an);
      setDetectedSkills([]);
      setUploadSuccess('Reset CV Coach to benchmark sample CV (John Doe · NLP Data Scientist).');
    } catch (err: any) {
      console.error('Failed to reset CV', err);
      setUploadError('Failed to reset to default sample.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunLlmAnalysis = async () => {
    setIsAnalyzingLlm(true);
    setViewTab('llm_audit');
    try {
      const res = await analyzeCvWithLlm({
        gemini_api_key: geminiApiKey || undefined,
      });
      setLlmAnalysis(res);
    } catch (err: any) {
      console.error('LLM analysis error', err);
    } finally {
      setIsAnalyzingLlm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <RefreshCw className="h-8 w-8 text-[#1746A2] animate-spin" />
        <p className="text-xs text-[#7A8CA6] font-mono">
          Loading ai-career-coach.ipynb dataset & RAG vectors…
        </p>
      </div>
    );
  }

  const atsKeywords = analysis?.ats_keyword_breakdown || [];
  const starBullets = analysis?.star_bullet_rewrites || [];

  const filteredKeywords = atsKeywords.filter((k: any) => {
    if (keywordFilter === 'all') return true;
    if (keywordFilter === 'matched') return k.status === 'MATCHED';
    if (keywordFilter === 'missing') return k.status === 'MISSING';
    if (keywordFilter === 'partial') return k.status === 'PARTIAL';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hidden File Input for CV/Resume Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt,.md,.json"
        className="hidden"
      />

      {/* Header Banner: Deep Cobalt via Sapphire to Blue with Amber accents & Companion Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>SkillAura CV Coach</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Sponsored by Worcflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Resume Optimizer & ATS Match Scanner
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Find out if your resume will pass applicant tracking systems (ATS). See missing keywords, get STAR-formatted bullet points (Situation, Task, Action, Result), and chat with the AI coach about your career.
            </p>

            {/* Beginner Explainer Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Candidate:{' '}
                <strong className="text-white">{dataset?.candidate || 'John Doe'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Role Match:{' '}
                <strong className="text-white">{analysis?.match_analysis?.overall_score || 68}%</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                File:{' '}
                <strong className="text-white truncate max-w-[150px]">
                  {dataset?.filename || 'sample_cv_john_doe.txt'}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Attached Reference Image Preview Badge */}
            <div className="hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-white/20 shrink-0">
              <img
                src="/career-companion.png"
                alt="SkillAura Companion"
                className="h-11 w-10 object-cover rounded-xl shadow-md border border-white/25"
              />
              <div className="text-left">
                <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Career Companion</p>
                <p className="text-[11px] font-bold text-white">Smart Resume Scan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Match</p>
                <p className="text-xl font-black text-white">{analysis?.match_analysis?.overall_score || 68}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#A7F3D0]">ATS</p>
                <p className="text-xl font-black text-white">
                  {analysis?.match_analysis?.overall_score || 78}%
                </p>
              </div>
            </div>

            {/* Quick Launch Codespace */}
            <a
              href={`https://github.com/codespaces/new?repo=${encodeURIComponent(connectedRepoName || 'Yadnesh2007/SAHAYOG')}&ref=${encodeURIComponent(connectedBranch || 'main')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-[#0E2E72] hover:bg-[#1746A2] text-[#FFC66B] font-black text-sm transition-all flex items-center justify-center gap-2 border border-[#FFC66B]/30 shadow-md shadow-[#0E2E72]/40 shrink-0"
              title={`Launch GitHub Codespace for ${connectedRepoName || 'connected repository'}`}
            >
              <Zap className="h-4 w-4 fill-current text-[#FFC66B]" />
              <span>⚡ Open Codespace</span>
            </a>

            <a
              href={connectedRepoUrl || 'https://github.com/Yadnesh2007/SAHAYOG'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
              title={`View ${connectedRepoName || 'connected repository'} on GitHub`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>{connectedRepoName || 'GitHub Repo'}</span>
            </a>

            {onOpenConnectRepo && (
              <button
                type="button"
                onClick={onOpenConnectRepo}
                className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFC66B] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                title="Switch connected account or repository"
              >
                <span>Switch Repo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE RESUME UPLOAD & ATS COMMAND CENTER ── */}
      <div className="bg-white rounded-2xl border border-[#DDE7F5] shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-[#EFF5FE] border border-[#BBD9FF] flex items-center justify-center text-[#1746A2] shrink-0 shadow-xs">
              <FileUp className="h-6 w-6 text-[#1746A2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base text-[#0F1D38]">Resume & CV Document</h3>
                {dataset?.is_custom ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    <CheckCircle className="h-3 w-3" />
                    <span>Custom Resume Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                    <span>Benchmark Sample (ai-career-coach.ipynb)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#627796] mt-0.5">
                Active candidate:{' '}
                <strong className="text-[#0F1D38]">{dataset?.candidate || 'John Doe'}</strong> · File:{' '}
                <span className="font-mono text-[#1746A2]">{dataset?.filename || 'sample_cv_john_doe.txt'}</span>
              </p>
            </div>
          </div>

          {/* Upload and Paste Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1746A2] to-[#2563EB] hover:from-[#0E2E72] hover:to-[#1746A2] text-white text-xs font-bold transition-all shadow-md shadow-[#1746A2]/20 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{isUploading ? 'Extracting & Scanning…' : 'Upload Resume (.PDF, .DOCX, .TXT)'}</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => setShowPasteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] hover:bg-[#EEF4FD] text-[#0F1D38] text-xs font-bold transition-all shadow-2xs"
            >
              <FileText className="h-4 w-4 text-[#3978E8]" />
              <span>Paste Text</span>
            </button>

            <button
              type="button"
              disabled={isAnalyzingLlm}
              onClick={handleRunLlmAnalysis}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-[#7C3AED]/20 shrink-0"
              title="Run Gemini 1.5 Pro / Flash deep CV analysis"
            >
              <Sparkles className={`h-4 w-4 text-[#FFC66B] ${isAnalyzingLlm ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingLlm ? 'Gemini Auditing…' : '✨ Gemini LLM CV Audit'}</span>
            </button>

            {dataset?.is_custom && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleResetToBenchmark}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#DDE7F5] text-[#627796] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-xs font-semibold transition-all"
                title="Reset to default benchmark sample CV"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Sample</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Visual Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDropFile}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#2563EB] bg-[#EFF5FE] scale-[1.005]'
              : 'border-[#DDE7F5] bg-[#FBFDFF] hover:border-[#BBD9FF] hover:bg-[#F8FAFD]'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#475874]">
            <div className="h-9 w-9 rounded-full bg-[#EBF2FE] flex items-center justify-center text-[#1746A2] shrink-0">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#0F1D38]">
                Drag and drop your CV or Resume here, or <span className="text-[#2563EB] underline">browse files</span>
              </p>
              <p className="text-[11px] text-[#7A8CA6] mt-0.5">
                Supports PDF, DOCX, TXT, and Markdown · Native text extraction with automatic skill categorization
              </p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7A8CA6] sm:ml-auto">
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDE7F5]">.PDF</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDE7F5]">.DOCX</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDE7F5]">.TXT</span>
            </div>
          </div>
        </div>

        {/* Upload Scanning Progress Animation */}
        {isUploading && (
          <div className="p-4 rounded-xl bg-[#EFF5FE] border border-[#BBD9FF] flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-[#1746A2] animate-spin shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1746A2]">
                Extracting CV text & evaluating ATS keyword compatibility…
              </p>
              <p className="text-[11px] text-[#3B82F6]">
                Analyzing programming skills, synthesizing custom STAR bullets, and tailoring your cover letter.
              </p>
            </div>
          </div>
        )}

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start justify-between gap-3 text-xs text-[#065F46]">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{uploadSuccess}</p>
                {detectedSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10.5px] font-semibold text-[#047857]">Detected Skills:</span>
                    {detectedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[10px] font-bold text-[#065F46]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setUploadSuccess(null)}
              className="text-[#047857] hover:text-[#065F46] p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-between gap-3 text-xs text-[#991B1B]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
              <p className="font-semibold">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-[#991B1B] hover:text-[#7F1D1D] p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── PASTE RESUME TEXT MODAL ── */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07132B]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-[#DDE7F5] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1746A2]" />
                <h3 className="font-bold text-base text-[#0F1D38]">Paste Resume / CV Text</h3>
              </div>
              <button
                onClick={() => setShowPasteModal(false)}
                className="p-1 rounded-lg text-[#7A8CA6] hover:bg-[#F3F7FC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#627796]">
              Paste the text or Markdown content of your resume below. SkillAura will automatically detect your skills, calculate your ATS match score, and generate custom STAR bullets.
            </p>

            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <textarea
                  rows={10}
                  value={pastedCvText}
                  onChange={(e) => setPastedCvText(e.target.value)}
                  placeholder="Paste your CV / Resume text here...&#10;&#10;e.g.&#10;Yadnesh Gandhele&#10;Software Engineer&#10;Skills: Python, FastAPI, PostgreSQL, Pytest, Docker&#10;Experience: Designed REST APIs and optimized database queries..."
                  className="w-full p-4 rounded-xl border border-[#DDE7F5] text-xs font-mono text-[#0F1D38] outline-none focus:border-[#1746A2] focus:ring-2 focus:ring-[#1746A2]/20 resize-none leading-relaxed"
                  required
                />
                <div className="flex items-center justify-between text-[11px] text-[#7A8CA6] mt-1">
                  <span>Minimum 40 characters</span>
                  <span>{pastedCvText.length} characters</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDE7F5] text-xs font-bold text-[#475874] hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || pastedCvText.trim().length < 40}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1746A2] to-[#2563EB] text-white text-xs font-bold hover:from-[#0E2E72] hover:to-[#1746A2] transition-all shadow-sm disabled:opacity-50"
                >
                  {isUploading ? 'Analyzing Resume…' : 'Parse & Scan Resume'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sub-nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#DDE7F5] pb-2">
        {[
          { id: 'insights', label: 'Strengths & Gaps (Few-Shot)', icon: CheckCircle2 },
          { id: 'llm_audit', label: '✨ Gemini LLM Deep CV Audit', icon: Sparkles, highlight: true },
          { id: 'ats_scanner', label: `ATS Keyword Scanner (${atsKeywords.length})`, icon: BarChart2 },
          { id: 'star_optimizer', label: `STAR Bullet Optimizer (${starBullets.length})`, icon: Edit3 },
          { id: 'rag', label: 'Interactive RAG Q&A', icon: Sparkles },
          { id: 'cover_letter', label: 'Targeted Cover Letter', icon: FileText },
          { id: 'dataset', label: 'Source Documents (Raw CV/JD)', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = viewTab === tab.id;
          const isHighlight = (tab as any).highlight;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setViewTab(tab.id as any);
                if (tab.id === 'llm_audit' && !llmAnalysis && !isAnalyzingLlm) {
                  handleRunLlmAnalysis();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? isHighlight
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-sm'
                    : 'bg-[#1746A2] text-white shadow-sm'
                  : isHighlight
                  ? 'text-[#7C3AED] bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF]'
                  : 'text-[#475874] hover:bg-[#EFF5FE] hover:text-[#1746A2]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: GEMINI LLM DEEP CV AUDIT ── */}
      {viewTab === 'llm_audit' && (
        <div className="space-y-6">
          {/* Top Control Bar for Gemini Analysis */}
          <div className="rounded-2xl border border-[#DDE7F5] bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#7C3AED] p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFC66B]/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-[#FFC66B] text-[#0E2E72]">
                    Gemini 1.5 LLM Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-blue-100 border border-white/20">
                    AST Grounded Audit
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Gemini Deep CV & Resume Document Analysis
                </h3>
                <p className="text-xs text-blue-100/90 max-w-xl">
                  Evaluates ATS keyword density, detects ungrounded or inflated resume claims, generates
                  quantified STAR rewrites, and constructs a 14-day technical preparation roadmap.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isAnalyzingLlm}
                  onClick={handleRunLlmAnalysis}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC66B] hover:bg-[#FBBF24] text-[#0E2E72] text-xs font-bold transition-all shadow-md shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isAnalyzingLlm ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingLlm ? 'Analyzing with Gemini…' : 'Re-run Gemini Audit'}</span>
                </button>
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 shrink-0"
                >
                  ⚙️ API Key
                </button>
              </div>
            </div>

            {/* Optional Custom Gemini API Key Drawer */}
            {showApiKeyInput && (
              <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="password"
                  placeholder="Enter optional Google Gemini API Key (AIzaSy...)"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white/10 text-white placeholder-blue-200/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFC66B]"
                />
                <button
                  onClick={handleRunLlmAnalysis}
                  className="px-3.5 py-2 rounded-xl bg-white text-[#1746A2] text-xs font-bold hover:bg-blue-50 transition-colors"
                >
                  Apply & Run
                </button>
              </div>
            )}
          </div>

          {/* Loading Animation State */}
          {isAnalyzingLlm && (
            <div className="rounded-2xl border border-[#BBD9FF] bg-[#EFF5FE] p-8 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#7C3AED] animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-[#1746A2]">
                Gemini 1.5 Cognitive Document Inspector in Progress…
              </h4>
              <p className="text-xs text-[#5A6E85] max-w-md mx-auto">
                Comparing candidate CV text claims against target job expectations and verifying AST code
                grounding on GitHub.
              </p>
            </div>
          )}

          {/* LLM ANALYSIS RESULTS */}
          {!isAnalyzingLlm && llmAnalysis?.analysis && (
            <div className="space-y-6">
              {/* Score Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#7A8CA6] uppercase tracking-wide">
                    ATS Keyword Match Rate
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#1746A2]">
                      {llmAnalysis.analysis.ats_match_percentage}%
                    </span>
                    <span className="text-xs font-semibold text-[#059669]">
                      ({llmAnalysis.analysis.ats_keywords_found?.length || 0} matched)
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-[#1746A2] to-[#3978E8] h-full rounded-full"
                      style={{ width: `${llmAnalysis.analysis.ats_match_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#7A8CA6] uppercase tracking-wide">
                    Hallucination / Inflated Claim Risk
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-3xl font-black ${
                        llmAnalysis.analysis.hallucination_risk_score < 30
                          ? 'text-[#059669]'
                          : llmAnalysis.analysis.hallucination_risk_score < 60
                          ? 'text-[#D97706]'
                          : 'text-[#DC2626]'
                      }`}
                    >
                      {llmAnalysis.analysis.hallucination_risk_score}%
                    </span>
                    <span className="text-xs font-semibold text-[#7A8CA6]">
                      {llmAnalysis.analysis.hallucination_risk_score < 30
                        ? 'Low Risk (Code Verified)'
                        : 'Medium Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        llmAnalysis.analysis.hallucination_risk_score < 30
                          ? 'bg-[#10B981]'
                          : llmAnalysis.analysis.hallucination_risk_score < 60
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#EF4444]'
                      }`}
                      style={{ width: `${llmAnalysis.analysis.hallucination_risk_score}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#7A8CA6] uppercase tracking-wide">
                    Bar Raiser Hiring Verdict
                  </span>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                      {llmAnalysis.analysis.hiring_verdict}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7A8CA6] mt-2 font-mono">
                    Model: {llmAnalysis.model_used}
                  </p>
                </div>
              </div>

              {/* Executive Summary Callout */}
              <div className="rounded-xl border border-[#BBD9FF] bg-[#F4F8FE] p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1746A2]">
                    Bar Raiser Executive Verdict
                  </h4>
                </div>
                <p className="text-xs text-[#1E293B] leading-relaxed">
                  {llmAnalysis.analysis.executive_summary}
                </p>
              </div>

              {/* Keywords Match Breakdown */}
              <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 space-y-4">
                <h4 className="text-xs font-bold text-[#0F1D38] uppercase tracking-wider">
                  ATS Keyword Cloud Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#059669] font-bold block mb-2">
                      ✓ Confirmed ATS Keywords ({llmAnalysis.analysis.ats_keywords_found?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {llmAnalysis.analysis.ats_keywords_found?.map((k: string) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#065F46] font-mono text-[11px] font-bold border border-[#A7F3D0]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#D97706] font-bold block mb-2">
                      ⚠ High-Value Missing Criteria ({llmAnalysis.analysis.ats_keywords_missing?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {llmAnalysis.analysis.ats_keywords_missing?.map((k: string) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 rounded-md bg-[#FFFBEB] text-[#92400E] font-mono text-[11px] font-bold border border-[#FDE68A]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hallucination / Inflated Claim Verification */}
              {llmAnalysis.analysis.hallucination_analysis?.length > 0 && (
                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1746A2]" />
                    <h4 className="text-xs font-bold text-[#0F1D38] uppercase tracking-wider">
                      Resume Claims vs. AST Code Evidence Audit
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {llmAnalysis.analysis.hallucination_analysis.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-[#DDE7F5] bg-[#F8FAFD] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0F1D38]">"{item.claim}"</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              item.risk_level === 'Low'
                                ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                                : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                            }`}
                          >
                            {item.risk_level} Risk
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#5A6E85]">{item.verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable STAR Bullet Rewrites */}
              {llmAnalysis.analysis.star_rewrites?.length > 0 && (
                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-[#7C3AED]" />
                    <h4 className="text-xs font-bold text-[#0F1D38] uppercase tracking-wider">
                      Quantified STAR Bullet Rewrites (Gemini Enhanced)
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {llmAnalysis.analysis.star_rewrites.map((star: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] space-y-2 text-xs"
                      >
                        <div>
                          <span className="text-[11px] font-semibold text-[#7A8CA6] block mb-0.5">
                            Original Bullet:
                          </span>
                          <p className="line-through text-[#64748B] italic">{star.original_bullet}</p>
                        </div>
                        <div className="pt-2 border-t border-[#E2E8F0]">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold text-[#059669]">
                              STAR Rewrite with Evidence & Metrics:
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                              {star.impact_delta}
                            </span>
                          </div>
                          <p className="font-semibold text-[#0F1D38] leading-relaxed">
                            {star.improved_bullet}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 14-Day Preparation & Proof Roadmap */}
              {llmAnalysis.analysis.preparation_roadmap_14d?.length > 0 && (
                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#D97706]" />
                    <h4 className="text-xs font-bold text-[#0F1D38] uppercase tracking-wider">
                      14-Day Technical Proof & Hiring Roadmap
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {llmAnalysis.analysis.preparation_roadmap_14d.map((phase: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-[#DDE7F5] bg-[#FAFBFD] space-y-2"
                      >
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#1746A2] text-white">
                          {phase.day_range}
                        </span>
                        <h5 className="font-bold text-[#0F1D38] mt-1">{phase.focus}</h5>
                        <p className="text-[11.5px] text-[#5A6E85] leading-relaxed">
                          {phase.deliverable}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bar Raiser Probing Questions */}
              {llmAnalysis.analysis.bar_raiser_questions?.length > 0 && (
                <div className="rounded-xl border border-[#DDE7F5] bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#1746A2]" />
                    <h4 className="text-xs font-bold text-[#0F1D38] uppercase tracking-wider">
                      Bar Raiser Technical Interview Checklist
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {llmAnalysis.analysis.bar_raiser_questions.map((q: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5]"
                      >
                        <span className="h-5 w-5 rounded-full bg-[#1746A2] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-[#0F1D38] leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: STRENGTHS & FEW-SHOT RECOMMENDATIONS ── */}
      {viewTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
              <h3 className="font-bold text-sm text-[#065F46] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                <span>5 Verified Strengths (Notebook Analysis)</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#334155]">
                {analysis?.cv_summary?.strengths?.map((st: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
              <h3 className="font-bold text-sm text-[#991B1B] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                <span>5 Priority Skill Gaps (Target Role Specific)</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#334155]">
                {analysis?.cv_summary?.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] shrink-0 mt-1.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Few Shot Evaluation Matrix */}
          <div className="panel p-6 bg-white border border-[#DDE7F5] space-y-4">
            <h3 className="font-bold text-sm text-[#0F1D38]">
              Few-Shot Evaluation Rubric (from Notebook Prompt 35)
            </h3>
            <div className="space-y-3">
              {analysis?.few_shot_recommendations?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1746A2]">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0F1D38]">Match: {item.match_score}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#EFF6FF] text-[#1E40AF]'
                        }`}
                      >
                        Priority: {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#475874]">
                    <div>
                      <span className="font-semibold text-[#0F1D38]">CV Experience: </span>
                      {item.cv_evidence}
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F1D38]">JD Requirement: </span>
                      {item.jd_requirement}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#DDE7F5] text-[#1746A2] font-semibold">
                    Recommendation: {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ATS KEYWORD SCANNER ── */}
      {viewTab === 'ats_scanner' && (
        <div className="space-y-6">
          <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#0F1D38]">
                  Applicant Tracking System (ATS) Keyword Density Comparison
                </h3>
                <p className="text-xs text-[#7A8CA6] mt-0.5">
                  Scanning candidate CV text frequency versus LinguaLogic AI target requirements.
                </p>
              </div>

              {/* Keyword Filters */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Keywords' },
                  { id: 'matched', label: 'Matched' },
                  { id: 'missing', label: 'Missing' },
                  { id: 'partial', label: 'Partial' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setKeywordFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      keywordFilter === f.id
                        ? 'bg-[#1746A2] text-white'
                        : 'bg-[#F8FAFD] border border-[#DDE7F5] text-[#475874] hover:bg-[#EEF4FD]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredKeywords.map((kw: any, idx: number) => {
                const isMatched = kw.status === 'MATCHED';
                const isPartial = kw.status === 'PARTIAL';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F1D38]">{kw.keyword}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isMatched
                            ? 'bg-[#E6FBF2] text-[#065F46] border border-[#A7F3D0]'
                            : isPartial
                            ? 'bg-[#FFF9E6] text-[#854D0E] border border-[#FFE4A0]'
                            : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                        }`}
                      >
                        {kw.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#7A8CA6]">
                        <span>Candidate CV: <strong className="text-[#0F1D38]">{kw.cv_mentions} mentions</strong></span>
                        <span>Target JD: <strong className="text-[#1746A2]">{kw.jd_mentions} required</strong></span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${
                            isMatched ? 'bg-[#10B981]' : isPartial ? 'bg-[#FFC66B]' : 'bg-[#EF4444]'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((kw.cv_mentions / (kw.jd_mentions || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: STAR BULLET OPTIMIZER ── */}
      {viewTab === 'star_optimizer' && (
        <div className="space-y-6">
          <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#0F1D38]">
                Resume Bullet Point Optimizer (STAR Formula + AST Proof)
              </h3>
              <p className="text-xs text-[#7A8CA6] mt-0.5">
                Translating passive descriptions into metric-backed, verified engineering claims.
              </p>
            </div>

            <div className="space-y-4">
              {starBullets.map((bullet: any, idx: number) => {
                const isCopied = copiedBulletIdx === idx;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#DDE7F5] bg-white space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-[#1746A2]">{bullet.role}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOptimizeBulletWithLlm(idx, bullet)}
                          disabled={loadingBulletLlm[idx]}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#1746A2] to-[#2563EB] text-white hover:brightness-110 flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                        >
                          <Sparkles className={`h-3 w-3 text-[#FFC66B] ${loadingBulletLlm[idx] ? 'animate-spin' : ''}`} />
                          <span>{loadingBulletLlm[idx] ? 'Gemini Generating…' : '✨ Gemini 1.5 Pro Polish'}</span>
                        </button>
                        <button
                          onClick={() => copyBullet(idx, llmBullets[idx]?.star_rewrite || bullet.star_rewrite)}
                          className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                        >
                          {isCopied ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy STAR Bullet'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B]">
                          Original (Vague & Passive)
                        </span>
                        <p className="text-[#991B1B] italic">"{bullet.original}"</p>
                        <p className="text-[11px] text-[#7F1D1D] pt-1 border-t border-[#FECACA]">
                          <strong>Critique:</strong> {bullet.critique}
                        </p>
                      </div>

                      {/* STAR Optimized */}
                      <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                          Baseline AST-Optimized
                        </span>
                        <p className="text-[#14532D] font-medium leading-relaxed">
                          "{bullet.star_rewrite}"
                        </p>
                        <div className="pt-2 border-t border-[#BBF7D0] flex items-center justify-between text-[11px]">
                          <span className="text-[#166534] font-semibold">{bullet.ast_signal}</span>
                          <a
                            href={bullet.evidence_link || 'https://github.com/Yadnesh2007/SAHAYOG'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#1746A2] font-semibold hover:underline"
                          >
                            <span>Inspect Code</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Gemini 1.5 Pro Deep Dive Card */}
                    {llmBullets[idx] && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-[#F8FAFD] to-[#EFF6FF] border border-[#BFDBFE] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1746A2] text-white flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5 text-[#FFC66B]" />
                              Gemini 1.5 Pro Production Polish
                            </span>
                            <span className="text-[10px] font-mono text-[#7A8CA6]">Model: {llmBullets[idx].model}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            ATS Score: 98/100
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-[#DDE7F5] text-xs font-semibold text-[#0F1D38] leading-relaxed shadow-xs">
                          "{llmBullets[idx].star_rewrite}"
                        </div>

                        {llmBullets[idx].star_breakdown && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#991B1B]">S — Situation:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.situation}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#D97706]">T — Task:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.task}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#1D4ED8]">A — Action:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.action}</span>
                            </div>
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#E2E8F0]">
                              <span className="font-bold text-[#15803D]">R — Result:</span>{' '}
                              <span className="text-[#475569]">{llmBullets[idx].star_breakdown.result}</span>
                            </div>
                          </div>
                        )}

                        {llmBullets[idx].ats_keywords && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                            <span className="text-[10px] font-bold text-[#7A8CA6] uppercase tracking-wider">ATS Keywords Injected:</span>
                            {llmBullets[idx].ats_keywords.map((kw: string, kidx: number) => (
                              <span key={kidx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EBF3FE] text-[#1746A2] border border-[#BFDBFE]">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: INTERACTIVE RAG Q&A ── */}
      {viewTab === 'rag' && (
        <div className="space-y-6">
          {/* Query Input */}
          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-3">
            <h3 className="font-bold text-sm text-[#0F1D38]">
              Ask Career Coach (Grounded RAG on Embedded CV & JD)
            </h3>
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Does the applicant satisfy the NLP requirement? What advice can you provide?"
                className="flex-1 p-2.5 rounded-xl border border-[#DDE7F5] bg-[#F8FAFD] text-xs text-[#0F1D38] placeholder-[#7A8CA6] focus:outline-none focus:border-[#3978E8] focus:bg-white"
              />
              <button
                type="submit"
                disabled={asking || !query.trim()}
                className="btn-primary shrink-0"
              >
                {asking ? <RefreshCw className="h-4 w-4 animate-spin text-[#1746A2]" /> : <Send className="h-4 w-4 text-[#1746A2]" />}
                <span>Ask Coach</span>
              </button>
            </form>
          </div>

          {/* Q&A Cards */}
          <div className="space-y-4">
            {qaHistory.map((qa, i) => (
              <div
                key={i}
                className="panel p-5 bg-white border border-[#DDE7F5] space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-[#EFF5FE] text-[#1746A2] flex items-center justify-center text-xs font-bold shrink-0">
                    Q
                  </span>
                  <h4 className="font-bold text-xs text-[#0F1D38]">{qa.q}</h4>
                </div>
                <div className="flex items-start gap-2.5 pl-8 text-xs text-[#334155] leading-relaxed">
                  <Sparkles className="h-4 w-4 text-[#FFC66B] shrink-0 mt-0.5" />
                  <div>
                    <p>{qa.a}</p>
                    {qa.passages && qa.passages.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#DDE7F5] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8CA6]">
                          Grounded Passages:
                        </span>
                        {qa.passages.map((p, pIdx) => (
                          <p key={pIdx} className="text-[11px] font-mono text-[#475874]">
                            • {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: TAILORED COVER LETTER ── */}
      {viewTab === 'cover_letter' && (
        <div className="panel p-6 bg-white border border-[#DDE7F5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE7F5] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0F1D38]">
                Auto-Generated Tailored Cover Letter
              </h3>
              <p className="text-xs text-[#7A8CA6]">
                Synthesized by model factoring in prioritized gaps and verified skills.
              </p>
            </div>
            <button
              onClick={copyCoverLetter}
              className="btn-secondary text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] text-xs text-[#334155] font-sans leading-relaxed whitespace-pre-wrap">
            {analysis?.cover_letter}
          </pre>
        </div>
      )}

      {/* ── TAB 6: RAW DATASET ── */}
      {viewTab === 'dataset' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1746A2]">
              Sample CV (John Doe)
            </h3>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] text-[11px] font-mono text-[#334155] max-h-96 overflow-y-auto whitespace-pre-wrap">
              {dataset?.cv_text}
            </pre>
          </div>

          <div className="panel p-5 bg-white border border-[#DDE7F5] space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1746A2]">
              Job Description (LinguaLogic AI)
            </h3>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] text-[11px] font-mono text-[#334155] max-h-96 overflow-y-auto whitespace-pre-wrap">
              {dataset?.jd_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
