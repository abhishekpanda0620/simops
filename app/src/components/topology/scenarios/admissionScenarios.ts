import type { ControlPlaneState } from '../ControlPlaneUtils';

/**
 * ResourceQuota Scenario - Demonstrates Admission Control
 * 
 * Flow:
 * 1. User applies deployment
 * 2. API Server authenticates request
 * 3. API Server checks ResourceQuota
 * 4. Quota exceeded - Pod rejected
 */
export function runResourceQuotaScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // 1. kubectl apply
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying high-resource deployment...' }));
  }, 1000));

  // 2. API Server - Authentication
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating request...' }));
  }, 3000));

  // 3. API Server - Authorization
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Checking RBAC permissions...' }));
  }, 5000));

  // 4. API Server - Admission Control (ResourceQuota)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Admission Controller → Checking ResourceQuota "default-quota"...' }));
  }, 7000));

  // 5. Quota Check - Current usage
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'ResourceQuota: Current CPU usage 3.5/4 cores, Memory 7Gi/8Gi...' }));
  }, 9500));

  // 6. Quota Exceeded
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: '❌ ResourceQuota EXCEEDED! Requested: 2 cores, Available: 0.5 cores' }));
  }, 12000));

  // 7. Rejection
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Pod creation REJECTED by admission controller' }));
  }, 14500));

  timeouts.push(setTimeout(stop, 16500));

  return timeouts;
}

/**
 * Cluster Autoscaler Scenario - Demonstrates Node Scale-Up
 * 
 * Flow:
 * 1. User scales deployment to 10 replicas
 * 2. API Server validates
 * 3. Scheduler tries to place pods
 * 4. Insufficient resources - pods pending
 * 5. Cluster Autoscaler detects pending pods
 * 6. New node provisioned
 * 7. Pending pods scheduled
 */
export function runClusterAutoscalerScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // 1. kubectl scale
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Scaling deployment to 10 replicas...' }));
  }, 1000));

  // 2. API Server - Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating scale request...' }));
  }, 3000));

  // 3. etcd - Store desired state
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing deployment replicas=10...' }));
  }, 5000));

  // 4. Controller - Create ReplicaSets
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ReplicaSet Controller: Creating 7 new pods (3 existing)...' }));
  }, 7000));

  // 5. Scheduler - Try to place pods
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Filtering nodes for 7 new pods...' }));
  }, 9500));

  // 6. Scheduler - Insufficient resources
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: '⚠ Scheduler: Insufficient resources! 4 pods remain Pending' }));
  }, 12000));

  // 7. Cluster Autoscaler - Detect pending
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Cluster Autoscaler: Detected 4 unschedulable pods...' }));
  }, 14500));

  // 8. Cluster Autoscaler - Request node
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Cluster Autoscaler: Requesting new node from cloud provider...' }));
  }, 17000));

  // 9. Node provisioning
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: '☁ Cloud Provider: Provisioning node "worker-3"...' }));
  }, 19500));

  // 10. Node Ready
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Node "worker-3" Ready! Joined cluster.' }));
  }, 22500));

  // 11. Scheduler - Assign pending pods
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning 4 pending pods to worker-3...' }));
  }, 25000));

  // 12. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'All 10 pods Running ✓ Cluster scaled successfully!' }));
  }, 27500));

  timeouts.push(setTimeout(stop, 29500));

  return timeouts;
}
