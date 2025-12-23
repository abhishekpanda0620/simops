/**
 * Data Source Service
 * Switches between local static data and backend API based on VITE_DATA_SOURCE env var
 */

import { api, type Scenario } from './api';
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
  // ========== K8s Cluster Scenarios (User Request Flow) ==========
  
  /**
   * Get list of K8s cluster scenarios (for scenario selector dropdown)
   */
  getK8sScenarios: async (): Promise<Array<{ id: string; name: string; description: string }>> => {
    if (isBackendMode()) {
      const response = await api.k8sScenarios.list();
      return response.scenarios.map(s => ({
        id: s.slug,
        name: s.name,
        description: s.description,
      }));
    }
    // Return local scenarios as list
    return Object.entries(scenarios).map(([id, cluster]) => ({
      id,
      name: id.replace(/([A-Z])/g, ' $1').trim(),
      description: cluster.description,
    }));
  },

  /**
   * Get full K8s scenario data (ClusterSnapshot) by ID
   */
  getK8sScenario: async (id: string): Promise<ClusterSnapshot | null> => {
    if (isBackendMode()) {
      try {
        console.log(`[dataService] Fetching scenario ${id} from backend...`);
        const response = await api.k8sScenarios.get(id);
        console.log(`[dataService] Got response:`, response);
        
        if (!response.scenario?.data) {
          console.error(`[dataService] No data in scenario response for ${id}`);
          return null;
        }
        
        // The data field contains the full ClusterSnapshot
        return response.scenario.data as unknown as ClusterSnapshot;
      } catch (error) {
        console.error(`[dataService] Failed to fetch scenario ${id} from backend:`, error);
        return null;
      }
    }
    // Return from local data
    const scenario = scenarios[id as keyof typeof scenarios];
    return scenario || null;
  },

  /**
   * Get all local scenarios (for sync access when local mode)
   */
  getAllScenarios: () => scenarios,

  // ========== Control Plane Scenarios (Control Plane Flow) ==========
  
  /**
   * Get list of control plane simulation scenarios
   */
  getControlPlaneScenarios: async (): Promise<Scenario[]> => {
    if (isBackendMode()) {
      const response = await api.scenarios.list();
      return response.scenarios;
    }
    // Return static list for local mode
    return [
      { id: 'create-pod', name: 'Create Pod', category: 'pods' },
      { id: 'delete-pod', name: 'Delete Pod', category: 'pods' },
      { id: 'scale-deployment', name: 'Scale Deployment', category: 'workloads' },
      { id: 'node-failure', name: 'Node Failure Recovery', category: 'cluster' },
      { id: 'simulate-hpa', name: 'HPA Autoscaling', category: 'scaling' },
      { id: 'simulate-node-affinity', name: 'Node Affinity', category: 'scheduling' },
      { id: 'simulate-pod-antiaffinity', name: 'Pod Anti-Affinity', category: 'scheduling' },
      { id: 'simulate-node-selector', name: 'Node Selector', category: 'scheduling' },
      { id: 'argocd-sync', name: 'ArgoCD Sync', category: 'gitops' },
      { id: 'certmanager-issue', name: 'Cert-Manager TLS', category: 'security' },
    ];
  },

  /**
   * Get scenario simulation status (for polling)
   */
  getScenarioStatus: async (id: string) => {
    if (isBackendMode()) {
      return api.scenarios.status(id);
    }
    return { scenario: id, status: 'idle', phase: null };
  },

  // ========== CI/CD Pipelines ==========
  
  /**
   * Get list of pipeline scenarios
   */
  getPipelines: async (): Promise<Array<{ slug: string; name: string; status: string }>> => {
    if (isBackendMode()) {
      const response = await api.pipelines.list();
      return response.pipelines.map(p => ({
        slug: p.slug,
        name: p.name,
        status: p.status,
      }));
    }
    return Object.entries(pipelineScenarios).map(([slug, pipeline]) => ({
      slug,
      name: pipeline.name,
      status: pipeline.status,
    }));
  },

  /**
   * Get full pipeline data by slug
   */
  getPipeline: async (slug: string) => {
    if (isBackendMode()) {
      const response = await api.pipelines.get(slug);
      return response.pipeline.data;
    }
    return pipelineScenarios[slug as keyof typeof pipelineScenarios] || null;
  },

  /**
   * Get all local pipeline scenarios (for sync access)
   */
  getAllPipelines: () => pipelineScenarios,
};

export default dataService;
