import type { ResourceStatus, StageStatus } from '@/types';

type StatusType = ResourceStatus | StageStatus;

/**
 * Helper to get status variant for Badge/other components
 */
export function getStatusVariant(status: StatusType): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'running':
    case 'succeeded':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
}
