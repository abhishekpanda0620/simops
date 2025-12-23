import type { StoreSlice } from './types';
import type { ClusterSnapshot } from '@/types';
import { dataService, isBackendMode } from '@/services/dataService';

// ScenarioId can be any string when using backend mode
export type ScenarioId = string;

export interface ClusterCoreSlice {
  currentCluster: ClusterSnapshot | null;
  currentScenarioId: ScenarioId | null;
  isLoadingScenario: boolean;
  loadScenario: (scenarioId: ScenarioId) => void;
  loadScenarioAsync: (scenarioId: ScenarioId) => Promise<void>;
}

export const createClusterCoreSlice: StoreSlice<ClusterCoreSlice> = (set, get) => ({
  currentCluster: null,
  currentScenarioId: null,
  isLoadingScenario: false,
  
  // Sync load for local mode (kept for backwards compatibility)
  loadScenario: (scenarioId) => {
    if (isBackendMode()) {
      // Use async version for backend mode
      get().loadScenarioAsync(scenarioId);
      return;
    }
    // Local mode: sync access
    const scenarios = dataService.getAllScenarios();
    const cluster = scenarios[scenarioId as keyof typeof scenarios];
    set({
      currentCluster: cluster || null,
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

  // Async load for backend mode
  loadScenarioAsync: async (scenarioId) => {
    set({ isLoadingScenario: true });
    try {
      const cluster = await dataService.getK8sScenario(scenarioId);
      set({
        currentCluster: cluster,
        currentScenarioId: scenarioId,
        isLoadingScenario: false,
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
    } catch (error) {
      console.error('Failed to load scenario:', error);
      set({ isLoadingScenario: false });
    }
  },
});
