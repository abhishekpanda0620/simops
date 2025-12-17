import type { StoreSlice } from './types';
import type { K8sPod } from '@/types';

export interface PodSlice {
  killPod: (podId: string) => void;
  restartPod: (podId: string) => void;
  causeOOM: (podId: string) => void;
  breakImage: (podId: string) => void;
  triggerCrashLoop: (podId: string) => void;
  removePod: (podId: string) => void;
  deletePodByName: (namePattern: string) => void;
  addPod: (pod: K8sPod) => void;
}

export const createPodSlice: StoreSlice<PodSlice> = (set, get) => ({
  killPod: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'pending' as const,
                phase: 'Pending' as const,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'waiting' as const,
                  waitingReason: 'ContainerCreating' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Normal' as const, reason: 'Killing', message: 'Stopping container', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
    
    // Simulate pod coming back after 2 seconds (self-healing)
    setTimeout(() => {
      const currentCluster = get().currentCluster;
      if (!currentCluster) return;
      
      set({
        currentCluster: {
          ...currentCluster,
          pods: currentCluster.pods.map((pod) =>
            pod.id === podId
              ? {
                  ...pod,
                  status: 'running' as const,
                  phase: 'Running' as const,
                  restarts: pod.restarts + 1,
                  containers: pod.containers.map((c) => ({
                    ...c,
                    state: 'running' as const,
                    waitingReason: undefined,
                    ready: true,
                    restarts: c.restarts + 1,
                  })),
                  events: [
                    ...pod.events,
                    { type: 'Normal' as const, reason: 'Started', message: 'Started container (recreated by controller)', timestamp: new Date().toISOString(), count: 1 },
                  ],
                }
              : pod
          ),
        },
      });
    }, 2000);
  },

  restartPod: (podId) => {
    get().killPod(podId);
  },

  causeOOM: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'failed' as const,
                phase: 'Failed' as const,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'terminated' as const,
                  terminatedReason: 'OOMKilled' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'OOMKilling', message: 'Memory cgroup out of memory: Killed process', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
  },

  breakImage: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'pending' as const,
                phase: 'Pending' as const,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'waiting' as const,
                  waitingReason: 'ImagePullBackOff' as const,
                  ready: false,
                })),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'Failed', message: `Failed to pull image "${pod.containers[0].image}": manifest unknown`, timestamp: new Date().toISOString(), count: 1 },
                  { type: 'Warning' as const, reason: 'BackOff', message: 'Back-off pulling image', timestamp: new Date().toISOString(), count: 1 },
                ],
              }
            : pod
        ),
      },
    });
  },

  triggerCrashLoop: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                status: 'failed' as const,
                phase: 'Running' as const,
                restarts: pod.restarts + 5,
                containers: pod.containers.map((c) => ({
                  ...c,
                  state: 'waiting' as const,
                  waitingReason: 'CrashLoopBackOff' as const,
                  ready: false,
                  restarts: c.restarts + 5,
                  lastRestartAt: new Date().toISOString(),
                })),
                conditions: pod.conditions.map(c => c.type === 'Ready' ? { ...c, status: 'False', message: 'Container failing' } : c),
                events: [
                  ...pod.events,
                  { type: 'Warning' as const, reason: 'BackOff', message: 'Back-off restarting failed container', timestamp: new Date().toISOString(), count: 12 },
                ],
              }
            : pod
        ),
      },
    });
  },

  removePod: (podId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.filter(p => p.id !== podId),
        deployments: cluster.deployments.map(d => ({
            ...d,
            podIds: d.podIds.filter(id => id !== podId)
        })),
        services: cluster.services.map(s => ({
            ...s,
            podIds: s.podIds.filter(id => id !== podId)
        }))
      }
    });
  },

  deletePodByName: (namePattern) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    // Find last matching pod
    const pod = cluster.pods.find(p => p.name.includes(namePattern));
    if (pod) {
        get().removePod(pod.id);
    }
  },

  addPod: (pod) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    set({
      currentCluster: {
        ...cluster,
        pods: [...cluster.pods, pod],
      },
    });
  },
});
