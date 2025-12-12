import { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import type { K8sIngress, K8sService, K8sPod } from '@/types';
import './TrafficFlow.css';

// Traffic simulation state - tracks the actual routing path
export interface TrafficState {
  isFlowing: boolean;
  phase: 'idle' | 'ingress' | 'service' | 'pod' | 'response' | 'complete';
  endpoint: string;
  // The actual path components
  targetIngressId: string | null;
  targetServiceId: string | null;
  targetPodId: string | null;
  targetNodeId: string | null;
  // Service name for display
  targetServiceName: string | null;
}

interface TrafficFlowControlsProps {
  isFlowing: boolean;
  endpoints: string[];
  selectedEndpoint: string;
  onEndpointChange: (endpoint: string) => void;
  onStart: () => void;
  onComplete?: () => void;
}

export function TrafficFlowControls({ 
  isFlowing, 
  endpoints, 
  selectedEndpoint, 
  onEndpointChange, 
  onStart, 
  onComplete 
}: TrafficFlowControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-stop after animation completes
  useEffect(() => {
    if (!isFlowing) return;
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 11000); // 11 seconds for full animation with pauses
    
    return () => clearTimeout(timer);
  }, [isFlowing, onComplete]);

  return (
    <div className="flex items-center gap-2">
      {/* Endpoint Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isFlowing}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
            "bg-surface-800 border border-surface-600 text-surface-200",
            "hover:bg-surface-700 transition-colors",
            isFlowing && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="text-surface-400">Path:</span>
          <span className="font-mono text-accent-400">{selectedEndpoint}</span>
          <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
        </button>
        
        {isDropdownOpen && !isFlowing && (
          <div className="absolute top-full left-0 mt-1 bg-surface-800 border border-surface-600 rounded-md shadow-xl z-50 min-w-[150px]">
            {endpoints.map((ep) => (
              <button
                key={ep}
                onClick={() => {
                  onEndpointChange(ep);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm font-mono",
                  "hover:bg-surface-700 transition-colors",
                  ep === selectedEndpoint ? "text-accent-400 bg-surface-700" : "text-surface-200"
                )}
              >
                {ep}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Start Button */}
      <Button
        variant={isFlowing ? 'secondary' : 'primary'}
        size="sm"
        onClick={onStart}
        disabled={isFlowing}
        icon={isFlowing ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
      >
        {isFlowing ? 'Routing...' : 'Send Request'}
      </Button>
    </div>
  );
}

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

  const setEndpoint = useCallback((endpoint: string) => {
    setState(prev => ({ ...prev, endpoint }));
  }, []);

  const startSimulation = useCallback(() => {
    // Step 1: Find which ingress handles this host (we have one ingress)
    const ingress = ingresses[0];
    if (!ingress) return;

    // Step 2: Find which path matches and get the service
    const path = ingress.paths.find(p => p.path === state.endpoint);
    const serviceId = path?.serviceId;
    
    // Step 3: Find the service
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Step 4: Service load-balances to one of its pods (random selection)
    const podIds = service.podIds || [];
    const targetPodId = podIds[Math.floor(Math.random() * podIds.length)];
    
    // Step 5: Find the pod to get its node
    const targetPod = pods.find(p => p.id === targetPodId);
    const targetNodeId = targetPod?.nodeId || null;

    console.log(`🌐 Traffic: ${state.endpoint} → Ingress → ${service.name} → ${targetPod?.name} (on ${targetPod?.nodeName})`);

    // Start the animation sequence
    setState(prev => ({
      ...prev,
      isFlowing: true,
      phase: 'ingress',
      targetIngressId: ingress.id,
      targetServiceId: service.id,
      targetPodId,
      targetNodeId,
      targetServiceName: service.name,
    }));

    // Phase transitions - longer pauses at each component for understanding
    // Ingress: 0-2s, Service: 2-4s, Pod processing: 4-7s, Response: 7-10s
    setTimeout(() => setState(prev => ({ ...prev, phase: 'service' })), 2000);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'pod' })), 4000);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'response' })), 7000);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'complete' })), 10000);
  }, [state.endpoint, ingresses, services, pods]);

  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      targetIngressId: null,
      targetServiceId: null,
      targetPodId: null,
      targetNodeId: null,
      targetServiceName: null,
    }));
  }, []);

  return {
    state,
    endpoints: endpoints.length > 0 ? endpoints : ['/', '/api'],
    setEndpoint,
    startSimulation,
    stopSimulation,
  };
}

