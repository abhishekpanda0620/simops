import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runNodeFailureScenario(
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

export function runWorkerFlowScenario(
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
