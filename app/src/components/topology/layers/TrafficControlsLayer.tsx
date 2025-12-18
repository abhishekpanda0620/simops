import { Globe, ArrowDown } from 'lucide-react';
import { cn } from '@/utils';
import { TrafficFlowControls, RoutingStatus } from '../TrafficFlow';
import type { TrafficState } from '../TrafficUtils';

interface TrafficControlsLayerProps {
  trafficState: TrafficState;
  trafficEndpoints: string[];
  onSetTrafficEndpoint: (endpoint: string) => void;
  onStartTrafficSimulation: () => void;
  onStopTrafficSimulation: () => void;
}

export function TrafficControlsLayer({
  trafficState,
  trafficEndpoints,
  onSetTrafficEndpoint,
  onStartTrafficSimulation,
  onStopTrafficSimulation
}: TrafficControlsLayerProps) {
  return (
    <>
      {/* Traffic Controls */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <TrafficFlowControls
          isFlowing={trafficState.isFlowing}
          endpoints={trafficEndpoints}
          selectedEndpoint={trafficState.endpoint}
          onEndpointChange={onSetTrafficEndpoint}
          onStart={onStartTrafficSimulation}
          onComplete={onStopTrafficSimulation}
        />
        <RoutingStatus trafficState={trafficState} />
      </div>

      {/* External Traffic Entry Point */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
          trafficState.isFlowing 
            ? "bg-success-500/20 border-success-500/50 shadow-lg shadow-success-500/20" 
            : "bg-primary-500/10 border-primary-500/30"
        )}>
          <Globe className={cn("w-5 h-5", trafficState.isFlowing ? "text-success-400" : "text-primary-400")} />
          <span className={cn("text-sm font-medium", trafficState.isFlowing ? "text-success-300" : "text-primary-300")}>External Traffic</span>
          <span className="text-xs text-surface-400 ml-2">(app.example.com)</span>
        </div>
        <ArrowDown className={cn(
          "w-5 h-5 my-2 transition-colors duration-300",
          trafficState.isFlowing ? "text-success-400 animate-bounce" : "text-primary-500/50"
        )} />
      </div>
    </>
  );
}
