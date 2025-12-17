import { Box, ArrowDown } from 'lucide-react';
import { cn } from '@/utils';
import type { ClusterSnapshot } from '@/types';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface WorkloadVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
  cluster: ClusterSnapshot;
}

export function WorkloadVisuals({ scenario, state, cluster }: WorkloadVisualsProps) {
  return (
    <>
      {/* Visual Pod Feedback (Scale Deployment Scenario) */}
      {scenario === 'scale-deployment' && (
          <div className="flex justify-center gap-4 flex-wrap max-w-2xl mx-auto">
              {/* Existing Pods */}
              {[1, 2, 3].map((i) => (
                  <div key={`existing-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 border-2 border-surface-700 opacity-50">
                      <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                          <Box className="w-6 h-6 text-surface-400" />
                      </div>
                      <div>
                          <p className="font-semibold text-surface-100">pod-{i}</p>
                          <p className="text-xs text-surface-400">Running</p>
                      </div>
                  </div>
              ))}
              
              {/* New Pods (appear during scheduler phase) */}
              {['scheduler', 'node-assign', 'complete'].includes(state.phase) && [4, 5].map((i) => (
                    <div key={`new-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 border-2 border-primary-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in duration-500">
                      <div className="relative">
                          <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                              <Box className="w-6 h-6 text-primary-400" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg animate-bounce">
                              NEW
                          </div>
                      </div>
                      <div>
                          <p className="font-semibold text-surface-100">pod-{i}</p>
                          <p className="text-xs text-primary-400">
                              {['complete'].includes(state.phase) ? 'Running' : 'Creating...'}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Visual Feedback (StatefulSet Scenario) */}
      {scenario === 'deploy-statefulset' && (
          <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-surface-400">
                  {cluster.pods.filter(p => p.labels['app'] === 'web').length === 0 
                      ? 'Waiting for StatefulSet...' 
                      : `Deployed ${cluster.pods.filter(p => p.labels['app'] === 'web').length} Pods (Ordered)`}
                </p>
                <div className="flex gap-4">
                  {cluster.pods.filter(p => p.labels['app'] === 'web').sort((a,b) => a.name.localeCompare(b.name)).map(pod => (
                      <div key={pod.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 border-2 border-primary-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-in slide-in-from-left duration-700">
                          <div className="relative">
                              <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                                  <Box className="w-6 h-6 text-primary-400" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                                  {pod.name.split('-')[1]}
                              </div>
                          </div>
                          <div>
                              <p className="font-semibold text-surface-100">{pod.name}</p>
                              <p className="text-xs text-primary-400">{pod.nodeName}</p>
                          </div>
                      </div>
                  ))}
                </div>
                {cluster.pvcs && cluster.pvcs.length > 0 && (
                    <div className="flex gap-4 mt-2">
                        {cluster.pvcs.filter(p => p.namespace === 'default').map(pvc => (
                            <div key={pvc.id} className="px-2 py-1 bg-surface-800 rounded border border-surface-600 text-[10px] text-surface-300">
                                💾 {pvc.name}
                            </div>
                        ))}
                    </div>
                )}
          </div>
      )}

      {/* Visual Feedback (DaemonSet Scenario) */}
      {scenario === 'deploy-daemonset' && (
          <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Show all worker nodes, and any DS pods on them */}
                  {cluster.nodes.filter(n => n.role === 'worker').map(node => {
                      const dsPod = cluster.pods.find(p => p.nodeId === node.id && p.labels['app'] === 'monitoring');
                      
                      return (
                          <div key={node.id} className="p-4 rounded-lg bg-surface-800 border border-surface-700 flex flex-col items-center gap-2 w-32">
                              <span className="text-xs font-semibold text-surface-300">{node.name}</span>
                              
                              {dsPod ? (
                                  <div className="flex items-center gap-2 p-2 bg-surface-900 rounded border border-primary-500/50 animate-in zoom-in duration-500">
                                      <Box className="w-4 h-4 text-primary-400" />
                                      <span className="text-xs text-primary-200">agent</span>
                                  </div>
                              ) : (
                                  <div className="w-full h-8 bg-surface-900/50 rounded border border-dashed border-surface-700 flex items-center justify-center">
                                      <span className="text-[10px] text-surface-500">Waiting...</span>
                                  </div>
                              )}
                          </div>
                      );
                  })}
                </div>
          </div>
      )}

      {/* Visual Feedback (Run Job Scenario) */}
      {scenario === 'run-job' && (
          <div className="flex flex-col items-center gap-4">
              {/* Job Resource */}
              <div className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-500 flex items-center gap-3",
                  ['controller', 'scheduler', 'node-assign', 'node-flow', 'complete'].includes(state.phase)
                     ? "bg-surface-800 border-primary-500 opacity-100"
                     : "bg-surface-800 border-surface-700 opacity-30"
              )}>
                  <div className="p-2 bg-surface-900 rounded">
                      <span className="text-xl">📜</span>
                  </div>
                  <div>
                      <p className="font-semibold text-surface-100">Job: batch-processor</p>
                      <p className={cn(
                          "text-xs font-mono",
                          state.phase === 'complete' ? "text-success-400" : "text-primary-400"
                      )}>
                          Status: {state.phase === 'complete' ? 'Complete' : 'Running'}
                      </p>
                  </div>
              </div>

              {/* Arrow */}
              {['scheduler', 'node-assign', 'node-flow', 'complete'].includes(state.phase) && (
                  <ArrowDown className="w-5 h-5 text-surface-400" />
              )}

              {/* Job Pod */}
              {['node-assign', 'node-flow', 'complete'].includes(state.phase) && (
                   <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 bg-surface-800 transition-all duration-500",
                      state.phase === 'complete' ? "border-success-500" : "border-primary-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  )}>
                      <div className="relative">
                          <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                              <Box className={cn(
                                  "w-6 h-6 transition-colors",
                                  state.phase === 'complete' ? "text-success-400" : "text-primary-400"
                              )} />
                          </div>
                      </div>
                      <div>
                          <p className="font-semibold text-surface-100">batch-processor-pod</p>
                          <p className={cn(
                              "text-xs",
                              state.phase === 'complete' ? "text-success-400" : "text-primary-400"
                          )}>
                              {state.phase === 'complete' ? 'Succeeded' : 'Processing...'}
                          </p>
                      </div>
                  </div>
              )}
          </div>
      )}
    </>
  );
}
