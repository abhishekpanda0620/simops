import type { K8sPod, K8sPVC, K8sStatefulSet, K8sDaemonSet, K8sJob, K8sConfigMap, K8sSecret, K8sHPA, K8sRole, K8sRoleBinding, ArgoApplication, PrometheusTarget, PrometheusAlert, JaegerTrace, IstioVirtualService, IstioDestinationRule, IstioPeerAuthentication, CircuitBreakerState } from '@/types';

export type ControlPlanePhase = 'idle' | 'kubectl' | 'api-server' | 'etcd' | 'scheduler' | 'controller' | 'node-assign' | 'kube-proxy' | 'kubelet' | 'node-flow' | 'complete';
export type ControlPlaneScenario = 'create-pod' | 'get-pods' | 'delete-pod' | 'scale-deployment' | 'node-failure' | 'worker-flow' | 'deploy-statefulset' | 'deploy-daemonset' | 'run-job' | 'manage-configmap' | 'manage-secret' | 'simulate-hpa' | 'simulate-rbac' | 'simulate-node-affinity'
  | 'simulate-pod-antiaffinity'
  | 'simulate-node-selector'
  | 'simulate-taints'
  | 'simulate-netpol'
  | 'argocd-sync'
  | 'certmanager-issue'
  | 'resource-quota'
  | 'cluster-autoscaler'
  // Observability scenarios
  | 'prometheus-scrape'
  | 'prometheus-alert'
  | 'jaeger-trace'
  | 'jaeger-error-trace'
  // Service Mesh (Istio) scenarios
  | 'istio-canary'
  | 'istio-ab-testing'
  | 'istio-fault-injection'
  | 'istio-mtls'
  | 'istio-circuit-breaker';

export interface ControlPlaneState {
  isFlowing: boolean;
  phase: ControlPlanePhase;
  message: string;
  scenario: ControlPlaneScenario;
}

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
  addConfigMap: (cm: K8sConfigMap) => void;
  addSecret: (secret: K8sSecret) => void;
  addHPA: (hpa: K8sHPA) => void;
  updateHPA: (hpaId: string, currentCpu: number) => void;
  addRole: (role: K8sRole) => void;
  addRoleBinding: (rb: K8sRoleBinding) => void;
  updateNode: (nodeId: string, updates: Partial<import('@/types').K8sNode>) => void;
  addArgoApplication: (app: ArgoApplication) => void;
  updateArgoApplication: (appId: string, updates: Partial<ArgoApplication>) => void;
  // Observability actions (optional - visual only for now)
  addPrometheusTarget?: (target: PrometheusTarget) => void;
  updatePrometheusTarget?: (targetId: string, status: 'up' | 'down') => void;
  firePrometheusAlert?: (alert: PrometheusAlert) => void;
  resolvePrometheusAlert?: (alertId: string) => void;
  addJaegerTrace?: (trace: JaegerTrace) => void;
  // Service Mesh actions (optional - visual only for now)
  addVirtualService?: (vs: IstioVirtualService) => void;
  addDestinationRule?: (dr: IstioDestinationRule) => void;
  setPeerAuthentication?: (pa: IstioPeerAuthentication) => void;
  updateCircuitBreaker?: (cb: CircuitBreakerState) => void;
}


export function getStartMessage(scenario: ControlPlaneScenario) {
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
    case 'manage-configmap': return '$ kubectl create cm app-config --from-file=config.json';
    case 'manage-secret': return '$ kubectl create secret generic db-pass --from-literal=password=***';
    case 'simulate-hpa': return '$ kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10';
    case 'simulate-rbac': return '$ kubectl get pods --as=alice';
    case 'simulate-node-affinity': return '$ kubectl apply -f deployment-gpu.yaml';
    case 'simulate-pod-antiaffinity': return '$ kubectl scale deploy redis-ha --replicas=3';
    case 'simulate-node-selector': return '$ kubectl apply -f deployment-ssd.yaml';
    case 'simulate-taints': return '$ kubectl apply -f tolerant-pod.yaml';
    case 'simulate-netpol': return '$ kubectl apply -f network-policy.yaml';
    case 'argocd-sync': return '$ kubectl apply -f application.yaml';
    case 'certmanager-issue': return '$ kubectl apply -f certificate.yaml';
    case 'resource-quota': return '$ kubectl apply -f deployment.yaml';
    case 'cluster-autoscaler': return '$ kubectl scale deploy nginx --replicas=10';
    // Observability
    case 'prometheus-scrape': return '# Prometheus: Scraping metrics from targets...';
    case 'prometheus-alert': return '# Alertmanager: Processing firing alerts...';
    case 'jaeger-trace': return '# Jaeger: Collecting distributed traces...';
    case 'jaeger-error-trace': return '# Jaeger: Tracing error propagation...';
    // Service Mesh
    case 'istio-canary': return '$ kubectl apply -f virtual-service-canary.yaml';
    case 'istio-ab-testing': return '$ kubectl apply -f virtual-service-ab.yaml';
    case 'istio-fault-injection': return '$ kubectl apply -f fault-injection.yaml';
    case 'istio-mtls': return '$ kubectl apply -f peer-authentication.yaml';
    case 'istio-circuit-breaker': return '$ kubectl apply -f destination-rule.yaml';
    default: return '';
  }
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
