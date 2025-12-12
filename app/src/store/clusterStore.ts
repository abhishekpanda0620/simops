import { create } from 'zustand';
import type { ClusterSnapshot, K8sPod, K8sService, K8sIngress, ControlPlaneComponent } from '@/types';
import { scenarios, type ScenarioId } from '@/data';

interface ClusterState {
  currentCluster: ClusterSnapshot | null;
  currentScenarioId: ScenarioId | null;
  selectedPod: K8sPod | null;
  selectedService: K8sService | null;
  selectedIngress: K8sIngress | null;
  selectedControlPlane: ControlPlaneComponent | null;
  selectedNodeId: string | null;
  
  // Actions
  loadScenario: (scenarioId: ScenarioId) => void;
  selectPod: (pod: K8sPod | null) => void;
  selectService: (service: K8sService | null) => void;
  selectIngress: (ingress: K8sIngress | null) => void;
  selectControlPlane: (component: ControlPlaneComponent | null) => void;
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;
  
  // Simulation actions
  killPod: (podId: string) => void;
  restartPod: (podId: string) => void;
}

export const useClusterStore = create<ClusterState>((set, get) => ({
  currentCluster: null,
  currentScenarioId: null,
  selectedPod: null,
  selectedService: null,
  selectedIngress: null,
  selectedControlPlane: null,
  selectedNodeId: null,
  
  loadScenario: (scenarioId) => {
    set({
      currentCluster: scenarios[scenarioId],
      currentScenarioId: scenarioId,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
    });
  },
  
  selectPod: (pod) => {
    set({ 
      selectedPod: pod, 
      selectedService: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
    });
  },
  
  selectService: (service) => {
    set({ 
      selectedService: service, 
      selectedPod: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
    });
  },
  
  selectIngress: (ingress) => {
    set({ 
      selectedIngress: ingress, 
      selectedPod: null, 
      selectedService: null,
      selectedControlPlane: null,
      selectedNodeId: null,
    });
  },
  
  selectControlPlane: (component) => {
    set({
      selectedControlPlane: component,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedNodeId: null,
    });
  },
  
  selectNode: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
    });
  },
  
  clearSelection: () => {
    set({ 
      selectedPod: null, 
      selectedService: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
    });
  },
  
  // Simulation: Kill a pod (simulates kubectl delete pod)
  killPod: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'pending' as const,
                phase: 'Pending' as const,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'waiting' as const,
                  waitingReason: 'ContainerCreating' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Normal' as const, reason: 'Killing', message: 'Stopping container', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
    
    // Simulate pod coming back after 2 seconds (self-healing)
    setTimeout(() => {
      const currentCluster = get().currentCluster;
      if (!currentCluster) return;
      
      set({
        currentCluster: {
          ...currentCluster,
          pods: currentCluster.pods.map((pod) =>
            pod.id === podId
              ? {
                  ...pod,
                  status: 'running' as const,
                  phase: 'Running' as const,
                  restarts: pod.restarts + 1,
                  containers: pod.containers.map((c) => ({
                    ...c,
                    state: 'running' as const,
                    waitingReason: undefined,
                    ready: true,
                    restarts: c.restarts + 1,
                  })),
                  events: [
                    ...pod.events,
                    { type: 'Normal' as const, reason: 'Started', message: 'Started container (recreated by controller)', timestamp: new Date().toISOString(), count: 1 },
                  ],
                }
              : pod
          ),
        },
      });
    }, 2000);
  },
  
  restartPod: (podId) => {
    get().killPod(podId);
  },
}));
