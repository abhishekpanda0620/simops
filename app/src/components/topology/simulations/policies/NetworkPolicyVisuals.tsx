import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface NetworkPolicyVisualsProps {
  state: ControlPlaneState;
}

export function NetworkPolicyVisuals({ state }: NetworkPolicyVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full px-12 relative h-48">
            {/* Alice (Source) */}
            <div className="z-10 p-4 rounded-lg border-2 border-primary-500 bg-surface-800 flex flex-col items-center w-32">
                <div className="text-3xl mb-2">🌐</div>
                <h4 className="font-semibold text-surface-200">Frontend</h4>
                <span className="text-[10px] bg-surface-700 px-1 rounded">pod-1</span>
            </div>

            {/* Packet / Traffic Animation */}
            <div className="flex-1 relative mx-4 h-2 bg-surface-800 rounded-full overflow-hidden">
                {['api-server', 'scheduler', 'complete'].includes(state.phase) && (
                    <div className={cn(
                        "absolute top-0 bottom-0 w-8 rounded-full animate-[moveRight_1s_ease-in-out_infinite]",
                        state.message?.includes('BLOCKED') ? "bg-error-500" : "bg-success-500"
                    )} />
                )}
            </div>

            {/* FIREWALL WALL */}
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2 transition-all duration-500 z-0",
                state.message?.includes('BLOCKED') ? "bg-error-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] h-full" : "bg-transparent h-0"
            )} />

            {/* Bob (Dest) */}
            <div className="z-10 p-4 rounded-lg border-2 border-accent-500 bg-surface-800 flex flex-col items-center w-32">
                <div className="text-3xl mb-2">💾</div>
                <h4 className="font-semibold text-surface-200">Database</h4>
                <span className="text-[10px] bg-surface-700 px-1 rounded">pod-2</span>
            </div>
        </div>
        
        <div className="text-sm font-mono p-2 bg-surface-900 rounded text-surface-300">
            {state.message?.includes('BLOCKED') ? '❌ DENY INGRESS' : '✅ ALLOWED'}
        </div>
    </div>
  );
}
