import type { K8sPod } from '@/types';

// ============ HELPER: Create Healthy Pod ============
export const createHealthyPod = (
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
        requests: { cpu: '500m', memory: '512Mi' },
        limits: { cpu: '1000m', memory: '1024Mi' },
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
