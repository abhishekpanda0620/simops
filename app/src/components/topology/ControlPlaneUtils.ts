export type ControlPlanePhase = 'idle' | 'kubectl' | 'api-server' | 'etcd' | 'scheduler' | 'controller' | 'node-assign' | 'kube-proxy' | 'kubelet' | 'node-flow' | 'complete';
export type ControlPlaneScenario = 'create-pod' | 'get-pods' | 'delete-pod' | 'scale-deployment' | 'node-failure' | 'worker-flow' | 'deploy-statefulset' | 'deploy-daemonset' | 'run-job' | 'manage-configmap' | 'manage-secret';

export interface ControlPlaneState {
  isFlowing: boolean;
  phase: ControlPlanePhase;
  message: string;
  scenario: ControlPlaneScenario;
}

// Helper to check highlight status
export function isControlPlaneActive(
  component: 'kubectl' | 'api-server' | 'etcd' | 'scheduler' | 'controller',
  currentPhase: ControlPlanePhase
): boolean {
  switch (component) {
    case 'kubectl':
      return currentPhase === 'kubectl' || currentPhase === 'complete';
    case 'api-server':
      // API Server is central hub
      return ['api-server', 'etcd', 'scheduler', 'controller', 'node-assign'].includes(currentPhase);
    case 'etcd':
      return currentPhase === 'etcd';
    case 'scheduler':
      return currentPhase === 'scheduler';
    case 'controller':
      return currentPhase === 'controller';
    default:
      return false;
  }
}
