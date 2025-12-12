import type { ClusterSnapshot, ControlPlane, K8sNode, K8sPod, K8sService, K8sIngress, K8sDeployment } from '@/types';

// ============ CONTROL PLANE ============
const healthyControlPlane: ControlPlane = {
  apiServer: {
    id: 'api-server',
    name: 'kube-apiserver',
    status: 'healthy',
    description: 'The API server validates and configures data for pods, services, and controllers.',
  },
  etcd: {
    id: 'etcd',
    name: 'etcd',
    status: 'healthy',
    description: 'Consistent and highly-available key-value store for all cluster data.',
  },
  controllerManager: {
    id: 'controller-manager',
    name: 'kube-controller-manager',
    status: 'healthy',
    description: 'Runs controller processes (node controller, replication controller, etc.).',
  },
  scheduler: {
    id: 'scheduler',
    name: 'kube-scheduler',
    status: 'healthy',
    description: 'Watches for newly created pods and selects nodes for them to run on.',
  },
};

// ============ NODES ============
const createNodes = (): K8sNode[] => [
  {
    id: 'node-cp-1',
    name: 'control-plane-1',
    status: 'running',
    role: 'control-plane',
    conditions: [
      { type: 'Ready', status: 'True' },
      { type: 'MemoryPressure', status: 'False' },
      { type: 'DiskPressure', status: 'False' },
      { type: 'PIDPressure', status: 'False' },
    ],
    cpu: { used: 1.2, total: 4, unit: 'cores' },
    memory: { used: 3072, total: 8192, unit: 'Mi' },
    pods: ['pod-etcd', 'pod-apiserver', 'pod-controller', 'pod-scheduler'],
    kubeletVersion: 'v1.28.4',
    containerRuntime: 'containerd://1.7.0',
  },
  {
    id: 'node-worker-1',
    name: 'worker-1',
    status: 'running',
    role: 'worker',
    conditions: [
      { type: 'Ready', status: 'True' },
      { type: 'MemoryPressure', status: 'False' },
      { type: 'DiskPressure', status: 'False' },
      { type: 'PIDPressure', status: 'False' },
    ],
    cpu: { used: 2.5, total: 8, unit: 'cores' },
    memory: { used: 6144, total: 16384, unit: 'Mi' },
    pods: ['pod-frontend-1', 'pod-frontend-2', 'pod-api-1'],
    kubeletVersion: 'v1.28.4',
    containerRuntime: 'containerd://1.7.0',
  },
  {
    id: 'node-worker-2',
    name: 'worker-2',
    status: 'running',
    role: 'worker',
    conditions: [
      { type: 'Ready', status: 'True' },
      { type: 'MemoryPressure', status: 'False' },
      { type: 'DiskPressure', status: 'False' },
      { type: 'PIDPressure', status: 'False' },
    ],
    cpu: { used: 1.8, total: 8, unit: 'cores' },
    memory: { used: 4096, total: 16384, unit: 'Mi' },
    pods: ['pod-api-2', 'pod-db-1', 'pod-cache-1'],
    kubeletVersion: 'v1.28.4',
    containerRuntime: 'containerd://1.7.0',
  },
];

// ============ HELPER: Create Healthy Pod ============
const createHealthyPod = (
  id: string,
  name: string,
  nodeId: string,
  nodeName: string,
  containerName: string,
  image: string,
  serviceIds: string[],
  labels: Record<string, string>
): K8sPod => ({
  id,
  name,
  namespace: 'default',
  phase: 'Running',
  status: 'running',
  conditions: [
    { type: 'Initialized', status: 'True' },
    { type: 'Ready', status: 'True' },
    { type: 'ContainersReady', status: 'True' },
    { type: 'PodScheduled', status: 'True' },
  ],
  restarts: 0,
  containers: [
    {
      name: containerName,
      image,
      state: 'running',
      ready: true,
      restarts: 0,
      resources: {
        requests: { cpu: '100m', memory: '128Mi' },
        limits: { cpu: '500m', memory: '512Mi' },
        usage: { cpu: 50, memory: 200 },
      },
    },
  ],
  labels,
  nodeId,
  nodeName,
  serviceIds,
  events: [
    { type: 'Normal', reason: 'Scheduled', message: `Successfully assigned default/${name} to ${nodeName}`, timestamp: '2024-12-11T10:00:00Z', count: 1 },
    { type: 'Normal', reason: 'Pulled', message: `Container image "${image}" already present on machine`, timestamp: '2024-12-11T10:00:01Z', count: 1 },
    { type: 'Normal', reason: 'Created', message: `Created container ${containerName}`, timestamp: '2024-12-11T10:00:02Z', count: 1 },
    { type: 'Normal', reason: 'Started', message: `Started container ${containerName}`, timestamp: '2024-12-11T10:00:03Z', count: 1 },
  ],
  createdAt: '2024-12-11T10:00:00Z',
  startedAt: '2024-12-11T10:00:03Z',
});

