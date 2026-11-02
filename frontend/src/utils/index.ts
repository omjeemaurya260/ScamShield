import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function getRiskColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-green-400';
}

export function getRiskBgColor(score: number): string {
  if (score >= 70) return 'bg-red-500/20 border-red-500/30';
  if (score >= 30) return 'bg-orange-500/20 border-orange-500/30';
  return 'bg-green-500/20 border-green-500/30';
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'SCAM': return 'text-red-400';
    case 'SUSPICIOUS': return 'text-orange-400';
    case 'SAFE': return 'text-green-400';
    case 'DANGEROUS': return 'text-red-500';
    default: return 'text-gray-400';
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict) {
    case 'SCAM': return 'bg-red-500/20 border-red-500/50 text-red-300';
    case 'SUSPICIOUS': return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
    case 'SAFE': return 'bg-green-500/20 border-green-500/50 text-green-300';
    case 'DANGEROUS': return 'bg-red-600/20 border-red-600/50 text-red-200';
    default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
  }
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'High Risk';
  if (score >= 30) return 'Medium Risk';
  return 'Low Risk';
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function truncate(str: string, len: number = 60): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function getInputTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    message: '💬',
    image: '🖼️',
    audio: '🎙️',
    url: '🔗',
  };
  return icons[type] || '📋';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
