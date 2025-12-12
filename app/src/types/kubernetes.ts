// Kubernetes Resource Types - Complete Architecture

// ============ POD STATUS TYPES ============
export type PodPhase = 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown';

export type ContainerState = 
  | 'running'
  | 'waiting'
  | 'terminated';

export type ContainerWaitingReason =
  | 'ContainerCreating'
  | 'CrashLoopBackOff'
  | 'ImagePullBackOff'
  | 'ErrImagePull'
  | 'CreateContainerConfigError'
  | 'InvalidImageName'
  | 'PodInitializing';

export type ContainerTerminatedReason =
  | 'Completed'
  | 'Error'
  | 'OOMKilled'
  | 'ContainerCannotRun'
  | 'DeadlineExceeded';

export type PodConditionReason =
  | 'Unschedulable'        // No node with enough resources
  | 'SchedulingGated'      // Waiting for scheduling gate
  | 'ContainersNotReady'   // Containers still starting
  | 'PodCompleted';        // All containers finished

// ============ RESOURCE STATUS ============
export type ResourceStatus = 'running' | 'pending' | 'failed' | 'succeeded' | 'unknown';

// ============ CONTROL PLANE ============
export interface ControlPlane {
  apiServer: ControlPlaneComponent;
  etcd: ControlPlaneComponent;
  controllerManager: ControlPlaneComponent;
  scheduler: ControlPlaneComponent;
}

export interface ControlPlaneComponent {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  description: string;
}

// ============ NODES ============
export interface K8sNode {
  id: string;
  name: string;
  status: ResourceStatus;
  role: 'control-plane' | 'worker';
  conditions: NodeCondition[];
  cpu: { used: number; total: number; unit: 'cores' };
  memory: { used: number; total: number; unit: 'Mi' };
  pods: string[]; // Pod IDs running on this node
  kubeletVersion: string;
  containerRuntime: string;
}

export interface NodeCondition {
  type: 'Ready' | 'MemoryPressure' | 'DiskPressure' | 'PIDPressure' | 'NetworkUnavailable';
  status: 'True' | 'False' | 'Unknown';
  reason?: string;
  message?: string;
}

// ============ PODS ============
export interface K8sPod {
  id: string;
  name: string;
  namespace: string;
  phase: PodPhase;
  status: ResourceStatus; // Derived from phase for visualization
  conditions: PodCondition[];
  restarts: number;
  containers: Container[];
  initContainers?: Container[];
  labels: Record<string, string>;
  nodeId: string;
  nodeName: string;
  serviceIds: string[];
  events: K8sEvent[];
  createdAt: string;
  startedAt?: string;
}

export interface PodCondition {
  type: 'Initialized' | 'Ready' | 'ContainersReady' | 'PodScheduled';
  status: 'True' | 'False' | 'Unknown';
  reason?: PodConditionReason;
  message?: string;
}

export interface Container {
  name: string;
  image: string;
  state: ContainerState;
  waitingReason?: ContainerWaitingReason;
  terminatedReason?: ContainerTerminatedReason;
  ready: boolean;
  restarts: number;
  lastRestartAt?: string;
  resources?: ContainerResources;
}

export interface ContainerResources {
  requests: { cpu: string; memory: string };
  limits: { cpu: string; memory: string };
  usage?: { cpu: number; memory: number }; // Current usage in millicores / Mi
}

// ============ EVENTS ============
export interface K8sEvent {
  type: 'Normal' | 'Warning';
  reason: string;
  message: string;
  timestamp: string;
  count: number;
}

// ============ SERVICES ============
export interface K8sService {
  id: string;
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  clusterIP: string;
  ports: ServicePort[];
  selector: Record<string, string>;
  podIds: string[];
}

export interface ServicePort {
  name?: string;
  port: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP';
  nodePort?: number;
}

// ============ INGRESS ============
export interface K8sIngress {
  id: string;
  name: string;
  namespace: string;
  host: string;
  paths: IngressPath[];
}

export interface IngressPath {
  path: string;
  pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
  serviceId: string;
  port: number;
}

// ============ DEPLOYMENTS ============
export interface K8sDeployment {
  id: string;
  name: string;
  namespace: string;
  replicas: { desired: number; ready: number; available: number };
  selector: Record<string, string>;
  podIds: string[];
  strategy: 'RollingUpdate' | 'Recreate';
}

// ============ CLUSTER SNAPSHOT ============
export interface ClusterSnapshot {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  controlPlane: ControlPlane;
  nodes: K8sNode[];
  pods: K8sPod[];
  services: K8sService[];
  ingresses: K8sIngress[];
  deployments: K8sDeployment[];
}

// ============ SCENARIO ACTIONS ============
export interface ScenarioAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  execute: () => void;
}
