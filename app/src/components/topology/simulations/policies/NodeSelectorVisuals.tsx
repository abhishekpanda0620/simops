import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface NodeSelectorVisualsProps {
  state: ControlPlaneState;
}

export function NodeSelectorVisuals({ state }: NodeSelectorVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
       <div className="flex flex-col items-center gap-4 w-full">
           {/* Deployment Definition */}
            <div className={cn(
                 "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 w-64",
                 "border-primary-500"
             )}>
                 <h4 className="font-semibold text-primary-300 mb-2">MyDeployment</h4>
                 <div className="text-xs font-mono bg-surface-900 p-2 rounded text-surface-400">
                     nodeSelector:<br/>
                     &nbsp;&nbsp;disktype: ssd
                 </div>
             </div>

             {/* Logic Arrow (Down) */}
             <div className="flex items-center justify-center h-12">
                  <div className={cn(
                      "flex flex-col items-center transition-all duration-300",
                      ['scheduler', 'node-assign'].includes(state.phase) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  )}>
                      <span className="text-xs text-primary-400 font-medium mb-1">Filter Nodes</span>
                      <div className="w-0.5 h-6 bg-primary-500/50 relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-primary-500/50" />
                      </div>
                  </div>
             </div>
       </div>

       {/* Node Candidates */}
        <div className="flex gap-4 p-4 rounded-lg bg-surface-800/50 border border-surface-700 w-full justify-center">
             {/* Node 1 (No Match) */}
             <div className={cn(
                 "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40 opacity-50",
                 ['scheduler', 'node-assign', 'complete'].includes(state.phase) ? "border-error-500 grayscale" : "border-surface-600 bg-surface-800"
             )}>
                 <div className="text-2xl mb-1">🖥️</div>
                 <h4 className="font-semibold text-surface-200">worker-1</h4>
                 <span className="text-[10px] bg-surface-700 text-surface-400 px-1 rounded mt-1">disktype=hdd</span>
                 {['scheduler', 'node-assign', 'complete'].includes(state.phase) && (
                     <div className="mt-2 text-xs text-error-400">
                         Mismatch
                     </div>
                 )}
             </div>

             {/* Node 2 (Match) */}
             <div className={cn(
                 "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40",
                 ['node-assign', 'complete'].includes(state.phase) ? "border-success-500 bg-success-500/10" : "border-surface-600 bg-surface-800"
             )}>
                 <div className="text-2xl mb-1">🖥️</div>
                 <h4 className="font-semibold text-surface-200">worker-2</h4>
                 <span className="text-[10px] bg-accent-500/20 text-accent-300 px-1 rounded mt-1">disktype=ssd</span>
                 {['node-assign', 'complete'].includes(state.phase) && (
                     <div className="mt-2 text-xs bg-success-500 text-white px-2 py-1 rounded animate-in zoom-in">
                         Selected
                     </div>
                 )}
             </div>
        </div>
    </div>
  );
}
