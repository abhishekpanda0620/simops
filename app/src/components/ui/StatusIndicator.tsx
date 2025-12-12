import type { ResourceStatus, StageStatus } from '@/types';
import { cn } from '@/utils/cn';

type StatusType = ResourceStatus | StageStatus;

interface StatusIndicatorProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { color: string; label: string; pulse: boolean }> = {
  running: { color: 'bg-success-500', label: 'Running', pulse: true },
  pending: { color: 'bg-warning-500', label: 'Pending', pulse: true },
  succeeded: { color: 'bg-success-500', label: 'Succeeded', pulse: false },
  failed: { color: 'bg-error-500', label: 'Failed', pulse: false },
  unknown: { color: 'bg-surface-500', label: 'Unknown', pulse: false },
  skipped: { color: 'bg-surface-500', label: 'Skipped', pulse: false },
  cancelled: { color: 'bg-surface-500', label: 'Cancelled', pulse: false },
};

const sizeStyles = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeStyles[size],
          config.color,
          config.pulse && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="text-sm text-surface-300">{config.label}</span>
      )}
    </div>
  );
}

