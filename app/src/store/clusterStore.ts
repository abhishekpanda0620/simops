import { create } from 'zustand';
import type { ClusterSnapshot, K8sPod, K8sService, K8sIngress, ControlPlaneComponent, K8sStatefulSet, K8sDaemonSet, K8sPV, K8sPVC, ResourceStatus, K8sDeployment } from '@/types';
import { scenarios, type ScenarioId } from '@/data';

interface ClusterState {
  currentCluster: ClusterSnapshot | null;
  currentScenarioId: ScenarioId | null;
  selectedPod: K8sPod | null;
  selectedService: K8sService | null;
  selectedIngress: K8sIngress | null;
  selectedControlPlane: ControlPlaneComponent | null;
  selectedNodeId: string | null;
  selectedStatefulSet: K8sStatefulSet | null;
  selectedDaemonSet: K8sDaemonSet | null;
  selectedDeployment: K8sDeployment | null;
  selectedPV: K8sPV | null;
  selectedPVC: K8sPVC | null;
  
  // Actions
  loadScenario: (scenarioId: ScenarioId) => void;
  selectPod: (pod: K8sPod | null) => void;
  selectService: (service: K8sService | null) => void;
  selectIngress: (ingress: K8sIngress | null) => void;
  selectControlPlane: (component: ControlPlaneComponent | null) => void;
  selectNode: (nodeId: string | null) => void;
  selectStatefulSet: (sts: K8sStatefulSet | null) => void;
  selectDaemonSet: (ds: K8sDaemonSet | null) => void;
  selectDeployment: (deploy: K8sDeployment | null) => void;
  selectPV: (pv: K8sPV | null) => void;
  selectPVC: (pvc: K8sPVC | null) => void;
  clearSelection: () => void;
  
  // Simulation actions
  killPod: (podId: string) => void;
  restartPod: (podId: string) => void;
  causeOOM: (podId: string) => void;
  breakImage: (podId: string) => void;
  triggerCrashLoop: (podId: string) => void;
  toggleNodeFailure: (nodeId: string) => void;
  scaleDeployment: (deploymentId: string, replicas: number) => void;
  // Generic Actions
  addPod: (pod: K8sPod) => void;
  addPVC: (pvc: K8sPVC) => void;
  addStatefulSet: (sts: K8sStatefulSet) => void;
  addDaemonSet: (ds: K8sDaemonSet) => void;
}

