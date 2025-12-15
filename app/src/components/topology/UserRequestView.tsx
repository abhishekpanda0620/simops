import { useMemo } from 'react';
import { Globe, ArrowDown, Network, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { TrafficFlowControls, RoutingStatus, isInTrafficPath } from './TrafficFlow';
import { ScenarioSelector, ScenarioDescription } from './ScenarioSelector';
import { WorkerNode, ControlPlaneNode } from './nodes';
import { StorageLayer } from './StorageLayer';
import { ConfigurationLayer } from './ConfigurationLayer';
import type { ClusterSnapshot, K8sPod } from '@/types';
import type { ScenarioId } from '@/data';
import type { SelectedItem } from './SelectionTypes';
import type { TrafficState } from './TrafficFlow';
import type { ControlPlaneState, ControlPlaneScenario } from './ControlPlaneUtils';

interface UserRequestViewProps {
  cluster: ClusterSnapshot;
  trafficState: TrafficState;
  trafficEndpoints: string[];
  onSetTrafficEndpoint: (endpoint: string) => void;
  onStartTrafficSimulation: () => void;
  onStopTrafficSimulation: () => void;
  controlPlaneState: ControlPlaneState;
  controlPlaneScenario: ControlPlaneScenario;
  currentScenarioId: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
  selected: SelectedItem;
  onSelect: (item: SelectedItem) => void;
}

export function UserRequestView({
  cluster,
  trafficState,
  trafficEndpoints,
  onSetTrafficEndpoint,
  onStartTrafficSimulation,
  onStopTrafficSimulation,
  controlPlaneState,
  controlPlaneScenario,
  currentScenarioId,
  onSelectScenario,
  selected,
  onSelect
}: UserRequestViewProps) {
  
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
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Traffic Controls */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <TrafficFlowControls
          isFlowing={trafficState.isFlowing}
          endpoints={trafficEndpoints}
          selectedEndpoint={trafficState.endpoint}
          onEndpointChange={onSetTrafficEndpoint}
          onStart={onStartTrafficSimulation}
          onComplete={onStopTrafficSimulation}
        />
        <RoutingStatus trafficState={trafficState} />
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
          trafficState.isFlowing 
            ? "bg-success-500/20 border-success-500/50 shadow-lg shadow-success-500/20" 
            : "bg-primary-500/10 border-primary-500/30"
        )}>
          <Globe className={cn("w-5 h-5", trafficState.isFlowing ? "text-success-400" : "text-primary-400")} />
          <span className={cn("text-sm font-medium", trafficState.isFlowing ? "text-success-300" : "text-primary-300")}>External Traffic</span>
          <span className="text-xs text-surface-400 ml-2">(app.example.com)</span>
        </div>
        <ArrowDown className={cn(
          "w-5 h-5 my-2 transition-colors duration-300",
          trafficState.isFlowing ? "text-success-400 animate-bounce" : "text-primary-500/50"
        )} />
      </div>

      {/* Ingress Layer */}
      <div className="flex flex-col items-center">
        {cluster.ingresses.map((ingress) => {
          const isSelected = selected?.type === 'ingress' && selected.data.id === ingress.id;
          return (
            <div
              key={ingress.id}
              onClick={() => onSelect({ type: 'ingress', data: ingress })}
              className={cn(
                'px-6 py-3 rounded-lg border-2 cursor-pointer transition-all',
                'border-accent-500 bg-accent-500/10 hover:bg-accent-500/20',
                isSelected && 'ring-2 ring-primary-400 scale-105',
                isInTrafficPath('ingress', ingress.id, trafficState) && 'traffic-active border-success-500 bg-success-500/10'
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
          Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cluster.services.map((svc) => {
            const isSelected = selected?.type === 'service' && selected.data.id === svc.id;
            return (
              <div
                key={svc.id}
                onClick={() => onSelect({ type: 'service', data: svc })}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                  'border-accent-500/30 bg-accent-500/5 hover:bg-accent-500/15',
                  isSelected && 'ring-2 ring-primary-400 scale-105',
                  isInTrafficPath('service', svc.id, trafficState) && 'traffic-active border-success-500/50 bg-success-500/5'
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
          trafficState.isFlowing ? "text-success-400" : "text-accent-500/50"
        )} />
      </div>

      {/* Worker Nodes - Where the traffic actually goes */}
      <div>
        <h3 
          onClick={() => onSelect({ type: 'info', data: { id: 'workerNodesIntro' } })}
          className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
        >
          <span className={cn("w-2 h-2 rounded-full", trafficState.isFlowing ? "bg-success-500 animate-pulse" : "bg-success-500")} />
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
              trafficTargetPodId={trafficState.isFlowing && ['pod', 'response'].includes(trafficState.phase) ? trafficState.targetPodId : null}
              isSelected={selected?.type === 'node' && selected.data.id === node.id}
              onSelectNode={() => onSelect({ type: 'node', data: node })}
              onSelectPod={(pod) => onSelect({ type: 'pod', data: pod })}
              onSelectComponent={(component) => onSelect({ type: 'nodeComponent', data: { nodeId: node.id, component, nodeName: node.name } })}
              activeComponent={
                controlPlaneScenario === 'worker-flow'
                  ? (['kube-proxy', 'node-flow'].includes(controlPlaneState.phase) ? 'kube-proxy' :
                      ['kubelet'].includes(controlPlaneState.phase) ? 'kubelet' : null)
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
          onClick={() => onSelect({ type: 'info', data: { id: 'controlPlaneIntro' } })}
          className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
        >
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          Control Plane Components (Cluster Management)
          <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </h3>
        <ControlPlaneNode
          controlPlane={cluster.controlPlane}
          selectedComponent={selected?.type === 'controlPlane' ? selected.data : null}
          onSelectComponent={(component) => onSelect({ type: 'controlPlane', data: component })}
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
                  onClick={() => onSelect({ type: 'pod', data: pod })}
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
      {/* Storage Layer */}
      {cluster && (cluster.pvs?.length > 0 || cluster.pvcs?.length > 0) && (
        <StorageLayer 
          pvs={cluster.pvs} 
          pvcs={cluster.pvcs}
          onSelectPV={(pv) => {
            console.log('Selected PV:', pv);
            onSelect({ type: 'pv', data: pv });
          }}
          onSelectPVC={(pvc) => {
            console.log('Selected PVC:', pvc);
            onSelect({ type: 'pvc', data: pvc });
          }}
          selectedPVId={selected?.type === 'pv' ? selected.data.id : null}
          selectedPVCId={selected?.type === 'pvc' ? selected.data.id : null}
        />
      )}

      {/* Configuration Layer */}
      {cluster && (cluster.configMaps?.length > 0 || cluster.secrets?.length > 0) && (
        <ConfigurationLayer 
          configMaps={cluster.configMaps}
          secrets={cluster.secrets}
          onSelectConfigMap={(cm) => onSelect({ type: 'configMap', data: cm })}
          onSelectSecret={(secret) => onSelect({ type: 'secret', data: secret })}
          selectedConfigMapId={selected?.type === 'configMap' ? selected.data.id : null}
          selectedSecretId={selected?.type === 'secret' ? selected.data.id : null}
        />
      )}

      {/* Deployments Layer (Management) */}
      <div>
        <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Workload Controllers (Deployments)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cluster.deployments?.map((deploy) => {
                const isSelected = selected?.type === 'deployment' && selected.data.id === deploy.id;
                return (
                <div
                    key={deploy.id}
                    onClick={() => onSelect({ type: 'deployment', data: deploy })}
                    className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                    'border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/15',
                    isSelected && 'ring-2 ring-primary-400 scale-105'
                    )}
                >
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-surface-200">{deploy.name}</p>
                        <p className="text-xs text-surface-400">
                        {deploy.replicas.ready} / {deploy.replicas.desired} Ready
                        </p>
                    </div>
                    <div className="bg-surface-800/50 px-2 py-1 rounded text-xs text-primary-300 font-mono">
                        ReplicaSet
                    </div>
                    </div>
                </div>
                );
            })}
        </div>
      </div>

    </div>
  );
}
