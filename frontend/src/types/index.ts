export interface RedFlag {
  indicator: string;
  explanation: string;
}

export interface AnalysisResult {
  verdict: 'SCAM' | 'SUSPICIOUS' | 'SAFE' | 'UNKNOWN' | 'DANGEROUS';
  risk_score: number;
  category: string;
  confidence: number;
  red_flags: RedFlag[];
  keywords: string[];
  explanation: string;
  recommendations: string[];
  analysis_method: string;
  scan_id?: string;
  // Image specific
  ocr_success?: boolean;
  ocr_error?: string;
  extracted_text?: string;
  ocr_method?: string;
  word_count?: number;
  // Audio specific
  transcription_success?: boolean;
  transcription_error?: string;
  transcript?: string;
  transcription_method?: string;
}

export interface URLSuspiciousPattern {
  pattern: string;
  explanation: string;
}

export interface URLAnalysisResult {
  url: string;
  is_valid: boolean;
  is_https: boolean;
  domain: string;
  tld: string;
  risk_score: number;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'INVALID';
  suspicious_patterns: URLSuspiciousPattern[];
  recommendations: string[];
  scan_id?: string;
}

export interface ScanHistoryItem {
  id: string;
  input_type: 'message' | 'image' | 'audio' | 'url';
  input_preview?: string;
  verdict: string;
  risk_score: number;
  category: string;
  created_at: string;
  language?: string;
  full_result?: AnalysisResult | URLAnalysisResult;
}

export interface DashboardStats {
  total_scans: number;
  scams_detected: number;
  suspicious_messages: number;
  safe_messages: number;
  total_change?: number;
  scam_change?: number;
  suspicious_change?: number;
  safe_change?: number;
  recent_scans: ScanHistoryItem[];
}

export interface ScamDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ScamDistributionData {
  total_scans: number;
  scam: number;
  suspicious: number;
  safe: number;
  percentages: {
    scam: number;
    suspicious: number;
    safe: number;
  };
  data: ScamDistributionItem[];
}

export interface ScamCategoryItem {
  category: string;
  count: number;
  percentage: number;
  risk_level: 'High' | 'Medium';
}

export interface ScamCategoriesData {
  total_flagged: number;
  categories: ScamCategoryItem[];
}

export interface DailyTrendItem {
  date: string;
  formatted_date: string;
  total: number;
  scam: number;
  suspicious: number;
  safe: number;
}

export interface DailyTrendsData {
  trends: DailyTrendItem[];
}

export interface RiskDistributionItem {
  date: string;
  formatted_date: string;
  low: number;
  medium: number;
  high: number;
  total: number;
}

export interface RiskDistributionData {
  distribution: RiskDistributionItem[];
}

export interface InputTypeItem {
  type: string;
  label: string;
  count: number;
  scams: number;
  percentage: number;
  color: string;
}

export interface InputTypesData {
  total: number;
  types: InputTypeItem[];
}

export interface RiskScoreBucket {
  range: string;
  count: number;
  percentage: number;
  risk: string;
  color: string;
}

export interface RiskScoresData {
  total: number;
  scores: RiskScoreBucket[];
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  alert_on_scam: boolean;
  alert_on_suspicious: boolean;
  active: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  contact_id: string;
  scan_id: string;
  verdict: string;
  risk_score: number;
  category: string;
  status: 'simulated' | 'sent' | 'failed' | 'queued';
  note: string;
  created_at: string;
}
