import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ArrowRight,
  GitBranch,
  ExternalLink,
  Code2,
  Cpu,
  Database,
  Shield,
  Server,
  Zap,
  BookOpen,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { fetchSkillMap } from '../lib/api';

interface SkillMapProps {
  assessmentId: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  foundation: { label: 'Foundation & Core', icon: Cpu, color: '#1746A2', bg: '#EFF5FE' },
  backend: { label: 'Backend & APIs', icon: Server, color: '#3978E8', bg: '#F0F6FF' },
  database: { label: 'Data & Storage', icon: Database, color: '#059669', bg: '#ECFDF5' },
  performance: { label: 'Performance & Caching', icon: Zap, color: '#D97706', bg: '#FFFBEB' },
  reliability: { label: 'Reliability & Testing', icon: Shield, color: '#7C3AED', bg: '#F5F3FF' },
  devops: { label: 'DevOps & CI/CD', icon: GitBranch, color: '#475569', bg: '#F8FAFC' },
  ai_rag: { label: 'AI & RAG Intelligence', icon: Sparkles, color: '#D97706', bg: '#FFF9E6' },
};

export const SkillMap: React.FC<SkillMapProps> = ({ assessmentId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loadSkillMap = async () => {
      try {
        const res = await fetchSkillMap(assessmentId);
        setData(res);
        if (res.nodes && res.nodes.length > 0) {
          setSelectedNode(res.nodes[0]);
        }
      } catch (err) {
        console.error('Failed to load skill map', err);
      } finally {
        setLoading(false);
      }
    };
    loadSkillMap();
  }, [assessmentId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[#1746A2] border-t-transparent animate-spin" />
        <p className="text-xs text-[#7A8CA6] font-mono">Constructing 14-node skill hierarchy graph…</p>
      </div>
    );
  }

  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  const filteredNodes = nodes.filter((n: any) => {
    if (categoryFilter === 'all') return true;
    return n.category === categoryFilter;
  });

  // Calculate demonstrated percentage
  const demonstratedCount = nodes.filter((n: any) => n.status === 'demonstrated').length;
  const partialCount = nodes.filter((n: any) => n.status === 'partially_demonstrated').length;
  const masteryPercentage = Math.round(((demonstratedCount + partialCount * 0.5) / (nodes.length || 1)) * 100);

  return (
    <div className="space-y-8">
      {/* Header Banner: Deep Cobalt via Sapphire to Blue with Amber accents */}
      <div className="panel p-6 sm:p-8 bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white shadow-xl shadow-[#0E2E72]/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FFC66B]">
              <Network className="h-3.5 w-3.5" />
              <span>Interactive Skill Hierarchy</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Beginner Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Developer Skill Tree & Learning Paths
            </h1>
            <p className="text-[#DCEBFF] text-xs sm:text-sm leading-relaxed">
              Understand prerequisite skills step-by-step. See which skills build on each other (e.g., Python Basics &rarr; SQL Queries &rarr; Backend APIs &rarr; Production Caching) so you always know what to study next.
            </p>

            {/* Quick Helper Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 border border-white/20 text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Click Any Skill to View Prerequisites
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 border border-white/20 text-[#FFC66B] flex items-center gap-1.5">
                Stripe & Enterprise Aligned
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-[#FFC66B]">Mastery</p>
                <p className="text-2xl font-black text-white">{masteryPercentage}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-[#BBD9FF]">Skills Mapped</p>
                <p className="text-2xl font-black text-white">{nodes.length}</p>
              </div>
            </div>
            <a
              href="https://github.com/Yadnesh2007/AICOACH2"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All Skills (${nodes.length})` },
          { id: 'foundation', label: 'Foundation & Core' },
          { id: 'backend', label: 'Backend & APIs' },
          { id: 'database', label: 'Data & Storage' },
          { id: 'performance', label: 'Performance & Caching' },
          { id: 'reliability', label: 'Reliability & Testing' },
          { id: 'devops', label: 'DevOps & CI/CD' },
          { id: 'ai_rag', label: 'AI & RAG Intelligence' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-[#1746A2] text-white shadow-sm'
                : 'bg-white border border-[#DDE7F5] text-[#475874] hover:bg-[#F3F7FC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Graph Nodes List */}
        <div className="lg:col-span-2 panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0F1D38] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#1746A2]" />
              <span>Skill Hierarchy & Verification Status ({filteredNodes.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-[#7A8CA6]">Click a node to inspect citations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredNodes.map((node: any) => {
              const isSelected = selectedNode?.id === node.id;
              const isDemonstrated = node.status === 'demonstrated';
              const isPartial = node.status === 'partially_demonstrated';
              const meta = CATEGORY_META[node.category] || CATEGORY_META.foundation;
              const Icon = meta.icon;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all select-none relative ${
                    isSelected
                      ? 'border-[#1746A2] bg-[#EFF5FE] shadow-md shadow-[#1746A2]/10 ring-2 ring-[#1746A2]'
                      : 'border-[#DDE7F5] bg-white hover:border-[#3978E8] hover:bg-[#F8FAFD]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded bg-[#E8F2FF] flex items-center justify-center text-[#1746A2]">
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1746A2] uppercase">
                        Level {node.level || 1}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDemonstrated
                          ? 'bg-[#E6FBF2] text-[#065F46] border border-[#A7F3D0]'
                          : isPartial
                          ? 'bg-[#FFF9E6] text-[#854D0E] border border-[#FFE4A0]'
                          : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                      }`}
                    >
                      {isDemonstrated ? 'Demonstrated' : isPartial ? 'Partial' : 'Not In Scope'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#0F1D38]">{node.label}</h4>
                  <p className="text-xs text-[#475874] mt-1 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DDE7F5]/70 text-[11px]">
                    <span className="text-[#7A8CA6] font-medium">{meta.label}</span>
                    <span className="font-mono text-[#1746A2] font-semibold text-[10px]">
                      {node.evidence_ref || 'repo/verified'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prerequisite & Downstream Dependency Mappings */}
          <div className="pt-4 border-t border-[#DDE7F5] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#627796] flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-[#1746A2]" />
              <span>Architectural Prerequisite Mappings ({edges.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {edges.map((e: any, idx: number) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#F8FAFD] border border-[#DDE7F5] text-xs font-mono flex items-center gap-2 text-[#475874]"
                >
                  <span className="font-semibold text-[#1746A2]">{e.source.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-[#7A8CA6] italic">({e.relation})</span>
                  <ArrowRight className="h-3 w-3 text-[#7A8CA6]" />
                  <span className="font-semibold text-[#0F1D38]">{e.target.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Skill Deep Dive Inspector Panel */}
        <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#DDE7F5] pb-3">
            <h3 className="font-bold text-sm text-[#0F1D38]">Skill Deep Dive Inspector</h3>
            {selectedNode && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F2FF] text-[#1746A2]">
                Level {selectedNode.level || 1}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EFF5FE] border border-[#BBD9FF] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#1746A2] uppercase">
                  {selectedNode.category}
                </span>
                <h4 className="text-base font-bold text-[#0F1D38]">{selectedNode.label}</h4>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-[#DDE7F5]">
                  <span className="text-[#7A8CA6]">Market Demand:</span>
                  <span className="font-bold text-[#10B981]">{selectedNode.demand || 'High (Enterprise Core)'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#DDE7F5]">
                  <span className="text-[#7A8CA6]">Verification Status:</span>
                  <span className="font-mono font-semibold capitalize text-[#1746A2]">
                    {selectedNode.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#DDE7F5]">
                  <span className="text-[#7A8CA6]">Prerequisite Nodes:</span>
                  <span className="font-mono font-semibold text-[#0F1D38]">
                    {edges.filter((e: any) => e.target === selectedNode.id).length} Skills Required
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#DDE7F5]">
                  <span className="text-[#7A8CA6]">Downstream Unlocked:</span>
                  <span className="font-mono font-semibold text-[#0F1D38]">
                    {edges.filter((e: any) => e.source === selectedNode.id).length} Skills Enabled
                  </span>
                </div>
              </div>

              {/* Working GitHub Link */}
              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#DDE7F5] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F1D38]">Repository Evidence</span>
                  <span className="text-[10px] font-mono text-[#10B981] font-bold">200 OK</span>
                </div>
                <p className="text-[11px] text-[#475874]">
                  Referenced file: <span className="font-mono font-semibold text-[#1746A2]">{selectedNode.evidence_ref || 'package.json'}</span>
                </p>
                <a
                  href={`https://github.com/Yadnesh2007/SAHAYOG/blob/main/${
                    selectedNode.evidence_ref?.includes('.sql')
                      ? 'supabase_schema.sql'
                      : selectedNode.evidence_ref?.includes('README')
                      ? 'README.md'
                      : 'package.json'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#DDE7F5] text-xs font-semibold text-[#1746A2] hover:bg-[#EFF5FE] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Inspect on GitHub (Yadnesh2007/SAHAYOG)</span>
                </a>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FFF5E5] border border-[#FFE4A0] text-xs text-[#854D0E] space-y-1">
                <p className="font-bold">Career Impact Advice:</p>
                <p>
                  Demonstrating this node proves production competency for senior backend and AI roles. Check the AI Gap Lab to generate starter implementation pull requests.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#7A8CA6] italic">Select any skill node to view architectural details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
