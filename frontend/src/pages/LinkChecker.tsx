import { useState } from 'react';
import {
  Link2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Globe,
  ExternalLink,
  Info,
  X,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { analyzeUrl } from '../services/api';
import type { URLAnalysisResult } from '../types';
import { getVerdictBg, getRiskColor } from '../utils';

// ─── Example suspicious URLs ──────────────────────────────────────────────────
const EXAMPLE_URLS = [
  'http://paypa1-secure-login.xyz/verify?user=you',
  'https://amazon-account-suspended.tk/reactivate',
  'http://192.168.1.1/bank-login',
  'http://bit.ly/3xFakeBonus',
  'https://sbi-bank-secure.ml/update-kyc',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidUrlFormat(raw: string): boolean {
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return u.hostname.includes('.');
  } catch {
    return false;
  }
}

function extractSubdomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length > 2) return parts.slice(0, parts.length - 2).join('.');
  return '—';
}

// ─── Verdict config ───────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  SAFE: {
    icon: CheckCircle,
    color: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    label: 'SAFE',
  },
  SUSPICIOUS: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
    label: 'SUSPICIOUS',
  },
  DANGEROUS: {
    icon: XCircle,
    color: 'text-red-400',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    label: 'DANGEROUS',
  },
  INVALID: {
    icon: Info,
    color: 'text-slate-400',
    border: 'border-slate-500/40',
    bg: 'bg-slate-500/10',
    label: 'INVALID',
  },
};

