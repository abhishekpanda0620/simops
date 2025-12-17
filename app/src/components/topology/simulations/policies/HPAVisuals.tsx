import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState } from '../../ControlPlaneUtils';

interface HPAVisualsProps {
  state: ControlPlaneState;
}

export function HPAVisuals({ state }: HPAVisualsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
       {/* HPA Controller / Metrics Server */}
       <div className="flex justify-between w-full">
           {/* Metrics Server */}
           <div className={cn(
               "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 w-1/3",
               ['idle', 'node-flow', 'controller', 'scheduler', 'node-assign', 'complete'].includes(state.phase) 
                  ? "border-primary-500 opacity-100" 
                  : "border-surface-700 opacity-30"
           )}>
               <h4 className="font-semibold text-primary-300 mb-2">Metrics Server</h4>
               <div className="flex items-end gap-2 h-24 bg-surface-900 rounded p-4 relative overflow-hidden">
                    {/* Target Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-success-500/50 border-t border-dashed border-success-400">
                        <span className="absolute -top-4 right-2 text-[10px] text-success-400">Target (50%)</span>
                    </div>
                    
                    {/* Current Bar */}
                    <div 
                      className={cn("w-full bg-primary-500 transition-all duration-1000", state.phase === 'node-flow' || state.phase === 'controller' ? "bg-error-500 h-full" : "bg-success-500 h-1/5")} 
                      style={{ 
                          height: ['node-flow', 'controller', 'scheduler'].includes(state.phase) ? '100%' : 
                                  ['complete', 'node-assign'].includes(state.phase) ? '45%' : '10%' 
                      }}
                    />
               </div>
               <p className="text-xs text-center mt-2 text-surface-300">
                   Current CPU: {['node-flow', 'controller', 'scheduler'].includes(state.phase) ? '200%' : 
                                 ['complete', 'node-assign'].includes(state.phase) ? '45%' : '10%'}
               </p>
           </div>

           {/* HPA Resource */}
           <div className={cn(
               "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 w-1/3 flex flex-col items-center justify-center",
               ['controller', 'scheduler', 'node-assign', 'complete'].includes(state.phase) 
                  ? "border-accent-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-100" 
                  : "border-surface-700 opacity-30"
           )}>
               <div className="text-4xl mb-2">⚖️</div>
               <h4 className="font-semibold text-surface-100">php-apache-hpa</h4>
               <p className="text-xs text-surface-400 text-center">Min: 1 | Max: 10</p>
               <div className="mt-2 text-xs font-mono bg-surface-900 px-2 py-1 rounded text-accent-400">
                   {['controller', 'scheduler'].includes(state.phase) ? 'Scale: 1 -> 4' : 'Monitoring'}
               </div>
           </div>
       </div>

       {/* Deployment / Pods */}
       <div className="w-full p-4 rounded-lg bg-surface-800/50 border border-surface-700">
           <h4 className="text-sm font-semibold text-surface-300 mb-4">Deployment: php-apache</h4>
           <div className="flex gap-4 flex-wrap justify-center">
               {/* Pod 1 (Always there) */}
               <div className={cn(
                   "p-3 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center gap-1 w-24",
                   ['node-flow', 'controller', 'scheduler'].includes(state.phase) ? "border-error-500 animate-pulse" : "border-success-500"
               )}>
                   <Box className={cn("w-8 h-8", ['node-flow', 'controller', 'scheduler'].includes(state.phase) ? "text-error-500" : "text-success-500")} />
                   <span className="text-[10px] text-surface-300">pod-1</span>
                   <div className={cn("text-[10px] px-1 rounded", ['node-flow', 'controller', 'scheduler'].includes(state.phase) ? "bg-error-500/20 text-error-300" : "bg-success-500/20 text-success-300")}>
                       {['node-flow', 'controller', 'scheduler'].includes(state.phase) ? '200% CPU' : '45% CPU'}
                   </div>
               </div>

               {/* New Pods (3 more) */}
               {['scheduler', 'node-assign', 'complete'].includes(state.phase) && [2, 3, 4].map(i => (
                   <div key={i} className="p-3 rounded-lg border-2 border-success-500 bg-surface-800 flex flex-col items-center gap-1 w-24 animate-in zoom-in duration-500">
                       <Box className="w-8 h-8 text-success-500" />
                       <span className="text-[10px] text-surface-300">pod-{i}</span>
                       <div className="text-[10px] px-1 rounded bg-success-500/20 text-success-300">
                           45% CPU
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
