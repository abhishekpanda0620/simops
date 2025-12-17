export { healthyCluster } from './healthy';
export {
  crashLoopBackOffCluster,
  oomKilledCluster,
  imagePullBackOffCluster,
  pendingCluster,
  nodeNotReadyCluster,
} from './failures';

import { healthyCluster } from './healthy';
import {
  crashLoopBackOffCluster,
  oomKilledCluster,
  imagePullBackOffCluster,
  pendingCluster,
  nodeNotReadyCluster,
} from './failures';

export const scenarios = {
  healthy: healthyCluster,
  crashLoopBackOff: crashLoopBackOffCluster,
  oomKilled: oomKilledCluster,
  imagePullBackOff: imagePullBackOffCluster,
  pending: pendingCluster,
  nodeNotReady: nodeNotReadyCluster,
};

export type ScenarioId = keyof typeof scenarios;