// ============ HEALTHY PODS ============
const createHealthyPods = (): K8sPod[] => [
  createHealthyPod('pod-frontend-1', 'frontend-7d8f9b6c5-abc12', 'node-worker-1', 'worker-1', 'frontend', 'nginx:1.25', ['svc-frontend'], { app: 'frontend', tier: 'web' }),
  createHealthyPod('pod-frontend-2', 'frontend-7d8f9b6c5-def34', 'node-worker-1', 'worker-1', 'frontend', 'nginx:1.25', ['svc-frontend'], { app: 'frontend', tier: 'web' }),
  createHealthyPod('pod-api-1', 'api-5c4d3b2a1-ghi56', 'node-worker-1', 'worker-1', 'api', 'myapp/api:v2.1.0', ['svc-api'], { app: 'api', tier: 'backend' }),
  createHealthyPod('pod-api-2', 'api-5c4d3b2a1-jkl78', 'node-worker-2', 'worker-2', 'api', 'myapp/api:v2.1.0', ['svc-api'], { app: 'api', tier: 'backend' }),
  createHealthyPod('pod-db-1', 'postgres-0', 'node-worker-2', 'worker-2', 'postgres', 'postgres:15', ['svc-postgres'], { app: 'postgres', tier: 'database' }),
  createHealthyPod('pod-cache-1', 'redis-0', 'node-worker-2', 'worker-2', 'redis', 'redis:7', ['svc-redis'], { app: 'redis', tier: 'cache' }),
];

// ============ SERVICES ============
const createServices = (): K8sService[] => [
  {
    id: 'svc-frontend',
    name: 'frontend',
    namespace: 'default',
    type: 'NodePort', // Accessible on each node's IP
    clusterIP: '10.96.45.12',
    ports: [{ port: 80, targetPort: 80, protocol: 'TCP', nodePort: 30080 }],
    selector: { app: 'frontend' },
    podIds: ['pod-frontend-1', 'pod-frontend-2'],
  },
  {
    id: 'svc-api',
    name: 'api',
    namespace: 'default',
    type: 'LoadBalancer', // Exposed via cloud load balancer
    clusterIP: '10.96.78.34',
    ports: [{ port: 8080, targetPort: 8080, protocol: 'TCP' }],
    selector: { app: 'api' },
    podIds: ['pod-api-1', 'pod-api-2'],
  },
  {
    id: 'svc-postgres',
    name: 'postgres',
    namespace: 'default',
    type: 'ClusterIP', // Internal only - best for databases
    clusterIP: '10.96.120.56',
    ports: [{ port: 5432, targetPort: 5432, protocol: 'TCP' }],
    selector: { app: 'postgres' },
    podIds: ['pod-db-1'],
  },
  {
    id: 'svc-redis',
    name: 'redis',
    namespace: 'default',
    type: 'ClusterIP', // Internal only - best for caches
    clusterIP: '10.96.99.78',
    ports: [{ port: 6379, targetPort: 6379, protocol: 'TCP' }],
    selector: { app: 'redis' },
    podIds: ['pod-cache-1'],
  },
];

