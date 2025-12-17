import type { StoreSlice } from './types';
import type { K8sHPA, K8sRole, K8sRoleBinding } from '@/types';

export interface PolicySlice {
  addHPA: (hpa: K8sHPA) => void;
  updateHPA: (hpaId: string, currentCpu: number) => void;
  addRole: (role: K8sRole) => void;
  addRoleBinding: (rb: K8sRoleBinding) => void;
}

export const createPolicySlice: StoreSlice<PolicySlice> = (set, get) => ({
  addHPA: (hpa) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        hpas: [...(cluster.hpas || []), hpa],
      },
    });
  },

  updateHPA: (hpaId, currentCpu) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        hpas: (cluster.hpas || []).map(h => 
          h.id === hpaId ? { ...h, metrics: { ...h.metrics, currentCpu } } : h
        ),
      },
    });
  },

  addRole: (role) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        roles: [...(cluster.roles || []), role],
      },
    });
  },

  addRoleBinding: (rb) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        roleBindings: [...(cluster.roleBindings || []), rb],
      },
    });
  },
});
