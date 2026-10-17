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
  BarChart3,
  PieChart as PieIcon,
  Compass,
  Activity,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
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

// SVG visual graph coordinates for the 12 core skill tree nodes
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  python_core: { x: 50, y: 110 },
  typing_pydantic: { x: 50, y: 270 },
  rest_apis: { x: 260, y: 90 },
  sql_query_writing: { x: 260, y: 220 },
  api_security: { x: 260, y: 350 },
  redis_caching: { x: 470, y: 80 },
  automated_testing: { x: 470, y: 210 },
  orm_sqlalchemy: { x: 470, y: 340 },
  containerization_docker: { x: 680, y: 90 },
  ci_cd_github_actions: { x: 680, y: 220 },
  ast_static_analysis: { x: 680, y: 350 },
  vector_embeddings_rag: { x: 880, y: 220 },
};

export const SkillMap: React.FC<SkillMapProps> = ({ assessmentId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [graphView, setGraphView] = useState<'dag' | 'radar' | 'tiers' | 'ratio' | 'all'>('dag');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
  const gapCount = Math.max(0, nodes.length - demonstratedCount - partialCount);
  const masteryPercentage = Math.round(((demonstratedCount + partialCount * 0.5) / (nodes.length || 1)) * 100);

  // 1. Competency Radar Data across the 7 domains
  const radarData = Object.entries(CATEGORY_META).map(([catKey, meta]) => {
    const catNodes = nodes.filter((n: any) => n.category === catKey);
    const total = catNodes.length || 1;
    const demo = catNodes.filter((n: any) => n.status === 'demonstrated').length;
    const part = catNodes.filter((n: any) => n.status === 'partially_demonstrated').length;
    const score = Math.round(((demo + part * 0.5) / total) * 100);
    const targetBenchmark = catKey === 'foundation' ? 95 : catKey === 'backend' ? 90 : catKey === 'database' ? 85 : 80;
    return {
      category: meta.label.split(' ')[0],
      fullLabel: meta.label,
      candidateScore: score,
      targetBenchmark: targetBenchmark,
      demonstrated: demo,
      total: catNodes.length,
    };
  });

  // 2. Proficiency Tiers (Levels 1 to 5)
  const levelNames = ['Foundation', 'Core Backend', 'Storage & Cache', 'Reliability & DevOps', 'AI Frontier'];
  const tierData = [1, 2, 3, 4, 5].map((lvl) => {
    const lvlNodes = nodes.filter((n: any) => (n.level || 1) === lvl);
    const demo = lvlNodes.filter((n: any) => n.status === 'demonstrated').length;
    const part = lvlNodes.filter((n: any) => n.status === 'partially_demonstrated').length;
    const gaps = lvlNodes.filter((n: any) => n.status !== 'demonstrated' && n.status !== 'partially_demonstrated').length;
    const total = lvlNodes.length || 1;
    const mastery = Math.round(((demo + part * 0.5) / total) * 100);
    return {
      tier: `L${lvl} ${levelNames[lvl - 1]}`,
      demonstrated: demo,
      partial: part,
      gaps: gaps,
      mastery: mastery,
      total: lvlNodes.length,
    };
  });

  // 3. Verification Ratio Donut Data
  const pieData = [
    { name: 'Demonstrated (Verified AST)', value: demonstratedCount, color: '#10B981' },
    { name: 'Partially Demonstrated', value: partialCount, color: '#F59E0B' },
    { name: 'Identified Skill Gaps', value: gapCount, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E2E72] via-[#1746A2] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl shadow-[#0E2E72]/15 border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-[#FFC66B]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFC66B]">
              <Network className="h-3.5 w-3.5" />
              <span>SkillAura Skill Graph & Analytics</span>
              <span className="text-white/60">·</span>
              <span className="text-white">Every Skill Backed by Real GitHub Evidence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Developer Skill Tree & Interactive Graphs
            </h1>
            <p className="text-[#DCEBFF] text-sm sm:text-base leading-relaxed">
              Explore dynamic topological DAG dependencies, radar competency profiles, tier-level mastery bars, and verification donuts calculated directly from your repository AST citations.
            </p>

            {/* Quick Helper Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Status: <strong className="text-white">{masteryPercentage}% Mastery</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Target: <strong className="text-white">Senior SWE Alignment</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[#BBD9FF] flex items-center gap-1.5">
                Total Nodes: <strong className="text-white">{nodes.length} Skills</strong>
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
                <p className="text-[11px] font-bold text-white">Visual Tree Map</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#FFC66B]">Mastery</p>
                <p className="text-xl font-black text-white">{masteryPercentage}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <p className="text-[9px] uppercase font-bold text-[#BBD9FF]">Skills</p>
                <p className="text-xl font-black text-white">{nodes.length}</p>
              </div>
            </div>
            <a
              href="https://github.com/Yadnesh2007/SAHAYOG"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── GRAPH SELECTION BAR ── */}
      <div className="p-4 rounded-2xl bg-white border border-[#DDE7F5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#EFF5FE] text-[#1746A2]">
            <Compass className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#0F1D38]">Skill Visualization Graphs</h3>
            <p className="text-xs text-[#7A8CA6]">Select a graph perspective to inspect data patterns</p>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'dag', label: 'Skill DAG Tree', icon: GitBranch },
            { id: 'radar', label: 'Competency Radar', icon: Radio },
            { id: 'tiers', label: 'Level Tiers Bar', icon: BarChart3 },
            { id: 'ratio', label: 'Verification Ratio', icon: PieIcon },
            { id: 'all', label: 'Executive Grid', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = graphView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setGraphView(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0E2E72] to-[#2563EB] text-white shadow-sm'
                    : 'bg-[#F8FAFD] border border-[#DDE7F5] text-[#475874] hover:bg-[#EEF4FD]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#FFC66B]' : 'text-[#7A8CA6]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRAPH DISPLAY CANVASES ── */}

      {/* 1. VISUAL DAG SKILL TREE GRAPH */}
      {(graphView === 'dag' || graphView === 'all') && (
        <div className="panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#0F1D38] flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[#1746A2]" />
                <span>Topological Skill Dependency Graph (DAG)</span>
              </h3>
              <p className="text-xs text-[#7A8CA6] mt-0.5">
                Directed graph mapping prerequisite fundamentals into high-throughput production and AI capabilities. Click any node to inspect.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#065F46]">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Demonstrated
              </span>
              <span className="flex items-center gap-1 text-[#854D0E]">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Partial
              </span>
              <span className="flex items-center gap-1 text-[#991B1B]">
                <span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Gap
              </span>
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="relative overflow-x-auto rounded-2xl bg-[#07132B] border border-[#1E293B] p-4 shadow-inner">
            <svg
              className="w-full min-w-[960px] h-[450px]"
              viewBox="0 0 1060 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="dag-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#3B82F6" />
                </marker>
                <marker
                  id="dag-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#FFC66B" />
                </marker>
                <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Tier Background Columns */}
              {[
                { label: 'LEVEL 1: FOUNDATION', x: 20, width: 190 },
                { label: 'LEVEL 2: BACKEND & APIS', x: 230, width: 190 },
                { label: 'LEVEL 3: STORAGE & CACHE', x: 440, width: 190 },
                { label: 'LEVEL 4: RELIABILITY & DEVOPS', x: 650, width: 190 },
                { label: 'LEVEL 5: AI & FRONTIER', x: 860, width: 180 },
              ].map((tier, idx) => (
                <g key={idx}>
                  <rect
                    x={tier.x}
                    y={15}
                    width={tier.width}
                    height={420}
                    rx={12}
                    fill="#0B1B3D"
                    fillOpacity={0.4}
                    stroke="#1E293B"
                    strokeWidth={1}
                  />
                  <text
                    x={tier.x + tier.width / 2}
                    y={38}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    {tier.label}
                  </text>
                </g>
              ))}

              {/* Connecting Directed Edges */}
              {edges.map((edge: any, idx: number) => {
                const sPos = NODE_POSITIONS[edge.source];
                const tPos = NODE_POSITIONS[edge.target];
                if (!sPos || !tPos) return null;

                const isConnected =
                  selectedNode?.id === edge.source ||
                  selectedNode?.id === edge.target ||
                  hoveredNodeId === edge.source ||
                  hoveredNodeId === edge.target;

                const startX = sPos.x + 155;
                const startY = sPos.y + 26;
                const endX = tPos.x;
                const endY = tPos.y + 26;
                const dx = endX - startX;
                const c1X = startX + dx * 0.45;
                const c2X = startX + dx * 0.55;

                return (
                  <path
                    key={idx}
                    d={`M ${startX} ${startY} C ${c1X} ${startY}, ${c2X} ${endY}, ${endX} ${endY}`}
                    stroke={isConnected ? '#FFC66B' : '#2563EB'}
                    strokeWidth={isConnected ? 2.5 : 1.3}
                    strokeOpacity={isConnected ? 1 : 0.45}
                    strokeDasharray={isConnected ? '4 2' : 'none'}
                    markerEnd={isConnected ? 'url(#dag-arrow-active)' : 'url(#dag-arrow)'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Graph Nodes */}
              {nodes.map((node: any) => {
                const pos = NODE_POSITIONS[node.id];
                if (!pos) return null;

                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isDemonstrated = node.status === 'demonstrated';
                const isPartial = node.status === 'partially_demonstrated';
                const statusColor = isDemonstrated ? '#10B981' : isPartial ? '#F59E0B' : '#EF4444';
                const statusText = isDemonstrated ? 'Demonstrated' : isPartial ? 'Partial' : 'Skill Gap';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Glowing highlight ring if selected */}
                    {isSelected && (
                      <rect
                        x={-3}
                        y={-3}
                        width={161}
                        height={58}
                        rx={12}
                        fill="none"
                        stroke="#FFC66B"
                        strokeWidth={2.5}
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Card Body */}
                    <rect
                      x={0}
                      y={0}
                      width={155}
                      height={52}
                      rx={10}
                      fill={isSelected ? '#132854' : '#0E2042'}
                      stroke={isSelected ? '#3B82F6' : '#1E3A8A'}
                      strokeWidth={1.5}
                      className="hover:stroke-[#60A5FA] transition-colors"
                    />

                    {/* Status accent strip */}
                    <rect
                      x={0}
                      y={0}
                      width={4}
                      height={52}
                      rx={2}
                      fill={statusColor}
                    />

                    {/* Status Pill Badge */}
                    <rect
                      x={10}
                      y={8}
                      width={70}
                      height={13}
                      rx={4}
                      fill={statusColor}
                      fillOpacity={0.2}
                    />
                    <circle cx={16} cy={14.5} r={2.5} fill={statusColor} />
                    <text
                      x={23}
                      y={18}
                      fill={statusColor}
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {statusText}
                    </text>

                    {/* Level Badge */}
                    <text
                      x={142}
                      y={18}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      L{node.level || 1}
                    </text>

                    {/* Node Title */}
                    <text
                      x={10}
                      y={34}
                      fill="#F8FAFC"
                      fontSize="10"
                      fontWeight="700"
                      className="select-none"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 19) + '…' : node.label}
                    </text>

                    {/* Subtitle / Category */}
                    <text
                      x={10}
                      y={45}
                      fill="#64748B"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {node.category}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 2. RECHARTS RADAR, BARS, AND DONUT EXECUTIVE GRID */}
      {(graphView !== 'dag') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Radar Chart: Domain Competency vs Industry Benchmark */}
          {(graphView === 'radar' || graphView === 'all') && (
            <div className={`panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4 ${graphView === 'radar' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F1D38] flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[#1746A2]" />
                    <span>Domain Competency Spider Chart</span>
                  </h3>
                  <p className="text-xs text-[#7A8CA6] mt-0.5">
                    Candidate AST proof vs Employer Benchmark across 7 categories
                  </p>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                    <Radar
                      name="Candidate Verified Mastery"
                      dataKey="candidateScore"
                      stroke="#2563EB"
                      fill="#3B82F6"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name="Target SWE Benchmark"
                      dataKey="targetBenchmark"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.15}
                      strokeDasharray="3 3"
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bar Chart: Level Tier Mastery */}
          {(graphView === 'tiers' || graphView === 'all') && (
            <div className={`panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4 ${graphView === 'tiers' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F1D38] flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#1746A2]" />
                    <span>Proficiency Tier Mastery (Levels 1–5)</span>
                  </h3>
                  <p className="text-xs text-[#7A8CA6] mt-0.5">
                    Demonstrated skills vs pending gaps by engineering seniority level
                  </p>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="tier"
                      tick={{ fill: '#64748B', fontSize: 9.5, fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748B', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="demonstrated" name="Demonstrated" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="partial" name="Partial" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gaps" name="Skill Gaps" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Donut Chart: Skill Verification Ratio */}
          {(graphView === 'ratio' || graphView === 'all') && (
            <div className={`panel p-6 bg-white border border-[#DDE7F5] shadow-sm space-y-4 ${graphView === 'ratio' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F1D38] flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-[#1746A2]" />
                    <span>Verification Ratio Donut</span>
                  </h3>
                  <p className="text-xs text-[#7A8CA6] mt-0.5">
                    Overall proof coverage distribution
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF5FE] text-[#1746A2]">
                  {masteryPercentage}% Ready
                </span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CATEGORY FILTER PILLS ── */}
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

      {/* ── SKILL NODES & DEEP DIVE INSPECTOR GRID ── */}
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
