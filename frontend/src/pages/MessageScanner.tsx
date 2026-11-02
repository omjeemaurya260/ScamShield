import { useState, useRef } from 'react';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Copy,
  RefreshCw,
  ExternalLink,
  Tag,
  Flag,
  Lightbulb,
} from 'lucide-react';
import { analyzeMessage } from '../services/api';
import type { AnalysisResult } from '../types';
import {
  getVerdictBg,
  getRiskColor,
  getRiskLabel,
} from '../utils';

// ─── Example messages ──────────────────────────────────────────────────────────
const EXAMPLE_MESSAGES = [
  {
    label: '🎰 Lottery Scam',
    value:
      'Congratulations! You have won Rs. 25,00,000 in the KBC Lucky Draw. To claim your prize, send your Aadhaar card and pay Rs. 5,000 processing fee to account 9876543210. Call Mr. Sharma at +91-9999888877 immediately. Offer expires in 24 hours!',
  },
  {
    label: '🏦 Bank Phishing',
    value:
      'URGENT: Your SBI account has been suspended due to suspicious activity. Verify your account immediately by clicking: http://sbi-verify-secure.xyz/login — Failure to verify within 2 hours will result in permanent account closure. — SBI Customer Care',
  },
  {
    label: '💰 Job Offer Scam',
    value:
      'Work from home opportunity! Earn Rs. 50,000/month by liking YouTube videos. No experience needed. Pay Rs. 2,000 registration fee to join. WhatsApp us at +91-8888777766. Limited seats available. Join today and start earning immediately!',
  },
];

// ─── Verdict icon helper ────────────────────────────────────────────────────────
function VerdictIcon({ verdict, size = 32 }: { verdict: string; size?: number }) {
  const cls = `w-${size === 32 ? 8 : 6} h-${size === 32 ? 8 : 6}`;
  switch (verdict) {
    case 'SCAM':
      return <XCircle className={`${cls} text-red-400`} />;
    case 'SUSPICIOUS':
      return <AlertTriangle className={`${cls} text-orange-400`} />;
    case 'SAFE':
      return <CheckCircle className={`${cls} text-green-400`} />;
    default:
      return <Shield className={`${cls} text-slate-400`} />;
  }
}

