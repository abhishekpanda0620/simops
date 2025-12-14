import { Play, Square, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import { type ControlPlaneScenario, type ControlPlaneState } from './ControlPlaneUtils';

export interface ControlPlaneFlowControlsProps {
  isFlowing: boolean;
  scenario: ControlPlaneScenario;
  onScenarioChange: (scenario: ControlPlaneScenario) => void;
  onStart: () => void;
  onStop: () => void;
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
            {scenario === 'scale-deployment' && 'Scale Deployment'}
            {scenario === 'node-failure' && 'Node Failure (Recovery)'}
            {scenario === 'worker-flow' && 'Worker Node Flow'}
            {scenario === 'deploy-statefulset' && 'Deploy StatefulSet'}
            {scenario === 'deploy-daemonset' && 'Deploy DaemonSet'}
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
               <button onClick={() => onScenarioChange('scale-deployment')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Scale Deployment</button>
               <button onClick={() => onScenarioChange('node-failure')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Node Failure (Recovery)</button>
               <button onClick={() => onScenarioChange('worker-flow')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Worker Node Flow</button>
               <button onClick={() => onScenarioChange('deploy-statefulset')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Deploy StatefulSet</button>
               <button onClick={() => onScenarioChange('deploy-daemonset')} className="w-full text-left px-3 py-2 hover:bg-surface-700 text-sm text-surface-200">Deploy DaemonSet</button>
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

