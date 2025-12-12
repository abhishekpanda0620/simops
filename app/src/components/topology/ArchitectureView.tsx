import { useMemo, useState } from 'react';
import { ControlPlaneNode, WorkerNode } from './nodes';
import { EnhancedInfoPanel } from './EnhancedInfoPanel';
import { TrafficFlowControls, RoutingStatus, useTrafficSimulation, isInTrafficPath } from './TrafficFlow';
import type { ClusterSnapshot, K8sPod, K8sService, K8sIngress, ControlPlaneComponent, K8sNode } from '@/types';
import { Globe, Network, ArrowDown, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils';

interface ArchitectureViewProps {
  cluster: ClusterSnapshot;
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

export function ArchitectureView({ cluster, onKillPod }: ArchitectureViewProps) {
  const [selected, setSelected] = useState<SelectedItem>(null);

  // Traffic simulation
  const traffic = useTrafficSimulation(
    cluster.ingresses,
    cluster.services,
    cluster.pods
  );

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
                traffic.state.phase === 'ingress' && "top-[22%]",
                traffic.state.phase === 'service' && "top-[42%]",
                traffic.state.phase === 'pod' && "top-[62%]"
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
              <div className="absolute left-1/2 translate-x-12 z-30 pointer-events-none top-[62%] animate-[moveUp_3s_ease-in-out_forwards]">
                <div className="px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-lg bg-accent-500 text-white border border-accent-400 flex items-center gap-2">
                  <span className="animate-bounce">▲</span>
                  <span>200 OK</span>
                  <span>📥</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Traffic Controls - Above routing status */}
        <div className="mb-3">
          <TrafficFlowControls 
            isFlowing={traffic.state.isFlowing}
            endpoints={traffic.endpoints}
            selectedEndpoint={traffic.state.endpoint}
            onEndpointChange={traffic.setEndpoint}
            onStart={traffic.startSimulation}
            onComplete={traffic.stopSimulation}
          />
        </div>
        
        {/* Routing Status Bar */}
        <RoutingStatus trafficState={traffic.state} />
        
        <div className="max-w-6xl mx-auto space-y-8">
          
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