export const useClusterStore = create<ClusterState>((set, get) => ({
  currentCluster: null,
  currentScenarioId: null,
  selectedPod: null,
  selectedService: null,
  selectedIngress: null,
  selectedControlPlane: null,
  selectedNodeId: null,
  selectedStatefulSet: null,
  selectedDaemonSet: null,
  selectedDeployment: null,
  selectedPV: null,
  selectedPVC: null,
  
  loadScenario: (scenarioId) => {
    set({
      currentCluster: scenarios[scenarioId],
      currentScenarioId: scenarioId,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
  
  selectPod: (pod) => {
    set({ 
      selectedPod: pod, 
      selectedService: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
  
  selectService: (service) => {
    set({ 
      selectedService: service, 
      selectedPod: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
  
  selectIngress: (ingress) => {
    set({ 
      selectedIngress: ingress, 
      selectedPod: null, 
      selectedService: null, 
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
  
  selectControlPlane: (component) => {
    set({
      selectedControlPlane: component,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
  
  selectNode: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },

  selectStatefulSet: (sts) => {
    set({
      selectedStatefulSet: sts,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedDaemonSet: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },

  selectDaemonSet: (ds) => {
    set({
      selectedDaemonSet: ds,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },

  selectDeployment: (deploy) => {
    set({
      selectedDeployment: deploy,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },

  selectPV: (pv) => {
    set({
      selectedPV: pv,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPVC: null,
    });
  },

  selectPVC: (pvc) => {
    set({
      selectedPVC: pvc,
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPV: null,
    });
  },
  
  clearSelection: () => {
    set({ 
      selectedPod: null, 
      selectedService: null, 
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedDeployment: null,
      selectedPV: null,
      selectedPVC: null,
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
            nodes: cluster.nodes.map(n => n.id === nodeId ? { ...n, status: newStatus as unknown as ResourceStatus } : n),
            // If node fails, pods become unknown/terminating logic (simplified for viz)
        }
    });
  },

  // Simulation: Scale Deployment
  scaleDeployment: (deploymentId, replicas) => {
    // ... existing implementation ...
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
      // 1. Resolve Template Pod (Critical for scaling from 0)
      let templatePod = cluster.pods.find(p => deployment.podIds.includes(p.id));
      
      if (!templatePod) {
          // If no running pods, fallback to original scenario to find what a pod "should" look like
          const currentScenarioId = get().currentScenarioId || 'healthy';
          const originalScenario = scenarios[currentScenarioId];
          const originalDeploy = originalScenario?.deployments.find(d => d.id === deploymentId);
          if (originalDeploy && originalDeploy.podIds.length > 0) {
              templatePod = originalScenario.pods.find(p => p.id === originalDeploy.podIds[0]);
          }
      }
      
      // Safety fallback (should rarely be hit if data is correct)
      templatePod = templatePod || cluster.pods[0];


      // Helpers for resource parsing
      const parseCpu = (val: string) => val.endsWith('m') ? parseInt(val) / 1000 : parseFloat(val);
      const parseMem = (val: string) => {
        if (val.endsWith('Gi')) return parseFloat(val) * 1024;
        if (val.endsWith('Mi')) return parseFloat(val);
        return parseFloat(val); // Assume Mi if no unit (simplification)
      };

      for (let i = 0; i < countToAdd; i++) {
        const newId = `${deployment.name}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Find a node with available resources
        let selectedNode: typeof workerNodes[0] | undefined;
        
        // Shuffle start index for simple load balancing distribution
        const startIndex = Math.floor(Math.random() * workerNodes.length);
        
        for (let j = 0; j < workerNodes.length; j++) {
            const node = workerNodes[(startIndex + j) % workerNodes.length];
            
            // Calculate current usage
            const nodePods = updatedPods.filter(p => p.nodeId === node.id);
            const usedCpu = nodePods.reduce((acc, p) => acc + parseCpu(p.containers[0].resources?.requests.cpu || '0'), 0);
            const usedMem = nodePods.reduce((acc, p) => acc + parseMem(p.containers[0].resources?.requests.memory || '0'), 0);
            
            const requestedCpu = parseCpu(templatePod.containers[0].resources?.requests.cpu || '100m');
            const requestedMem = parseMem(templatePod.containers[0].resources?.requests.memory || '128Mi');
            
            if (usedCpu + requestedCpu <= node.cpu.total && usedMem + requestedMem <= node.memory.total) {
                selectedNode = node;
                break;
            }
        }

        const isPending = !selectedNode;
        
        const newPod: K8sPod = {
            ...templatePod,
            id: newId,
            name: newId,
            nodeId: selectedNode?.id || '',  // No node if pending
            nodeName: selectedNode?.name || '',
            phase: isPending ? 'Pending' : 'Running',
            status: isPending ? 'pending' : 'running',
            createdAt: new Date().toISOString(),
            restarts: 0,
            conditions: isPending ? [
                 { type: 'PodScheduled', status: 'False', reason: 'Unschedulable', message: '0/3 nodes are available: 3 Insufficient cpu.' }
            ] : [
                { type: 'Initialized', status: 'True' },
                { type: 'Ready', status: 'True' },
                { type: 'ContainersReady', status: 'True' },
                { type: 'PodScheduled', status: 'True' },
            ],
            containers: templatePod.containers.map(c => ({ 
                ...c, 
                state: isPending ? 'waiting' : 'running', 
                ready: !isPending, 
                restarts: 0,
                waitingReason: isPending ? 'ContainerCreating' : undefined,
                terminatedReason: undefined
            })),
            events: isPending ? [
                { type: 'Warning', reason: 'FailedScheduling', message: '0/3 nodes are available: 3 Insufficient cpu.', timestamp: new Date().toISOString(), count: 1 }
            ] : [
                { type: 'Normal', reason: 'Scheduled', message: `Successfully assigned to ${selectedNode?.name}`, timestamp: new Date().toISOString(), count: 1 }
            ]
        };

        updatedPods.push(newPod);
        
        // Update Deployment pod list
         updatedDeployments = updatedDeployments.map(d => 
            d.id === deploymentId ? { ...d, podIds: [...d.podIds, newId] } : d
         );
         
         // Update Service pod list using LABEL SELECTORS (Correct K8s Behavior)
         if (!isPending) {
             updatedServices = updatedServices.map(s => {
                // Check if service selector matches the deployment selector (which the pod inherits)
                const isMatch = s.selector && Object.entries(s.selector).every(([key, val]) => deployment.selector[key] === val);
                
                if (isMatch) {
                    return { ...s, podIds: [...s.podIds, newId] };
                }
                return s;
             });
         }
      }
      
    } else if (replicas < currentReplicas) {
      // Scale DOWN
      const countToRemove = currentReplicas - replicas;
      const podIdsToRemove = deployment.podIds.slice(-countToRemove);
      updatedPods = updatedPods.filter(p => !podIdsToRemove.includes(p.id));
      updatedDeployments = updatedDeployments.map(d => 
        d.id === deploymentId 
            ? { ...d, podIds: d.podIds.filter(id => !podIdsToRemove.includes(id)) } 
            : d
      );
      updatedServices = updatedServices.map(s => ({
          ...s,
          podIds: s.podIds.filter(id => !podIdsToRemove.includes(id))
      }));
    }
    
    // Recalculate Ready/Available counts for the deployment
    const finalDeploymentPods = updatedPods.filter(p => 
        updatedDeployments.find(d => d.id === deploymentId)?.podIds.includes(p.id)
    );
    const readyCount = finalDeploymentPods.filter(p => p.status === 'running' || p.phase === 'Running').length;
    
    updatedDeployments = updatedDeployments.map(d => 
        d.id === deploymentId 
            ? { ...d, replicas: { ...d.replicas, ready: readyCount, available: readyCount } }
            : d
    );

    set({
        currentCluster: {
            ...cluster,
            deployments: updatedDeployments,
            pods: updatedPods,
            services: updatedServices,
        }
    });
  },

  addPod: (pod) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        pods: [...cluster.pods, pod],
      },
    });
  },

  addPVC: (pvc) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        pvcs: [...(cluster.pvcs || []), pvc],
      },
    });
  },

  addStatefulSet: (sts) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        statefulSets: [...(cluster.statefulSets || []), sts],
      },
    });
  },

  addDaemonSet: (ds) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        daemonSets: [...(cluster.daemonSets || []), ds],
      },
    });
  },
}));
