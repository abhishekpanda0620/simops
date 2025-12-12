import { cn } from '@/utils';
import { Route, Terminal } from 'lucide-react';

export type FlowMode = 'user-request' | 'control-plane';

interface FlowModeSelectorProps {
  mode: FlowMode;
  onModeChange: (mode: FlowMode) => void;
}

const modes = [
  {
    id: 'user-request' as FlowMode,
    label: 'User Request Flow',
    description: 'External → Ingress → Service → Pod',
    icon: Route,
  },
  {
    id: 'control-plane' as FlowMode,
    label: 'Control Plane Flow',
    description: 'kubectl → API Server → etcd/Controllers',
    icon: Terminal,
  },
];

export function FlowModeSelector({ mode, onModeChange }: FlowModeSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-surface-800/50 rounded-lg border border-surface-700">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
              "text-sm font-medium",
              isActive
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/50"
                : "text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Compact version for smaller spaces
export function FlowModeTabs({ mode, onModeChange }: FlowModeSelectorProps) {
  return (
    <div className="flex border-b border-surface-700">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              "border-b-2 -mb-px",
              isActive
                ? "border-primary-500 text-primary-300"
                : "border-transparent text-surface-400 hover:text-surface-200"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
