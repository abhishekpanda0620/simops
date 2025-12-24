import type { StageStatus } from '@/types/pipeline';
import { CheckCircle, XCircle, Play, Pause, AlertTriangle } from 'lucide-react';

// Status colors and icons - shared across pipeline components
export const statusConfig: Record<StageStatus, { color: string; bgColor: string; Icon: typeof CheckCircle }> = {
  succeeded: { color: 'text-green-400', bgColor: 'bg-green-500/20', Icon: CheckCircle },
  failed: { color: 'text-red-400', bgColor: 'bg-red-500/20', Icon: XCircle },
  running: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', Icon: Play },
  pending: { color: 'text-surface-400', bgColor: 'bg-surface-500/20', Icon: Pause },
  skipped: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', Icon: AlertTriangle },
  cancelled: { color: 'text-surface-500', bgColor: 'bg-surface-600/20', Icon: XCircle },
};

export function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
