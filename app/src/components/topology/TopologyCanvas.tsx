import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PodNode, ServiceNode, IngressNode } from './nodes';
import { InfoPanel } from './InfoPanel';
import type { ClusterSnapshot, K8sPod, K8sService, K8sIngress } from '@/types';

// Register custom node types
const nodeTypes = {
  pod: PodNode,
  service: ServiceNode,
  ingress: IngressNode,
};

interface TopologyCanvasProps {
  cluster: ClusterSnapshot;
}

type SelectedResource =
  | { type: 'pod'; data: K8sPod }
  | { type: 'service'; data: K8sService }
  | { type: 'ingress'; data: K8sIngress }
  | null;

export function TopologyCanvas({ cluster }: TopologyCanvasProps) {
  const [selected, setSelected] = useState<SelectedResource>(null);

  // Memoize handlers
  const handleSelectPod = useCallback((pod: K8sPod) => {
    setSelected({ type: 'pod', data: pod });
  }, []);

  const handleSelectService = useCallback((service: K8sService) => {
    setSelected({ type: 'service', data: service });
  }, []);

  const handleSelectIngress = useCallback((ingress: K8sIngress) => {
    setSelected({ type: 'ingress', data: ingress });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelected(null);
  }, []);

  // Generate nodes and edges from cluster data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Calculate layout positions
    const INGRESS_Y = 50;
    const SERVICE_Y = 200;
    const POD_Y = 400;
    const X_SPACING = 200;
    const X_START = 100;

    // Add ingress nodes
    cluster.ingresses.forEach((ingress, i) => {
      nodes.push({
        id: ingress.id,
        type: 'ingress',
        position: { x: X_START + i * X_SPACING * 2, y: INGRESS_Y },
        data: {
          ingress,
          isSelected: selected?.type === 'ingress' && selected.data.id === ingress.id,
          onSelect: handleSelectIngress,
        },
      });

      // Create edges from ingress to services
      ingress.paths.forEach((path) => {
        edges.push({
          id: `${ingress.id}-${path.serviceId}`,
          source: ingress.id,
          target: path.serviceId,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
        });
      });
    });

    // Add service nodes
    cluster.services.forEach((service, i) => {
      nodes.push({
        id: service.id,
        type: 'service',
        position: { x: X_START + i * X_SPACING, y: SERVICE_Y },
        data: {
          service,
          isSelected: selected?.type === 'service' && selected.data.id === service.id,
          onSelect: handleSelectService,
        },
      });

      // Create edges from services to pods
      service.podIds.forEach((podId) => {
        edges.push({
          id: `${service.id}-${podId}`,
          source: service.id,
          target: podId,
          animated: true,
          style: { stroke: '#06b6d4', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
        });
      });
    });

    // Add pod nodes - group by service for better layout
    const podsByService: Record<string, K8sPod[]> = {};
    cluster.pods.forEach((pod) => {
      pod.serviceIds.forEach((svcId) => {
        if (!podsByService[svcId]) podsByService[svcId] = [];
        podsByService[svcId].push(pod);
      });
    });

    let podX = X_START;
    Object.entries(podsByService).forEach(([, pods]) => {
      pods.forEach((pod, i) => {
        // Check if node already exists (pod might belong to multiple services)
        if (!nodes.find((n) => n.id === pod.id)) {
          nodes.push({
            id: pod.id,
            type: 'pod',
            position: { x: podX + i * 160, y: POD_Y + (i % 2) * 30 },
            data: {
              pod,
              isSelected: selected?.type === 'pod' && selected.data.id === pod.id,
              onSelect: handleSelectPod,
            },
          });
        }
      });
      podX += pods.length * 160 + 40;
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [cluster, selected, handleSelectPod, handleSelectService, handleSelectIngress]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="flex h-full">
      {/* Topology Canvas */}
      <div className="flex-1 bg-surface-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          className="bg-surface-950"
        >
          <Background color="#374151" gap={20} />
          <Controls
            className="!bg-surface-800 !border-surface-700 !rounded-lg [&>button]:!bg-surface-800 [&>button]:!border-surface-700 [&>button]:!text-surface-300 [&>button:hover]:!bg-surface-700"
          />
          <MiniMap
            className="!bg-surface-800 !border-surface-700 !rounded-lg"
            nodeColor={(node) => {
              if (node.type === 'ingress') return '#8b5cf6';
              if (node.type === 'service') return '#06b6d4';
              return '#22c55e';
            }}
          />
        </ReactFlow>
      </div>

      {/* Educational Info Panel */}
      <InfoPanel selected={selected} onClose={handleClearSelection} />
    </div>
  );
}
