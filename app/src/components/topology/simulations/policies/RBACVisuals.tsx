import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface RBACVisualsProps {
  state: ControlPlaneState;
}

export function RBACVisuals({ state }: RBACVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        
        {/* User Alice */}
        <div className="flex justify-center w-full">
            <div className={cn(
                "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center",
                state.message?.includes('403') ? "border-error-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "border-primary-500"
            )}>
                <div className="w-16 h-16 bg-surface-900 rounded-full flex items-center justify-center border border-surface-700 mb-2">
                    <span className="text-3xl">👤</span>
                </div>
                <h4 className="font-semibold text-surface-100">User: alice</h4>
                <div className={cn(
                    "mt-2 text-xs font-mono px-2 py-1 rounded transition-colors",
                    state.message?.includes('403') ? "bg-error-500/10 text-error-400" : 
                    state.message?.includes('Authorized') || state.phase === 'complete' ? "bg-success-500/10 text-success-400" : "bg-surface-900 text-surface-400"
                )}>
                    {state.message?.includes('403') ? 'Status: 403 Forbidden' : 
                    state.message?.includes('Authorized') || state.phase === 'complete' ? 'Status: Authorized' : 'Connecting...'}
                </div>
            </div>
        </div>

        {/* RBAC Resources (Admin Intervention) */}
        <div className="flex gap-8 justify-center items-center">
            
            {/* Role */}
            <div className={cn(
                "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center w-48",
                ['kubectl', 'node-assign', 'api-server', 'complete'].includes(state.phase) && !state.message?.includes('403') 
                   ? "border-accent-500 opacity-100 transform translate-y-0" 
                   : "border-surface-700 opacity-30 transform translate-y-4"
            )}>
                <div className="text-3xl mb-2">🔑</div>
                <h4 className="font-semibold text-surface-100">Role</h4>
                <p className="text-xs text-accent-400 font-mono mb-2">pod-reader</p>
                <div className="w-full bg-surface-900 p-2 rounded text-[10px] text-surface-400 font-mono">
                    resources: ["pods"]<br/>verbs: ["get", "list"]
                </div>
            </div>

            {/* Binding Connection */}
            <div className={cn(
                "h-1 bg-gradient-to-r from-accent-500 to-primary-500 transition-all duration-1000",
                ['kubectl', 'node-assign', 'api-server', 'complete'].includes(state.phase) && !state.message?.includes('403') && state.message?.includes('Bind')
                  ? "w-24 opacity-100" 
                  : "w-0 opacity-0"
            )} />

            {/* RoleBinding */}
            <div className={cn(
                "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center w-48",
                ['kubectl', 'node-assign', 'api-server', 'complete'].includes(state.phase) && !state.message?.includes('403') && state.message?.includes('Bind')
                   ? "border-primary-500 opacity-100 transform translate-y-0" 
                   : "border-surface-700 opacity-30 transform translate-y-4"
            )}>
                <div className="text-3xl mb-2">🔗</div>
                <h4 className="font-semibold text-surface-100">RoleBinding</h4>
                <p className="text-xs text-primary-400 font-mono mb-2">alice-read-pods</p>
                <div className="w-full bg-surface-900 p-2 rounded text-[10px] text-surface-400 font-mono">
                    User: alice<br/>Role: pod-reader
                </div>
            </div>
        </div>

        {/* Message Display */}
        {state.message?.includes('403') && (
            <div className="animate-in fade-in zoom-in duration-300 p-4 bg-error-500/10 border border-error-500/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-error-400 font-mono text-sm">Error: User "alice" cannot list resource "pods" in API group ""</span>
            </div>
        )}
    </div>
  );
}
