import { useState, useCallback, useRef, useEffect } from 'react';
import type { ControlPlaneScenario, ControlPlaneState } from './ControlPlaneUtils';

export function useControlPlaneSimulation() {
  const [state, setState] = useState<ControlPlaneState>({
    isFlowing: false,
    phase: 'idle',
    message: '',
    scenario: 'create-pod' // Default
  });

  // Track active timeouts
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopSimulation = useCallback(() => {
    // Clear all active timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      message: ''
    }));
  }, []);

  const setScenario = useCallback((scenario: ControlPlaneScenario) => {
    // Stop any running simulation before changing scenario
    if (state.isFlowing) {
      stopSimulation();
    }
    setState(prev => ({
      ...prev,
      scenario
    }));
  }, [state.isFlowing, stopSimulation]);

  const startSimulation = useCallback(() => {
    stopSimulation();
    
    // Slight delay to ensure clean state start
    const startTimeout = setTimeout(() => {
      const ids = runScenario(state.scenario, setState, stopSimulation);
      timeoutsRef.current = [...timeoutsRef.current, ...ids];
    }, 100);
    
    timeoutsRef.current.push(startTimeout);
  }, [state.scenario, stopSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    state,
    setScenario,
    startSimulation,
    stopSimulation
  };
}

function runScenario(
  scenario: ControlPlaneScenario, 
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stopSimulation: () => void
): ReturnType<typeof setTimeout>[] {
  // Common start
  setState(prev => ({ ...prev, isFlowing: true, phase: 'kubectl', message: getStartMessage(scenario) }));

  if (scenario === 'create-pod') {
    return runCreatePodScenario(setState, stopSimulation);
  } else if (scenario === 'get-pods') {
    return runGetPodsScenario(setState, stopSimulation);
  } else if (scenario === 'delete-pod') {
    return runDeletePodScenario(setState, stopSimulation);
  } else if (scenario === 'scale-deployment') {
    return runScaleDeploymentScenario(setState, stopSimulation);
  } else if (scenario === 'node-failure') {
    return runNodeFailureScenario(setState, stopSimulation);
  }
  return [];
}

function getStartMessage(scenario: ControlPlaneScenario) {
  switch (scenario) {
    case 'create-pod': return '$ kubectl create pod nginx';
    case 'get-pods': return '$ kubectl get pods';
    case 'delete-pod': return '$ kubectl delete pod nginx';
    case 'scale-deployment': return '$ kubectl scale deploy nginx --replicas=5';
    case 'node-failure': return '# Simulating Node Power Failure...';
    default: return '';
  }
}

// --- Scenarios ---

function runCreatePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server receives request
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating & Validating...' })), 2000));
  // 2. Write to etcd
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Pod configuration' })), 4000));
  // 3. Scheduler
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Detected unbound pod, selecting node...' })), 6500));
  // 4. Node assignment
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (Node 1): Starting container...' })), 9000));
  // 5. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Running!' })), 12000));
  timeouts.push(setTimeout(stop, 14000));
  
  return timeouts;
}

function runGetPodsScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Authenticating...' })), 1500));
  // 2. etcd (Read)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Reading Pods list' })), 3000));
  // 3. API Server (Response)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Returning data' })), 5000));
  // 4. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'kubectl: Listed 3 pods' })), 7000));
  timeouts.push(setTimeout(stop, 9000));
  
  return timeouts;
}

function runDeletePodScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating delete request...' })), 2000));
  // 2. etcd (Mark deleted)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Marking Pod as deletionCandidate' })), 4000));
  // 3. Controller Manager (GC)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Recognizing deletion event...' })), 6500));
  // 4. Node (Kill)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Stopping container...' })), 9000));
  // 5. etcd (Remove)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Removing Pod data permanently' })), 11500));
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Pod Deleted' })), 14000));
  timeouts.push(setTimeout(stop, 16000));
  
  return timeouts;
}

function runScaleDeploymentScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. API Server
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating scale request...' })), 2000));
  // 2. etcd (Update spec)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Updating Deployment replicas to 5' })), 4000));
  // 3. Controller Manager (ReplicaSet)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller (ReplicaSet): Detected 2 missing pods...' })), 6500));
  // 4. Scheduler (Schedule new pods)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning nodes for new pods...' })), 9000));
  // 5. Node (Start containers)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Starting new containers...' })), 11500));
  // 6. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Deployment Scaled' })), 14000));
  timeouts.push(setTimeout(stop, 16000));
  
  return timeouts;
}

function runNodeFailureScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  // 1. Controller Manager (Heartbeat check)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Heartbeat missing from Node 2...' })), 2000));
  // 2. Controller Manager (Mark NodeLost)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Marking Node 2 as NotReady' })), 4000));
  // 3. Controller (Eviction)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'controller', message: 'Controller: Evicting pods from failed node...' })), 6500));
  // 4. API Server (Update state)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Updating Pod status to Pending' })), 8500));
   // 5. Scheduler (Reschedule)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Detected pending pods, assigning to Node 1...' })), 11000));
  // 6. Node (Start new pods)
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet (Node 1): Starting recovered pods...' })), 13500));
  // 7. Complete
  timeouts.push(setTimeout(() => setState(p => ({ ...p, phase: 'complete', message: 'Recovery Complete' })), 16000));
  timeouts.push(setTimeout(stop, 18000));
  
  return timeouts;
}
