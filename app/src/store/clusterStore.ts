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
  causeOOM: (podId: string) => void;
  breakImage: (podId: string) => void;
  triggerCrashLoop: (podId: string) => void;
  toggleNodeFailure: (nodeId: string) => void;
  scaleDeployment: (deploymentId: string, replicas: number) => void;
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
  // Simulation: Trigger OOMKilled
  causeOOM: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'failed' as const,
                phase: 'Failed' as const,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'terminated' as const,
                  terminatedReason: 'OOMKilled' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'OOMKilling', message: 'Memory cgroup out of memory: Killed process', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
  },

  // Simulation: Trigger ImagePullBackOff
  breakImage: (podId) => {
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
                  waitingReason: 'ImagePullBackOff' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'Failed', message: `Failed to pull image "${pod.containers[0].image}": manifest unknown`, timestamp: new Date().toISOString(), count: 1 },
                  { type: 'Warning' as const, reason: 'BackOff', message: 'Back-off pulling image', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
  },

  // Simulation: Trigger CrashLoopBackOff
  triggerCrashLoop: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'failed' as const,
                phase: 'Running' as const, // Pod is running but container is crashing
                restarts: pod.restarts + 5,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'waiting' as const,
                  waitingReason: 'CrashLoopBackOff' as const,
                  ready: false,
                  restarts: c.restarts + 5,
                  lastRestartAt: new Date().toISOString(),
                })),
                conditions: pod.conditions.map(c => c.type === 'Ready' ? { ...c, status: 'False', message: 'Container failing' } : c),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'BackOff', message: 'Back-off restarting failed container', timestamp: new Date().toISOString(), count: 12 },
                ],
              }
            : pod
        ),
      },
    });
  },

  // Simulation: Toggle Node Failure
  toggleNodeFailure: (nodeId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    const node = cluster.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const isFailing = (node.status as string) === 'NotReady'; // Fix type check
    
    // Toggle Status
    const newStatus = isFailing ? 'Ready' : 'NotReady'; 

    set({
        currentCluster: {
            ...cluster,
            nodes: cluster.nodes.map(n => n.id === nodeId ? { ...n, status: newStatus as any } : n),
            // If node fails, pods become unknown/terminating logic (simplified for viz)
        }
    });
  },

  // Simulation: Scale Deployment
  scaleDeployment: (deploymentId, replicas) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    const deployment = cluster.deployments.find((d) => d.id === deploymentId);
    if (!deployment) return;

    const currentReplicas = deployment.replicas.desired;
    
    // Update Deployment
    let updatedDeployments = cluster.deployments.map((d) => 
      d.id === deploymentId 
        ? { ...d, replicas: { ...d.replicas, desired: replicas } }
        : d
    );
    let updatedPods = [...cluster.pods];
    let updatedServices = [...cluster.services];

    if (replicas > currentReplicas) {
      // Scale UP: Add new pods
      const countToAdd = replicas - currentReplicas;
      const workerNodes = cluster.nodes.filter(n => n.role === 'worker');
      const templatePod = cluster.pods.find(p => deployment.podIds.includes(p.id)) || cluster.pods[0]; // Fallback if 0 pods

      for (let i = 0; i < countToAdd; i++) {
        const newId = `${deployment.name}-${Math.random().toString(36).substr(2, 5)}`;
        // Round-robin node assignment
        const node = workerNodes[i % workerNodes.length];
        
        const newPod: K8sPod = {
            ...templatePod,
            id: newId,
            name: newId,
            nodeId: node.id,
            nodeName: node.name,
            phase: 'Running',
            status: 'running',
            createdAt: new Date().toISOString(),
            restarts: 0,
            conditions: [
                { type: 'Initialized', status: 'True' },
                { type: 'Ready', status: 'True' },
                { type: 'ContainersReady', status: 'True' },
                { type: 'PodScheduled', status: 'True' },
            ],
            containers: templatePod.containers.map(c => ({ 
                ...c, 
                state: 'running', 
                ready: true, 
                restarts: 0,
                waitingReason: undefined,
                terminatedReason: undefined
            })),
            events: [{ type: 'Normal', reason: 'Scheduled', message: `Successfully assigned to ${node.name}`, timestamp: new Date().toISOString(), count: 1 }]
        };

        updatedPods.push(newPod);
        
        // Update Deployment pod list
         updatedDeployments = updatedDeployments.map(d => 
            d.id === deploymentId ? { ...d, podIds: [...d.podIds, newId] } : d
         );
         
         // Update Service pod list (naive: add to all services that selected the template pod)
         updatedServices = updatedServices.map(s => 
            s.podIds.includes(templatePod.id) ? { ...s, podIds: [...s.podIds, newId] } : s
         );
      }
      
    } else if (replicas < currentReplicas) {
      // Scale DOWN: Remove pods
      const countToRemove = currentReplicas - replicas;
      // Remove the last N pods associated with this deployment
      const podIdsToRemove = deployment.podIds.slice(-countToRemove);
      
      updatedPods = updatedPods.filter(p => !podIdsToRemove.includes(p.id));
      
      // Update Deployment
      updatedDeployments = updatedDeployments.map(d => 
        d.id === deploymentId 
            ? { ...d, podIds: d.podIds.filter(id => !podIdsToRemove.includes(id)) } 
            : d
      );
      
      // Update Services
      updatedServices = updatedServices.map(s => ({
          ...s,
          podIds: s.podIds.filter(id => !podIdsToRemove.includes(id))
      }));
    }

    set({
        currentCluster: {
            ...cluster,
            deployments: updatedDeployments,
            pods: updatedPods,
            services: updatedServices,
            // (Ideally we should also update Nodes.pods list, but the visualization mostly relies on Pod.nodeId)
        }
    });

  },
}));
