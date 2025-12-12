import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlanePhase, ControlPlaneScenario, ControlPlaneState } from './ControlPlaneUtils';

export interface ControlPlaneFlowControlsProps {
  isFlowing: boolean;
  scenario: ControlPlaneScenario;
  onScenarioChange: (scenario: ControlPlaneScenario) => void;
  onStart: () => void;
  onStop: () => void;
}

// Hook to manage control plane simulation
export function useControlPlaneSimulation() {
  const [state, setState] = useState<ControlPlaneState>({
    isFlowing: false,
    phase: 'idle',
    message: '',
    scenario: 'create-pod' // Default
  });

  // Track active timeouts
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopSimulation = useCallback(() => {
    // Clear all active timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      message: ''
    }));
  }, []);

  const setScenario = useCallback((scenario: ControlPlaneScenario) => {
    // Stop any running simulation before changing scenario
    if (state.isFlowing) {
      stopSimulation();
    }
    setState(prev => ({
      ...prev,
      scenario
    }));
  }, [state.isFlowing, stopSimulation]);

  const startSimulation = useCallback(() => {
    stopSimulation();
    
    // Slight delay to ensure clean state start
    const startTimeout = setTimeout(() => {
      const ids = runScenario(state.scenario, setState, stopSimulation);
      timeoutsRef.current = [...timeoutsRef.current, ...ids];
    }, 100);
    
    timeoutsRef.current.push(startTimeout);
  }, [state.scenario, stopSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    state,
    setScenario,
    startSimulation,
    stopSimulation
  };
}

function runScenario(
  scenario: ControlPlaneScenario, 
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stopSimulation: () => void
): ReturnType<typeof setTimeout>[] {
  // Common start
  setState(prev => ({ ...prev, isFlowing: true, phase: 'kubectl', message: getStartMessage(scenario) }));

  if (scenario === 'create-pod') {
    return runCreatePodScenario(setState, stopSimulation);
  } else if (scenario === 'get-pods') {
    return runGetPodsScenario(setState, stopSimulation);
  } else if (scenario === 'delete-pod') {
    return runDeletePodScenario(setState, stopSimulation);
  }
  return [];
}

function getStartMessage(scenario: ControlPlaneScenario) {
  switch (scenario) {
    case 'create-pod': return '$ kubectl create pod nginx';
    case 'get-pods': return '$ kubectl get pods';
    case 'delete-pod': return '$ kubectl delete pod nginx';
  }
}

// --- Scenarios ---

function runCreatePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server receives request
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating & Validating...' })), 2000));
  // 2. Write to etcd
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Pod configuration' })), 4000));
  // 3. Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Detected unbound pod, selecting node...' })), 6500));
  // 4. Node assignment
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (Node 1): Starting container...' })), 9000));
  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Running!' })), 12000));
  timeouts.push(setTimeout(stop, 14000));
  
  return timeouts;
}

function runGetPodsScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating...' })), 1500));
  // 2. etcd (Read)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Reading Pods list' })), 3000));
  // 3. API Server (Response)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Returning data' })), 5000));
  // 4. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'kubectl: Listed 3 pods' })), 7000));
  timeouts.push(setTimeout(stop, 9000));
  
  return timeouts;
}

function runDeletePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating delete request...' })), 2000));
  // 2. etcd (Mark deleted)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Marking Pod as deletionCandidate' })), 4000));
  // 3. Controller Manager (GC)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Recognizing deletion event...' })), 6500));
  // 4. Node (Kill)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Stopping container...' })), 9000));
  // 5. etcd (Remove)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Removing Pod data permanently' })), 11500));
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Deleted' })), 14000));
  timeouts.push(setTimeout(stop, 16000));
  
  return timeouts;
}


export function ControlPlaneFlowControls({
  isFlowing,
  scenario,
  onScenarioChange,
  onStart,
  onStop
}: ControlPlaneFlowControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-surface-800 p-2 rounded-lg border border-surface-700 shadow-lg z-50">
      
      {/* Scenario Selector */}
      <div className="relative group">
        <button 
          disabled={isFlowing}
          className="flex items-center gap-2 px-3 py-2 bg-surface-700 hover:bg-surface-600 disabled:opacity-50 disabled:cursor-not-allowed text-surface-200 rounded-md transition-colors text-sm font-medium min-w-[140px] justify-between"
        >
          <span>
            {scenario === 'create-pod' && 'Create Pod'}
            {scenario === 'get-pods' && 'Get Pods'}
            {scenario === 'delete-pod' && 'Delete Pod'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute top-full left-0 mt-1 w-full bg-surface-800 border border-surface-700 rounded-md shadow-xl overflow-hidden hidden group-hover:block z-50">
           {!isFlowing && (
             <>
               <button onClick={() => onScenarioChange('create-pod')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Create Pod</button>
               <button onClick={() => onScenarioChange('get-pods')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Get Pods</button>
               <button onClick={() => onScenarioChange('delete-pod')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Delete Pod</button>
             </>
           )}
        </div>
      </div>

      <div className="h-6 w-px bg-surface-700" />

      <div className="flex items-center gap-2">
        {!isFlowing ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-md transition-colors font-medium text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Simulate</span>
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
    </div>
  );
}

export function ControlPlaneStatus({ state }: { state: ControlPlaneState }) {
  if (!state.isFlowing && state.phase === 'idle') return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center gap-4 px-4 py-3 bg-surface-800 rounded-lg border border-surface-700 shadow-lg">
        <div className="flex gap-1.5 shrink-0">
          {/* Dynamic dots based on active components */}
          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", ['kubectl', 'complete'].includes(state.phase) ? "bg-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] scale-110" : "bg-surface-600")} />
          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", ['api-server'].includes(state.phase) ? "bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] scale-110" : "bg-surface-600")} />
          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", ['etcd'].includes(state.phase) ? "bg-warning-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] scale-110" : "bg-surface-600")} />
          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", ['scheduler', 'controller', 'node-assign'].includes(state.phase) ? "bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-110" : "bg-surface-600")} />
        </div>
        <div className="h-8 w-px bg-surface-700" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            {state.phase === 'complete' ? 'COMPLETED' : 'IN PROGRESS'}
          </span>
          <span className="text-sm font-mono text-surface-200 mt-0.5">
            {state.message}
          </span>
        </div>
      </div>
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
      return currentPhase === 'kubectl' || currentPhase === 'complete';
    case 'api-server':
      // API Server is central hub
      return ['api-server', 'etcd', 'scheduler', 'controller', 'node-assign'].includes(currentPhase);
    case 'etcd':
      return currentPhase === 'etcd';
    case 'scheduler':
      return currentPhase === 'scheduler';
    case 'controller':
      return currentPhase === 'controller';
    default:
      return false;
  }
}
