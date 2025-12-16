import { ArrowDown, AlertCircle, Globe, Box } from 'lucide-react';
import { cn } from '@/utils';
import { ControlPlaneFlowControls, ControlPlaneStatus } from './ControlPlaneFlow';
import { isControlPlaneActive } from './ControlPlaneUtils';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from './SelectionTypes';
import type { ControlPlaneState, ControlPlaneScenario } from './ControlPlaneUtils'; // Assuming exported from here or check where it is
// Check ControlPlaneUtils exports: It exports ControlPlaneScenario and ControlPlaneState (per step 20)

interface ControlPlaneViewProps {
  cluster: ClusterSnapshot;
  controlPlaneState: ControlPlaneState;
  controlPlaneScenario: ControlPlaneScenario;
  onScenarioChange: (scenario: ControlPlaneScenario) => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onSelect: (item: SelectedItem) => void;
}

export function ControlPlaneView({
  cluster,
  controlPlaneState,
  controlPlaneScenario,
  onScenarioChange,
  onStartSimulation,
  onStopSimulation,
  onSelect
}: ControlPlaneViewProps) {
  
  // Helper for checking active state
  // We can use isControlPlaneActive directly in JSX

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Control Plane Flow Controls */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <ControlPlaneFlowControls
          isFlowing={controlPlaneState.isFlowing}
          scenario={controlPlaneScenario}
          onScenarioChange={onScenarioChange}
          onStart={onStartSimulation}
          onStop={onStopSimulation}
        />
        <ControlPlaneStatus state={controlPlaneState} />
      </div>

      {/* kubectl Entry Point / Event Display */}
      <div className="flex flex-col items-center">
        {['node-failure', 'worker-flow'].includes(controlPlaneScenario) ? (
            <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
            !['idle', 'kubectl'].includes(controlPlaneState.phase)
              ? controlPlaneScenario === 'node-failure' 
                  ? "bg-error-500/10 border-error-500/50 shadow-lg shadow-error-500/20"
                  : "bg-surface-800 border-accent-500/50 shadow-lg shadow-accent-500/20"
              : "bg-surface-800 border-surface-600"
          )}>
            <AlertCircle className={cn("w-4 h-4", controlPlaneScenario === 'node-failure' ? "text-error-500" : "text-accent-400")} />
            <span className="text-sm font-medium text-surface-200">
              {controlPlaneScenario === 'node-failure' && '# Simulating Power Failure...'}
              {controlPlaneScenario === 'worker-flow' && '# Simulating Kube-Proxy & Kubelet Flow...'}
            </span>
          </div>
        ) : (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
            isControlPlaneActive('kubectl', controlPlaneState.phase)
              ? "bg-accent-500/20 border-accent-500/50 shadow-lg shadow-accent-500/20 scale-105"
              : "bg-surface-800 border-surface-600"
          )}>
            <span className="text-accent-400 font-mono text-sm">$</span>
            <span className="text-sm font-medium text-surface-200">
              {controlPlaneScenario === 'create-pod' && 'kubectl create pod nginx'}
              {controlPlaneScenario === 'get-pods' && 'kubectl get pods'}
              {controlPlaneScenario === 'delete-pod' && 'kubectl delete pod nginx'}
              {controlPlaneScenario === 'scale-deployment' && 'kubectl scale deploy nginx --replicas=5'}
              {controlPlaneScenario === 'deploy-statefulset' && 'kubectl apply -f statefulset.yaml'}
              {controlPlaneScenario === 'deploy-daemonset' && 'kubectl apply -f daemonset.yaml'}
              {controlPlaneScenario === 'run-job' && 'kubectl apply -f job.yaml'}
            </span>
          </div>
        )}
        <ArrowDown className="w-5 h-5 my-2 text-accent-500/50" />
      </div>

      {/* API Server */}
      <div className="flex flex-col items-center">
        <div 
          onClick={() => onSelect({ type: 'controlPlane', data: cluster.controlPlane.apiServer })}
          className={cn(
            "px-6 py-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
            isControlPlaneActive('api-server', controlPlaneState.phase)
              ? "border-primary-500 bg-primary-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105"
              : "border-primary-500 bg-primary-500/10 hover:bg-primary-500/20"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Globe className={cn("w-5 h-5 transition-colors", isControlPlaneActive('api-server', controlPlaneState.phase) ? "text-primary-300" : "text-primary-400")} />
            </div>
            <div>
              <p className="font-semibold text-surface-100">API Server</p>
              <p className="text-xs text-surface-400">Authentication → Authorization → Validation</p>
            </div>
          </div>
        </div>
        <ArrowDown className={cn(
          "w-5 h-5 my-2 transition-colors duration-300",
          isControlPlaneActive('api-server', controlPlaneState.phase) ? "text-primary-400 animate-bounce" : "text-primary-500/50"
        )} />
      </div>

      {/* Control Plane Components */}
      <div className="grid grid-cols-3 gap-4">
        {/* etcd */}
        {/* etcd */}
        <div 
          onClick={() => onSelect({ type: 'controlPlane', data: cluster.controlPlane.etcd })}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer relative hover:z-50",
            isControlPlaneActive('etcd', controlPlaneState.phase)
              ? "border-accent-500 bg-accent-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105 z-40"
              : "border-accent-500 bg-accent-500/10 hover:bg-accent-500/20"
          )}
        >
          <div className="text-center">
            <p className="font-semibold text-surface-100">etcd</p>
            <p className="text-xs text-surface-400 mt-1">Cluster state store</p>
            <p className="text-xs text-accent-400 mt-2">Read/Write data</p>
          </div>
        </div>

        {/* Controller Manager */}
        <div 
          onClick={() => onSelect({ type: 'controlPlane', data: cluster.controlPlane.controllerManager })}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer relative hover:z-50",
            isControlPlaneActive('controller', controlPlaneState.phase)
              ? "border-warning-500 bg-warning-500/20 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105 z-40"
              : "border-warning-500 bg-warning-500/10 hover:bg-warning-500/20"
          )}
        >
          <div className="text-center">
            <p className="font-semibold text-surface-100">Controller Manager</p>
            <p className="text-xs text-surface-400 mt-1">Reconciliation loops</p>
            <p className="text-xs text-warning-400 mt-2">Desired → Actual state</p>
          </div>
        </div>

        {/* Scheduler */}
        <div 
          onClick={() => onSelect({ type: 'controlPlane', data: cluster.controlPlane.scheduler })}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer relative hover:z-50",
            isControlPlaneActive('scheduler', controlPlaneState.phase)
              ? "border-success-500 bg-success-500/20 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105 z-40"
              : "border-success-500 bg-success-500/10 hover:bg-success-500/20"
          )}
        >
          <div className="text-center">
            <p className="font-semibold text-surface-100">Scheduler</p>
            <p className="text-xs text-surface-400 mt-1">Pod placement</p>
            <p className="text-xs text-success-400 mt-2">Node selection</p>
          </div>
        </div>
      </div>

      {/* Visual Pod Feedback (Create Scenario) */}
      {(controlPlaneScenario === 'create-pod' && ['node-assign', 'complete'].includes(controlPlaneState.phase)) && (
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
      {controlPlaneScenario === 'get-pods' && (
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500",
                ['complete'].includes(controlPlaneState.phase) 
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
      {controlPlaneScenario === 'delete-pod' && (
          <div className="flex justify-center">
              <div className={cn(
                  "flex items-center gap-4 p-4 rounded-lg bg-surface-800 border-2 transition-all duration-1000",
                  ['controller', 'node-assign', 'etcd'].includes(controlPlaneState.phase) ? "border-warning-500/50 bg-warning-500/10" : "border-surface-600",
                  ['idle', 'api-server', 'kubectl'].includes(controlPlaneState.phase) ? "opacity-100 scale-100" : "", // Initial state
                  ['complete'].includes(controlPlaneState.phase) ? "opacity-0 scale-90 blur-sm" : "" // Deleted state
              )}>
                  <div className="relative">
                      <div className="w-12 h-12 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                          <Box className={cn(
                              "w-8 h-8 transition-colors duration-300",
                              ['controller', 'node-assign', 'etcd'].includes(controlPlaneState.phase) ? "text-warning-500" : "text-surface-200"
                          )} />
                      </div>
                      {['controller', 'node-assign', 'etcd'].includes(controlPlaneState.phase) && (
                          <div className="absolute -top-2 -right-2 bg-warning-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                              TERM
                          </div>
                      )}
                  </div>
                  <div>
                      <p className="font-semibold text-surface-100">nginx-pod-old</p>
                      <p className={cn(
                          "text-xs font-mono transition-colors",
                          ['controller', 'node-assign', 'etcd'].includes(controlPlaneState.phase) ? "text-warning-400" : "text-success-400"
                      )}>
                          Status: {['controller', 'node-assign', 'etcd'].includes(controlPlaneState.phase) ? 'Terminating' : 'Running'}
                      </p>
                      <p className="text-xs text-surface-400">Node: worker-node-2</p>
                  </div>
              </div>
          </div>
      )}

      {/* Visual Pod Feedback (Scale Deployment Scenario) */}
      {controlPlaneScenario === 'scale-deployment' && (
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
              {['scheduler', 'node-assign', 'complete'].includes(controlPlaneState.phase) && [4, 5].map((i) => (
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
                              {['complete'].includes(controlPlaneState.phase) ? 'Running' : 'Creating...'}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Visual Feedback (StatefulSet Scenario) */}
      {controlPlaneScenario === 'deploy-statefulset' && (
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
      {controlPlaneScenario === 'deploy-daemonset' && (
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

      {/* Visual Feedback (Node Failure Scenario) */}
      {controlPlaneScenario === 'node-failure' && (
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
                        {['node-assign', 'complete'].includes(controlPlaneState.phase) && (
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
                  ['idle', 'kubectl'].includes(controlPlaneState.phase) ? "border-success-500/30" : "border-error-500 opacity-70"
              )}>
                  <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                            "w-3 h-3 rounded-full transition-colors duration-500",
                            ['idle', 'kubectl'].includes(controlPlaneState.phase) ? "bg-success-500" : "bg-error-500 animate-pulse"
                        )} />
                        <span className="font-semibold text-surface-100">Node 2</span>
                  </div>
                  {/* Pods on failing node - Only show until complete */}
                  {controlPlaneState.phase !== 'complete' && (
                      <div className="flex flex-col gap-2">
                          <div className={cn(
                              "flex items-center gap-2 p-2 bg-surface-900 rounded border border-surface-700 transition-all duration-1000",
                              !['idle', 'kubectl'].includes(controlPlaneState.phase) ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
                          )}>
                              <Box className="w-4 h-4 text-surface-400" />
                              <span className="text-xs text-surface-400">pod-target-1</span>
                          </div>
                          {!['idle', 'kubectl'].includes(controlPlaneState.phase) && (
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
      {controlPlaneScenario === 'worker-flow' && (
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all duration-500",
              ['kube-proxy', 'node-flow'].includes(controlPlaneState.phase) 
                ? "bg-accent-500/20 border-accent-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" 
                : "bg-surface-800 border-surface-700 opacity-50"
            )}>
              <h4 className="font-semibold text-accent-300 mb-2">kube-proxy</h4>
              <p className="text-xs text-surface-300 mb-2">
                Maintains network rules on nodes. Handles Service abstraction.
              </p>
              {['kube-proxy', 'node-flow'].includes(controlPlaneState.phase) && (
                <div className="text-xs font-mono text-accent-200 bg-accent-500/10 p-2 rounded">
                  $ iptables -t nat -A KUBE-SERVICES...
                </div>
              )}
            </div>
            
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all duration-500",
              ['kubelet'].includes(controlPlaneState.phase) 
                ? "bg-primary-500/20 border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" 
                : "bg-surface-800 border-surface-700 opacity-50"
            )}>
              <h4 className="font-semibold text-primary-300 mb-2">kubelet</h4>
              <p className="text-xs text-surface-300 mb-2">
                Primary "node agent". Syncs PodSpecs with container runtime.
              </p>
              {['kubelet'].includes(controlPlaneState.phase) && (
                <div className="text-xs font-mono text-primary-200 bg-primary-500/10 p-2 rounded">
                  SyncLoop: Pod status update → Running
                </div>
              )}
            </div>
          </div>
      )}

      {/* Visual Feedback (Run Job Scenario) */}
      {controlPlaneScenario === 'run-job' && (
          <div className="flex flex-col items-center gap-4">
              {/* Job Resource */}
              <div className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-500 flex items-center gap-3",
                  ['controller', 'scheduler', 'node-assign', 'node-flow', 'complete'].includes(controlPlaneState.phase)
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
                          controlPlaneState.phase === 'complete' ? "text-success-400" : "text-primary-400"
                      )}>
                          Status: {controlPlaneState.phase === 'complete' ? 'Complete' : 'Running'}
                      </p>
                  </div>
              </div>

              {/* Arrow */}
              {['scheduler', 'node-assign', 'node-flow', 'complete'].includes(controlPlaneState.phase) && (
                  <ArrowDown className="w-5 h-5 text-surface-400" />
              )}

              {/* Job Pod */}
              {['node-assign', 'node-flow', 'complete'].includes(controlPlaneState.phase) && (
                   <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 bg-surface-800 transition-all duration-500",
                      controlPlaneState.phase === 'complete' ? "border-success-500" : "border-primary-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  )}>
                      <div className="relative">
                          <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                              <Box className={cn(
                                  "w-6 h-6 transition-colors",
                                  controlPlaneState.phase === 'complete' ? "text-success-400" : "text-primary-400"
                              )} />
                          </div>
                      </div>
                      <div>
                          <p className="font-semibold text-surface-100">batch-processor-pod</p>
                          <p className={cn(
                              "text-xs",
                              controlPlaneState.phase === 'complete' ? "text-success-400" : "text-primary-400"
                          )}>
                              {controlPlaneState.phase === 'complete' ? 'Succeeded' : 'Processing...'}
                          </p>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Explanation */}
      <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700 mt-8">
        <p className="text-sm text-surface-300">
          <span className="text-primary-400 font-medium">Control Plane Flow:</span>{' '}
          Every kubectl command goes through the API Server. The API Server authenticates, authorizes, 
          and validates requests, then interacts with etcd for storage. Controllers watch for changes 
          and reconcile actual state with desired state.
        </p>
      </div>
    </div>
  );
}
