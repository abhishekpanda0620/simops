import { Info } from 'lucide-react';
import { cn } from '@/utils';
import { WorkerNode } from '../nodes';
import type { K8sPod, K8sNode } from '@/types';
import type { TrafficState } from '../TrafficUtils';
import type { SelectedItem } from '../SelectionTypes';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface NodesLayerProps {
  workerNodes: K8sNode[];
  podsByNode: Record<string, K8sPod[]>;
  selected: SelectedItem;
  trafficState: TrafficState;
  controlPlaneState: ControlPlaneState;
  controlPlaneScenario: ControlPlaneScenario;
  onSelect: (item: SelectedItem) => void;
}

export function NodesLayer({
  workerNodes,
  podsByNode,
  selected,
  trafficState,
  controlPlaneState,
  controlPlaneScenario,
  onSelect
}: NodesLayerProps) {
  return (
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
  );
}