// Helper to check if a component should be highlighted in current traffic path
export function isInTrafficPath(
  componentType: 'ingress' | 'service' | 'pod' | 'node',
  componentId: string,
  trafficState: TrafficState
): boolean {
  if (!trafficState.isFlowing || trafficState.phase === 'idle' || trafficState.phase === 'complete') {
    return false;
  }
  
  switch (componentType) {
    case 'ingress':
      // Ingress highlights during ingress, service, pod, and response phases
      return trafficState.targetIngressId === componentId && 
             ['ingress', 'service', 'pod', 'response'].includes(trafficState.phase);
    case 'service':
      // Service highlights during service, pod, and response phases
      return trafficState.targetServiceId === componentId && 
             ['service', 'pod', 'response'].includes(trafficState.phase);
    case 'pod':
      // Pod highlights during pod and response phases
      return trafficState.targetPodId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    case 'node':
      // Node highlights when its pod is active
      return trafficState.targetNodeId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    default:
      return false;
  }
}

// Traffic path indicator - shows which service was selected
export function TrafficPathIndicator({ trafficState }: { trafficState: TrafficState }) {
  if (!trafficState.isFlowing || trafficState.phase === 'idle') return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-surface-800/95 border border-success-500/50 shadow-xl">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-success-400 font-medium">Request:</span>
        <code className="text-accent-400 font-mono">{trafficState.endpoint}</code>
        <span className="text-surface-500">→</span>
        <span className={cn(
          "transition-colors duration-300",
          trafficState.phase === 'ingress' ? "text-success-400 font-medium" : "text-surface-400"
        )}>
          Ingress
        </span>
        <span className="text-surface-500">→</span>
        <span className={cn(
          "transition-colors duration-300",
          trafficState.phase === 'service' ? "text-success-400 font-medium" : "text-surface-400"
        )}>
          {trafficState.targetServiceName || 'Service'}
        </span>
        <span className="text-surface-500">→</span>
        <span className={cn(
          "transition-colors duration-300",
          trafficState.phase === 'pod' ? "text-success-400 font-medium" : "text-surface-400"
        )}>
          Pod
        </span>
        {trafficState.phase === 'response' && (
          <>
            <span className="text-surface-500">→</span>
            <span className="text-accent-400 font-medium animate-pulse">200 OK ✓</span>
          </>
        )}
      </div>
    </div>
  );
}

// Inline routing status that shows above the architecture
export function RoutingStatus({ trafficState }: { trafficState: TrafficState }) {
  if (!trafficState.isFlowing) return null;
  
  return (
    <div className="mb-4 p-3 rounded-lg bg-success-500/10 border border-success-500/30">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-success-400 font-medium">🔄 Routing:</span>
        <span className="font-mono text-accent-400">{trafficState.endpoint}</span>
        <span className="text-surface-500">→</span>
        <span className={trafficState.phase === 'ingress' ? "text-success-400 font-medium" : "text-surface-400"}>
          Ingress
        </span>
        <span className="text-surface-500">→</span>
        <span className={trafficState.phase === 'service' ? "text-success-400 font-medium" : "text-surface-400"}>
          {trafficState.targetServiceName || 'Service'}
        </span>
        <span className="text-surface-500">→</span>
        <span className={trafficState.phase === 'pod' || trafficState.phase === 'response' ? "text-success-400 font-medium" : "text-surface-400"}>
          Pod
        </span>
        {trafficState.phase === 'response' && (
          <span className="ml-2 text-accent-400 font-medium">← 200 OK</span>
        )}
      </div>
    </div>
  );
}
