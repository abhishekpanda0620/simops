import type { StoreSlice } from './types';
import type { ResourceStatus, K8sPod } from '@/types';

export interface NodeSlice {
  toggleNodeFailure: (nodeId: string) => void;
  evictNodePods: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<import('@/types').K8sNode>) => void;
}

export const createNodeSlice: StoreSlice<NodeSlice> = (set, get) => ({
  toggleNodeFailure: (nodeId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;

    const node = cluster.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const isFailing = (node.status as string) === 'NotReady';
    
    const newStatus = isFailing ? 'Ready' : 'NotReady'; 

    set({
        currentCluster: {
            ...cluster,
            nodes: cluster.nodes.map(n => n.id === nodeId ? { ...n, status: newStatus as unknown as ResourceStatus } : n),
        }
    });
  },

  evictNodePods: (nodeId) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        pods: cluster.pods.map(p => {
            if (p.nodeId === nodeId) {
                return {
                    ...p,
                    status: 'pending',
                    phase: 'Pending',
                    nodeId: '', // Unassigned
                    nodeName: '',
                    conditions: [
                        ...p.conditions,
                        { type: 'Ready', status: 'False', reason: 'Evicted', message: 'Node failed' }
                    ],
                    events: [
                        ...p.events,
                        { type: 'Warning', reason: 'Evicted', message: 'Node NotReady: Evicting', timestamp: new Date().toISOString(), count: 1 }
                    ]
                } as K8sPod;
            }
            return p;
        })
      }
    });
  },

  updateNode: (nodeId, updates) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        nodes: cluster.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
      }
    });
  },

});
