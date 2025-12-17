import type { StateCreator } from 'zustand';
import type { ClusterState } from '../clusterStore';

export type StoreSlice<T> = StateCreator<ClusterState, [], [], T>;
