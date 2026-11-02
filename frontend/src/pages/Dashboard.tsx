import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Shield,
  MessageSquare,
  Camera,
  Link2,
  Mic,
  ArrowRight,
  Filter,
  ExternalLink,
} from 'lucide-react';
import {
  getDashboardStats,
  getScamDistribution,
  getScamCategories,
  getDailyTrends,
  getRiskDistribution,
  getInputTypes,
  getRiskScores,
} from '../services/api';
import type {
  DashboardStats,
  ScamDistributionData,
  ScamCategoriesData,
  DailyTrendsData,
  RiskDistributionData,
  InputTypesData,
  RiskScoresData,
} from '../types';
import { formatDate, getInputTypeIcon, getVerdictBg, getRiskColor, truncate } from '../utils';

// ─── Custom Tooltip for Recharts ───────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
        {label && <p className="font-semibold text-slate-200 mb-1.5">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
            />
            <span className="text-slate-400 font-medium">{entry.name}:</span>
            <span className="text-slate-100 font-bold">
              {entry.value}
              {entry.payload?.percentage !== undefined ? ` (${entry.payload.percentage}%)` : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Chart Skeleton Loader ───────────────────────────────────────────────────

const ChartSkeleton = ({ height = 280 }: { height?: number }) => (
  <div
    style={{ height }}
    className="w-full bg-slate-900/40 rounded-xl flex flex-col justify-center items-center gap-3 animate-pulse border border-slate-800/40"
  >
    <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
    <span className="text-xs text-slate-500 font-medium">Aggregating live scan data...</span>
  </div>
);

// ─── Empty State Widget ───────────────────────────────────────────────────────

const EmptyChartState = ({ message = 'No data available for the selected period.' }: { message?: string }) => (
  <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
    <Shield className="h-10 w-10 text-slate-600 mb-2" />
    <p className="text-slate-400 text-sm font-medium">{message}</p>
    <Link
      to="/scanner"
      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
    >
      Run a Scan <ArrowRight className="h-3 w-3" />
    </Link>
  </div>
);

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  // Date filter: 7, 30, 90, or undefined (all-time)
  const [days, setDays] = useState<number | undefined>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [distribution, setDistribution] = useState<ScamDistributionData | null>(null);
  const [categories, setCategories] = useState<ScamCategoriesData | null>(null);
  const [dailyTrends, setDailyTrends] = useState<DailyTrendsData | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionData | null>(null);
  const [inputTypes, setInputTypes] = useState<InputTypesData | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScoresData | null>(null);

  // Fetch all analytics datasets concurrently
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [
        statsRes,
        distRes,
        catsRes,
        trendsRes,
        riskDistRes,
        inputTypesRes,
        riskScoresRes,
      ] = await Promise.all([
        getDashboardStats(days),
        getScamDistribution(days),
        getScamCategories(days),
        getDailyTrends(days || 30),
        getRiskDistribution(days || 30),
        getInputTypes(days),
        getRiskScores(days),
      ]);

      setStats(statsRes);
      setDistribution(distRes);
      setCategories(catsRes);
      setDailyTrends(trendsRes);
      setRiskDist(riskDistRes);
      setInputTypes(inputTypesRes);
      setRiskScores(riskScoresRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Failed to connect to the ScamShield backend API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const totalScans = stats?.total_scans ?? 0;
  const hasData = totalScans > 0;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ─── Top Header & Controls ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Threat Intelligence Dashboard
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Real-time telemetry, risk classification, and scam pattern analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 text-xs font-medium">
              <Filter className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
              {[
                { label: '7D', value: 7 },
                { label: '30D', value: 30 },
                { label: '90D', value: 90 },
                { label: 'All', value: undefined },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    days === opt.value
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2.5 bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl text-slate-300 hover:text-cyan-400 transition-all disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─── Error Alert Banner ───────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-red-300 text-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-semibold text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Row 1: Four Summary Statistic Cards ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Scans */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-5 hover:border-cyan-500/40 transition-all shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Total Messages Scanned
              </span>
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {loading ? '...' : (stats?.total_scans ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              {stats?.total_change !== undefined && stats.total_change !== 0 ? (
                <>
                  {stats.total_change > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span
                    className={stats.total_change > 0 ? 'text-cyan-400 font-semibold' : 'text-slate-400 font-semibold'}
                  >
                    {stats.total_change > 0 ? `+${stats.total_change}%` : `${stats.total_change}%`}
                  </span>
                  <span className="text-slate-500">vs prev period</span>
                </>
              ) : (
                <span className="text-slate-500">Live aggregated telemetry</span>
              )}
            </div>
          </div>

          {/* Card 2: Scams Detected */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-5 hover:border-red-500/40 transition-all shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Scams Detected
              </span>
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-400 tracking-tight">
              {loading ? '...' : (stats?.scams_detected ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              {stats?.scam_change !== undefined && stats.scam_change !== 0 ? (
                <>
                  {stats.scam_change > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-green-400" />
                  )}
                  <span
                    className={stats.scam_change > 0 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}
                  >
                    {stats.scam_change > 0 ? `+${stats.scam_change}%` : `${stats.scam_change}%`}
                  </span>
                  <span className="text-slate-500">vs prev period</span>
                </>
              ) : (
                <span className="text-slate-500">Confirmed fraudulent threats</span>
              )}
            </div>
          </div>

          {/* Card 3: Suspicious Messages */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-5 hover:border-orange-500/40 transition-all shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Suspicious Messages
              </span>
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-orange-400 tracking-tight">
              {loading ? '...' : (stats?.suspicious_messages ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              {stats?.suspicious_change !== undefined && stats.suspicious_change !== 0 ? (
                <>
                  {stats.suspicious_change > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span
                    className={
                      stats.suspicious_change > 0 ? 'text-orange-400 font-semibold' : 'text-slate-400 font-semibold'
                    }
                  >
                    {stats.suspicious_change > 0
                      ? `+${stats.suspicious_change}%`
                      : `${stats.suspicious_change}%`}
                  </span>
                  <span className="text-slate-500">vs prev period</span>
                </>
              ) : (
                <span className="text-slate-500">Flagged for verification</span>
              )}
            </div>
          </div>

          {/* Card 4: Safe Messages */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-5 hover:border-green-500/40 transition-all shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Safe Messages
              </span>
              <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-green-400 tracking-tight">
              {loading ? '...' : (stats?.safe_messages ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              {stats?.safe_change !== undefined && stats.safe_change !== 0 ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    {stats.safe_change > 0 ? `+${stats.safe_change}%` : `${stats.safe_change}%`}
                  </span>
                  <span className="text-slate-500">vs prev period</span>
                </>
              ) : (
                <span className="text-slate-500">Legitimate communications</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Row 2: Scam Distribution (Donut) & Scam Categories (Bar) ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart: Scam Distribution */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  Scam Distribution
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportion of scanned items by verdict
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                {distribution?.total_scans ?? 0} total
              </span>
            </div>

            {loading ? (
              <ChartSkeleton height={280} />
            ) : !hasData ? (
              <EmptyChartState message="No scans recorded yet." />
            ) : (
              <div className="relative flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={distribution?.data || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {(distribution?.data || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val, entry: any) => (
                        <span className="text-xs font-semibold text-slate-300">
                          {val} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label */}
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-2xl font-black text-white">
                    {distribution?.total_scans ?? 0}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Scans
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart: Scam Categories */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Top Scam Categories
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Frequently detected Indian fraud patterns (ranked by frequency)
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {categories?.categories.length ?? 0} categories detected
              </span>
            </div>

            {loading ? (
              <ChartSkeleton height={280} />
            ) : !categories || categories.categories.length === 0 ? (
              <EmptyChartState message="No categorized scam patterns detected in this timeframe." />
            ) : (
              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={categories.categories.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.4} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="#cbd5e1"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Cases"
                      radius={[0, 6, 6, 0]}
                    >
                      {categories.categories.map((entry, idx) => (
                        <Cell
                          key={`cat-cell-${idx}`}
                          fill={entry.risk_level === 'High' ? '#ef4444' : '#fb923c'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ─── Row 3: Daily Detection Line Chart & Risk Distribution Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Scam Detection – Line Chart */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  Daily Scam Trends
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Day-by-day telemetry of scanned messages & verdict distribution
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">Continuous timeline</span>
            </div>

            {loading ? (
              <ChartSkeleton height={280} />
            ) : !dailyTrends || dailyTrends.trends.length === 0 ? (
              <EmptyChartState message="No timeline data available." />
            ) : (
              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={dailyTrends.trends}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="formatted_date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={30} iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Scans"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="scam"
                      name="Scams"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="suspicious"
                      name="Suspicious"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="safe"
                      name="Safe"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Risk Distribution – Area Chart */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Risk Distribution Over Time
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Severity stratification: Low (0-29), Medium (30-69), High (70-100)
                </p>
              </div>
              <span className="text-xs text-slate-400">Severity timeline</span>
            </div>

            {loading ? (
              <ChartSkeleton height={280} />
            ) : !riskDist || riskDist.distribution.length === 0 ? (
              <EmptyChartState message="No risk distribution history." />
            ) : (
              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={riskDist.distribution}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="formatted_date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={30} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="high"
                      name="High Risk (70-100)"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorHigh)"
                    />
                    <Area
                      type="monotone"
                      dataKey="medium"
                      name="Medium Risk (30-69)"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorMedium)"
                    />
                    <Area
                      type="monotone"
                      dataKey="low"
                      name="Low Risk (0-29)"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorLow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ─── Row 4: Input Type Analytics & Risk Score Histogram ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Type Analytics */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  Input Source Breakdown
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Threat vector origins: Text, Screenshots, Audio & URLs
                </p>
              </div>
              <span className="text-xs text-slate-400">Source telemetry</span>
            </div>

            {loading ? (
              <ChartSkeleton height={260} />
            ) : !inputTypes || inputTypes.types.length === 0 ? (
              <EmptyChartState message="No input source records." />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                <div className="w-full sm:w-1/2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inputTypes.types}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {inputTypes.types.map((entry, idx) => (
                          <Cell key={`type-cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Source Stats Legend Details */}
                <div className="w-full sm:w-1/2 space-y-2 text-xs">
                  {inputTypes.types.map((item) => (
                    <div
                      key={item.type}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-300 font-medium">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{item.count}</span>
                        <span className="text-slate-400 ml-1.5">({item.percentage}%)</span>
                        <div className="text-[10px] text-red-400 font-medium">
                          {item.scams} scam{item.scams !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Risk Score Histogram */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  Risk Score Distribution
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Histogram of scans across risk score ranges (0 to 100)
                </p>
              </div>
              <span className="text-xs text-slate-400">Score buckets</span>
            </div>

            {loading ? (
              <ChartSkeleton height={260} />
            ) : !riskScores || riskScores.scores.length === 0 ? (
              <EmptyChartState message="No risk scores evaluated yet." />
            ) : (
              <div className="flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={riskScores.scores}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="range" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Scans" radius={[6, 6, 0, 0]}>
                      {riskScores.scores.map((entry, idx) => (
                        <Cell key={`score-cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ─── Row 5: Recent Detections Table ──────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                Recent Detections & Scans
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest live entries evaluated by the ScamShield engine
              </p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              View Full History <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !stats?.recent_scans || stats.recent_scans.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <Shield className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No recent scan records available.</p>
              <Link
                to="/scanner"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Scan Your First Message
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-3">Type</th>
                    <th className="pb-3">Preview / Message</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Verdict</th>
                    <th className="pb-3 pr-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recent_scans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getInputTypeIcon(scan.input_type)}</span>
                          <span className="capitalize text-slate-300 font-medium">
                            {scan.input_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 max-w-xs sm:max-w-md truncate text-slate-300 font-mono text-[11px]">
                        {truncate(scan.input_preview || 'No preview available', 55)}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-md text-slate-200 font-medium text-[11px]">
                          {scan.category}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono ${getRiskColor(scan.risk_score)}`}>
                            {scan.risk_score}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                scan.risk_score >= 70
                                  ? 'bg-red-500'
                                  : scan.risk_score >= 30
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${scan.risk_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getVerdictBg(
                            scan.verdict
                          )}`}
                        >
                          {scan.verdict}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right text-slate-400 whitespace-nowrap">
                        {formatDate(scan.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Row 6: Quick Scan Action Shortcuts ─────────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Quick Threat Scanners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/scanner"
              className="p-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Message Scanner
                </h4>
                <p className="text-xs text-slate-400">SMS, WhatsApp & UPI scams</p>
              </div>
            </Link>

            <Link
              to="/screenshot"
              className="p-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  Screenshot OCR
                </h4>
                <p className="text-xs text-slate-400">Scan chat screenshots</p>
              </div>
            </Link>

            <Link
              to="/call"
              className="p-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-pink-500/40 rounded-2xl flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                  Call Recording
                </h4>
                <p className="text-xs text-slate-400">Digital arrest & fake police</p>
              </div>
            </Link>

            <Link
              to="/url"
              className="p-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Phishing Link
                </h4>
                <p className="text-xs text-slate-400">Inspect suspicious URLs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
