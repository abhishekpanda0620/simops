import { useMemo, useState, useEffect } from 'react';
import { ControlPlaneNode, WorkerNode } from './nodes';
import { EnhancedInfoPanel } from './EnhancedInfoPanel';
import { useTrafficSimulation, isInTrafficPath, TrafficFlowControls, RoutingStatus } from './TrafficFlow';
import { ControlPlaneFlowControls, ControlPlaneStatus } from './ControlPlaneFlow';
import { useControlPlaneSimulation } from './useControlPlaneSimulation';
import { isControlPlaneActive } from './ControlPlaneUtils';
import { FlowModeSelector, type FlowMode } from './FlowModeSelector';
import { ScenarioSelector, ScenarioDescription } from './ScenarioSelector';
import type { ClusterSnapshot, K8sPod, K8sService, K8sIngress, ControlPlaneComponent, K8sNode } from '@/types';
import type { ScenarioId } from '@/data';
import { Globe, Network, ArrowDown, AlertCircle, Info, Box } from 'lucide-react';
import { cn } from '@/utils';

interface ArchitectureViewProps {
  cluster: ClusterSnapshot;
  currentScenarioId: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
  onKillPod: (podId: string) => void;
}

type SelectedItem =
  | { type: 'controlPlane'; data: ControlPlaneComponent }
  | { type: 'node'; data: K8sNode }
  | { type: 'pod'; data: K8sPod }
  | { type: 'service'; data: K8sService }
  | { type: 'ingress'; data: K8sIngress }
  | { type: 'info'; data: { id: 'controlPlaneIntro' | 'workerNodesIntro' } }
  | null;

