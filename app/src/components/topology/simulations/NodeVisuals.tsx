import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface NodeVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function NodeVisuals({ scenario, state }: NodeVisualsProps) {
  return (
    <>
      {/* Visual Feedback (Node Failure Scenario) */}
      {scenario === 'node-failure' && (
          <div className="flex justify-center gap-8 items-start">
              {/* Node 1 (Healthy) */}
              <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface-800 border-2 border-success-500/30 w-48 transition-all duration-500">
                  <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-success-500" />
                        <span className="font-semibold text-surface-100">Node 1 (Ready)</span>
                  </div>
                  {/* Existing Pods */}
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 p-2 bg-surface-900 rounded border border-surface-700 opacity-50">
                          <Box className="w-4 h-4 text-surface-400" />
                          <span className="text-xs text-surface-400">pod-stable-1</span>
                      </div>
                        {/* Recovered Pods */}
                        {['node-assign', 'complete'].includes(state.phase) && (
                          <div className="flex items-center gap-2 p-2 bg-surface-900 rounded border border-success-500/50 animate-in fade-in slide-in-from-right-4 duration-700">
                              <Box className="w-4 h-4 text-success-400" />
                              <div>
                                  <p className="text-xs text-success-300 font-bold">pod-recovered-1</p>
                                  <p className="text-[10px] text-surface-400">Restarted by Kubelet</p>
                              </div>
                          </div>
                        )}
                  </div>
              </div>

              {/* Node 2 (Failing) */}
              <div className={cn(
                  "flex flex-col gap-2 p-4 rounded-lg bg-surface-800 border-2 w-48 transition-all duration-1000",
                  ['idle', 'kubectl'].includes(state.phase) ? "border-success-500/30" : "border-error-500 opacity-70"
              )}>
                  <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                            "w-3 h-3 rounded-full transition-colors duration-500",
                            ['idle', 'kubectl'].includes(state.phase) ? "bg-success-500" : "bg-error-500 animate-pulse"
                        )} />
                        <span className="font-semibold text-surface-100">Node 2</span>
                  </div>
                  {/* Pods on failing node - Only show until complete */}
                  {state.phase !== 'complete' && (
                      <div className="flex flex-col gap-2">
                          <div className={cn(
                              "flex items-center gap-2 p-2 bg-surface-900 rounded border border-surface-700 transition-all duration-1000",
                              !['idle', 'kubectl'].includes(state.phase) ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
                          )}>
                              <Box className="w-4 h-4 text-surface-400" />
                              <span className="text-xs text-surface-400">pod-target-1</span>
                          </div>
                          {!['idle', 'kubectl'].includes(state.phase) && (
                              <div className="text-[10px] text-error-400 text-center font-mono bg-error-500/10 rounded py-1">
                                  Node Lost
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Visual Feedback (Worker Node Flow) */}
      {scenario === 'worker-flow' && (
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all duration-500",
              ['kube-proxy', 'node-flow'].includes(state.phase) 
                ? "bg-accent-500/20 border-accent-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" 
                : "bg-surface-800 border-surface-700 opacity-50"
            )}>
              <h4 className="font-semibold text-accent-300 mb-2">kube-proxy</h4>
              <p className="text-xs text-surface-300 mb-2">
                Maintains network rules on nodes. Handles Service abstraction.
              </p>
              {['kube-proxy', 'node-flow'].includes(state.phase) && (
                <div className="text-xs font-mono text-accent-200 bg-accent-500/10 p-2 rounded">
                  $ iptables -t nat -A KUBE-SERVICES...
                </div>
              )}
            </div>
            
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all duration-500",
              ['kubelet'].includes(state.phase) 
                ? "bg-primary-500/20 border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" 
                : "bg-surface-800 border-surface-700 opacity-50"
            )}>
              <h4 className="font-semibold text-primary-300 mb-2">kubelet</h4>
              <p className="text-xs text-surface-300 mb-2">
                Primary "node agent". Syncs PodSpecs with container runtime.
              </p>
              {['kubelet'].includes(state.phase) && (
                <div className="text-xs font-mono text-primary-200 bg-primary-500/10 p-2 rounded">
                  SyncLoop: Pod status update → Running
                </div>
              )}
            </div>
          </div>
      )}
    </>
  );
}
