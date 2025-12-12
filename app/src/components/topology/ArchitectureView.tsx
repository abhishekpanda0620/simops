import { useMemo, useState } from 'react';
import { ControlPlaneNode, WorkerNode } from './nodes';
import { EnhancedInfoPanel } from './EnhancedInfoPanel';
import { TrafficFlowControls, TrafficPacket, TrafficFlowLine } from './TrafficFlow';
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
  const [isTrafficFlowing, setIsTrafficFlowing] = useState(false);

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
        {/* Traffic Flow Visualization */}
        <TrafficFlowLine isFlowing={isTrafficFlowing} />
        <TrafficPacket isFlowing={isTrafficFlowing} direction="request" />
        <TrafficPacket isFlowing={isTrafficFlowing} direction="response" />
        
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* External Traffic Entry Point */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                isTrafficFlowing 
                  ? "bg-success-500/20 border-success-500/50 shadow-lg shadow-success-500/20" 
                  : "bg-primary-500/10 border-primary-500/30"
              )}>
                <Globe className={cn("w-5 h-5", isTrafficFlowing ? "text-success-400" : "text-primary-400")} />
                <span className={cn("text-sm font-medium", isTrafficFlowing ? "text-success-300" : "text-primary-300")}>External Traffic</span>
                <span className="text-xs text-surface-400 ml-2">(app.example.com)</span>
              </div>
              <TrafficFlowControls 
                isFlowing={isTrafficFlowing} 
                onToggle={() => setIsTrafficFlowing(!isTrafficFlowing)} 
              />
            </div>
            <ArrowDown className={cn(
              "w-5 h-5 my-2 transition-colors duration-300",
              isTrafficFlowing ? "text-success-400 animate-bounce" : "text-primary-500/50"
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
                    isTrafficFlowing && 'traffic-active border-success-500 bg-success-500/10'
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

          {/* Control Plane */}
          <div>
            <h3 
              onClick={() => setSelected({ type: 'info', data: { id: 'controlPlaneIntro' } })}
              className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              Control Plane Components
              <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </h3>
            <ControlPlaneNode
              controlPlane={cluster.controlPlane}
              selectedComponent={selected?.type === 'controlPlane' ? selected.data : null}
              onSelectComponent={(component) => setSelected({ type: 'controlPlane', data: component })}
            />
          </div>

          <ArrowDown className="w-5 h-5 text-surface-500 mx-auto" />

          {/* Worker Nodes */}
          <div>
            <h3 
              onClick={() => setSelected({ type: 'info', data: { id: 'workerNodesIntro' } })}
              className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-success-500" />
              Worker Nodes
              <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workerNodes.map((node) => (
                <WorkerNode
                  key={node.id}
                  node={node}
                  pods={podsByNode[node.id] || []}
                  selectedPodId={selected?.type === 'pod' ? selected.data.id : null}
                  isSelected={selected?.type === 'node' && selected.data.id === node.id}
                  onSelectNode={() => setSelected({ type: 'node', data: node })}
                  onSelectPod={(pod) => setSelected({ type: 'pod', data: pod })}
                />
              ))}
            </div>
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

          {/* Services Layer */}
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
                    onClick={() => setSelected({ type: 'service', data: svc })}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                      'border-accent-500/30 bg-accent-500/5 hover:bg-accent-500/15',
                      isSelected && 'ring-2 ring-primary-400 scale-105',
                      isTrafficFlowing && 'traffic-active border-success-500/50 bg-success-500/5'
                    )}
                  >
                    <p className="text-sm font-medium text-surface-200">{svc.name}</p>
                    <p className="text-xs text-surface-400">
                      {svc.type} · {svc.ports[0]?.port}
                    </p>
                    <p className="text-xs text-accent-400">
                      {svc.podIds.length} pod{svc.podIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
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
