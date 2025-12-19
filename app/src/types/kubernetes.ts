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
  labels: Record<string, string>;
  conditions: NodeCondition[];
  cpu: { used: number; total: number; unit: 'cores' };
  memory: { used: number; total: number; unit: 'Mi' };
  pods: string[]; // Pod IDs running on this node
  kubeletVersion: string;
  containerRuntime: string;
  taints?: Taint[];
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
  nodeSelector?: Record<string, string>;
  affinity?: Affinity;
  tolerations?: Toleration[];
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
  template?: {
    metadata: { labels: Record<string, string> };
    spec: { 
      nodeSelector?: Record<string, string>;
      affinity?: Affinity; 
    };
  };
  podIds: string[];
  strategy: 'RollingUpdate' | 'Recreate';
}

// ============ STORAGE ============
export interface K8sPV {
  id: string;
  name: string;
  capacity: string;
  accessModes: Array<'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany'>;
  reclaimPolicy: 'Retain' | 'Recycle' | 'Delete';
  status: 'Available' | 'Bound' | 'Released' | 'Failed';
  claimId?: string;
  storageClass: string;
}

export interface K8sPVC {
  id: string;
  name: string;
  namespace: string;
  volumeName?: string;
  status: 'Pending' | 'Bound' | 'Lost';
  capacity: string;
  accessModes: Array<'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany'>;
  storageClass: string;
}

// ============ STATEFULSETS ============
export interface K8sStatefulSet {
  id: string;
  name: string;
  namespace: string;
  replicas: { desired: number; ready: number; current: number };
  selector: Record<string, string>;
  serviceName: string; // Governing service
  podIds: string[];
}

// ============ DAEMONSETS ============
export interface K8sDaemonSet {
  id: string;
  name: string;
  namespace: string;
  replicas: { desired: number; current: number; ready: number; available: number };
  selector: Record<string, string>;
  podIds: string[];
}
// ============ JOBS ============
export interface K8sJob {
  id: string;
  name: string;
  namespace: string;
  completions: { desired: number; succeeded: number };
  parallelism: number;
  selector: Record<string, string>;
  podIds: string[];
  status: 'Running' | 'Complete' | 'Failed';
}

// ============ CRONJOBS ============
export interface K8sCronJob {
  id: string;
  name: string;
  namespace: string;
  schedule: string;
  suspend: boolean;
  active: number;
  lastScheduleTime?: string;
}

// ============ HPA ============
export interface K8sHPA {
  id: string;
  name: string;
  namespace: string;
  targetRef: { kind: 'Deployment' | 'StatefulSet'; name: string };
  minReplicas: number;
  maxReplicas: number;
  metrics: {
      currentCpu: number; // percentage
      targetCpu: number;  // percentage
  };
  status: 'Active' | 'Scaling' | 'Stabilizing';
}

// ============ RBAC ============
export interface K8sRole {
  id: string;
  name: string;
  namespace: string;
  rules: {
    resources: string[]; // e.g., ["pods"]
    verbs: string[];     // e.g., ["get", "list"]
  }[];
}

export interface K8sRoleBinding {
  id: string;
  name: string;
  namespace: string;
  subjects: {
    kind: 'User' | 'Group' | 'ServiceAccount';
    name: string; 
    namespace?: string;
  }[];
  roleRef: {
    kind: 'Role' | 'ClusterRole';
    name: string;
    apiGroup: string;
  };
}

// ============ CONFIGURATION ============
export interface K8sConfigMap {
  id: string;
  name: string;
  namespace: string;
  data: Record<string, string>;
  createdAt: string;
}

export interface K8sSecret {
  id: string;
  name: string;
  namespace: string;
  type: 'Opaque' | 'kubernetes.io/service-account-token' | 'kubernetes.io/dockerconfigjson';
  data: Record<string, string>; // Base64 encoded values
  createdAt: string;
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
  statefulSets: K8sStatefulSet[];
  daemonSets: K8sDaemonSet[];
  pvs: K8sPV[];
  pvcs: K8sPVC[];
  configMaps: K8sConfigMap[];
  secrets: K8sSecret[];
  jobs: K8sJob[];
  cronJobs: K8sCronJob[];
  hpas: K8sHPA[];
  roles: K8sRole[];
  roleBindings: K8sRoleBinding[];
  argoApplications: ArgoApplication[];
}

// ============ SCENARIO ACTIONS ============
export interface ScenarioAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  execute: () => void;
}

// ============ SCHEDULING & AFFINITY ============
export type MatchOperator = 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';

export interface LabelSelectorRequirement {
  key: string;
  operator: MatchOperator;
  values?: string[];
}

export interface NodeSelectorTerm {
  matchExpressions: LabelSelectorRequirement[];
}

export interface NodeAffinity {
  requiredDuringSchedulingIgnoredDuringExecution?: {
    nodeSelectorTerms: NodeSelectorTerm[];
  };
}

export interface PodAffinityTerm {
  labelSelector: { matchExpressions: LabelSelectorRequirement[] };
  topologyKey: string; // e.g. "kubernetes.io/hostname"
}

export interface PodAntiAffinity {
  requiredDuringSchedulingIgnoredDuringExecution?: PodAffinityTerm[];
}

export interface Affinity {
  nodeAffinity?: NodeAffinity;
  podAntiAffinity?: PodAntiAffinity;
}

// ============ TAINTS & TOLERATIONS ============
export type TaintEffect = 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';

export interface Taint {
  key: string;
  value?: string;
  effect: TaintEffect;
}

export type TolerationOperator = 'Exists' | 'Equal';

export interface Toleration {
  key?: string;
  operator?: TolerationOperator;
  value?: string;
  effect?: TaintEffect;
  tolerationSeconds?: number;
}

// ============ NETWORK POLICIES ============
export interface NetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  podSelector: Record<string, string>;
  policyTypes: Array<'Ingress' | 'Egress'>;
  ingress?: NetworkPolicyIngressRule[];
  egress?: NetworkPolicyEgressRule[];
}

export interface NetworkPolicyIngressRule {
  from?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface NetworkPolicyEgressRule {
  to?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface NetworkPolicyPeer {
  podSelector?: { matchLabels: Record<string, string> };
  namespaceSelector?: { matchLabels: Record<string, string> };
  ipBlock?: { cidr: string; except?: string[] };
}

export interface NetworkPolicyPort {
  protocol?: 'TCP' | 'UDP' | 'SCTP';
  port?: number | string;
}

// ============ ARGOCD / CRD OPERATOR ============
export interface ArgoApplication {
  id: string;
  name: string;
  namespace: string;
  project: string;
  source: {
    repoURL: string;
    path: string;
    targetRevision: string;
  };
  destination: {
    server: string;
    namespace: string;
  };
  syncStatus: 'Synced' | 'OutOfSync' | 'Unknown';
  healthStatus: 'Healthy' | 'Progressing' | 'Degraded' | 'Missing';
}

// ============ CERT-MANAGER ============
export interface Certificate {
  id: string;
  name: string;
  namespace: string;
  secretName: string;
  issuerRef: { name: string; kind: 'Issuer' | 'ClusterIssuer' };
  dnsNames: string[];
  status: 'Pending' | 'Ready' | 'Failed';
}

export interface CertificateRequest {
  id: string;
  name: string;
  namespace: string;
  issuerRef: { name: string; kind: string };
  status: 'Pending' | 'Approved' | 'Denied' | 'Ready';
}

