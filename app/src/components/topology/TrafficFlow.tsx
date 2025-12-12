import { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import type { K8sIngress, K8sService, K8sPod } from '@/types';
import './TrafficFlow.css';

// Traffic simulation state
export interface TrafficState {
  isFlowing: boolean;
  phase: 'idle' | 'ingress' | 'service' | 'pod' | 'response' | 'complete';
  endpoint: string;
  targetServiceId: string | null;
  targetPodId: string | null;
  targetNodeId: string | null;
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
    }, 8000); // 8 seconds for full animation
    
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
        {isFlowing ? 'Simulating...' : 'Send Request'}
      </Button>
    </div>
  );
}

// Hook to manage traffic simulation
export function useTrafficSimulation(
  ingresses: K8sIngress[],
  services: K8sService[],
  pods: K8sPod[]
) {
  const [state, setState] = useState<TrafficState>({
    isFlowing: false,
    phase: 'idle',
    endpoint: '/api',
    targetServiceId: null,
    targetPodId: null,
    targetNodeId: null,
  });

  const [animationKey, setAnimationKey] = useState(0);

  // Available endpoints from ingress paths
  const endpoints = ingresses.flatMap(ing => 
    ing.paths.map(p => p.path)
  );

  const setEndpoint = useCallback((endpoint: string) => {
    setState(prev => ({ ...prev, endpoint }));
  }, []);

  const startSimulation = useCallback(() => {
    // Find which service handles this endpoint
    const ingress = ingresses[0]; // Assuming single ingress for now
    const path = ingress?.paths.find(p => p.path === state.endpoint);
    const serviceId = path?.serviceId;
    
    // Find the service by ID
    const service = services.find(s => s.id === serviceId);
    
    // Pick a random pod from the service
    const podIds = service?.podIds || [];
    const targetPodId = podIds[Math.floor(Math.random() * podIds.length)];
    
    // Find the pod to get its node
    const targetPod = pods.find(p => p.id === targetPodId);
    const targetNodeId = targetPod?.nodeId || null;

    console.log('Traffic simulation:', { 
      endpoint: state.endpoint, 
      service: service?.name, 
      pod: targetPodId,
      node: targetNodeId 
    });

    setAnimationKey(prev => prev + 1);
    setState(prev => ({
      ...prev,
      isFlowing: true,
      phase: 'ingress',
      targetServiceId: service?.id || null,
      targetPodId,
      targetNodeId,
    }));

    // Phase transitions
    setTimeout(() => setState(prev => ({ ...prev, phase: 'service' })), 1500);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'pod' })), 3000);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'response' })), 5000);
    setTimeout(() => setState(prev => ({ ...prev, phase: 'complete' })), 7500);
  }, [state.endpoint, ingresses, services, pods]);

  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      targetServiceId: null,
      targetPodId: null,
      targetNodeId: null,
    }));
  }, []);

  return {
    state,
    endpoints: endpoints.length > 0 ? endpoints : ['/api', '/frontend'],
    animationKey,
    setEndpoint,
    startSimulation,
    stopSimulation,
  };
}

// Traffic packet with path info
export function TrafficPacket({ 
  isFlowing, 
  direction, 
  endpoint,
  animationKey 
}: { 
  isFlowing: boolean; 
  direction: 'request' | 'response';
  endpoint?: string;
  animationKey?: number;
}) {
  if (!isFlowing) return null;
  
  return (
    <div 
      key={animationKey}
      className={`traffic-packet traffic-packet-${direction}`}
    >
      <div className={cn(
        "px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap shadow-lg",
        direction === 'request' 
          ? 'bg-success-500/90 text-white border border-success-400' 
          : 'bg-accent-500/90 text-white border border-accent-400'
      )}>
        {direction === 'request' ? `📤 GET ${endpoint || '/api'}` : '📥 200 OK'}
      </div>
    </div>
  );
}

// Flow line
export function TrafficFlowLine({ isFlowing }: { isFlowing: boolean }) {
  if (!isFlowing) return null;
  
  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 pointer-events-none overflow-hidden z-0">
      <div className="traffic-flow-line h-full w-full bg-gradient-to-b from-success-500 via-accent-500 to-primary-500" />
    </div>
  );
}

// Helper to check if component is in active traffic path
export function isInTrafficPath(
  componentType: 'ingress' | 'service' | 'pod' | 'node',
  componentId: string,
  trafficState: TrafficState
): boolean {
  if (!trafficState.isFlowing) return false;
  
  switch (componentType) {
    case 'ingress':
      return trafficState.phase !== 'idle' && trafficState.phase !== 'complete';
    case 'service':
      return trafficState.targetServiceId === componentId && 
             ['service', 'pod', 'response'].includes(trafficState.phase);
    case 'pod':
      return trafficState.targetPodId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    case 'node':
      return trafficState.targetNodeId === componentId && 
             ['pod', 'response'].includes(trafficState.phase);
    default:
      return false;
  }
}
