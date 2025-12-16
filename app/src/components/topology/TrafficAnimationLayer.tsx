import { cn } from '@/utils';
import type { TrafficState } from './TrafficUtils';

interface TrafficAnimationLayerProps {
  trafficState: TrafficState;
}

export function TrafficAnimationLayer({ trafficState }: TrafficAnimationLayerProps) {
  if (!trafficState.isFlowing) return null;

  return (
    <>
      {/* Request packet - moves DOWN based on phase */}
      {['ingress', 'service', 'pod'].includes(trafficState.phase) && (
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-700 ease-in-out",
          trafficState.phase === 'ingress' && "top-[38%]",
          trafficState.phase === 'service' && "top-[58%]",
          trafficState.phase === 'pod' && "top-[78%]"
        )}>
          <div className="px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-lg bg-success-500 text-white border border-success-400 flex items-center gap-2">
            <span>📤</span>
            <span>GET {trafficState.endpoint}</span>
            <span className="animate-bounce">▼</span>
          </div>
        </div>
      )}
      {/* Response packet - moves UP based on phase */}
      {trafficState.phase === 'response' && (
        <div className="absolute left-1/2 translate-x-12 z-30 pointer-events-none top-[78%] animate-[moveUp_3s_ease-in-out_forwards]">
          <div className={cn(
            "px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-lg text-white border flex items-center gap-2",
            trafficState.status === 'error' ? "bg-error-500 border-error-400" : "bg-accent-500 border-accent-400"
          )}>
            <span className="animate-bounce">▲</span>
            <span>{trafficState.responseCode} {trafficState.status === 'error' ? 'Error' : 'OK'}</span>
            <span>📥</span>
          </div>
        </div>
      )}
    </>
  );
}
