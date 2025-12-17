import type { StoreSlice } from './types';
import type { ClusterSnapshot } from '@/types';
import type { ScenarioId } from '@/data';
import { scenarios } from '@/data';

export interface ClusterCoreSlice {
  currentCluster: ClusterSnapshot | null;
  currentScenarioId: ScenarioId | null;
  loadScenario: (scenarioId: ScenarioId) => void;
}

export const createClusterCoreSlice: StoreSlice<ClusterCoreSlice> = (set) => ({
  currentCluster: null,
  currentScenarioId: null,
  
  loadScenario: (scenarioId) => {
    set({
      currentCluster: scenarios[scenarioId],
      currentScenarioId: scenarioId,
      // Reset selection when loading new scenario
      selectedPod: null,
      selectedService: null,
      selectedIngress: null,
      selectedControlPlane: null,
      selectedNodeId: null,
      selectedStatefulSet: null,
      selectedDaemonSet: null,
      selectedPV: null,
      selectedPVC: null,
    });
  },
});