// ─── Risk progress bar ──────────────────────────────────────────────────────────
function RiskBar({ score }: { score: number }) {
  const barColor =
    score >= 70 ? 'bg-red-500' : score >= 30 ? 'bg-orange-400' : 'bg-green-400';
  return (
    <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-1000 ease-out ${barColor}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MessageScanner() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFlagIndexes, setOpenFlagIndexes] = useState<Set<number>>(new Set());

  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setOpenFlagIndexes(new Set());
    try {
      const data = await analyzeMessage(message.trim(), language);
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setResult(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setError('Only .txt files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMessage((ev.target?.result as string) || '');
      setResult(null);
      setError(null);
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleFlag = (i: number) => {
    setOpenFlagIndexes((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  // ── Keyword color cycling ────────────────────────────────────────────────────
  const kwColors = [
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-semibold tracking-wide">AI Message Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Detect Scams Instantly
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Paste any suspicious message — SMS, WhatsApp, email — and our AI will analyse it in seconds.
          </p>
        </div>

        {/* ── Input Card ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 space-y-5">

          {/* Top toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Language selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Language:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700/70">
                {(['en', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      language === lang
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    }`}
                  >
                    {lang === 'en' ? 'English' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Example messages dropdown */}
            <div className="sm:ml-auto">
              <select
                className="bg-slate-800/80 border border-slate-700/60 text-slate-300 text-sm rounded-lg px-3 py-1.5 cursor-pointer hover:border-cyan-500/40 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/40 w-full sm:w-auto"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setMessage(e.target.value);
                    setResult(null);
                    setError(null);
                    e.target.value = '';
                  }
                }}
              >
                <option value="" disabled>💡 Try an example</option>
                {EXAMPLE_MESSAGES.map((ex) => (
                  <option key={ex.label} value={ex.value}>{ex.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'यहाँ संदेश पेस्ट करें या टाइप करें…'
                  : 'Paste or type a suspicious message here…'
              }
              className="w-full min-h-[160px] bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
              style={{ minHeight: '160px' }}
            />
            {/* Character counter */}
            <span className="absolute bottom-3 right-4 text-slate-600 text-xs select-none">
              {message.length} chars
            </span>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !message.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Analyse Message
                </>
              )}
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              disabled={!message && !result}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 hover:border-slate-500 px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <XCircle className="w-4 h-4" />
              Clear
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              disabled={!message}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 hover:border-slate-500 px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* File upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-500 px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <Tag className="w-4 h-4" />
              Upload .txt
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* ── Error Banner ───────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Analysis Failed</p>
              <p className="text-red-400/80 text-sm mt-0.5">{error}</p>
              <p className="text-slate-500 text-xs mt-1">
                Make sure the ScamShield backend is running on{' '}
                <span className="text-slate-400 font-mono">the ScamShield server</span>.
              </p>
            </div>
          </div>
        )}

        {/* ── Results Section ────────────────────────────────────────── */}
        {result && (
          <div
            ref={resultRef}
            className="space-y-6"
            style={{ animation: 'fadeInUp 0.5s ease-out both' }}
          >
            {/* Verdict + Risk row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Verdict Card */}
              <div className={`bg-slate-900/80 border backdrop-blur rounded-2xl p-6 flex flex-col items-center gap-3 text-center ${
                result.verdict === 'SCAM'
                  ? 'border-red-500/40'
                  : result.verdict === 'SUSPICIOUS'
                  ? 'border-orange-500/40'
                  : 'border-green-500/40'
              }`}>
                <VerdictIcon verdict={result.verdict} size={32} />
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Verdict</p>
                  <span
                    className={`inline-flex items-center border rounded-full px-5 py-1.5 text-xl font-extrabold tracking-wide ${getVerdictBg(result.verdict)}`}
                  >
                    {result.verdict}
                  </span>
                </div>
                {result.scan_id && (
                  <p className="text-slate-600 text-xs font-mono mt-1">
                    Scan&nbsp;ID:&nbsp;{result.scan_id}
                  </p>
                )}
              </div>

              {/* Risk Score Card */}
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Risk Score</p>
                  <span className={`text-3xl font-extrabold ${getRiskColor(result.risk_score)}`}>
                    {result.risk_score}
                    <span className="text-base font-normal text-slate-500">/100</span>
                  </span>
                </div>
                <RiskBar score={result.risk_score} />
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${getRiskColor(result.risk_score)}`}>
                    {getRiskLabel(result.risk_score)}
                  </span>
                  <span className="text-slate-500">Confidence: {result.confidence}%</span>
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.category && (
                    <span className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs rounded-full px-3 py-1">
                      <Flag className="w-3 h-3" />
                      {result.category}
                    </span>
                  )}
                  {result.analysis_method && (
                    <span className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs rounded-full px-3 py-1">
                      <Info className="w-3 h-3" />
                      {result.analysis_method}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Keywords */}
            {result.keywords && result.keywords.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">Extracted Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className={`text-xs border rounded-full px-3 py-1 font-medium ${kwColors[i % kwColors.length]}`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {result.red_flags && result.red_flags.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">
                    Red Flags
                    <span className="ml-2 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5">
                      {result.red_flags.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {result.red_flags.map((flag, i) => (
                    <div key={i} className="border border-red-500/20 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleFlag(i)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-slate-200 text-sm font-medium flex-1">
                          {flag.indicator}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {openFlagIndexes.has(i) ? '▲' : '▼'}
                        </span>
                      </button>
                      {openFlagIndexes.has(i) && (
                        <div className="px-4 py-3 bg-slate-900/40 border-t border-red-500/10">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {flag.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {result.explanation && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">AI Explanation</h3>
                </div>
                <p className="text-slate-300 text-sm leading-7">{result.explanation}</p>
              </div>
            )}

            {/* Recommended Actions */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">Recommended Actions</h3>
                </div>
                <ol className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-300 text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Report to Cybercrime */}
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Report to Cybercrime Portal
              </a>

              {/* Family Alert */}
              <a
                href="/family"
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Alert Family Members
              </a>

              {/* Re-scan */}
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 border border-slate-700/60 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Global fade-in animation ──────────────────────────────────── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