// ============ INGRESSES ============
const createIngresses = (): K8sIngress[] => [
  {
    id: 'ingress-main',
    name: 'main-ingress',
    namespace: 'default',
    host: 'app.example.com',
    paths: [
      { path: '/', pathType: 'Prefix', serviceId: 'svc-frontend', port: 80 },
      { path: '/api', pathType: 'Prefix', serviceId: 'svc-api', port: 8080 },
    ],
  },
];

// ============ DEPLOYMENTS ============
const createDeployments = (): K8sDeployment[] => [
  {
    id: 'deploy-frontend',
    name: 'frontend',
    namespace: 'default',
    replicas: { desired: 2, ready: 2, available: 2 },
    selector: { app: 'frontend' },
    podIds: ['pod-frontend-1', 'pod-frontend-2'],
    strategy: 'RollingUpdate',
  },
  {
    id: 'deploy-api',
    name: 'api',
    namespace: 'default',
    replicas: { desired: 2, ready: 2, available: 2 },
    selector: { app: 'api' },
    podIds: ['pod-api-1', 'pod-api-2'],
    strategy: 'RollingUpdate',
  },
];

// ============ SCENARIO: HEALTHY CLUSTER ============
export const healthyCluster: ClusterSnapshot = {
  id: 'healthy-cluster',
  name: 'Production Cluster',
  description: 'All systems operational. All pods running, no errors.',
  timestamp: new Date().toISOString(),
  controlPlane: healthyControlPlane,
  nodes: createNodes(),
  pods: createHealthyPods(),
  services: createServices(),
  ingresses: createIngresses(),
  deployments: createDeployments(),
};

// ============ SCENARIO: CRASHLOOPBACKOFF ============
export const crashLoopBackOffCluster: ClusterSnapshot = {
  ...healthyCluster,
  id: 'crashloop-cluster',
  name: 'CrashLoopBackOff Scenario',
  description: 'API pod is crashing repeatedly. Container exits with error, Kubernetes keeps restarting it with exponential backoff.',
  pods: healthyCluster.pods.map((pod) =>
    pod.id === 'pod-api-1'
      ? {
          ...pod,
          phase: 'Running' as const,
          status: 'failed' as const,
          restarts: 8,
          conditions: [
            { type: 'Initialized' as const, status: 'True' as const },
            { type: 'Ready' as const, status: 'False' as const, reason: 'ContainersNotReady' as const, message: 'containers with unready status: [api]' },
            { type: 'ContainersReady' as const, status: 'False' as const },
            { type: 'PodScheduled' as const, status: 'True' as const },
          ],
          containers: [
            {
              name: 'api',
              image: 'myapp/api:v2.1.0',
              state: 'waiting' as const,
              waitingReason: 'CrashLoopBackOff' as const,
              ready: false,
              restarts: 8,
              lastRestartAt: '2024-12-11T10:15:00Z',
              resources: {
                requests: { cpu: '100m', memory: '128Mi' },
                limits: { cpu: '500m', memory: '512Mi' },
              },
            },
          ],
          events: [
            { type: 'Normal', reason: 'Scheduled', message: 'Successfully assigned default/api-5c4d3b2a1-ghi56 to worker-1', timestamp: '2024-12-11T10:00:00Z', count: 1 },
            { type: 'Normal', reason: 'Pulled', message: 'Container image "myapp/api:v2.1.0" already present', timestamp: '2024-12-11T10:00:01Z', count: 1 },
            { type: 'Normal', reason: 'Created', message: 'Created container api', timestamp: '2024-12-11T10:00:02Z', count: 8 },
            { type: 'Normal', reason: 'Started', message: 'Started container api', timestamp: '2024-12-11T10:00:03Z', count: 8 },
            { type: 'Warning', reason: 'BackOff', message: 'Back-off restarting failed container api in pod api-5c4d3b2a1-ghi56', timestamp: '2024-12-11T10:15:00Z', count: 5 },
          ],
        }
      : pod
  ),
  deployments: healthyCluster.deployments.map((deploy) =>
    deploy.id === 'deploy-api'
      ? { ...deploy, replicas: { desired: 2, ready: 1, available: 1 } }
      : deploy
  ),
};

