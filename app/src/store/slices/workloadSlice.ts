import type { StoreSlice } from './types';
import { scenarios } from '@/data';
import type { K8sPod, K8sStatefulSet, K8sDaemonSet, K8sJob, K8sCronJob } from '@/types';

export interface WorkloadSlice {
  scaleDeployment: (deploymentId: string, replicas: number) => void;
  addStatefulSet: (sts: K8sStatefulSet) => void;
  addDaemonSet: (ds: K8sDaemonSet) => void;
  addJob: (job: K8sJob) => void;
  addCronJob: (cronJob: K8sCronJob) => void;
  completeJob: (jobId: string) => void;
}

export const createWorkloadSlice: StoreSlice<WorkloadSlice> = (set, get) => ({
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
      // 1. Resolve Template Pod
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
      
      // Safety fallback
      templatePod = templatePod || cluster.pods[0];

      // Helpers for resource parsing
      const parseCpu = (val: string) => val.endsWith('m') ? parseInt(val) / 1000 : parseFloat(val);
      const parseMem = (val: string) => {
        if (val.endsWith('Gi')) return parseFloat(val) * 1024;
        if (val.endsWith('Mi')) return parseFloat(val);
        return parseFloat(val); 
      };

      for (let i = 0; i < countToAdd; i++) {
        const newId = `${deployment.name}-${Math.random().toString(36).substr(2, 5)}`;
        
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
            nodeId: selectedNode?.id || '',  
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
         
         // Update Service pod list
         if (!isPending) {
             updatedServices = updatedServices.map(s => {
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
    
    // Recalculate Ready/Available counts
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

  addJob: (job) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        jobs: [...(cluster.jobs || []), job],
      },
    });
  },

  addCronJob: (cronJob) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
        currentCluster: {
            ...cluster,
            cronJobs: [...(cluster.cronJobs || []), cronJob],
        },
    });
  },

  completeJob: (jobId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
        currentCluster: {
            ...cluster,
            jobs: (cluster.jobs || []).map(j => 
                j.id === jobId ? { ...j, status: 'Complete', completions: { ...j.completions, succeeded: 1 } } : j
            )
        }
    });
  },
});
