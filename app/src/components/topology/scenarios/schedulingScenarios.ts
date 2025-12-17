import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

export function runNodeAffinityScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const deployId = 'dep-gpu';

  // 1. Setup - Label Node 1 as GPU
  timeouts.push(setTimeout(() => {
     setState(p => ({ ...p, phase: 'kubectl', message: 'Admin: Labeling worker-1 as strictly "gpu=true"...' }));
     if (actions) {
         actions.updateNode('node-worker-1', { labels: { 'gpu': 'true', 'kubernetes.io/hostname': 'worker-1' } });
         // Ensure other nodes don't have it (or have different labels) for clarity
         actions.updateNode('node-worker-2', { labels: { 'gpu': 'false', 'kubernetes.io/hostname': 'worker-2' } });
     }
  }, 2000));

  // 2. Create Deployment with Affinity
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Creating Deployment "gpu-job" with NodeAffinity...' }));
      // We rely on the scale action to actually create/scale the pods with affinity logic
      // But we need to make sure the store has this deployment "definition" first if we were being strict
      // For this sim, we'll assume the 'dep-gpu' exists or we simulate its creation via scale
  }, 4500));

  // 3. Scheduler Decision
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Found NodeAffinity required: {key: "gpu", val: "true"}' })), 7000));

  // 4. Scale Up (Trigger the logic)
  timeouts.push(setTimeout(() => {
      setState(p => ({ ...p, phase: 'node-assign', message: 'Scheduler: Filtered nodes... Only worker-1 matches.' }));
      if (actions) {
          // We need to inject a deployment that has the affinity into the store first?
          // Or we can rely on `scaleDeployment` finding a template. 
          // Since we don't have a "createDeployment" action exposed easily here that accepts full JSON,
          // we might need to assume the store handles it or add a helper.
          // For simplicity, let's update `addPod` logic or just pretend for now, 
          // BUT wait, `scaleDeployment` uses the EXISTING deployment in store.
          // SO we must ensure `dep-gpu` IS in the store with affinity.
          
          // Implementation Note: See Node Affinity Note. 
          // We rely on `scaleDeployment` to check affinity of the DEPLOYMENT related to the ID passed.
          // So 'dep-gpu' must have affinity in store.
          if (actions) actions.scaleDeployment(deployId, 1);
      }
  }, 9000));
  
  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Scheduled on worker-1 (Match: gpu=true)' })), 11500));
  timeouts.push(setTimeout(stop, 13500));
  
  return timeouts;
}

export function runPodAntiAffinityScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const deployId = 'dep-redis'; // Hypothetical redis deployment

  // 1. Setup - Create 1st Pod (Should land anywhere)
  timeouts.push(setTimeout(() => {
     setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Scale "redis-ha" to 2...' }));
     if (actions) actions.scaleDeployment(deployId, 1);
  }, 2000));

  // 2. Scheduler check 1
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Pod 1 assigned to worker-1.' })), 4000));

  // 3. Scheduler Decision for Pod 2 (Anti-Affinity)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Pod 2 Anti-Affinity: Cannot be on worker-1.' })), 6000));

  // 4. Scale Action (Trigger logic for 2nd pod)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Scheduler: Pod 2 assigned to worker-2.' }));
    if (actions) actions.scaleDeployment(deployId, 2);
  }, 8500));
  
  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'High Availability: Pods Spread Across Nodes' })), 11000));
  timeouts.push(setTimeout(stop, 13000));

  return timeouts;
}

export function runNodeSelectorScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = []; 
  const deployId = 'dep-ssd'; // Hypothetical deployment

  // 1. Setup - Create Deployment with Node Selector AND Label Nodes
  timeouts.push(setTimeout(() => {
     setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Creating Deployment with nodeSelector: disktype=ssd' }));
     if (actions) {
         // Label worker-2 as the SSD node
         actions.updateNode('node-worker-2', { labels: { 'disktype': 'ssd', 'kubernetes.io/hostname': 'worker-2' } });
         // Label worker-1 as HDD
         actions.updateNode('node-worker-1', { labels: { 'disktype': 'hdd', 'kubernetes.io/hostname': 'worker-1' } });
     }
  }, 2000));

  // 2. Scheduler Filter
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Filtering nodes matching disktype=ssd...' })), 4000));

  // 3. Scheduler Decision & Scale
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Scheduler: Found match! Assigning to worker-2.' }));
    // Actually trigger the pod creation so it shows up in the cluster
    if (actions) actions.scaleDeployment(deployId, 1);
  }, 6500));
  
  // 4. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Scheduled on Node with SSD' })), 9000));
  timeouts.push(setTimeout(stop, 11000));

  return timeouts;
}