// ============ SCENARIO: OOMKilled ============
export const oomKilledCluster: ClusterSnapshot = {
  ...healthyCluster,
  id: 'oomkilled-cluster',
  name: 'OOMKilled Scenario',
  description: 'API pod exceeded memory limits. Container was killed by the kernel OOM killer.',
  pods: healthyCluster.pods.map((pod) =>
    pod.id === 'pod-api-2'
      ? {
          ...pod,
          phase: 'Running' as const,
          status: 'failed' as const,
          restarts: 3,
          conditions: [
            { type: 'Initialized' as const, status: 'True' as const },
            { type: 'Ready' as const, status: 'False' as const, reason: 'ContainersNotReady' as const },
            { type: 'ContainersReady' as const, status: 'False' as const },
            { type: 'PodScheduled' as const, status: 'True' as const },
          ],
          containers: [
            {
              name: 'api',
              image: 'myapp/api:v2.1.0',
              state: 'terminated' as const,
              terminatedReason: 'OOMKilled' as const,
              ready: false,
              restarts: 3,
              lastRestartAt: '2024-12-11T10:20:00Z',
              resources: {
                requests: { cpu: '100m', memory: '128Mi' },
                limits: { cpu: '500m', memory: '512Mi' },
                usage: { cpu: 450, memory: 512 }, // At limit when killed
              },
            },
          ],
          events: [
            { type: 'Normal', reason: 'Scheduled', message: 'Successfully assigned default/api-5c4d3b2a1-jkl78 to worker-2', timestamp: '2024-12-11T10:00:00Z', count: 1 },
            { type: 'Warning', reason: 'OOMKilling', message: 'Memory cgroup out of memory: Killed process 12345 (api)', timestamp: '2024-12-11T10:20:00Z', count: 3 },
            { type: 'Normal', reason: 'Pulled', message: 'Container image "myapp/api:v2.1.0" already present', timestamp: '2024-12-11T10:20:01Z', count: 3 },
          ],
        }
      : pod
  ),
  nodes: healthyCluster.nodes.map((node) =>
    node.id === 'node-worker-2'
      ? { ...node, memory: { used: 15000, total: 16384, unit: 'Mi' as const } } // High memory usage
      : node
  ),
};

// ============ SCENARIO: ImagePullBackOff ============
export const imagePullBackOffCluster: ClusterSnapshot = {
  ...healthyCluster,
  id: 'imagepull-cluster',
  name: 'ImagePullBackOff Scenario',
  description: 'Frontend pod cannot pull container image. Image might not exist or registry credentials are wrong.',
  pods: healthyCluster.pods.map((pod) =>
    pod.id === 'pod-frontend-1'
      ? {
          ...pod,
          phase: 'Pending' as const,
          status: 'pending' as const,
          restarts: 0,
          conditions: [
            { type: 'Initialized' as const, status: 'True' as const },
            { type: 'Ready' as const, status: 'False' as const, reason: 'ContainersNotReady' as const },
            { type: 'ContainersReady' as const, status: 'False' as const },
            { type: 'PodScheduled' as const, status: 'True' as const },
          ],
          containers: [
            {
              name: 'frontend',
              image: 'nginx:nonexistent-tag',
              state: 'waiting' as const,
              waitingReason: 'ImagePullBackOff' as const,
              ready: false,
              restarts: 0,
            },
          ],
          events: [
            { type: 'Normal', reason: 'Scheduled', message: 'Successfully assigned default/frontend-7d8f9b6c5-abc12 to worker-1', timestamp: '2024-12-11T10:00:00Z', count: 1 },
            { type: 'Normal', reason: 'Pulling', message: 'Pulling image "nginx:nonexistent-tag"', timestamp: '2024-12-11T10:00:01Z', count: 3 },
            { type: 'Warning', reason: 'Failed', message: 'Failed to pull image "nginx:nonexistent-tag": rpc error: manifest unknown', timestamp: '2024-12-11T10:00:05Z', count: 3 },
            { type: 'Warning', reason: 'Failed', message: 'Error: ImagePullBackOff', timestamp: '2024-12-11T10:05:00Z', count: 1 },
          ],
        }
      : pod
  ),
  deployments: healthyCluster.deployments.map((deploy) =>
    deploy.id === 'deploy-frontend'
      ? { ...deploy, replicas: { desired: 2, ready: 1, available: 1 } }
      : deploy
  ),
};

