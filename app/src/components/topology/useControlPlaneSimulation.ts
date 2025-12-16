import { useState, useCallback, useRef, useEffect } from 'react';
import type { ControlPlaneScenario, ControlPlaneState } from './ControlPlaneUtils';
import type { K8sPod, K8sPVC, K8sStatefulSet, K8sDaemonSet, K8sJob } from '@/types';

// Actions we can perform on the store
export interface SimulationActions {
  addPod: (pod: K8sPod) => void;
  addPVC: (pvc: K8sPVC) => void;
  removePod: (podId: string) => void;
  deletePodByName: (namePattern: string) => void;
  toggleNodeFailure: (nodeId: string) => void;
  evictNodePods: (nodeId: string) => void;
  scaleDeployment: (id: string, replicas: number) => void;
  addStatefulSet: (sts: K8sStatefulSet) => void;
  addDaemonSet: (ds: K8sDaemonSet) => void;
  addJob: (job: K8sJob) => void;
  completeJob: (jobId: string) => void;
}

export function useControlPlaneSimulation(actions?: SimulationActions) {
  const [state, setState] = useState<ControlPlaneState>({
    isFlowing: false,
    phase: 'idle',
    message: '',
    scenario: 'create-pod' // Default
  });

  // Track active timeouts
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopSimulation = useCallback(() => {
    // Clear all active timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      message: ''
    }));
  }, []);

  const setScenario = useCallback((scenario: ControlPlaneScenario) => {
    // Stop any running simulation before changing scenario
    if (state.isFlowing) {
      stopSimulation();
    }
    setState(prev => ({
      ...prev,
      scenario
    }));
  }, [state.isFlowing, stopSimulation]);

  const startSimulation = useCallback(() => {
    stopSimulation();
    
    // Slight delay to ensure clean state start
    const startTimeout = setTimeout(() => {
      const ids = runScenario(state.scenario, setState, stopSimulation, actions);
      timeoutsRef.current = [...timeoutsRef.current, ...ids];
    }, 100);
    
    timeoutsRef.current.push(startTimeout);
  }, [state.scenario, stopSimulation, actions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    state,
    setScenario,
    startSimulation,
    stopSimulation
  };
}

function runScenario(
  scenario: ControlPlaneScenario, 
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stopSimulation: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  // Common start
  const startMsg = getStartMessage(scenario);
  setState(prev => ({ ...prev, isFlowing: true, phase: 'kubectl', message: startMsg }));

  if (scenario === 'create-pod') {
    return runCreatePodScenario(setState, stopSimulation, actions);
  } else if (scenario === 'get-pods') {
    return runGetPodsScenario(setState, stopSimulation);
  } else if (scenario === 'delete-pod') {
    return runDeletePodScenario(setState, stopSimulation, actions);
  } else if (scenario === 'scale-deployment') {
    return runScaleDeploymentScenario(setState, stopSimulation, actions);
  } else if (scenario === 'node-failure') {
    return runNodeFailureScenario(setState, stopSimulation, actions);
  } else if (scenario === 'worker-flow') {
    return runWorkerFlowScenario(setState, stopSimulation);
  } else if (scenario === 'deploy-statefulset') {
    return runDeployStatefulSetScenario(setState, stopSimulation, actions);
  } else if (scenario === 'deploy-daemonset') {
    return runDeployDaemonSetScenario(setState, stopSimulation, actions);
  } else if (scenario === 'run-job') {
    return runJobScenario(setState, stopSimulation, actions);
  }
  return [];
}

function getStartMessage(scenario: ControlPlaneScenario) {
  switch (scenario) {
    case 'create-pod': return '$ kubectl create pod nginx';
    case 'get-pods': return '$ kubectl get pods';
    case 'delete-pod': return '$ kubectl delete pod nginx';
    case 'scale-deployment': return '$ kubectl scale deploy nginx --replicas=5';
    case 'node-failure': return '# Simulating Node Power Failure...';
    case 'worker-flow': return '# Simulating Kube-Proxy & Kubelet Flow...';
    case 'deploy-statefulset': return '$ kubectl apply -f statefulset.yaml';
    case 'deploy-daemonset': return '$ kubectl apply -f daemonset.yaml';
    case 'run-job': return '$ kubectl apply -f job.yaml';
    default: return '';
  }
}

function runCreatePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server receives request
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating & Validating...' })), 2000));
  // 2. Write to etcd
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Pod configuration' })), 4000));
  // 3. Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Detected unbound pod, selecting node...' })), 6500));
  // 4. Node assignment  - ACTUAL ACTION
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (Node 1): Starting container...' }));
      if (actions) {
          actions.addPod({
              id: `nginx-${Math.random().toString(36).substr(2, 5)}`,
              name: 'nginx-demo',
              namespace: 'default',
              nodeId: 'node-worker-1',
              nodeName: 'worker-1',
              phase: 'Running',
              status: 'running',
              createdAt: new Date().toISOString(),
              restarts: 0,
              conditions: [],
              containers: [{ name: 'nginx', image: 'nginx:latest', state: 'running', ready: true, restarts: 0 }],
              events: [],
              labels: { app: 'nginx' },
              serviceIds: []
          });
      }
  }, 9000));
  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Running!' })), 12000));
  timeouts.push(setTimeout(stop, 14000));
  
  return timeouts;
}

function runGetPodsScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating...' })), 1500));
  // 2. etcd (Read)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Reading Pods list' })), 3000));
  // 3. API Server (Response)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Returning data' })), 5000));
  // 4. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'kubectl: Listed 3 pods' })), 7000));
  timeouts.push(setTimeout(stop, 9000));
  
  return timeouts;
}

function runDeletePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating delete request...' })), 2000));
  // 2. etcd (Mark deleted)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Marking Pod as deletionCandidate' })), 4000));
  // 3. Controller Manager (GC)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Recognizing deletion event...' })), 6500));
  // 4. Node (Kill)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Stopping container...' })), 9000));
  // 5. etcd (Remove) - ACTUAL ACTION
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Removing Pod data permanently' }));
      if (actions) {
          actions.deletePodByName('nginx');
      }
  }, 11500));
  
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Deleted' })), 14000));
  timeouts.push(setTimeout(stop, 16000));
  
  return timeouts;
}

function runScaleDeploymentScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating scale request...' })), 2000));
  // 2. etcd (Update spec)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Updating Deployment replicas to 5' })), 4000));
  // 3. Controller Manager (ReplicaSet)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller (ReplicaSet): Detected missing pods...' })), 6500));
  
  // 4. Scheduler & Node Assign - ACTUAL ACTION
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning nodes for new pods...' }));
      if (actions) {
          // Scale 'web-frontend' deployment to 5
          // We assume 'web-frontend' exists as it's part of the default/healthy scenario
          actions.scaleDeployment('dep-frontend', 5);
      }
  }, 9000));

  // 5. Node (Start containers)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Starting new containers...' })), 11500));
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Deployment Scaled' })), 14000));
  timeouts.push(setTimeout(stop, 16000));
  
  return timeouts;
}

function runNodeFailureScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  // 0. Trigger Failure - ACTUAL ACTION
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'controller', message: 'Simulating Power Failure on Node 2...' }));
      if (actions) {
          actions.toggleNodeFailure('node-worker-2');
      }
  }, 1000));

  // 1. Controller Manager (Heartbeat check)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Heartbeat missing from Node 2...' })), 3000));
  
  // 2. Controller Manager (Mark NodeLost)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Marking Node 2 as NotReady' })), 5000));
  
  // 3. Controller (Eviction) - ACTUAL ACTION
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'controller', message: 'Controller: Evicting pods from failed node...' }));
      if (actions) {
          actions.evictNodePods('node-worker-2');
      }
  }, 7500));
  
  // 4. API Server (Update state)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Updating Pod status to Pending' })), 9500));
  
   // 5. Scheduler (Reschedule) - ACTUAL ACTION (Implicit via Deployment reconciliation or manual add)
   // For simulation, we'll manually "reschedule" a pod to Node 1 to show recovery
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Detected pending pods, assigning to Node 1...' }));
      // We rely on the user seeing the 'Pending' pods or we could explicitly 'fix' one.
      // Let's just leave them pending/evicted to show the effect, OR
      // we can auto-recover one pod to complete the story.
      if (actions) {
          // Add a replacement pod to Node 1
          actions.addPod({
              id: `nginx-recovered-${Math.random().toString(36).substr(2, 5)}`,
              name: 'nginx-recovered',
              namespace: 'default',
              nodeId: 'node-worker-1',
              nodeName: 'worker-1',
              phase: 'Running',
              status: 'running',
              createdAt: new Date().toISOString(),
              restarts: 0,
              conditions: [],
              containers: [{ name: 'nginx', image: 'nginx:latest', state: 'running', ready: true, restarts: 0 }],
              events: [],
              labels: { app: 'nginx' },
              serviceIds: []
          });
      }
  }, 12000));
  
  // 6. Node (Start new pods)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (Node 1): Starting recovered pods...' })), 14500));
  
  // 7. Complete - Restore Node so simulation is replayable without hard refresh?
  // Let's leave it failed so user sees the red node. They can refresh to reset.
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Recovery Complete' })), 17000));
  timeouts.push(setTimeout(stop, 19000));
  
  return timeouts;
}

function runWorkerFlowScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  // 1. API Server (Service Update)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Service endpoints updated...' })), 2000));
  
  // 2. Kube-Proxy (Watch & Update)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'kube-proxy', message: 'kube-proxy: Watching API Server for Service changes...' })), 4500));
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'kube-proxy', message: 'kube-proxy: Updating iptables/IPVS rules...' })), 7000));

  // 3. Kubelet (Pod Sync)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'kubelet', message: 'kubelet: Syncing Pod status with API Server...' })), 10000));
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'kubelet', message: 'kubelet: Ensuring containers are healthy...' })), 12500));

  // 4. Node Flow (Traffic Simulation)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-flow', message: 'Node: Traffic routing rules active' })), 15000));

  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Worker Node Sync Complete' })), 17500));
  timeouts.push(setTimeout(stop, 19500));

  return timeouts;
}

function runDeployStatefulSetScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  // 1. API Server
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating StatefulSet spec...' }));
    // Persist STS to store (etcd)
    if (actions) {
       actions.addStatefulSet({
           id: 'sts-web',
           name: 'web',
           namespace: 'default',
           replicas: { desired: 2, ready: 0, current: 0 },
           selector: { app: 'web' },
           serviceName: 'nginx',
           podIds: []
       });
    }
  }, 2000));
  
  // 2. Controller - PVC Creation
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'controller', message: 'StatefulSet Controller: Creating PVC data-web-0...' }));
      if (actions) {
          actions.addPVC({
            id: 'pvc-web-0',
            name: 'data-web-0',
            namespace: 'default',
            status: 'Bound',
            capacity: '1Gi',
            accessModes: ['ReadWriteOnce'],
            storageClass: 'standard',
            volumeName: 'pv-web-0'
          });
      }
  }, 4000));
  
  // 3. Controller - Pod 0
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Creating Pod web-0 (Ordinal 0)...' })), 6500));
  
  // 4. Scheduler (skipped for brevity, merged with node start)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning web-0 to Node 1...' })), 8500));
  
  // 5. Node Start
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Starting web-0...' }));
      if (actions) {
          actions.addPod({
            id: 'web-0',
            name: 'web-0',
            namespace: 'default',
            nodeId: 'node-worker-1',
            nodeName: 'worker-1',
            phase: 'Running',
            status: 'running',
            createdAt: new Date().toISOString(),
            restarts: 0,
            conditions: [],
            containers: [{ name: 'nginx-stateful', image: 'nginx:alpine', state: 'running', ready: true, restarts: 0 }],
            events: [],
            labels: { app: 'web' },
            serviceIds: []
          });
      }
  }, 10500));
  
  // 6. Ordered Ready Wait
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Waiting for web-0 to be Ready...' })), 13000));
  
  // 7. Pod 1 Creation (and Node Start for Pod 1)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'controller', message: 'Controller: Pod web-0 Ready. Creating Pod web-1...' }));
       // Bonus: create PVC 1
       if (actions) {
           actions.addPVC({
             id: 'pvc-web-1',
             name: 'data-web-1',
             namespace: 'default',
             status: 'Bound',
             capacity: '1Gi',
             accessModes: ['ReadWriteOnce'],
             storageClass: 'standard',
             volumeName: 'pv-web-1'
           });
           // And Pod 1
           setTimeout(() => {
                actions.addPod({
                    id: 'web-1',
                    name: 'web-1',
                    namespace: 'default',
                    nodeId: 'node-worker-2',
                    nodeName: 'worker-2',
                    phase: 'Running',
                    status: 'running',
                    createdAt: new Date().toISOString(),
                    restarts: 0,
                    conditions: [],
                    containers: [{ name: 'nginx-stateful', image: 'nginx:alpine', state: 'running', ready: true, restarts: 0 }],
                    events: [],
                    labels: { app: 'web' },
                    serviceIds: []
                });
           }, 2000); // Slight delay for visual
       }
  }, 15500));
  
  // 8. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'StatefulSet Deployed (Ordered)' })), 19000));
  timeouts.push(setTimeout(stop, 21000));

  return timeouts;
}

function runDeployDaemonSetScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  // 1. API Server
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating DaemonSet spec...' }));
      // Persist DS to store (etcd)
      if (actions) {
         actions.addDaemonSet({
             id: 'ds-monitoring',
             name: 'monitoring-agent',
             namespace: 'monitoring',
             replicas: { desired: 2, current: 0, ready: 0, available: 0 }, // assuming 2 nodes
             selector: { app: 'monitoring' },
             podIds: []
         });
      }
  }, 2000));
  
  // 2. Controller
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'DaemonSet Controller: Calculating eligible nodes...' })), 4000));
  
  // 3. Controller/Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Found 3 eligible nodes (All Workers)...' })), 6500));
  
  // 4. Burst Creation & Assignment (All at once)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Controller: Creating Pods on All Nodes...' }));
      if (actions && actions.addPod) {
          // Add pods to all existing worker nodes
          ['node-worker-1', 'node-worker-2'].forEach((nodeId) => {
              actions.addPod({
                  id: `monitoring-agent-${nodeId}`,
                  name: `monitoring-agent-${nodeId.split('-')[2]}`,
                  namespace: 'monitoring',
                  nodeId: nodeId,
                  nodeName: nodeId.replace('node-', ''),
                  phase: 'Running',
                  status: 'running',
                  createdAt: new Date().toISOString(),
                  restarts: 0,
                  conditions: [],
                  containers: [{ name: 'agent', image: 'monitoring:v1', state: 'running', ready: true, restarts: 0 }],
                  events: [],
                  labels: { app: 'monitoring' },
                  serviceIds: []
              });
          });
      }
  }, 9000));
  
  // 5. Node Start
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (All Nodes): Starting DaemonSet pods...' })), 11500));
  
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'DaemonSet Deployed (1 per Node)' })), 14000));
  timeouts.push(setTimeout(stop, 16000));

  return timeouts;
}

function runJobScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const jobId = `job-${Math.random().toString(36).substr(2, 5)}`;
  const podId = `pi-${jobId}`;
  
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating Job spec...' })), 2000));
  
  // 2. Controller - Create Job
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Job Controller: Creating Job resource...' }));
    if (actions) {
       actions.addJob({
           id: jobId,
           name: 'batch-processor',
           namespace: 'default',
           completions: { desired: 1, succeeded: 0 },
           parallelism: 1,
           selector: { 'job-name': 'batch-processor' },
           podIds: [podId],
           status: 'Running'
       });
    }
  }, 4000));
  
  // 3. Controller - Create Pod
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Job Controller: Creating Pod for Job...' })), 6500));
  
  // 4. Scheduler (simplified)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning Job Pod to Node...' })), 8500));
  
  // 5. Node Start (Running)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Starting Job Pod...' }));
      if (actions) {
          actions.addPod({
              id: podId,
              name: `batch-processor-${podId}`,
              namespace: 'default',
              nodeId: 'node-worker-2',
              nodeName: 'worker-2',
              phase: 'Running',
              status: 'running',
              createdAt: new Date().toISOString(),
              restarts: 0,
              conditions: [],
              containers: [{ name: 'processor', image: 'perl', state: 'running', ready: true, restarts: 0 }],
              events: [],
              labels: { 'job-name': 'batch-processor' },
              serviceIds: []
          });
      }
  }, 10500));
  
  // 6. Execution (Wait)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-flow', message: 'Container: Processing data (Sleep 3s)...' })), 13000));
  
  // 7. Success
  timeouts.push(setTimeout(() => {
     setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Pod Succeeded! Notifying Controller...' }));
     if (actions) {
         actions.completeJob(jobId);
         // Visual fix: Update the pod to Succeeded (for now, simply relying on Job status update)
         // In a real K8s, the pod Phase goes to Succeeded.
         // We'll leave the pod as Running in the visual for now, but the Job will turn Green.
     }
  }, 16000));
  
  // 8. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Job Complete (1/1 Succeeded)' })), 18500));
  timeouts.push(setTimeout(stop, 20500));

  return timeouts;
}
