/**
 * Data Source Service
 * Switches between local static data and backend API based on VITE_DATA_SOURCE env var
 */

import { api } from './api';
import { scenarios, pipelineScenarios } from '@/data';
import type { ClusterSnapshot } from '@/types/kubernetes';

export type DataSource = 'local' | 'backend';

export const getDataSource = (): DataSource => {
  const source = import.meta.env.VITE_DATA_SOURCE || 'local';
  return source === 'backend' ? 'backend' : 'local';
};

export const isBackendMode = (): boolean => getDataSource() === 'backend';
export const isLocalMode = (): boolean => getDataSource() === 'local';

/**
 * Data fetching service that uses either local data or backend API
 */
export const dataService = {
  // Get scenarios list
  getScenarios: async () => {
    if (isBackendMode()) {
      const response = await api.scenarios.list();
      return response.scenarios;
    }
    // Return local scenarios as list
    return Object.entries(scenarios).map(([id, cluster]) => ({
      id,
      name: id.replace(/([A-Z])/g, ' $1').trim(),
      cluster,
    }));
  },

  // Get scenario by ID
  getScenario: async (id: string): Promise<ClusterSnapshot | null> => {
    if (isBackendMode()) {
      // For backend mode, would fetch from API
      // For now, fall back to local
    }
    // Return from local data
    const scenario = scenarios[id as keyof typeof scenarios];
    return scenario || null;
  },

  // Get all scenarios as object (for direct access)
  getAllScenarios: () => scenarios,

  // Get pipeline data  
  getPipelines: async () => {
    if (isBackendMode()) {
      // Future: api.pipelines.list()
      return pipelineScenarios;
    }
    return pipelineScenarios;
  },
};

export default dataService;
