import { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Upload,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  FileAudio,
  X,
  Info,
  RefreshCw,
  XCircle,
  Shield,
  Flag,
  Lightbulb,
  Tag,
  ExternalLink,
  PhoneOff,
} from 'lucide-react';
import { analyzeAudio } from '../services/api';
import type { AnalysisResult } from '../types';
import {
  getVerdictBg,
  getRiskColor,
  getRiskLabel,
  formatFileSize,
} from '../utils';

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4',
  'audio/m4a', 'audio/x-m4a', 'audio/webm', 'video/webm'];
const ACCEPTED_EXT  = ['.mp3', '.wav', '.m4a', '.webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Call scam patterns ────────────────────────────────────────────────────────
const CALL_SCAM_PATTERNS: {
  id: string;
  icon: string;
  label: string;
  keywords: string[];
  explanation: string;
}[] = [
  {
    id: 'digital_arrest',
    icon: '🚔',
    label: 'Digital Arrest',
    keywords: ['digital arrest', 'cyber crime', 'police', 'cbi', 'ed ', 'enforcement directorate',
      'arrested', 'warrant', 'court order', 'customs', 'narcotics'],
    explanation: 'Caller impersonates law enforcement and threatens "digital arrest" to extort money or personal details.',
  },
  {
    id: 'otp_request',
    icon: '🔑',
    label: 'OTP / PIN Request',
    keywords: ['otp', 'one time password', 'verification code', 'pin ', 'passcode',
      'share the code', 'tell me the code', 'bata do code'],
    explanation: 'Scammer asks you to share an OTP or PIN to gain access to your account.',
  },
  {
    id: 'aadhaar_pan',
    icon: '🪪',
    label: 'Aadhaar / PAN Phishing',
    keywords: ['aadhaar', 'aadhar', 'pan card', 'pan number', 'kyc', 'know your customer',
      'update kyc', 'kyc pending', 'kyc expire'],
    explanation: 'Caller requests Aadhaar or PAN details under the guise of KYC verification.',
  },
  {
    id: 'bank_fraud',
    icon: '🏦',
    label: 'Bank / UPI Fraud',
    keywords: ['bank account', 'upi', 'imps', 'neft', 'rtgs', 'transfer money', 'paytm',
      'phonepe', 'gpay', 'google pay', 'send money', 'account block', 'account suspend'],
    explanation: 'Scammer impersonates a bank or payment app to trick you into transferring money.',
  },
  {
    id: 'lottery_prize',
    icon: '🎰',
    label: 'Lottery / Prize Scam',
    keywords: ['lottery', 'prize', 'lucky draw', 'won', 'winner', 'reward', 'jackpot',
      'crore', 'lakh', 'cash prize', 'gift voucher'],
    explanation: 'You are falsely told you have won a prize and asked to pay a fee to claim it.',
  },
  {
    id: 'job_offer',
    icon: '💼',
    label: 'Fake Job Offer',
    keywords: ['job offer', 'work from home', 'part time', 'earn daily', 'registration fee',
      'training fee', 'joining fee', 'salary', 'recruiter'],
    explanation: 'Fraudulent job offers that require upfront payment for training or registration.',
  },
  {
    id: 'urgency_threat',
    icon: '⏰',
    label: 'Urgency / Threat Tactics',
    keywords: ['urgent', 'immediately', 'right now', 'last chance', 'expire', 'suspend',
      'block', 'action required', 'limited time', 'abhi karo', 'turant'],
    explanation: 'Caller creates artificial urgency or threatens negative consequences to pressure you.',
  },
  {
    id: 'remote_access',
    icon: '💻',
    label: 'Remote Access Request',
    keywords: ['anydesk', 'teamviewer', 'screen share', 'remote access', 'install app',
      'download software', 'control your phone', 'share screen'],
    explanation: 'Scammer asks you to install remote desktop software to gain full access to your device.',
  },
];

// ─── Helper: detect patterns from transcript ───────────────────────────────────
function detectCallPatterns(transcript: string) {
  const lower = transcript.toLowerCase();
  return CALL_SCAM_PATTERNS.filter((p) =>
    p.keywords.some((kw) => lower.includes(kw))
  );
}

// ─── Helper: highlight suspicious sentences ────────────────────────────────────
function highlightTranscript(
  transcript: string,
  redFlags: { indicator: string; explanation: string }[]
): React.ReactNode {
  if (!redFlags || redFlags.length === 0) {
    return <span className="text-slate-300">{transcript}</span>;
  }

  const sentences = transcript.split(/(?<=[.!?।])\s+/);
  const flagKeywords = redFlags.flatMap((f) =>
    f.indicator.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  );

  return (
    <>
      {sentences.map((sentence, i) => {
        const lower = sentence.toLowerCase();
        const isScam = flagKeywords.some((kw) => lower.includes(kw));
        return (
          <span
            key={i}
            className={
              isScam
                ? 'bg-red-500/20 text-red-200 border-b border-red-400/50 rounded px-0.5'
                : 'text-slate-300'
            }
          >
            {sentence}{' '}
          </span>
        );
      })}
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function VerdictIcon({ verdict, size = 32 }: { verdict: string; size?: number }) {
  const cls = `w-${size === 32 ? 8 : 6} h-${size === 32 ? 8 : 6}`;
  switch (verdict) {
    case 'SCAM':        return <XCircle      className={`${cls} text-red-400`} />;
    case 'SUSPICIOUS':  return <AlertTriangle className={`${cls} text-orange-400`} />;
    case 'SAFE':        return <CheckCircle  className={`${cls} text-green-400`} />;
    default:            return <Shield       className={`${cls} text-slate-400`} />;
  }
}

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
export default function CallAnalyzer() {
  const [file, setFile]               = useState<File | null>(null);
  const [audioUrl, setAudioUrl]       = useState<string | null>(null);
  const [duration, setDuration]       = useState<number | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [fileError, setFileError]     = useState<string | null>(null);
  const [language, setLanguage]       = useState<'en' | 'hi'>('en');

  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'transcribing' | 'analyzing'>('idle');
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [openFlagIdx, setOpenFlagIdx] = useState<Set<number>>(new Set());

  const dropRef    = useRef<HTMLDivElement>(null);
  const audioRef   = useRef<HTMLAudioElement>(null);
  const fileInput  = useRef<HTMLInputElement>(null);
  const resultRef  = useRef<HTMLDivElement>(null);

  // Revoke old blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ── File validation ──────────────────────────────────────────────────────────
  function validateAndSetFile(f: File) {
    setFileError(null);
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    const validExt  = ACCEPTED_EXT.includes(ext);
    const validMime = ACCEPTED_TYPES.includes(f.type) || f.type.startsWith('audio/');
    if (!validExt && !validMime) {
      setFileError(`Unsupported format "${ext}". Accepted: MP3, WAV, M4A, WEBM.`);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`File too large (${formatFileSize(f.size)}). Maximum allowed: 10 MB.`);
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setDuration(null);
    setIsPlaying(false);
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave() { setIsDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }

  // ── Audio player helpers ─────────────────────────────────────────────────────
  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setIsPlaying(true); }
    else           { el.pause(); setIsPlaying(false); }
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Analyze ──────────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!file) return;
    setResult(null);
    setError(null);
    setOpenFlagIdx(new Set());

    // Phase 1 – transcribing
    setLoadingPhase('transcribing');
    await new Promise((r) => setTimeout(r, 900)); // give UI a moment to render

    try {
      // Phase 2 – analyzing (the actual API call covers both transcription + analysis)
      setLoadingPhase('analyzing');
      const data = await analyzeAudio(file, language);
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(msg);
    } finally {
      setLoadingPhase('idle');
    }
  }

  function handleReset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setFileError(null);
    setDuration(null);
    setIsPlaying(false);
    setLoadingPhase('idle');
  }

  function toggleFlag(i: number) {
    setOpenFlagIdx((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const isLoading     = loadingPhase !== 'idle';
  const detectedPats  = result?.transcript ? detectCallPatterns(result.transcript) : [];

  const kwColors = [
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-4">
            <Mic className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-semibold tracking-wide">AI Call Analyzer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Call Recording Analyzer
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Upload a call recording and our AI will transcribe it and detect scam patterns in the speech content.
          </p>
        </div>

        {/* ── Disclaimer Banner ───────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl px-5 py-4">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-amber-300 text-sm font-semibold">Important Disclaimer</p>
            <ul className="text-amber-400/80 text-xs space-y-0.5 list-disc list-inside">
              <li>ScamShield does <strong>not</strong> identify callers from voice.</li>
              <li>Results are based on <strong>speech content analysis only</strong>.</li>
              <li>Voice biometrics and caller identity verification are NOT supported.</li>
            </ul>
          </div>
        </div>

        {/* ── Upload Card ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 space-y-5">

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

          {/* Drop zone */}
          {!file ? (
            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl py-12 px-6 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-cyan-400/70 bg-cyan-500/8 scale-[1.01]'
                  : 'border-slate-600/60 hover:border-cyan-500/40 hover:bg-slate-800/30'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-cyan-500/20' : 'bg-slate-800/60'
              }`}>
                <Upload className={`w-7 h-7 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold text-base">
                  Drop audio file here or{' '}
                  <span className="text-cyan-400 underline underline-offset-2">browse</span>
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  MP3, WAV, M4A, WEBM · Max 10 MB
                </p>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept=".mp3,.wav,.m4a,.webm,audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) validateAndSetFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            /* File preview card */
            <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{file.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {formatFileSize(file.size)}
                  {duration !== null && ` · ${formatDuration(duration)}`}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File validation error */}
          {fileError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {fileError}
            </div>
          )}

          {/* ── Audio Player ───────────────────────────────────────────── */}
          {audioUrl && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-colors flex-shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
                    controls
                    className="w-full h-9 accent-cyan-400"
                    style={{ filter: 'invert(0)' }}
                  />
                </div>
                {duration !== null && (
                  <span className="text-slate-500 text-xs flex-shrink-0">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            {loadingPhase === 'transcribing' ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Transcribing…</>
            ) : loadingPhase === 'analyzing' ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Mic className="w-4 h-4" /> Transcribe &amp; Analyze</>
            )}
          </button>
        </div>

        {/* ── API Error Banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Analysis Failed</p>
              <p className="text-red-400/80 text-sm mt-0.5">{error}</p>
              <p className="text-slate-500 text-xs mt-1">
                Make sure the ScamShield backend is running on{' '}
                <span className="text-slate-400 font-mono">localhost:8000</span>.
              </p>
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {result && (
          <div
            ref={resultRef}
            className="space-y-6"
            style={{ animation: 'fadeInUp 0.5s ease-out both' }}
          >
            {/* ─ Transcription result ──────────────────────────────────── */}
            <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">Transcription</h3>
                </div>
                {/* Success/error status */}
                {result.transcription_success === false ? (
                  <span className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-full px-3 py-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Transcription Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-300 text-xs rounded-full px-3 py-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Transcribed Successfully
                  </span>
                )}
              </div>

              {/* Transcription error */}
              {result.transcription_error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {result.transcription_error}
                </div>
              )}

              {/* Method + word count badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                {result.transcription_method && (
                  <span className="bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-full px-3 py-1">
                    Method: {result.transcription_method}
                  </span>
                )}
                {result.word_count != null && (
                  <span className="bg-slate-700/60 border border-slate-600/40 text-slate-400 rounded-full px-3 py-1">
                    {result.word_count} words
                  </span>
                )}
                {result.transcript && (
                  <span className="bg-slate-700/60 border border-slate-600/40 text-slate-400 rounded-full px-3 py-1">
                    {result.transcript.trim().split(/\s+/).length} words (counted)
                  </span>
                )}
              </div>

              {/* Transcript box */}
              {result.transcript ? (
                <>
                  <div className="max-h-56 overflow-y-auto bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 text-sm leading-7 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {highlightTranscript(result.transcript, result.red_flags || [])}
                  </div>
                  <p className="text-slate-600 text-xs flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-red-500/30 border border-red-400/50" />
                    Highlighted sentences contain suspicious patterns.
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-sm italic">No transcript available.</p>
              )}

              {/* Scope note */}
              <div className="flex items-start gap-2 bg-slate-800/40 border border-slate-600/30 rounded-lg px-3 py-2.5">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  This analysis is based on <strong className="text-slate-400">transcribed text only</strong>.
                  Voice identity verification is <strong className="text-slate-400">NOT supported</strong>.
                </p>
              </div>
            </div>

            {/* ─ Verdict + Risk row ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Verdict */}
              <div className={`bg-slate-900/80 border backdrop-blur rounded-2xl p-6 flex flex-col items-center gap-3 text-center ${
                result.verdict === 'SCAM'       ? 'border-red-500/40'
                : result.verdict === 'SUSPICIOUS' ? 'border-orange-500/40'
                : 'border-green-500/40'
              }`}>
                <VerdictIcon verdict={result.verdict} size={32} />
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Verdict</p>
                  <span className={`inline-flex items-center border rounded-full px-5 py-1.5 text-xl font-extrabold tracking-wide ${getVerdictBg(result.verdict)}`}>
                    {result.verdict}
                  </span>
                </div>
                {result.scan_id && (
                  <p className="text-slate-600 text-xs font-mono mt-1">
                    Scan&nbsp;ID:&nbsp;{result.scan_id}
                  </p>
                )}
              </div>

              {/* Risk score */}
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

            {/* ─ Detected Call Scam Patterns ───────────────────────────── */}
            {detectedPats.length > 0 && (
              <div className="bg-slate-900/80 border border-orange-500/30 backdrop-blur rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <PhoneOff className="w-4 h-4 text-orange-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">
                    Detected Call Scam Patterns
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5">
                      {detectedPats.length}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detectedPats.map((pat) => (
                    <div
                      key={pat.id}
                      className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3"
                    >
                      <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{pat.icon}</span>
                      <div>
                        <p className="text-orange-300 font-semibold text-sm">{pat.label}</p>
                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{pat.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─ Keywords ─────────────────────────────────────────────── */}
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

            {/* ─ Red Flags ────────────────────────────────────────────── */}
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
                        <span className="text-slate-200 text-sm font-medium flex-1">{flag.indicator}</span>
                        <span className="text-slate-500 text-xs">{openFlagIdx.has(i) ? '▲' : '▼'}</span>
                      </button>
                      {openFlagIdx.has(i) && (
                        <div className="px-4 py-3 bg-slate-900/40 border-t border-red-500/10">
                          <p className="text-slate-400 text-sm leading-relaxed">{flag.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─ AI Explanation ───────────────────────────────────────── */}
            {result.explanation && (
              <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">AI Explanation</h3>
                </div>
                <p className="text-slate-300 text-sm leading-7">{result.explanation}</p>
              </div>
            )}

            {/* ─ Recommendations ──────────────────────────────────────── */}
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

            {/* ─ Bottom disclaimer ─────────────────────────────────────── */}
            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-600/30 rounded-xl px-5 py-4">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">About This Analysis</p>
                <ul className="text-slate-500 text-xs space-y-0.5 list-disc list-inside">
                  <li>ScamShield does <strong className="text-slate-400">not</strong> identify callers from voice recordings.</li>
                  <li>Results are based on <strong className="text-slate-400">speech content analysis</strong> only.</li>
                  <li>Always verify suspicious calls independently before taking any action.</li>
                </ul>
              </div>
            </div>

            {/* ─ Action Buttons ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Report to Cybercrime Portal
              </a>
              <a
                href="/family"
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Alert Family Members
              </a>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 border border-slate-700/60 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 py-3 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
