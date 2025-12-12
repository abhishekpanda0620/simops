import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils';
import type { K8sPod } from '@/types';
import { Box } from 'lucide-react';

interface PodNodeData {
  pod: K8sPod;
  isSelected: boolean;
  onSelect: (pod: K8sPod) => void;
}

interface PodNodeProps {
  data: PodNodeData;
}

function PodNodeComponent({ data }: PodNodeProps) {
  const { pod, isSelected, onSelect } = data;
  
  const statusColors: Record<string, string> = {
    running: 'border-success-500 bg-success-500/10',
    pending: 'border-warning-500 bg-warning-500/10',
    failed: 'border-error-500 bg-error-500/10',
    succeeded: 'border-success-500 bg-success-500/10',
    unknown: 'border-surface-500 bg-surface-500/10',
  };

  const statusDotColors: Record<string, string> = {
    running: 'bg-success-500',
    pending: 'bg-warning-500',
    failed: 'bg-error-500',
    succeeded: 'bg-success-500',
    unknown: 'bg-surface-500',
  };

  return (
    <div
      onClick={() => onSelect(pod)}
      className={cn(
        'px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
        'min-w-[140px] backdrop-blur-sm',
        statusColors[pod.status] || statusColors.unknown,
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-950 scale-105',
        !isSelected && 'hover:scale-102 hover:shadow-lg'
      )}
    >
      {/* Input handle - connects from Service */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-surface-900"
      />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Box className="w-4 h-4 text-primary-400" />
        <span className="text-xs font-medium text-surface-300">Pod</span>
        <span
          className={cn(
            'w-2 h-2 rounded-full ml-auto',
            statusDotColors[pod.status] || statusDotColors.unknown,
            (pod.status === 'running' || pod.status === 'pending') && 'animate-pulse'
          )}
        />
      </div>
      
      {/* Pod name (truncated) */}
      <p className="text-sm font-semibold text-surface-100 truncate">
        {pod.name.split('-').slice(0, 2).join('-')}
      </p>
      
      {/* Container info */}
      {/* Container info */}
      <div className="flex gap-1 mt-2">
        {pod.containers.map((c, i) => (
             <div 
               key={i}
               className={cn(
                 "w-3 h-3 rounded-sm transition-colors",
                 c.state === 'running' ? "bg-accent-500" : "bg-surface-600 animate-pulse"
               )}
               title={`${c.name} (${c.state})`}
             />
        ))}
         {/* Fallback if no containers array yet */}
        {(!pod.containers || pod.containers.length === 0) && (
            <div className="w-3 h-3 rounded-sm bg-accent-500/50" title="Initializing..." />
        )}
      </div>
      
      {/* Restarts badge if > 0 */}
      {pod.restarts > 0 && (
        <div className="mt-2 px-2 py-0.5 bg-error-500/20 rounded text-xs text-error-400 inline-block">
          {pod.restarts} restart{pod.restarts > 1 ? 's' : ''}
        </div>
      )}
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-500 !border-2 !border-surface-900"
      />
    </div>
  );
}

export const PodNode = memo(PodNodeComponent);
