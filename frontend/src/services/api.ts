import axios from 'axios';
import type {
  DashboardStats,
  ScamDistributionData,
  ScamCategoriesData,
  DailyTrendsData,
  RiskDistributionData,
  InputTypesData,
  RiskScoresData,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error('Cannot connect to ScamShield server. Please ensure the backend is running on port 8000.')
      );
    }
    const message = error.response?.data?.detail || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

// ─── Analysis APIs ────────────────────────────────────────────────────────────

export const analyzeMessage = async (message: string, language: string = 'en') => {
  const { data } = await api.post('/api/analyze/message', { message, language });
  return data;
};

export const analyzeImage = async (file: File, language: string = 'en') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const { data } = await api.post('/api/analyze/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
};

export const analyzeAudio = async (file: File, language: string = 'en') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const { data } = await api.post('/api/analyze/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
};

export const analyzeUrl = async (url: string) => {
  const { data } = await api.post('/api/analyze/url', { url });
  return data;
};

// ─── History APIs ─────────────────────────────────────────────────────────────

export const getHistory = async (params?: { limit?: number; skip?: number; search?: string }) => {
  const { data } = await api.get('/api/history', { params });
  return data;
};

export const getHistoryItem = async (id: string) => {
  const { data } = await api.get(`/api/history/${id}`);
  return data;
};

export const deleteHistoryItem = async (id: string) => {
  const { data } = await api.delete(`/api/history/${id}`);
  return data;
};

// ─── Advanced Analytics & Dashboard APIs ──────────────────────────────────────

export const getDashboardStats = async (days?: number): Promise<DashboardStats> => {
  const params = days ? { days } : {};
  const { data } = await api.get('/api/dashboard/stats', { params });
  return data;
};

export const getScamDistribution = async (days?: number): Promise<ScamDistributionData> => {
  const params = days ? { days } : {};
  const { data } = await api.get('/api/analytics/scam-distribution', { params });
  return data;
};

export const getScamCategories = async (days?: number): Promise<ScamCategoriesData> => {
  const params = days ? { days } : {};
  const { data } = await api.get('/api/analytics/scam-categories', { params });
  return data;
};

export const getDailyTrends = async (days: number = 7): Promise<DailyTrendsData> => {
  const { data } = await api.get('/api/analytics/daily-trends', { params: { days } });
  return data;
};

export const getRiskDistribution = async (days: number = 7): Promise<RiskDistributionData> => {
  const { data } = await api.get('/api/analytics/risk-distribution', { params: { days } });
  return data;
};

export const getInputTypes = async (days?: number): Promise<InputTypesData> => {
  const params = days ? { days } : {};
  const { data } = await api.get('/api/analytics/input-types', { params });
  return data;
};

export const getRiskScores = async (days?: number): Promise<RiskScoresData> => {
  const params = days ? { days } : {};
  const { data } = await api.get('/api/analytics/risk-scores', { params });
  return data;
};

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const getContacts = async () => {
  const { data } = await api.get('/api/contacts');
  return data;
};

export const createContact = async (contact: {
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  alert_on_scam?: boolean;
  alert_on_suspicious?: boolean;
}) => {
  const { data } = await api.post('/api/contacts', contact);
  return data;
};

export const updateContact = async (id: string, data: Record<string, unknown>) => {
  const { data: response } = await api.put(`/api/contacts/${id}`, data);
  return response;
};

export const deleteContact = async (id: string) => {
  const { data } = await api.delete(`/api/contacts/${id}`);
  return data;
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const sendAlert = async (alertData: {
  contact_id: string;
  scan_id: string;
  verdict: string;
  risk_score: number;
  category: string;
  user_consent: boolean;
  message_preview?: string;
}) => {
  const { data } = await api.post('/api/alerts/send', alertData);
  return data;
};

export const getAlerts = async () => {
  const { data } = await api.get('/api/alerts');
  return data;
};

export default api;
