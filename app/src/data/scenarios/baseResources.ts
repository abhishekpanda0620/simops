import type { ControlPlane, K8sNode, K8sPod, K8sService, K8sIngress, K8sDeployment, K8sPV, K8sPVC, K8sConfigMap, K8sSecret, K8sJob, K8sCronJob } from '@/types';
import { createHealthyPod } from './utils';

// ============ CONTROL PLANE ============
export const healthyControlPlane: ControlPlane = {
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
export const createNodes = (): K8sNode[] => [
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
    kubeletVersion: 'v1.34.0',
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
    kubeletVersion: 'v1.34.0',
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
    kubeletVersion: 'v1.34.0',
    containerRuntime: 'containerd://1.7.0',
  },
];

// ============ HEALTHY PODS ============
export const createHealthyPods = (): K8sPod[] => [
  createHealthyPod('pod-frontend-1', 'frontend-7d8f9b6c5-abc12', 'node-worker-1', 'worker-1', 'frontend', 'nginx:1.25', ['svc-frontend'], { app: 'frontend', tier: 'web' }),
  createHealthyPod('pod-frontend-2', 'frontend-7d8f9b6c5-def34', 'node-worker-1', 'worker-1', 'frontend', 'nginx:1.25', ['svc-frontend'], { app: 'frontend', tier: 'web' }),
  createHealthyPod('pod-api-1', 'api-5c4d3b2a1-ghi56', 'node-worker-1', 'worker-1', 'api', 'myapp/api:v2.1.0', ['svc-api'], { app: 'api', tier: 'backend' }),
  createHealthyPod('pod-api-2', 'api-5c4d3b2a1-jkl78', 'node-worker-2', 'worker-2', 'api', 'myapp/api:v2.1.0', ['svc-api'], { app: 'api', tier: 'backend' }),
  createHealthyPod('pod-db-1', 'postgres-0', 'node-worker-2', 'worker-2', 'postgres', 'postgres:15', ['svc-postgres'], { app: 'postgres', tier: 'database' }),
  createHealthyPod('pod-cache-1', 'redis-0', 'node-worker-2', 'worker-2', 'redis', 'redis:7', ['svc-redis'], { app: 'redis', tier: 'cache' }),
  
  // DEMO: Pod with Init Container
  {
    ...createHealthyPod('pod-demo-init', 'job-processor-init', 'node-worker-1', 'worker-1', 'processor', 'myapp/processor:v1', [], { app: 'processor' }),
    initContainers: [
        {
            name: 'init-schema',
            image: 'busybox',
            state: 'terminated',
            terminatedReason: 'Completed',
            ready: true,
            restarts: 0,
        }
    ]
  },

  // DEMO: Pod with Sidecar (Multi-container)
  {
    ...createHealthyPod('pod-demo-sidecar', 'logging-stack-v1', 'node-worker-2', 'worker-2', 'main-app', 'myapp/server:v1', [], { app: 'logging-stack' }),
    containers: [
        {
            name: 'main-app',
            image: 'myapp/server:v1',
            state: 'running',
            ready: true,
            restarts: 0,
            resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '200m', memory: '256Mi' } }
        },
        {
            name: 'log-shipper',
            image: 'fluentd:v1.16',
            state: 'running',
            ready: true,
            restarts: 0,
            resources: { requests: { cpu: '50m', memory: '64Mi' }, limits: { cpu: '100m', memory: '128Mi' } }
        }
    ]
  }
];

// ============ SERVICES ============
export const createServices = (): K8sService[] => [
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
export const createIngresses = (): K8sIngress[] => [
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
export const createDeployments = (): K8sDeployment[] => [
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

// ============ STORAGE ============
export const createPVs = (): K8sPV[] => [
    {
        id: 'pv-postgres',
        name: 'pv-postgres-data-0',
        capacity: '10Gi',
        accessModes: ['ReadWriteOnce'],
        reclaimPolicy: 'Retain',
        status: 'Bound',
        storageClass: 'standard',
        claimId: 'pvc-postgres'
    },
    {
        id: 'pv-redis',
        name: 'pv-redis-data-0',
        capacity: '5Gi',
        accessModes: ['ReadWriteOnce'],
        reclaimPolicy: 'Delete',
        status: 'Available',
        storageClass: 'fast-ssd',
    }
];

export const createPVCs = (): K8sPVC[] => [
    {
        id: 'pvc-postgres',
        name: 'postgres-data-claim',
        namespace: 'default',
        status: 'Bound',
        capacity: '10Gi',
        accessModes: ['ReadWriteOnce'],
        storageClass: 'standard',
        volumeName: 'pv-postgres-data-0'
    }
];

// ============ CONFIGURATION ============
export const createConfigMaps = (): K8sConfigMap[] => [
    {
        id: 'cm-nginx',
        name: 'nginx-config',
        namespace: 'default',
        data: {
             'nginx.conf': 'server { listen 80; location / { root /usr/share/nginx/html; } }',
             'extra-settings': 'gzip on;'
        },
        createdAt: '2024-12-11T10:00:00Z',
    },
    {
        id: 'cm-game',
        name: 'game-settings',
        namespace: 'default',
        data: {
             'difficulty': 'hard',
             'max_players': '10'
        },
        createdAt: '2024-12-11T10:00:00Z',
    }
];

export const createSecrets = (): K8sSecret[] => [
    {
        id: 'secret-db',
        name: 'db-credentials',
        namespace: 'default',
        type: 'Opaque',
        data: {
             'username': 'YWRtaW4=', // admin
             'password': 'cGFzc3dvcmQxMjM=' // password123
        },
        createdAt: '2024-12-11T10:00:00Z',
    },
    {
        id: 'secret-tls',
        name: 'tls-cert',
        namespace: 'default',
        type: 'Opaque',
        data: {
             'tls.crt': 'LS0tLS1CRUdJTiBDRV...',
             'tls.key': 'LS0tLS1CRUdJTiBQUkk...'
        },
        createdAt: '2024-12-11T10:00:00Z',
    }
];

// ============ JOBS ============
export const createJobs = (): K8sJob[] => [
    {
        id: 'job-backup',
        name: 'db-backup-manual',
        namespace: 'default',
        completions: { desired: 1, succeeded: 1 },
        parallelism: 1,
        selector: { 'job-name': 'db-backup-manual' },
        podIds: ['pod-job-backup-123'], // Assuming we might want to show completed pods later
        status: 'Complete'
    }
];

// ============ CRONJOBS ============
export const createCronJobs = (): K8sCronJob[] => [
    {
        id: 'cron-report',
        name: 'daily-report',
        namespace: 'default',
        schedule: '0 0 * * *',
        suspend: false,
        active: 0,
        lastScheduleTime: '2024-12-11T00:00:00Z'
    }
];
