import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runHPAScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const hpaId = `hpa-${Math.random().toString(36).substr(2, 5)}`;
  
  // 1. Setup - Create Deployment & HPA
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Creating HPA for php-apache...' }));
      if (actions && actions.addHPA) {
          actions.addHPA({
              id: hpaId,
              name: 'php-apache-hpa',
              namespace: 'default',
              targetRef: { kind: 'Deployment', name: 'php-apache' },
              minReplicas: 1,
              maxReplicas: 10,
              metrics: { currentCpu: 10, targetCpu: 50 },
              status: 'Active'
          });
      }
  }, 2000));
  
  // 2. Initial State (Low Load)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'idle', message: 'Metrics Server: Current CPU Load: 10% (Target: 50%)' })), 4000));
  
  // 3. Traffic Spike (Simulated)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-flow', message: 'WARNING: Traffic Spike Detected! CPU Usage -> 200%' }));
      if (actions && actions.updateHPA) {
          actions.updateHPA(hpaId, 200);
      }
  }, 7000));
  
  // 4. HPA Notice (Controller)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'HPA Controller: Metric (200%) > Target (50%). Caclulating scale...' })), 10000));
  
  // 5. Scale Calculation (200/50 * 1 = 4 replicas)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'HPA Controller: Desired Replicas = 4. Updating Deployment...' })), 12500));
  
  // 6. Scale Deployment
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Deployment Controller: Scaling up to 4 replicas...' }));
    if (actions && actions.scaleDeployment) {
        // We assume 'php-apache' deployment exists or we map to our generic frontend for demo
        // For this demo, let's scale the 'frontend' if php-apache isn't there, or creating dummy logic.
        // Actually, let's scale the 'dep-frontend' to 4 to see the visual effect
        actions.scaleDeployment('dep-frontend', 4);
    }
  }, 14500));
  
  // 7. Stabilization
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Metrics Server: Load balancing across 4 pods... CPU -> 45%' }));
    if (actions && actions.updateHPA) {
        actions.updateHPA(hpaId, 45);
    }
  }, 17000));
  
  // 8. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'HPA: Load stabilized. Scaled to 4 replicas.' })), 19500));
  timeouts.push(setTimeout(stop, 21500));
  
  return timeouts;
}

export function runRBACScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  // 1. Initial Request (Unauthorized)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating User "alice"...' })), 2000));
  
  // 2. Authorization Check (Fail)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: ❌ Error 403 Forbidden: User "alice" cannot list pods.' })), 4000));
  
  // 3. Admin Intervention (Create Role)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'kubectl', message: 'Admin: Creating "pod-reader" Role...' }));
      if (actions && actions.addRole) {
          actions.addRole({
              id: 'role-pod-reader',
              name: 'pod-reader',
              namespace: 'default',
              rules: [{ resources: ['pods'], verbs: ['get', 'list', 'watch'] }]
          });
      }
  }, 7000));
  
  // 4. Admin Intervention (Create RoleBinding)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'Admin: Bind "pod-reader" Role to User "alice"...' }));
    if (actions && actions.addRoleBinding) {
        actions.addRoleBinding({
            id: 'rb-alice-reader',
            name: 'alice-read-pods',
            namespace: 'default',
            subjects: [{ kind: 'User', name: 'alice' }],
            roleRef: { kind: 'Role', name: 'pod-reader', apiGroup: 'rbac.authorization.k8s.io' }
        });
    }
  }, 9500));
  
  // 5. Retry Request (Authorized)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'User "alice": Retrying "kubectl get pods"...' })), 12000));
  
  // 6. Authorization Check (Success)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: ✅ Authorized via "alice-read-pods" Binding.' })), 14000));
  
  // 7. Response
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Success: Pod list returned.' })), 16500));
  timeouts.push(setTimeout(stop, 18500)); // Stop slightly later

  return timeouts;
}