// ─── Risk bar colours ─────────────────────────────────────────────────────────
function getRiskBarColor(score: number) {
  if (score >= 70) return 'bg-gradient-to-r from-red-600 to-red-400';
  if (score >= 30) return 'bg-gradient-to-r from-orange-500 to-yellow-400';
  return 'bg-gradient-to-r from-green-600 to-cyan-400';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LinkChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<URLAnalysisResult | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  // ── Validate & submit ──────────────────────────────────────────────────────
  const handleCheck = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL to check.');
      return;
    }
    if (!isValidUrlFormat(trimmed)) {
      setError('URL format looks invalid. Include http:// or https://');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data: URLAnalysisResult = await analyzeUrl(trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setResult(null);
    setShowExamples(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCheck();
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const verdictCfg = result ? VERDICT_CONFIG[result.verdict] : null;
  const VerdictIcon = verdictCfg?.icon ?? null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium tracking-wide">Phishing Link Checker</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Check a URL for{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Phishing Threats
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Paste any link below. Our heuristic engine scans for suspicious patterns,
            lookalike domains, and unsafe indicators — without ever opening the URL.
          </p>
        </div>

        {/* ── URL Input Card ────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">

          {/* Warning banner */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm font-medium">
              We will <span className="underline underline-offset-2">NOT</span> automatically open this URL in your browser.
            </p>
          </div>

          {/* Input row */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-3 bg-slate-800/60 border rounded-xl px-4 py-3 transition-colors duration-200
                ${error ? 'border-red-500/60 focus-within:border-red-400' : 'border-slate-600/50 focus-within:border-cyan-500/60'}`}
            >
              <Link2 className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="https://suspicious-site.example.com/verify"
                spellCheck={false}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none font-mono"
              />
              {url && (
                <button
                  onClick={handleClear}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Validation error */}
            {error && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs px-1">
                <XCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl
                transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Check URL
                </>
              )}
            </button>

            {(url || result) && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 border border-slate-600/50 hover:border-slate-500 text-slate-400
                  hover:text-slate-200 px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}

            {/* Example URLs toggle */}
            <button
              onClick={() => setShowExamples((p) => !p)}
              className="ml-auto flex items-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              Try example suspicious URLs
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Example URLs dropdown */}
          {showExamples && (
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">⚠ Example Suspicious URLs (for testing only)</p>
              {EXAMPLE_URLS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setUrl(ex); setShowExamples(false); setError(null); setResult(null); }}
                  className="w-full text-left font-mono text-xs text-cyan-300/80 hover:text-cyan-200 hover:bg-slate-700/50
                    px-3 py-1.5 rounded-lg transition-colors duration-150 truncate"
                  title={ex}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Analysis Result ───────────────────────────────────────────── */}
        {result && verdictCfg && VerdictIcon && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Animated verdict hero */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-6 ${verdictCfg.border} ${verdictCfg.bg}`}
            >
              {/* Pulse ring for DANGEROUS */}
              {result.verdict === 'DANGEROUS' && (
                <>
                  <span className="absolute inset-0 rounded-2xl border-2 border-red-500/30 animate-ping" style={{ animationDuration: '1.6s' }} />
                  <span className="absolute inset-0 rounded-2xl border border-red-500/15 animate-ping" style={{ animationDuration: '2.4s' }} />
                </>
              )}

              <div className="relative flex items-center gap-4">
                {/* Icon */}
                <div className={`shrink-0 relative ${result.verdict === 'SAFE' ? 'drop-shadow-[0_0_12px_#4ade80]' : result.verdict === 'DANGEROUS' ? 'drop-shadow-[0_0_12px_#f87171]' : ''}`}>
                  <VerdictIcon
                    className={`w-12 h-12 ${verdictCfg.color} ${result.verdict === 'SAFE' ? 'animate-pulse' : ''}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className={`text-2xl font-extrabold tracking-tight ${verdictCfg.color}`}>
                      {result.verdict}
                    </span>
                    <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${getVerdictBg(result.verdict)}`}>
                      Risk: {result.risk_score}/100
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm font-mono truncate">{result.url}</p>
                </div>
              </div>

              {/* Risk progress bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Risk Score</span>
                  <span className={`font-semibold ${getRiskColor(result.risk_score)}`}>{result.risk_score} / 100</span>
                </div>
                <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getRiskBarColor(result.risk_score)}`}
                    style={{ width: `${result.risk_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Domain Info Card ───────────────────────────────────────── */}
            <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Domain Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Domain */}
                <div className="bg-slate-800/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Domain</p>
                  <p className="text-sm font-mono text-slate-100 truncate" title={result.domain}>
                    {result.domain || '—'}
                  </p>
                </div>
                {/* TLD */}
                <div className="bg-slate-800/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">TLD</p>
                  <p className="text-sm font-mono text-slate-100">.{result.tld || '—'}</p>
                </div>
                {/* HTTPS */}
                <div className="bg-slate-800/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Protocol</p>
                  <div className="flex items-center gap-1.5">
                    {result.is_https ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs font-semibold bg-green-500/20 border border-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                          HTTPS
                        </span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full">
                          HTTP
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Subdomain */}
                <div className="bg-slate-800/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Subdomain</p>
                  <p className="text-sm font-mono text-slate-100 truncate" title={extractSubdomain(result.domain)}>
                    {extractSubdomain(result.domain)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Suspicious Patterns ────────────────────────────────────── */}
            {result.suspicious_patterns.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Suspicious Patterns Detected
                  <span className="ml-auto bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {result.suspicious_patterns.length}
                  </span>
                </h3>
                <ul className="space-y-2.5">
                  {result.suspicious_patterns.map((pat, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3"
                    >
                      <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-300">{pat.pattern}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{pat.explanation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Safety Recommendations ─────────────────────────────────── */}
            {result.recommendations.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Safety Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-slate-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-400
                        flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Footer: Disclaimer + Report ────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between
              bg-slate-900/60 border border-slate-700/40 rounded-xl px-5 py-4">
              <div className="flex items-start gap-2 text-xs text-slate-500 max-w-md">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  This is <strong className="text-slate-400">heuristic analysis only</strong>, not verified threat intelligence.
                  Results may not reflect real-time threat databases.
                </span>
              </div>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300
                  border border-orange-500/30 hover:border-orange-400/50 bg-orange-500/5 hover:bg-orange-500/10
                  px-3.5 py-2 rounded-lg transition-all duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Report to CyberCrime
              </a>
            </div>
          </div>
        )}

        {/* ── Empty / idle state ────────────────────────────────────────── */}
        {!result && !loading && (
          <div className="text-center py-10 text-slate-600 space-y-2">
            <Globe className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">Enter a URL above and click <strong className="text-slate-500">Check URL</strong> to start analysis.</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[80, 120, 96].map((h, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl border border-slate-700/30" style={{ height: h }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
