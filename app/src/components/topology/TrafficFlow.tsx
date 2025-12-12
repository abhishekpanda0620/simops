import { Play, Square, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import './TrafficFlow.css';

export function TrafficFlowControls({ isFlowing, onToggle }: { isFlowing: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFlowing ? 'secondary' : 'primary'}
        size="sm"
        onClick={onToggle}
        icon={isFlowing ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      >
        {isFlowing ? 'Stop' : 'Simulate Request'}
      </Button>
      {isFlowing && (
        <span className="text-xs text-success-400 flex items-center gap-1 animate-pulse">
          <Zap className="w-3 h-3" />
          Live traffic
        </span>
      )}
    </div>
  );
}

// Traffic indicators that show on architecture components
export function TrafficIndicator({ isActive, type }: { isActive: boolean; type: 'ingress' | 'service' | 'pod' }) {
  if (!isActive) return null;
  
  const delays = { ingress: '0s', service: '0.3s', pod: '0.6s' };
  const colors = { 
    ingress: 'bg-primary-400', 
    service: 'bg-accent-400', 
    pod: 'bg-success-400' 
  };
  
  return (
    <div 
      className="absolute -right-1 -top-1 z-10"
      style={{ animationDelay: delays[type] }}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${colors[type]} animate-ping`} />
      <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${colors[type]}`} />
    </div>
  );
}

// Request/Response packet label
export function TrafficPacket({ isFlowing, direction }: { isFlowing: boolean; direction: 'request' | 'response' }) {
  if (!isFlowing) return null;
  
  return (
    <div className={`traffic-packet traffic-packet-${direction}`}>
      <div className={`
        px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap
        ${direction === 'request' 
          ? 'bg-success-500/20 border border-success-500/50 text-success-400' 
          : 'bg-accent-500/20 border border-accent-500/50 text-accent-400'
        }
      `}>
        {direction === 'request' ? 'GET /api →' : '← 200 OK'}
      </div>
    </div>
  );
}

// Flow line that shows active traffic path
export function TrafficFlowLine({ isFlowing }: { isFlowing: boolean }) {
  if (!isFlowing) return null;
  
  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 pointer-events-none overflow-hidden z-0">
      <div className="traffic-flow-line h-full w-full bg-gradient-to-b from-success-500 via-accent-500 to-primary-500" />
    </div>
  );
}
