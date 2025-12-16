import { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import './TrafficFlow.css';
import { type TrafficState } from './TrafficUtils';

// Re-export TrafficState for convenience if needed, or consumers should import from Utils. 
// For now, let's rely on consumers importing from Utils to solve HMR.

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
    }, 8500); // 8.5 seconds for full animation (clears faster after response)
    
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
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm w-[240px] justify-between",
            "bg-surface-800 border border-surface-600 text-surface-200",
            "hover:bg-surface-700 transition-colors",
            isFlowing && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-surface-400 shrink-0">Path:</span>
            <span className="font-mono text-accent-400 truncate">{selectedEndpoint}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-surface-400 shrink-0" />
        </button>
        
        {isDropdownOpen && !isFlowing && (
          <div className="absolute top-full left-0 mt-1 bg-surface-800 border border-surface-600 rounded-md shadow-xl z-50 w-full min-w-[240px]">
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





// Traffic path indicator - shows which service was selected
export function TrafficPathIndicator({ trafficState }: { trafficState: TrafficState }) {
  if (!trafficState.isFlowing || trafficState.phase === 'idle') return null;
  
  const isError = trafficState.status === 'error';

  return (
    <div className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg backdrop-blur-md shadow-xl border",
        isError ? "bg-error-500/10 border-error-500/50" : "bg-surface-800/95 border-success-500/50"
    )}>
      <div className="flex items-center gap-3 text-sm">
        <span className={cn("font-medium", isError ? "text-error-400" : "text-success-400")}>Request:</span>
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
          trafficState.phase === 'service' ? (isError ? "text-error-400 font-medium" : "text-success-400 font-medium") : "text-surface-400"
        )}>
          {trafficState.targetServiceName || 'Service'}
        </span>
        
        {/* Only show Pod step if not error (or if we failed AT the pod, but here we fail at service level) */}
        {!isError && (
            <>
                <span className="text-surface-500">→</span>
                <span className={cn(
                  "transition-colors duration-300",
                  trafficState.phase === 'pod' ? "text-success-400 font-medium" : "text-surface-400"
                )}>
                  Pod
                </span>
            </>
        )}

        {trafficState.phase === 'response' && (
          <>
            <span className="text-surface-500">→</span>
            <span className={cn("font-medium animate-pulse", isError ? "text-error-400" : "text-accent-400")}>
                {trafficState.responseCode} {isError ? 'Service Unavailable' : 'OK'} {isError ? '❌' : '✓'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Inline routing status that shows above the architecture
export function RoutingStatus({ trafficState }: { trafficState: TrafficState }) {
  if (!trafficState.isFlowing) return null;
  
  const arrow = trafficState.phase === 'response' ? '←' : '→';
  const isError = trafficState.status === 'error';

  return (
    <div className={cn(
        "mb-4 p-3 rounded-lg border",
        isError ? "bg-error-500/10 border-error-500/30" : "bg-success-500/10 border-success-500/30"
    )}>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("font-medium", isError ? "text-error-400" : "text-success-400")}>
          {trafficState.phase === 'response' ? '📥 Response:' : '🔄 Routing:'}
        </span>
        <span className="font-mono text-accent-400">{trafficState.endpoint}</span>
        
        <span className="text-surface-500">{arrow}</span>
        
        <span className={trafficState.phase === 'ingress' ? "text-success-400 font-medium" : "text-surface-400"}>
          Ingress
        </span>
        
        <span className="text-surface-500">{arrow}</span>
        
        <span className={trafficState.phase === 'service' ? (isError ? "text-error-400 font-medium" : "text-success-400 font-medium") : "text-surface-400"}>
          {trafficState.targetServiceName || 'Service'}
        </span>
        
        {!isError && (
            <>
                <span className="text-surface-500">{arrow}</span>
                <span className={trafficState.phase === 'pod' || trafficState.phase === 'response' ? "text-success-400 font-medium" : "text-surface-400"}>
                  Pod
                </span>
            </>
        )}
        
        {trafficState.phase === 'response' && (
          <span className={cn("ml-2 font-medium", isError ? "text-error-400" : "text-accent-400")}>
            {trafficState.responseCode} {isError ? 'Error' : 'OK'}
          </span>
        )}
      </div>
    </div>
  );
}
