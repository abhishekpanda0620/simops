import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface PodVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function PodVisuals({ scenario, state }: PodVisualsProps) {
  return (
    <>
      {/* Visual Pod Feedback (Create Scenario) */}
      {(scenario === 'create-pod' && ['node-assign', 'complete'].includes(state.phase)) && (
          <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-800 border-2 border-primary-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <div className="relative">
                      <div className="w-12 h-12 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                          <Box className="w-8 h-8 text-primary-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg animate-bounce">
                          NEW
                      </div>
                  </div>
                  <div>
                      <p className="font-semibold text-surface-100">nginx-pod-1</p>
                      <p className="text-xs text-primary-400 font-mono">Status: Running</p>
                      <p className="text-xs text-surface-400">Assigned to: worker-node-1</p>
                  </div>
              </div>
          </div>
      )}

      {/* Visual Pod Feedback (Get Pods Scenario) */}
      {scenario === 'get-pods' && (
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500",
                ['complete'].includes(state.phase) 
                  ? "bg-surface-800 border-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] scale-105" 
                  : "bg-surface-800/50 border-surface-700 opacity-70"
              )}>
                  <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                      <Box className="w-6 h-6 text-surface-400" />
                  </div>
                  <div>
                      <p className="font-semibold text-surface-100">pod-{i}</p>
                      <p className="text-xs text-surface-400">Running</p>
                  </div>
              </div>
            ))}
          </div>
      )}

      {/* Visual Pod Feedback (Delete Pod Scenario) */}
      {scenario === 'delete-pod' && (
          <div className="flex justify-center">
              <div className={cn(
                  "flex items-center gap-4 p-4 rounded-lg bg-surface-800 border-2 transition-all duration-1000",
                  ['controller', 'node-assign', 'etcd'].includes(state.phase) ? "border-warning-500/50 bg-warning-500/10" : "border-surface-600",
                  ['idle', 'api-server', 'kubectl'].includes(state.phase) ? "opacity-100 scale-100" : "", // Initial state
                  ['complete'].includes(state.phase) ? "opacity-0 scale-90 blur-sm" : "" // Deleted state
              )}>
                  <div className="relative">
                      <div className="w-12 h-12 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                          <Box className={cn(
                              "w-8 h-8 transition-colors duration-300",
                              ['controller', 'node-assign', 'etcd'].includes(state.phase) ? "text-warning-500" : "text-surface-200"
                          )} />
                      </div>
                      {['controller', 'node-assign', 'etcd'].includes(state.phase) && (
                          <div className="absolute -top-2 -right-2 bg-warning-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                              TERM
                          </div>
                      )}
                  </div>
                  <div>
                      <p className="font-semibold text-surface-100">nginx-pod-old</p>
                      <p className={cn(
                          "text-xs font-mono transition-colors",
                          ['controller', 'node-assign', 'etcd'].includes(state.phase) ? "text-warning-400" : "text-success-400"
                      )}>
                          Status: {['controller', 'node-assign', 'etcd'].includes(state.phase) ? 'Terminating' : 'Running'}
                      </p>
                      <p className="text-xs text-surface-400">Node: worker-node-2</p>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}
