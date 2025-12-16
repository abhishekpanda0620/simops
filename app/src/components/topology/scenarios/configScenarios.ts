import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runConfigMapScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const cmId = `cm-${Math.random().toString(36).substr(2, 5)}`;
  
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating ConfigMap data...' })), 2000));
  
  // 2. Etcd
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing ConfigMap "app-config"...' }));
      if (actions && actions.addConfigMap) {
          actions.addConfigMap({
              id: cmId,
              name: 'app-config',
              namespace: 'default',
              data: { 'app.properties': 'mode=production\nlog=debug' },
              createdAt: new Date().toISOString()
          });
      }
  }, 4000));
  
  // 3. Controller - Create Pod
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Creating Pod using ConfigMap...' })), 6500));
  
  // 4. Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning Pod to Node...' })), 8500));
  
  // 5. Node Start
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Mounting ConfigMap as Volume...' }));
      const podId = `pod-cm-${cmId}`;
      if (actions && actions.addPod) {
          actions.addPod({
              id: podId,
              name: 'web-app-configured',
              namespace: 'default',
              nodeId: 'node-worker-1',
              nodeName: 'worker-1',
              phase: 'Running',
              status: 'running',
              createdAt: new Date().toISOString(),
              restarts: 0,
              conditions: [],
              containers: [{ name: 'web', image: 'nginx', state: 'running', ready: true, restarts: 0 }],
              events: [],
              labels: { app: 'web' },
              serviceIds: []
          });
      }
  }, 10500));
  
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Running with ConfigMap Mounted' })), 13500));
  timeouts.push(setTimeout(stop, 15500));

  return timeouts;
}

export function runSecretScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const secretId = `secret-${Math.random().toString(36).substr(2, 5)}`;
  
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating Secret (Encoding)...' })), 2000));
  
  // 2. Etcd
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Secret (Encrypted at rest)...' }));
      if (actions && actions.addSecret) {
          actions.addSecret({
              id: secretId,
              name: 'db-creds',
              namespace: 'default',
              type: 'Opaque',
              data: { 'password': 'cGFzc3dvcmQ=' }, // Base64 'password'
              createdAt: new Date().toISOString()
          });
      }
  }, 4000));
  
  // 3. Controller
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Creating Pod using Secret...' })), 6500));
  
  // 4. Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning Pod to Node...' })), 8500));
  
  // 5. Node Start
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Injecting Secret as EnvVars...' }));
      const podId = `pod-secret-${secretId}`;
      if (actions && actions.addPod) {
          actions.addPod({
              id: podId,
              name: 'db-client-secure',
              namespace: 'default',
              nodeId: 'node-worker-2',
              nodeName: 'worker-2',
              phase: 'Running',
              status: 'running',
              createdAt: new Date().toISOString(),
              restarts: 0,
              conditions: [],
              containers: [{ name: 'client', image: 'postgres-client', state: 'running', ready: true, restarts: 0 }],
              events: [],
              labels: { app: 'db-client' },
              serviceIds: []
          });
      }
  }, 10500));
  
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Running with Secret Injected' })), 13500));
  timeouts.push(setTimeout(stop, 15500));
  
  return timeouts;
}
