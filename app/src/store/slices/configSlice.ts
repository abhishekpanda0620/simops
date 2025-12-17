import type { StoreSlice } from './types';
import type { K8sConfigMap, K8sSecret, K8sPVC } from '@/types';

export interface ConfigSlice {
  addConfigMap: (cm: K8sConfigMap) => void;
  addSecret: (secret: K8sSecret) => void;
  addPVC: (pvc: K8sPVC) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  addConfigMap: (cm) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        configMaps: [...(cluster.configMaps || []), cm],
      },
    });
  },

  addSecret: (secret) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        secrets: [...(cluster.secrets || []), secret],
      },
    });
  },

  addPVC: (pvc) => {
    const cluster = get().currentCluster;
    if (!cluster) return;
    
    set({
      currentCluster: {
        ...cluster,
        pvcs: [...(cluster.pvcs || []), pvc],
      },
    });
  },
});
