import { useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import './TrafficFlow.css';

interface TrafficFlowControlsProps {
  isFlowing: boolean;
  onToggle: () => void;
  onComplete?: () => void;
}

export function TrafficFlowControls({ isFlowing, onToggle, onComplete }: TrafficFlowControlsProps) {
  // Auto-stop after animation completes (6 seconds total: 4s request + 2s delay + 4s response = ~6s to be safe)
  useEffect(() => {
    if (!isFlowing) return;
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [isFlowing, onComplete]);

  return (
    <Button
      variant={isFlowing ? 'secondary' : 'primary'}
      size="sm"
      onClick={onToggle}
      icon={isFlowing ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
    >
      {isFlowing ? 'Simulating...' : 'Simulate Request'}
    </Button>
  );
}

// Request/Response packet label - uses key to restart animation
export function TrafficPacket({ isFlowing, direction, animationKey }: { 
  isFlowing: boolean; 
  direction: 'request' | 'response';
  animationKey?: number;
}) {
  if (!isFlowing) return null;
  
  return (
    <div 
      key={animationKey}
      className={`traffic-packet traffic-packet-${direction}`}
    >
      <div className={`
        px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap shadow-lg
        ${direction === 'request' 
          ? 'bg-success-500/90 text-white border border-success-400' 
          : 'bg-accent-500/90 text-white border border-accent-400'
        }
      `}>
        {direction === 'request' ? '📤 GET /api/users' : '📥 200 OK'}
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

// Unused but kept for future use
export function TrafficIndicator({ isActive, type }: { isActive: boolean; type: 'ingress' | 'service' | 'pod' }) {
  if (!isActive) return null;
  
  const colors = { 
    ingress: 'bg-primary-400', 
    service: 'bg-accent-400', 
    pod: 'bg-success-400' 
  };
  
  return (
    <div className="absolute -right-1 -top-1 z-10">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[type]} animate-ping`} />
      <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${colors[type]}`} />
    </div>
  );
}
