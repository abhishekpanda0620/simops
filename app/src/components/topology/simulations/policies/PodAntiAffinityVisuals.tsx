import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface PodAntiAffinityVisualsProps {
  state: ControlPlaneState;
}

export function PodAntiAffinityVisuals({ state }: PodAntiAffinityVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
       <div className="flex flex-col items-center gap-4 w-full">
           {/* Deployment Definition */}
            <div className={cn(
                 "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 w-72",
                 "border-primary-500"
             )}>
                 <h4 className="font-semibold text-primary-300 mb-2">Redis-HA</h4>
                 <div className="text-xs font-mono bg-surface-900 p-2 rounded text-surface-400">
                     affinity:<br/>
                     &nbsp;&nbsp;podAntiAffinity:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;req.DuringScheduling:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- labelSelector:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;matchLabels:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;app: redis<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;topologyKey: hostname
                 </div>
             </div>

             {/* Logic Arrow (Down) */}
             <div className="flex items-center justify-center h-12">
                  <div className={cn(
                      "flex flex-col items-center transition-all duration-300",
                      ['scheduler', 'node-assign'].includes(state.phase) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  )}>
                      <span className="text-xs text-primary-400 font-medium mb-1">Check Existing Pods</span>
                      <div className="w-0.5 h-6 bg-primary-500/50 relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-primary-500/50" />
                      </div>
                  </div>
             </div>
       </div>

       <div className="flex gap-4 p-4 rounded-lg bg-surface-800/50 border border-surface-700 w-full justify-center">
             {/* Node 1 (Has Pod) */}
             <div className={cn(
                 "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40 relative",
                 ['scheduler'].includes(state.phase) && state.message?.includes('Cannot') ? "border-error-500" : "border-surface-600 bg-surface-800"
             )}>
                 <div className="text-2xl mb-1">🖥️</div>
                 <h4 className="font-semibold text-surface-200">worker-1</h4>
                 
                 {/* Existing Pod */}
                 <div className="mt-2 p-2 bg-surface-700 rounded border border-surface-600 flex items-center gap-2">
                     <Box className="w-4 h-4 text-accent-400" />
                     <span className="text-xs">redis-1</span>
                 </div>

                 {['scheduler'].includes(state.phase) && state.message?.includes('Cannot') && (
                     <div className="absolute -top-3 -right-3 bg-error-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce">
                         No!
                     </div>
                 )}
             </div>

             {/* Node 2 (Empty) */}
             <div className={cn(
                 "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40",
                 ['node-assign', 'complete'].includes(state.phase) && state.message?.includes('worker-2') ? "border-success-500 bg-success-500/10" : "border-surface-600 bg-surface-800"
             )}>
                 <div className="text-2xl mb-1">🖥️</div>
                 <h4 className="font-semibold text-surface-200">worker-2</h4>
                 
                 {/* Space for new pod */}
                 <div className={cn(
                     "mt-2 p-2 rounded border border-dashed border-surface-600 flex items-center gap-2 transition-all",
                     ['node-assign', 'complete'].includes(state.phase) && state.message?.includes('worker-2') 
                       ? "bg-accent-500/20 border-accent-500 border-solid" 
                       : "bg-transparent"
                 )}>
                     <Box className={cn("w-4 h-4", ['node-assign', 'complete'].includes(state.phase) && state.message?.includes('worker-2') ? "text-accent-400" : "text-surface-600")} />
                     <span className="text-xs text-surface-400">
                         {['node-assign', 'complete'].includes(state.phase) && state.message?.includes('worker-2') ? "redis-2" : "Empty"}
                     </span>
                 </div>
             </div>
        </div>
    </div>
  );
}
