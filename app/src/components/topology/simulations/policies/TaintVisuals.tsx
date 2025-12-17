import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface TaintVisualsProps {
  state: ControlPlaneState;
}

export function TaintVisuals({ state }: TaintVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
       <div className="flex gap-4 p-4 rounded-lg bg-surface-800/50 border border-surface-700 w-full justify-center">
           {/* Tainted Node */}
           <div className={cn(
               "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-48 relative overflow-hidden",
               "border-warning-500 bg-warning-500/10" // Always tainted here visually
           )}>
               {/* Biohazard / Taint Icon */}
               <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning-500 rotate-12 flex items-center justify-center">
                   <span className="text-xs font-bold text-surface-950">☣️</span>
               </div>
               
               <div className="text-3xl mb-1">🖥️</div>
               <h4 className="font-semibold text-surface-200">worker-1</h4>
               <div className="text-[10px] font-mono bg-warning-950 text-warning-400 px-1 rounded mt-1 max-w-full truncate">
                   env=prod:NoSchedule
               </div>

               {/* Pods attempting to schedule */}
               <div className="mt-4 w-full flex flex-col gap-2">
                   {state.message?.includes('Normal Pod') && state.phase === 'scheduler' && (
                       <div className="p-2 bg-surface-900 rounded border border-error-500 flex items-center gap-2 animate-bounce">
                           <Box className="w-4 h-4 text-surface-400" />
                           <span className="text-[10px] text-error-400">Repelled!</span>
                       </div>
                   )}
                   {state.message?.includes('admin-pod') && ['node-assign', 'complete'].includes(state.phase) && (
                       <div className="p-2 bg-success-500/20 rounded border border-success-500 flex items-center gap-2 animate-in slide-in-from-top">
                           <Box className="w-4 h-4 text-success-300" />
                           <span className="text-[10px] text-success-300">Tolerated</span>
                       </div>
                   )}
               </div>
           </div>

           {/* Clean Node */}
           <div className={cn(
               "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-48",
               "border-surface-600 bg-surface-800"
           )}>
               <div className="text-3xl mb-1">🖥️</div>
               <h4 className="font-semibold text-surface-200">worker-2</h4>
               <span className="text-[10px] bg-surface-700 text-surface-400 px-1 rounded mt-1">Untainted</span>
               
               {state.message?.includes('normal-pod') && ['node-assign', 'complete'].includes(state.phase) && (
                   <div className="mt-4 p-2 bg-primary-500/20 rounded border border-primary-500 flex items-center gap-2 animate-in zoom-in">
                       <Box className="w-4 h-4 text-primary-300" />
                       <span className="text-[10px] text-primary-300">Scheduled</span>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
