import { create } from 'zustand';
import { 
  createSelectionSlice, type SelectionSlice,
  createPodSlice, type PodSlice,
  createNodeSlice, type NodeSlice,
  createWorkloadSlice, type WorkloadSlice,
  createConfigSlice, type ConfigSlice,
  createPolicySlice, type PolicySlice,
  createClusterCoreSlice, type ClusterCoreSlice
} from './slices';

export type ClusterState = 
  ClusterCoreSlice & 
  SelectionSlice & 
  PodSlice & 
  NodeSlice & 
  WorkloadSlice & 
  ConfigSlice & 
  PolicySlice;

export const useClusterStore = create<ClusterState>()((...a) => ({
  ...createClusterCoreSlice(...a),
  ...createSelectionSlice(...a),
  ...createPodSlice(...a),
  ...createNodeSlice(...a),
  ...createWorkloadSlice(...a),
  ...createConfigSlice(...a),
  ...createPolicySlice(...a),
}));