// ============ SCENARIO: Pending (Unschedulable) ============
export const pendingCluster: ClusterSnapshot = {
  ...healthyCluster,
  id: 'pending-cluster',
  name: 'Pending Pod Scenario',
  description: 'New pod cannot be scheduled. No node has enough CPU/memory resources available.',
  pods: [
    ...healthyCluster.pods,
    {
      id: 'pod-api-3',
      name: 'api-5c4d3b2a1-pending',
      namespace: 'default',
      phase: 'Pending',
      status: 'pending',
      conditions: [
        { type: 'Initialized' as const, status: 'False' as const },
        { type: 'Ready' as const, status: 'False' as const },
        { type: 'ContainersReady' as const, status: 'False' as const },
        { type: 'PodScheduled' as const, status: 'False' as const, reason: 'Unschedulable' as const, message: '0/3 nodes are available: 3 Insufficient cpu.' },
      ],
      restarts: 0,
      containers: [
        {
          name: 'api',
          image: 'myapp/api:v2.1.0',
          state: 'waiting',
          waitingReason: 'ContainerCreating',
          ready: false,
          restarts: 0,
          resources: {
            requests: { cpu: '4000m', memory: '8Gi' }, // Very high request
            limits: { cpu: '8000m', memory: '16Gi' },
          },
        },
      ],
      labels: { app: 'api', tier: 'backend' },
      nodeId: '',
      nodeName: '',
      serviceIds: ['svc-api'],
      events: [
        { type: 'Warning', reason: 'FailedScheduling', message: '0/3 nodes are available: 1 node(s) had untolerated taint, 2 Insufficient cpu.', timestamp: '2024-12-11T10:25:00Z', count: 5 },
      ],
      createdAt: '2024-12-11T10:25:00Z',
    },
  ],
  deployments: healthyCluster.deployments.map((deploy) =>
    deploy.id === 'deploy-api'
      ? { ...deploy, replicas: { desired: 3, ready: 2, available: 2 }, podIds: [...deploy.podIds, 'pod-api-3'] }
      : deploy
  ),
};

// ============ SCENARIO: Node Not Ready ============
export const nodeNotReadyCluster: ClusterSnapshot = {
  ...healthyCluster,
  id: 'nodedown-cluster',
  name: 'Node Not Ready Scenario',
  description: 'Worker node has become NotReady. Pods on that node are being evicted and rescheduled.',
  nodes: healthyCluster.nodes.map((node) =>
    node.id === 'node-worker-2'
      ? {
          ...node,
          status: 'failed' as const,
          conditions: [
            { type: 'Ready' as const, status: 'Unknown' as const, reason: 'NodeStatusUnknown', message: 'Kubelet stopped posting node status.' },
            { type: 'MemoryPressure' as const, status: 'Unknown' as const },
            { type: 'DiskPressure' as const, status: 'Unknown' as const },
            { type: 'PIDPressure' as const, status: 'Unknown' as const },
          ],
        }
      : node
  ),
  pods: healthyCluster.pods.map((pod) =>
    pod.nodeId === 'node-worker-2'
      ? {
          ...pod,
          status: 'unknown' as const,
          phase: 'Unknown' as const,
          conditions: pod.conditions.map((c) => ({ ...c, status: 'Unknown' as const })),
          events: [
            ...pod.events,
            { type: 'Warning', reason: 'NodeNotReady', message: 'Node is not ready', timestamp: '2024-12-11T10:30:00Z', count: 1 },
          ],
        }
      : pod
  ),
};

// ============ EXPORT ALL SCENARIOS ============
export const scenarios = {
  healthy: healthyCluster,
  crashLoopBackOff: crashLoopBackOffCluster,
  oomKilled: oomKilledCluster,
  imagePullBackOff: imagePullBackOffCluster,
  pending: pendingCluster,
  nodeNotReady: nodeNotReadyCluster,
};

export type ScenarioId = keyof typeof scenarios;
