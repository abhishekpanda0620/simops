import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils';
import type { K8sIngress, IngressPath } from '@/types';
import { Globe } from 'lucide-react';

interface IngressNodeData {
  ingress: K8sIngress;
  isSelected: boolean;
  onSelect: (ingress: K8sIngress) => void;
}

interface IngressNodeProps {
  data: IngressNodeData;
}

function IngressNodeComponent({ data }: IngressNodeProps) {
  const { ingress, isSelected, onSelect } = data;

  return (
    <div
      onClick={() => onSelect(ingress)}
      className={cn(
        'px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
        'min-w-[180px] backdrop-blur-sm',
        'border-primary-500 bg-primary-500/10',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-950 scale-105',
        !isSelected && 'hover:scale-102 hover:shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-primary-400" />
        <span className="text-xs font-medium text-surface-300">Ingress</span>
        <span className="ml-auto w-2 h-2 rounded-full bg-success-500 animate-pulse" />
      </div>
      
      {/* Ingress name */}
      <p className="text-sm font-semibold text-surface-100">
        {ingress.name}
      </p>
      
      {/* Host */}
      <p className="text-xs text-primary-400 mt-1 font-mono">
        {ingress.host}
      </p>
      
      {/* Paths */}
      <div className="mt-2 space-y-1">
        {ingress.paths.map((path: IngressPath, i: number) => (
          <div
            key={i}
            className="text-xs px-2 py-1 rounded bg-surface-700/50 flex items-center gap-2"
          >
            <span className="text-surface-400">{path.path}</span>
            <span className="text-surface-500">→</span>
            <span className="text-accent-400">{path.port}</span>
          </div>
        ))}
      </div>
      
      {/* Output handle - connects to Services */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-500 !border-2 !border-surface-900"
      />
    </div>
  );
}

export const IngressNode = memo(IngressNodeComponent);
