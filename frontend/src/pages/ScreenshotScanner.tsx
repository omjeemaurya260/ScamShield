import { useState, useCallback, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { analyzeImage } from '../services/api';
import type { AnalysisResult } from '../types';
import {
  getRiskColor,
  getRiskBgColor,
  getVerdictBg,
  getRiskLabel,
  formatFileSize,
} from '../utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.png, .jpg, .jpeg, .webp';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Sub-components ───────────────────────────────────────────────────────────

interface VerdictBadgeProps {
  verdict: AnalysisResult['verdict'];
}
function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const icon =
    verdict === 'SAFE' ? (
      <CheckCircle className="w-4 h-4" />
    ) : verdict === 'SCAM' ? (
      <AlertTriangle className="w-4 h-4" />
    ) : (
      <Shield className="w-4 h-4" />
    );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getVerdictBg(verdict)}`}
    >
      {icon}
      {verdict}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScreenshotScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── File validation & state setter ──────────────────────────────────────────

  const processFile = useCallback((incoming: File) => {
    setFileError(null);
    setResult(null);
    setApiError(null);

    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setFileError('Unsupported format. Please upload a PNG, JPG, JPEG, or WEBP file.');
      return;
    }
    if (incoming.size > MAX_SIZE_BYTES) {
      setFileError(`File too large (${formatFileSize(incoming.size)}). Maximum allowed size is 10 MB.`);
      return;
    }

    setFile(incoming);
    const url = URL.createObjectURL(incoming);
    setPreview(url);
  }, []);

  const removeFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setFileError(null);
    setResult(null);
    setApiError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [preview]);

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) processFile(dropped);
    },
    [processFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = e.target.files?.[0];
      if (chosen) processFile(chosen);
    },
    [processFile],
  );

  // ── Analysis ─────────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);
    setApiError(null);
    try {
      const data = await analyzeImage(file, language);
      setResult(data);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2">
            <Camera className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Screenshot Scanner</h1>
          <p className="text-slate-400 text-sm">
            Upload a screenshot to extract text via OCR and analyze it for scam indicators
          </p>
        </div>

        {/* ── Upload Card ── */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 space-y-4">
          <h2 className="text-slate-200 font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            Upload Screenshot
          </h2>

          {/* Drop zone (shown only when no file selected) */}
          {!file && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload screenshot"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
                cursor-pointer transition-all duration-200 py-14 px-6
                ${isDragging
                  ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
                  : 'border-slate-600 hover:border-cyan-500/60 hover:bg-cyan-500/5'
                }
              `}
            >
              <div className={`
                flex items-center justify-center w-16 h-16 rounded-2xl transition-colors
                ${isDragging ? 'bg-cyan-400/20' : 'bg-slate-800'}
              `}>
                <Camera className={`w-8 h-8 transition-colors ${isDragging ? 'text-cyan-300' : 'text-slate-500'}`} />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-medium">
                  Drag &amp; drop screenshot here or{' '}
                  <span className="text-cyan-400 underline underline-offset-2">click to upload</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Supports PNG, JPG, JPEG, WEBP &bull; Max 10 MB
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                onChange={onInputChange}
              />
            </div>
          )}

          {/* File error */}
          {fileError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Image Preview */}
          {file && preview && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="relative shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-900">
                  <img
                    src={preview}
                    alt="Uploaded screenshot preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-slate-200 text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <p className="text-slate-500 text-xs">{formatFileSize(file.size)}</p>
                  <p className="text-slate-500 text-xs capitalize">{file.type.split('/')[1].toUpperCase()}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={removeFile}
                  aria-label="Remove image"
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Language & Action row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            {/* Language selector */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm whitespace-nowrap">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="bg-slate-800 border border-slate-600/50 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 Hindi</option>
              </select>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className={`
                sm:ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
                font-semibold text-sm transition-all duration-200
                ${file && !isAnalyzing
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Analyze Screenshot
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="mt-0.5 text-red-400/80">{apiError}</p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-5 animate-[fadeIn_0.35s_ease-out]">

            {/* OCR Status */}
            <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 space-y-4">
              <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                OCR Status
              </h2>

              {result.ocr_success ? (
                <div className="space-y-3">
                  {/* Success badge */}
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Text extraction successful</span>
                    {result.word_count !== undefined && (
                      <span className="ml-auto text-slate-500 text-xs">
                        {result.word_count} word{result.word_count !== 1 ? 's' : ''} extracted
                      </span>
                    )}
                  </div>

                  {/* Extracted text */}
                  {result.extracted_text && (
                    <div className="space-y-1.5">
                      <p className="text-slate-500 text-xs uppercase tracking-wide">Extracted Text</p>
                      <div className="relative max-h-48 overflow-y-auto rounded-lg bg-slate-800/70 border border-slate-700/50 p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                        {result.extracted_text}
                      </div>
                    </div>
                  )}

                  {result.ocr_method && (
                    <p className="text-slate-600 text-xs">Method: {result.ocr_method}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-orange-300 font-medium">Could not extract text</p>
                    <p className="text-orange-400/70 mt-0.5">
                      {result.ocr_error ||
                        'Please ensure the image contains readable, high-contrast text.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-6 space-y-6">
              <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Analysis Results
              </h2>

              {!result.ocr_success ? (
                <div className="text-center py-8 space-y-2">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm">
                    Analysis could not be completed — no text was extracted from the image.
                  </p>
                  <p className="text-slate-600 text-xs">
                    Try uploading a clearer screenshot with visible, readable text.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Verdict & Score row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <VerdictBadge verdict={result.verdict} />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Risk Score</span>
                        <span className={`font-semibold ${getRiskColor(result.risk_score)}`}>
                          {result.risk_score}/100 — {getRiskLabel(result.risk_score)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            result.risk_score >= 70
                              ? 'bg-gradient-to-r from-red-500 to-red-400'
                              : result.risk_score >= 30
                              ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                              : 'bg-gradient-to-r from-green-500 to-green-400'
                          }`}
                          style={{ width: `${result.risk_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Confidence */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 space-y-0.5">
                      <p className="text-slate-500 text-xs uppercase tracking-wide">Category</p>
                      <p className="text-slate-200 text-sm font-medium capitalize">{result.category}</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 space-y-0.5">
                      <p className="text-slate-500 text-xs uppercase tracking-wide">Confidence</p>
                      <p className="text-slate-200 text-sm font-medium">{result.confidence}%</p>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {result.red_flags.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">
                        Red Flags Detected ({result.red_flags.length})
                      </p>
                      <div className="space-y-2">
                        {result.red_flags.map((flag, i) => (
                          <div
                            key={i}
                            className={`flex gap-3 rounded-xl border px-4 py-3 ${getRiskBgColor(result.risk_score)}`}
                          >
                            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${getRiskColor(result.risk_score)}`} />
                            <div className="space-y-0.5">
                              <p className="text-slate-200 text-sm font-medium">{flag.indicator}</p>
                              <p className="text-slate-400 text-xs leading-relaxed">{flag.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Explanation</p>
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
                      {result.explanation}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">
                        Recommendations
                      </p>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-4 py-3 text-slate-300 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Keywords */}
                  {result.keywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">
                        Detected Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-600/50 text-slate-300 text-xs font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan ID footer */}
                  {result.scan_id && (
                    <p className="text-slate-600 text-xs pt-1 border-t border-slate-700/40">
                      Scan ID: <span className="font-mono">{result.scan_id}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
