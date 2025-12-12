import { useState, useCallback } from 'react';
import { Play, Square } from 'lucide-react';
import { cn } from '@/utils';

export type ControlPlanePhase = 'idle' | 'kubectl' | 'api-server' | 'etcd' | 'scheduler' | 'node-assign' | 'complete';

export interface ControlPlaneState {
  isFlowing: boolean;
  phase: ControlPlanePhase;
  message: string;
}

export interface ControlPlaneFlowControlsProps {
  isFlowing: boolean;
  phase: ControlPlanePhase;
  message: string;
  onStart: () => void;
  onStop: () => void;
}

// Hook to manage control plane simulation
export function useControlPlaneSimulation() {
  const [state, setState] = useState<ControlPlaneState>({
    isFlowing: false,
    phase: 'idle',
    message: ''
  });

  const stopSimulation = useCallback(() => {
    setState({
      isFlowing: false,
      phase: 'idle',
      message: ''
    });
  }, []);

  const startSimulation = useCallback(() => {
    // Reset first
    stopSimulation();

    // Start simulation sequence
    // kubectl -> API Server -> etcd -> Scheduler -> Node -> Complete
    
    // 1. kubectl command
    setState({
      isFlowing: true,
      phase: 'kubectl',
      message: '$ kubectl create pod nginx'
    });

    // 2. API Server receives request
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        phase: 'api-server',
        message: 'API Server: Authenticating & Validating...' 
      }));
    }, 2000);

    // 3. Write to etcd
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        phase: 'etcd',
        message: 'etcd: Storing Pod configuration' 
      }));
    }, 4500);

    // 4. Scheduler watches new pod
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        phase: 'scheduler',
        message: 'Scheduler: Detected unbound pod, selecting node...' 
      }));
    }, 7000);

    // 5. Node assignment (API Server updates)
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        phase: 'node-assign',
        message: 'Kubelet (Node 1): Starting container...' 
      }));
    }, 10000);

    // 6. Complete
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        phase: 'complete',
        message: 'Pod Running!' 
      }));
    }, 13000);

    // Auto-stop
    setTimeout(() => {
      stopSimulation();
    }, 15000);

  }, [stopSimulation]);

  return {
    state,
    startSimulation,
    stopSimulation
  };
}

export function ControlPlaneFlowControls({
  isFlowing,
  phase,
  message,
  onStart,
  onStop
}: ControlPlaneFlowControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-surface-800 p-2 rounded-lg border border-surface-700 shadow-lg">
      <div className="flex items-center gap-2">
        {!isFlowing ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-md transition-colors font-medium text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Simulate 'kubectl create'</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-md transition-colors font-medium text-sm"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Phase Indicator */}
      {isFlowing && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-900/50 rounded-md border border-surface-700/50">
          <div className="flex gap-1">
            <div className={cn("w-2 h-2 rounded-full transition-colors", ['kubectl'].includes(phase) ? "bg-accent-500 animate-pulse" : "bg-surface-600")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", ['api-server'].includes(phase) ? "bg-primary-500 animate-pulse" : "bg-surface-600")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", ['etcd'].includes(phase) ? "bg-warning-500 animate-pulse" : "bg-surface-600")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", ['scheduler'].includes(phase) ? "bg-success-500 animate-pulse" : "bg-surface-600")} />
          </div>
          <span className="text-xs font-mono text-surface-200 min-w-[200px]">
            {message}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper to check highlight status
export function isControlPlaneActive(
  component: 'kubectl' | 'api-server' | 'etcd' | 'scheduler' | 'controller',
  currentPhase: ControlPlanePhase
): boolean {
  switch (component) {
    case 'kubectl':
      return currentPhase === 'kubectl';
    case 'api-server':
      // API Server is involved in almost all steps as the hub
      return ['api-server', 'etcd', 'scheduler', 'node-assign'].includes(currentPhase);
    case 'etcd':
      return currentPhase === 'etcd';
    case 'scheduler':
      return currentPhase === 'scheduler';
    case 'controller':
        return false; // Not used in this specific flow yet
    default:
      return false;
  }
}
