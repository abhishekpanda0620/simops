import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runCreatePodScenario(
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

export function runGetPodsScenario(
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

export function runDeletePodScenario(
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
