import { memo } from 'react';
import { cn } from '@/utils';
import type { ControlPlane, ControlPlaneComponent } from '@/types';
import { Server, Database, Cog, Calendar } from 'lucide-react';

interface ControlPlaneNodeProps {
  controlPlane: ControlPlane;
  selectedComponent: ControlPlaneComponent | null;
  onSelectComponent: (component: ControlPlaneComponent) => void;
}

const componentIcons = {
  'api-server': Server,
  'etcd': Database,
  'controller-manager': Cog,
  'scheduler': Calendar,
};

const componentColors = {
  healthy: 'border-success-500 bg-success-500/10',
  degraded: 'border-warning-500 bg-warning-500/10',
  unhealthy: 'border-error-500 bg-error-500/10',
};

function ControlPlaneNodeComponent({ controlPlane, selectedComponent, onSelectComponent }: ControlPlaneNodeProps) {
  const components = [
    controlPlane.apiServer,
    controlPlane.etcd,
    controlPlane.controllerManager,
    controlPlane.scheduler,
  ];

  return (
    <div className="p-4 rounded-xl border-2 border-primary-500/50 bg-primary-500/5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary-500/30">
        <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
        <span className="text-sm font-semibold text-primary-400">Control Plane</span>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-2 gap-3">
        {components.map((component) => {
          const Icon = componentIcons[component.id as keyof typeof componentIcons] || Server;
          const isSelected = selectedComponent?.id === component.id;

          return (
            <div
              key={component.id}
              onClick={() => onSelectComponent(component)}
              className={cn(
                'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                componentColors[component.status],
                isSelected && 'ring-2 ring-primary-400 ring-offset-2 ring-offset-surface-950 scale-105',
                !isSelected && 'hover:scale-102'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary-300" />
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    component.status === 'healthy' && 'bg-success-500',
                    component.status === 'degraded' && 'bg-warning-500 animate-pulse',
                    component.status === 'unhealthy' && 'bg-error-500'
                  )}
                />
              </div>
              <p className="text-xs font-medium text-surface-200 truncate">
                {component.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ControlPlaneNode = memo(ControlPlaneNodeComponent);
