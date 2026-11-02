import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Trash2,
  Eye,
  Filter,
  Shield,
  MessageSquare,
  Camera,
  Mic,
  Link2,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { getHistory, deleteHistoryItem } from '../services/api';
import type { ScanHistoryItem, AnalysisResult, URLAnalysisResult } from '../types';
import { getVerdictBg, formatDate, getRiskColor, truncate } from '../utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type VerdictFilter = 'ALL' | 'SCAM' | 'SUSPICIOUS' | 'SAFE';
type TypeFilter = 'ALL' | 'message' | 'image' | 'audio' | 'url';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InputTypeIcon({ type }: { type: string }) {
  const base = 'w-4 h-4';
  switch (type) {
    case 'image':
      return <Camera className={`${base} text-purple-400`} />;
    case 'audio':
      return <Mic className={`${base} text-blue-400`} />;
    case 'url':
      return <Link2 className={`${base} text-cyan-400`} />;
    default:
      return <MessageSquare className={`${base} text-green-400`} />;
  }
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    message: 'Message',
    image: 'Image',
    audio: 'Audio',
    url: 'URL',
  };
  return labels[type] ?? type;
}

function RiskBar({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'bg-red-500'
      : score >= 30
      ? 'bg-orange-400'
      : 'bg-green-400';
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold tabular-nums ${getRiskColor(score)}`}>
        {score}%
      </span>
      <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
}: {
  item: ScanHistoryItem;
  onClose: () => void;
}) {
  const result = item.full_result as AnalysisResult | URLAnalysisResult | undefined;
  const isUrl = item.input_type === 'url';
  const urlResult = isUrl ? (result as URLAnalysisResult) : null;
  const msgResult = !isUrl ? (result as AnalysisResult) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl
                    bg-slate-900 border border-slate-700/60 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5
                        bg-slate-900 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <InputTypeIcon type={item.input_type} />
            <div>
              <h2 className="font-bold text-slate-100 text-lg leading-none">
                Scan Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                #{item.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100
                       hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Type', value: typeLabel(item.input_type) },
              { label: 'Category', value: item.category },
              {
                label: 'Verdict',
                value: (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${getVerdictBg(item.verdict)}`}
                  >
                    {item.verdict}
                  </span>
                ),
              },
              { label: 'Date', value: formatDate(item.created_at) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40"
              >
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                {typeof value === 'string' ? (
                  <p className="text-sm font-medium text-slate-200 truncate">{value}</p>
                ) : (
                  value
                )}
              </div>
            ))}
          </div>

          {/* Risk score */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs text-slate-500 mb-2">Risk Score</p>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black tabular-nums ${getRiskColor(item.risk_score)}`}>
                {item.risk_score}%
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.risk_score >= 70
                      ? 'bg-gradient-to-r from-red-500 to-red-400'
                      : item.risk_score >= 30
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                      : 'bg-gradient-to-r from-green-500 to-green-400'
                  }`}
                  style={{ width: `${item.risk_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {item.input_preview && (
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
              <p className="text-xs text-slate-500 mb-2">Content Preview</p>
              <p className="text-sm text-slate-300 leading-relaxed break-words">
                {item.input_preview}
              </p>
            </div>
          )}

          {/* URL specific */}
          {urlResult && (
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 space-y-2">
              <p className="text-xs text-slate-500 mb-2">URL Analysis</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-400">Domain:</span>
                <span className="text-slate-200 font-mono truncate">{urlResult.domain}</span>
                <span className="text-slate-400">HTTPS:</span>
                <span className={urlResult.is_https ? 'text-green-400' : 'text-red-400'}>
                  {urlResult.is_https ? '✓ Secure' : '✗ Not Secure'}
                </span>
                <span className="text-slate-400">TLD:</span>
                <span className="text-slate-200 font-mono">.{urlResult.tld}</span>
              </div>
              {urlResult.suspicious_patterns?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Suspicious Patterns</p>
                  <ul className="space-y-1.5">
                    {urlResult.suspicious_patterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                        <span className="text-slate-300">
                          <span className="font-medium text-orange-300">{p.pattern}:</span>{' '}
                          {p.explanation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Message/Image/Audio result */}
          {msgResult && (
            <>
              {/* Explanation */}
              {msgResult.explanation && (
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-2">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {msgResult.explanation}
                  </p>
                </div>
              )}

              {/* Red flags */}
              {msgResult.red_flags?.length > 0 && (
                <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-3 font-semibold uppercase tracking-wider">
                    Red Flags ({msgResult.red_flags.length})
                  </p>
                  <ul className="space-y-2">
                    {msgResult.red_flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-300">{f.indicator}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{f.explanation}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {msgResult.keywords?.length > 0 && (
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-2">Detected Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {msgResult.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20
                                   text-cyan-300 text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {msgResult.recommendations?.length > 0 && (
                <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-3 font-semibold uppercase tracking-wider">
                    Recommendations
                  </p>
                  <ul className="space-y-2">
                    {msgResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-300">{r}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transcript / OCR */}
              {msgResult.transcript && (
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-2">Transcript</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{msgResult.transcript}</p>
                </div>
              )}
              {msgResult.extracted_text && (
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-2">Extracted Text (OCR)</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{msgResult.extracted_text}</p>
                </div>
              )}
            </>
          )}

          {/* No result */}
          {!result && (
            <div className="text-center py-6 text-slate-500 text-sm">
              Detailed result not available for this scan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/60
                    shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/15">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-bold text-slate-100">Confirm Delete</h3>
        </div>
        <p className="text-sm text-slate-400">{message}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300
                       hover:bg-slate-700/50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60
                       text-white text-sm font-semibold transition-colors flex items-center
                       justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScanHistory() {
  const [allItems, setAllItems] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory({ limit: 200, skip: 0 });
      setAllItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, verdictFilter, typeFilter]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = allItems.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.category.toLowerCase().includes(q) ||
      item.verdict.toLowerCase().includes(q) ||
      item.input_type.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.input_preview ?? '').toLowerCase().includes(q);

    const matchVerdict =
      verdictFilter === 'ALL' || item.verdict.toUpperCase() === verdictFilter;

    const matchType = typeFilter === 'ALL' || item.input_type === typeFilter;

    return matchSearch && matchVerdict && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < filtered.length;

  const hasFilters = search !== '' || verdictFilter !== 'ALL' || typeFilter !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setVerdictFilter('ALL');
    setTypeFilter('ALL');
  };

  // ── Delete single ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteHistoryItem(deleteTarget);
      setAllItems((prev) => prev.filter((i) => i.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Delete all ─────────────────────────────────────────────────────────────

  const handleDeleteAll = async () => {
    setDeleteLoading(true);
    try {
      await Promise.all(allItems.map((i) => deleteHistoryItem(i.id)));
      setAllItems([]);
      setDeleteAllOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete all failed');
      setDeleteAllOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-4 sm:p-6 lg:p-8">
      {/* Modals */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message="This scan record will be permanently deleted and cannot be recovered."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
      {deleteAllOpen && (
        <ConfirmDialog
          message={`All ${allItems.length} scan records will be permanently deleted. This action cannot be undone.`}
          onConfirm={handleDeleteAll}
          onCancel={() => setDeleteAllOpen(false)}
          loading={deleteLoading}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                Scan History
              </h1>
              {!loading && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30
                                 text-cyan-300 text-xs font-bold tabular-nums">
                  {allItems.length}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1.5 ml-14">
              Review and manage all your previous scans
            </p>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100
                       hover:bg-slate-700 transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border
                          border-red-500/30 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Search & Filter Bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category, verdict, type, ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60
                         text-slate-200 placeholder-slate-500 text-sm focus:outline-none
                         focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Verdict Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value as VerdictFilter)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60
                         text-slate-300 text-sm appearance-none focus:outline-none
                         focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all
                         cursor-pointer min-w-[140px]"
            >
              <option value="ALL">All Verdicts</option>
              <option value="SCAM">Scam</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60
                         text-slate-300 text-sm appearance-none focus:outline-none
                         focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all
                         cursor-pointer min-w-[130px]"
            >
              <option value="ALL">All Types</option>
              <option value="message">Message</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="url">URL</option>
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-600
                         text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all
                         text-sm font-medium whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}

        {loading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-slate-800/60 border border-slate-700/40 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/40 mb-5">
              <Shield className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              {hasFilters ? 'No results found' : 'No scan records found'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't scanned anything yet. Start by scanning a message, image, audio, or URL."}
            </p>
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="mt-5 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600
                           text-slate-200 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <a
                href="/scan"
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                           bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400
                           hover:to-blue-500 text-white text-sm font-semibold transition-all
                           shadow-lg shadow-cyan-500/20"
              >
                <Shield className="w-4 h-4" />
                Scan Your First Message
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-xs text-slate-500">
              Showing{' '}
              <span className="text-slate-300 font-medium">{paginated.length}</span> of{' '}
              <span className="text-slate-300 font-medium">{filtered.length}</span> results
              {hasFilters && allItems.length !== filtered.length && (
                <span> (filtered from {allItems.length} total)</span>
              )}
            </p>

            {/* ── Table wrapper (desktop) / Cards (mobile) ─────────────────── */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur
                            overflow-hidden">
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-[80px_1fr_140px_120px_110px_160px_160px]
                              gap-3 px-5 py-3 border-b border-slate-700/50 bg-slate-800/40">
                {['Scan ID', 'Type', 'Category', 'Verdict', 'Risk', 'Date', 'Actions'].map((h) => (
                  <span key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-700/30">
                {paginated.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group flex flex-col md:grid
                               md:grid-cols-[80px_1fr_140px_120px_110px_160px_160px]
                               gap-3 px-4 py-3.5 hover:bg-slate-800/40 transition-colors
                               animate-fadeIn"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* ID */}
                    <div className="flex items-center">
                      <span className="font-mono text-xs text-slate-500 bg-slate-800 px-2
                                       py-1 rounded-lg border border-slate-700/50">
                        #{item.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <InputTypeIcon type={item.input_type} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200">
                          {typeLabel(item.input_type)}
                        </p>
                        {item.input_preview && (
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">
                            {truncate(item.input_preview, 40)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center">
                      <span className="text-sm text-slate-300 truncate max-w-[130px]">
                        {item.category || '—'}
                      </span>
                    </div>

                    {/* Verdict */}
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg border
                                    text-xs font-bold tracking-wide ${getVerdictBg(item.verdict)}`}
                      >
                        {item.verdict}
                      </span>
                    </div>

                    {/* Risk */}
                    <div className="flex items-center">
                      <RiskBar score={item.risk_score} />
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   bg-cyan-500/10 border border-cyan-500/20 text-cyan-300
                                   hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all
                                   text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400
                                   hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                Page {Math.min(page, totalPages)} of {totalPages || 1}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800
                               border border-slate-700 text-slate-300 hover:text-slate-100
                               hover:bg-slate-700 transition-all text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl
                               bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500
                               hover:to-blue-500 text-white text-sm font-semibold
                               transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Load More
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Delete All ─────────────────────────────────────────────────────── */}
        {allItems.length > 0 && !loading && (
          <div className="flex justify-end pt-4 border-t border-slate-700/30">
            <button
              onClick={() => setDeleteAllOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30
                         text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all
                         text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete All History ({allItems.length})
            </button>
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
}
