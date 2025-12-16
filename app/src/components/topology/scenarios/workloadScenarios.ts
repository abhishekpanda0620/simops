import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runScaleDeploymentScenario(
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

export function runDeployStatefulSetScenario(
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

export function runDeployDaemonSetScenario(
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

export function runJobScenario(
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
