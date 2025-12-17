import { ArrowDown, Globe } from 'lucide-react';
import { cn } from '@/utils';
import { ControlPlaneFlowControls, ControlPlaneStatus } from './ControlPlaneFlow';
import { isControlPlaneActive } from './ControlPlaneUtils';
import { PodVisuals } from './simulations/PodVisuals';
import { WorkloadVisuals } from './simulations/WorkloadVisuals';
import { ConfigVisuals } from './simulations/ConfigVisuals';
import { NodeVisuals } from './simulations/NodeVisuals';
import { PolicyVisuals } from './simulations/PolicyVisuals';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from './SelectionTypes';
import type { ControlPlaneState, ControlPlaneScenario } from './ControlPlaneUtils';

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
              {controlPlaneScenario === 'manage-configmap' && 'kubectl create cm app-config --from-file=config.json'}
              {controlPlaneScenario === 'manage-secret' && 'kubectl create secret generic db-pass --from-literal=password=***'}
              {controlPlaneScenario === 'simulate-hpa' && 'kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10'}
              {controlPlaneScenario === 'simulate-rbac' && 'kubectl get pods --as=alice'}
              {controlPlaneScenario === 'node-failure' && '# Simulating Power Failure...'}
              {controlPlaneScenario === 'worker-flow' && '# Simulating Kube-Proxy & Kubelet Flow...'}
            </span>
          </div>
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

      <PodVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
      <WorkloadVisuals scenario={controlPlaneScenario} state={controlPlaneState} cluster={cluster} />
      <ConfigVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
      <NodeVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
      <PolicyVisuals scenario={controlPlaneScenario} state={controlPlaneState} />

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