export function ArchitectureView({ cluster, currentScenarioId, onSelectScenario, onKillPod }: ArchitectureViewProps) {
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [flowMode, setFlowMode] = useState<FlowMode>('user-request');

  // Traffic simulation
  const traffic = useTrafficSimulation(
    cluster.ingresses,
    cluster.services,
    cluster.pods
  );

  // Control Plane simulation
  const controlPlane = useControlPlaneSimulation();

  // Reset selection when switching modes
  useEffect(() => {
    // eslint-disable-next-line
    setSelected(null);
  }, [flowMode]);

  // Get pods for each node
  const podsByNode = useMemo(() => {
    const map: Record<string, K8sPod[]> = {};
    cluster.pods.forEach((pod) => {
      if (!map[pod.nodeId]) map[pod.nodeId] = [];
      map[pod.nodeId].push(pod);
    });
    return map;
  }, [cluster.pods]);

  // Worker nodes only
  const workerNodes = cluster.nodes.filter((n) => n.role === 'worker');

  return (
    <div className="flex h-full">
      {/* Main Architecture Canvas */}
      <div className="flex-1 overflow-auto p-6 bg-surface-950 relative">
        {/* Traffic Flow Animation - visual packets */}
        {traffic.state.isFlowing && (
          <>
            {/* Request packet - moves DOWN based on phase */}
            {['ingress', 'service', 'pod'].includes(traffic.state.phase) && (
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-700 ease-in-out",
                traffic.state.phase === 'ingress' && "top-[38%]",
                traffic.state.phase === 'service' && "top-[58%]",
                traffic.state.phase === 'pod' && "top-[78%]"
              )}>
                <div className="px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-lg bg-success-500 text-white border border-success-400 flex items-center gap-2">
                  <span>📤</span>
                  <span>GET {traffic.state.endpoint}</span>
                  <span className="animate-bounce">▼</span>
                </div>
              </div>
            )}
            {/* Response packet - moves UP based on phase */}
            {traffic.state.phase === 'response' && (
              <div className="absolute left-1/2 translate-x-12 z-30 pointer-events-none top-[78%] animate-[moveUp_3s_ease-in-out_forwards]">
                <div className="px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-lg bg-accent-500 text-white border border-accent-400 flex items-center gap-2">
                  <span className="animate-bounce">▲</span>
                  <span>200 OK</span>
                  <span>📥</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Flow Mode Selector */}
        <div className="mb-4">
          <FlowModeSelector mode={flowMode} onModeChange={setFlowMode} />
        </div>
        

        
        {/* Control Plane Flow View */}
        {flowMode === 'control-plane' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Control Plane Flow Controls */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <ControlPlaneFlowControls
                isFlowing={controlPlane.state.isFlowing}
                scenario={controlPlane.state.scenario}
                onScenarioChange={controlPlane.setScenario}
                onStart={controlPlane.startSimulation}
                onStop={controlPlane.stopSimulation}
              />
              <ControlPlaneStatus state={controlPlane.state} />
            </div>

            {/* kubectl Entry Point / Event Display */}
            <div className="flex flex-col items-center">
              {['node-failure', 'worker-flow'].includes(controlPlane.state.scenario) ? (
                 <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
                  !['idle', 'kubectl'].includes(controlPlane.state.phase)
                    ? controlPlane.state.scenario === 'node-failure' 
                        ? "bg-error-500/10 border-error-500/50 shadow-lg shadow-error-500/20"
                        : "bg-surface-800 border-accent-500/50 shadow-lg shadow-accent-500/20"
                    : "bg-surface-800 border-surface-600"
                )}>
                  <AlertCircle className={cn("w-4 h-4", controlPlane.state.scenario === 'node-failure' ? "text-error-500" : "text-accent-400")} />
                  <span className="text-sm font-medium text-surface-200">
                    {controlPlane.state.scenario === 'node-failure' && '# Simulating Power Failure...'}
                    {controlPlane.state.scenario === 'worker-flow' && '# Simulating Kube-Proxy & Kubelet Flow...'}
                  </span>
                </div>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300",
                  isControlPlaneActive('kubectl', controlPlane.state.phase)
                    ? "bg-accent-500/20 border-accent-500/50 shadow-lg shadow-accent-500/20 scale-105"
                    : "bg-surface-800 border-surface-600"
                )}>
                  <span className="text-accent-400 font-mono text-sm">$</span>
                  <span className="text-sm font-medium text-surface-200">
                    {controlPlane.state.scenario === 'create-pod' && 'kubectl create pod nginx'}
                    {controlPlane.state.scenario === 'get-pods' && 'kubectl get pods'}
                    {controlPlane.state.scenario === 'delete-pod' && 'kubectl delete pod nginx'}
                    {controlPlane.state.scenario === 'scale-deployment' && 'kubectl scale deploy nginx --replicas=5'}
                  </span>
                </div>
              )}
              <ArrowDown className="w-5 h-5 my-2 text-accent-500/50" />
            </div>

            {/* API Server */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setSelected({ type: 'controlPlane', data: cluster.controlPlane.apiServer })}
                className={cn(
                  "px-6 py-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                  isControlPlaneActive('api-server', controlPlane.state.phase)
                    ? "border-primary-500 bg-primary-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105"
                    : "border-primary-500 bg-primary-500/10 hover:bg-primary-500/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Globe className={cn("w-5 h-5 transition-colors", isControlPlaneActive('api-server', controlPlane.state.phase) ? "text-primary-300" : "text-primary-400")} />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-100">API Server</p>
                    <p className="text-xs text-surface-400">Authentication → Authorization → Validation</p>
                  </div>
                </div>
              </div>
              <ArrowDown className={cn(
                "w-5 h-5 my-2 transition-colors duration-300",
                isControlPlaneActive('api-server', controlPlane.state.phase) ? "text-primary-400 animate-bounce" : "text-primary-500/50"
              )} />
            </div>

            {/* Control Plane Components */}
            <div className="grid grid-cols-3 gap-4">
              {/* etcd */}
              <div 
                onClick={() => setSelected({ type: 'controlPlane', data: cluster.controlPlane.etcd })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                  isControlPlaneActive('etcd', controlPlane.state.phase)
                    ? "border-accent-500 bg-accent-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105"
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
                onClick={() => setSelected({ type: 'controlPlane', data: cluster.controlPlane.controllerManager })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                  isControlPlaneActive('controller', controlPlane.state.phase)
                    ? "border-warning-500 bg-warning-500/20 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105"
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
                onClick={() => setSelected({ type: 'controlPlane', data: cluster.controlPlane.scheduler })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                  isControlPlaneActive('scheduler', controlPlane.state.phase)
                    ? "border-success-500 bg-success-500/20 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105"
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
            {/* Visual Pod Feedback (Create Scenario) */}
            {(controlPlane.state.scenario === 'create-pod' && ['node-assign', 'complete'].includes(controlPlane.state.phase)) && (
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
            {controlPlane.state.scenario === 'get-pods' && (
               <div className="flex justify-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500",
                      ['complete'].includes(controlPlane.state.phase) 
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
            {controlPlane.state.scenario === 'delete-pod' && (
                <div className="flex justify-center">
                    <div className={cn(
                        "flex items-center gap-4 p-4 rounded-lg bg-surface-800 border-2 transition-all duration-1000",
                        ['controller', 'node-assign', 'etcd'].includes(controlPlane.state.phase) ? "border-warning-500/50 bg-warning-500/10" : "border-surface-600",
                        ['idle', 'api-server', 'kubectl'].includes(controlPlane.state.phase) ? "opacity-100 scale-100" : "", // Initial state
                        ['complete'].includes(controlPlane.state.phase) ? "opacity-0 scale-90 blur-sm" : "" // Deleted state
                    )}>
                        <div className="relative">
                            <div className="w-12 h-12 bg-surface-900 rounded-lg flex items-center justify-center border border-surface-700">
                                <Box className={cn(
                                    "w-8 h-8 transition-colors duration-300",
                                    ['controller', 'node-assign', 'etcd'].includes(controlPlane.state.phase) ? "text-warning-500" : "text-surface-200"
                                )} />
                            </div>
                            {['controller', 'node-assign', 'etcd'].includes(controlPlane.state.phase) && (
                                <div className="absolute -top-2 -right-2 bg-warning-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                                    TERM
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-surface-100">nginx-pod-old</p>
                            <p className={cn(
                                "text-xs font-mono transition-colors",
                                ['controller', 'node-assign', 'etcd'].includes(controlPlane.state.phase) ? "text-warning-400" : "text-success-400"
                            )}>
                                Status: {['controller', 'node-assign', 'etcd'].includes(controlPlane.state.phase) ? 'Terminating' : 'Running'}
                            </p>
                            <p className="text-xs text-surface-400">Node: worker-node-2</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Pod Feedback (Scale Deployment Scenario) */}
            {controlPlane.state.scenario === 'scale-deployment' && (
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
                    {['scheduler', 'node-assign', 'complete'].includes(controlPlane.state.phase) && [4, 5].map((i) => (
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
                                    {['complete'].includes(controlPlane.state.phase) ? 'Running' : 'Creating...'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Visual Feedback (Node Failure Scenario) */}
            {controlPlane.state.scenario === 'node-failure' && (
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
                             {['node-assign', 'complete'].includes(controlPlane.state.phase) && (
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
                        ['idle', 'kubectl'].includes(controlPlane.state.phase) ? "border-success-500/30" : "border-error-500 opacity-70"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                             <div className={cn(
                                 "w-3 h-3 rounded-full transition-colors duration-500",
                                 ['idle', 'kubectl'].includes(controlPlane.state.phase) ? "bg-success-500" : "bg-error-500 animate-pulse"
                             )} />
                             <span className="font-semibold text-surface-100">Node 2</span>
                        </div>
                        {/* Pods on failing node - Only show until complete */}
                        {controlPlane.state.phase !== 'complete' && (
                            <div className="flex flex-col gap-2">
                                <div className={cn(
                                    "flex items-center gap-2 p-2 bg-surface-900 rounded border border-surface-700 transition-all duration-1000",
                                    !['idle', 'kubectl'].includes(controlPlane.state.phase) ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
                                )}>
                                    <Box className="w-4 h-4 text-surface-400" />
                                    <span className="text-xs text-surface-400">pod-target-1</span>
                                </div>
                                {!['idle', 'kubectl'].includes(controlPlane.state.phase) && (
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
            {controlPlane.state.scenario === 'worker-flow' && (
               <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                 <div className={cn(
                   "p-4 rounded-lg border-2 transition-all duration-500",
                   ['kube-proxy', 'node-flow'].includes(controlPlane.state.phase) 
                     ? "bg-accent-500/20 border-accent-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" 
                     : "bg-surface-800 border-surface-700 opacity-50"
                 )}>
                   <h4 className="font-semibold text-accent-300 mb-2">kube-proxy</h4>
                   <p className="text-xs text-surface-300 mb-2">
                     Maintains network rules on nodes. Handles Service abstraction.
                   </p>
                   {['kube-proxy', 'node-flow'].includes(controlPlane.state.phase) && (
                     <div className="text-xs font-mono text-accent-200 bg-accent-500/10 p-2 rounded">
                       $ iptables -t nat -A KUBE-SERVICES...
                     </div>
                   )}
                 </div>
                 
                 <div className={cn(
                   "p-4 rounded-lg border-2 transition-all duration-500",
                   ['kubelet'].includes(controlPlane.state.phase) 
                     ? "bg-primary-500/20 border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" 
                     : "bg-surface-800 border-surface-700 opacity-50"
                 )}>
                   <h4 className="font-semibold text-primary-300 mb-2">kubelet</h4>
                   <p className="text-xs text-surface-300 mb-2">
                     Primary "node agent". Syncs PodSpecs with container runtime.
                   </p>
                   {['kubelet'].includes(controlPlane.state.phase) && (
                     <div className="text-xs font-mono text-primary-200 bg-primary-500/10 p-2 rounded">
                       SyncLoop: Pod status update → Running
                     </div>
                   )}
                 </div>
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
        )}
        
        {/* User Request Flow Content */}
        {flowMode === 'user-request' && (
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Traffic Controls */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <TrafficFlowControls
              isFlowing={traffic.state.isFlowing}
              endpoints={traffic.endpoints}
              selectedEndpoint={traffic.state.endpoint}
              onEndpointChange={traffic.setEndpoint}
              onStart={traffic.startSimulation}
              onComplete={traffic.stopSimulation}
            />
            <RoutingStatus trafficState={traffic.state} />
          </div>

          {/* Scenario Selection (User Request Flow Only) */}
          <div className="flex flex-col items-center gap-3 mb-6 bg-surface-900/50 p-4 rounded-xl border border-surface-700/50">
             <ScenarioSelector
               currentScenarioId={currentScenarioId}
               onSelectScenario={onSelectScenario}
             />
             <ScenarioDescription scenarioId={currentScenarioId} />
           </div>

          {/* External Traffic Entry Point */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              traffic.state.isFlowing 
                ? "bg-success-500/20 border-success-500/50 shadow-lg shadow-success-500/20" 
                : "bg-primary-500/10 border-primary-500/30"
            )}>
              <Globe className={cn("w-5 h-5", traffic.state.isFlowing ? "text-success-400" : "text-primary-400")} />
              <span className={cn("text-sm font-medium", traffic.state.isFlowing ? "text-success-300" : "text-primary-300")}>External Traffic</span>
              <span className="text-xs text-surface-400 ml-2">(app.example.com)</span>
            </div>
            <ArrowDown className={cn(
              "w-5 h-5 my-2 transition-colors duration-300",
              traffic.state.isFlowing ? "text-success-400 animate-bounce" : "text-primary-500/50"
            )} />
          </div>

          {/* Ingress Layer */}
          <div className="flex flex-col items-center">
            {cluster.ingresses.map((ingress) => {
              const isSelected = selected?.type === 'ingress' && selected.data.id === ingress.id;
              return (
                <div
                  key={ingress.id}
                  onClick={() => setSelected({ type: 'ingress', data: ingress })}
                  className={cn(
                    'px-6 py-3 rounded-lg border-2 cursor-pointer transition-all',
                    'border-accent-500 bg-accent-500/10 hover:bg-accent-500/20',
                    isSelected && 'ring-2 ring-primary-400 scale-105',
                    isInTrafficPath('ingress', ingress.id, traffic.state) && 'traffic-active border-success-500 bg-success-500/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-accent-400" />
                    <div>
                      <p className="font-semibold text-surface-100">Ingress: {ingress.name}</p>
                      <p className="text-xs text-surface-400">
                        {ingress.host} • {ingress.paths.length} route{ingress.paths.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <ArrowDown className="w-5 h-5 text-accent-500/50 my-2" />
          </div>

          {/* Services Layer - between Ingress and Pods for correct traffic flow */}
          <div>
            <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              Services (Load Balancing)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cluster.services.map((svc) => {
                const isSelected = selected?.type === 'service' && selected.data.id === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelected({ type: 'service', data: svc })}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                      'border-accent-500/30 bg-accent-500/5 hover:bg-accent-500/15',
                      isSelected && 'ring-2 ring-primary-400 scale-105',
                      isInTrafficPath('service', svc.id, traffic.state) && 'traffic-active border-success-500/50 bg-success-500/5'
                    )}
                  >
                    <p className="text-sm font-medium text-surface-200">{svc.name}</p>
                    <p className="text-xs text-surface-400">
                      {svc.type} · {svc.ports[0]?.port}
                    </p>
                    <p className="text-xs text-accent-400">
                      → {svc.podIds.length} pod{svc.podIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
            <ArrowDown className={cn(
              "w-5 h-5 my-2 mx-auto transition-colors",
              traffic.state.isFlowing ? "text-success-400" : "text-accent-500/50"
            )} />
          </div>

          {/* Worker Nodes - Where the traffic actually goes */}
          <div>
            <h3 
              onClick={() => setSelected({ type: 'info', data: { id: 'workerNodesIntro' } })}
              className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
            >
              <span className={cn("w-2 h-2 rounded-full", traffic.state.isFlowing ? "bg-success-500 animate-pulse" : "bg-success-500")} />
              Worker Nodes (Pods)
              <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workerNodes.map((node) => (
                <WorkerNode
                  key={node.id}
                  node={node}
                  pods={podsByNode[node.id] || []}
                  selectedPodId={selected?.type === 'pod' ? selected.data.id : null}
                  trafficTargetPodId={traffic.state.isFlowing && ['pod', 'response'].includes(traffic.state.phase) ? traffic.state.targetPodId : null}
                  isSelected={selected?.type === 'node' && selected.data.id === node.id}
                  onSelectNode={() => setSelected({ type: 'node', data: node })}
                  onSelectPod={(pod) => setSelected({ type: 'pod', data: pod })}
                  activeComponent={
                    controlPlane.state.scenario === 'worker-flow'
                      ? (['kube-proxy', 'node-flow'].includes(controlPlane.state.phase) ? 'kube-proxy' :
                         ['kubelet'].includes(controlPlane.state.phase) ? 'kubelet' : null)
                      : null
                  }
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-surface-700 my-4" />

          {/* Control Plane - Separate section (not in traffic path) */}
          <div>
            <h3 
              onClick={() => setSelected({ type: 'info', data: { id: 'controlPlaneIntro' } })}
              className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              Control Plane Components (Cluster Management)
              <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </h3>
            <ControlPlaneNode
              controlPlane={cluster.controlPlane}
              selectedComponent={selected?.type === 'controlPlane' ? selected.data : null}
              onSelectComponent={(component) => setSelected({ type: 'controlPlane', data: component })}
            />
          </div>

          {/* Unscheduled Pods (Pending) */}
          {cluster.pods.filter(p => !p.nodeId).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-warning-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Unscheduled Pods (Pending)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cluster.pods.filter(p => !p.nodeId).map((pod) => {
                  const isSelected = selected?.type === 'pod' && selected.data.id === pod.id;
                  return (
                    <div
                      key={pod.id}
                      onClick={() => setSelected({ type: 'pod', data: pod })}
                      className={cn(
                        'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                        'border-warning-500/50 bg-warning-500/10 hover:bg-warning-500/20',
                        isSelected && 'ring-2 ring-primary-400 scale-105'
                      )}
                    >
                      <p className="text-sm font-medium text-surface-200 truncate">{pod.name.split('-').slice(0, 2).join('-')}</p>
                      <p className="text-xs text-warning-400">Pending - No node</p>
                      <p className="text-xs text-surface-400 truncate">
                        {pod.conditions.find(c => c.reason)?.message?.slice(0, 30) || 'Waiting for scheduling'}...
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Enhanced Info Panel */}
      <EnhancedInfoPanel
        selected={selected}
        cluster={cluster}
        onClose={() => setSelected(null)}
        onKillPod={onKillPod}
      />
    </div>
  );
}
