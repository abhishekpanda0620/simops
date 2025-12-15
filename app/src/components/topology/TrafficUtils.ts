export interface TrafficState {
  isFlowing: boolean;
  phase: 'idle' | 'ingress' | 'service' | 'pod' | 'response' | 'complete';
  endpoint: string;
  // The actual path components
  targetIngressId: string | null;
  targetServiceId: string | null;
  targetPodId: string | null;
  targetNodeId: string | null;
  // Service name for display
  targetServiceName: string | null;
  status: 'success' | 'error';
  responseCode: number;
}

// Helper to check if a component should be highlighted in current traffic path
export function isInTrafficPath(
  componentType: 'ingress' | 'service' | 'pod' | 'node',
  componentId: string,
  trafficState: TrafficState
): boolean {
  if (!trafficState.isFlowing || trafficState.phase === 'idle' || trafficState.phase === 'complete') {
    return false;
  }
  
  switch (componentType) {
    case 'ingress':
      // Ingress highlights during ingress, service, pod, and response phases
      return trafficState.targetIngressId === componentId && 
             ['ingress', 'service', 'pod', 'response'].includes(trafficState.phase);
    case 'service':
      // Service highlights during service, pod, and response phases
      return trafficState.targetServiceId === componentId && 
             ['service', 'pod', 'response'].includes(trafficState.phase);
    case 'pod':
      // Pod highlights during pod and response phases
      return trafficState.targetPodId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    case 'node':
      // Node highlights when its pod is active
      return trafficState.targetNodeId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    default:
      return false;
  }
}
