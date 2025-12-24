import { Badge } from '@/components/ui';
import type { StageStatus } from '@/types/pipeline';
import { statusConfig } from './pipelineConfig';

export function StatusBadge({ status, onClick }: { status: StageStatus; onClick?: () => void }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.Icon;
  const badge = (
    <Badge 
      variant={status === 'succeeded' ? 'success' : status === 'failed' ? 'error' : 'warning'} 
      dot
    >
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
  
  if (onClick) {
    return (
      <span onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
        {badge}
      </span>
    );
  }
  return badge;
}
