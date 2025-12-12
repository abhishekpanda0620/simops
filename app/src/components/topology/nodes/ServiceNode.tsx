import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils';
import type { K8sService, ServicePort } from '@/types';
import { Network } from 'lucide-react';

interface ServiceNodeData {
  service: K8sService;
  isSelected: boolean;
  onSelect: (service: K8sService) => void;
}

interface ServiceNodeProps {
  data: ServiceNodeData;
}

function ServiceNodeComponent({ data }: ServiceNodeProps) {
  const { service, isSelected, onSelect } = data;

  const typeColors: Record<string, string> = {
    ClusterIP: 'border-accent-500 bg-accent-500/10',
    NodePort: 'border-warning-500 bg-warning-500/10',
    LoadBalancer: 'border-primary-500 bg-primary-500/10',
    ExternalName: 'border-surface-500 bg-surface-500/10',
  };

  return (
    <div
      onClick={() => onSelect(service)}
      className={cn(
        'px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
        'min-w-[160px] backdrop-blur-sm',
        typeColors[service.type] || typeColors.ClusterIP,
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-950 scale-105',
        !isSelected && 'hover:scale-102 hover:shadow-lg'
      )}
    >
      {/* Input handle - connects from Ingress */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-surface-900"
      />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-4 h-4 text-accent-400" />
        <span className="text-xs font-medium text-surface-300">Service</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-surface-700 text-surface-300">
          {service.type}
        </span>
      </div>
      
      {/* Service name */}
      <p className="text-sm font-semibold text-surface-100">
        {service.name}
      </p>
      
      {/* Cluster IP */}
      <p className="text-xs text-surface-400 mt-1 font-mono">
        {service.clusterIP}
      </p>
      
      {/* Ports */}
      <div className="mt-2 flex flex-wrap gap-1">
        {service.ports.map((port: ServicePort, i: number) => (
          <span
            key={i}
            className="text-xs px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-300"
          >
            {port.port}→{port.targetPort}
          </span>
        ))}
      </div>
      
      {/* Output handle - connects to Pods */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-500 !border-2 !border-surface-900"
      />
    </div>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);
