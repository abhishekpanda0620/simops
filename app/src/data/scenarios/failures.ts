import type { ClusterSnapshot } from '@/types';
import { healthyCluster } from './healthy';

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
