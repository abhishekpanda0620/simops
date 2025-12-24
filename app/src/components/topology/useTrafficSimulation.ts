import { useState, useCallback, useRef, useEffect } from 'react';
import type { K8sIngress, K8sService, K8sPod } from '@/types';
import { type TrafficState } from './TrafficUtils';

// Hook to manage traffic simulation with real K8s routing logic
export function useTrafficSimulation(
  ingresses: K8sIngress[],
  services: K8sService[],
  pods: K8sPod[]
) {
  const [state, setState] = useState<TrafficState>({
    isFlowing: false,
    phase: 'idle',
    endpoint: '/',
    status: 'success',
    responseCode: 200,
    targetIngressId: null,
    targetServiceId: null,
    targetPodId: null,
    targetNodeId: null,
    targetServiceName: null,
  });

  // Available endpoints from ingress paths
  const endpoints = ingresses.flatMap(ing => 
    ing.paths.map(p => p.path)
  );

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const setEndpoint = useCallback((endpoint: string) => {
    setState(prev => ({ ...prev, endpoint }));
  }, []);

  const startSimulation = useCallback(() => {
    // Clear any existing simulation timeouts
    clearTimeouts();

    // Step 1: Find which ingress handles this host (we have one ingress)
    const ingress = ingresses[0];
    if (!ingress) return;

    // Step 2: Find which path matches and get the service
    const path = ingress.paths.find(p => p.path === state.endpoint);
    const serviceId = path?.serviceId;
    
    // Step 3: Find the service
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Step 4: Service load-balances to one of its pods
    // FIX: Check for HEALTHY pods only!
    const podIds = service.podIds || [];
    const candidates = pods.filter(p => podIds.includes(p.id) && p.status === 'running');
    
    if (candidates.length === 0) {
        // ERROR: No healthy pods -> 503 Service Unavailable
        console.log(`🌐 Traffic: ${state.endpoint} → Ingress → ${service.name} → ❌ 503 (No endpoints)`);
        
        setState(prev => ({
            ...prev,
            isFlowing: true,
            status: 'error',
            responseCode: 503,
            phase: 'ingress',
            targetIngressId: ingress.id,
            targetServiceId: service.id,
            targetPodId: null,
            targetNodeId: null,
            targetServiceName: service.name,
        }));

        // Short-circuit animation for error - still give time for response animation
        timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'service' })), 2000));
        timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'response' })), 4000)); // Skip pod phase
        timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'complete' })), 7500));
        
        return;
    }

    // Success case
    const targetPod = candidates[Math.floor(Math.random() * candidates.length)];
    const targetNodeId = targetPod?.nodeId || null;

    console.log(`🌐 Traffic: ${state.endpoint} → Ingress → ${service.name} → ${targetPod.name}`);

    // Start the animation sequence
    setState(prev => ({
      ...prev,
      isFlowing: true,
      status: 'success',
      responseCode: 200,
      phase: 'ingress',
      targetIngressId: ingress.id,
      targetServiceId: service.id,
      targetPodId: targetPod.id,
      targetNodeId,
      targetServiceName: service.name,
    }));

    // Phase transitions - request goes down
    timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'service' })), 2000));
    timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'pod' })), 4000));
    // Response phase - give enough time for the 3s CSS animation to complete
    timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'response' })), 6000));
    timeoutRefs.current.push(setTimeout(() => setState(prev => ({ ...prev, phase: 'complete' })), 9500));
  }, [state.endpoint, ingresses, services, pods, clearTimeouts]);

  const stopSimulation = useCallback(() => {
    clearTimeouts();
    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      status: 'success', 
      responseCode: 200,
      targetIngressId: null,
      targetServiceId: null,
      targetPodId: null,
      targetNodeId: null,
      targetServiceName: null,
    }));
  }, [clearTimeouts]);

  return {
    state,
    endpoints: endpoints.length > 0 ? endpoints : ['/', '/api'],
    setEndpoint,
    startSimulation,
    stopSimulation,
  };
}
