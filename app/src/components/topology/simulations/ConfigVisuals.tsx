import { Box } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface ConfigVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function ConfigVisuals({ scenario, state }: ConfigVisualsProps) {
  return (
    <>
      {/* Visual Feedback (ConfigMap Scenario) */}
      {scenario === 'manage-configmap' && (
          <div className="flex justify-center gap-12 items-center">
               {/* Pod */}
               <div className={cn(
                  "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center gap-2",
                  ['node-assign', 'complete'].includes(state.phase) 
                      ? "border-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] opacity-100" 
                      : "border-surface-700 opacity-30"
               )}>
                  <Box className="w-10 h-10 text-primary-400" />
                  <span className="font-semibold text-surface-100">web-app-configured</span>
                  <div className="w-full h-1 bg-surface-700 rounded-full mt-2 overflow-hidden">
                      <div className="w-full h-full bg-success-500" />
                  </div>
               </div>

               {/* Connection Line */}
               {['node-assign', 'complete'].includes(state.phase) && (
                   <div className="h-0.5 w-16 bg-gradient-to-r from-primary-500 to-accent-500 animate-in fade-in duration-1000" />
               )}

               {/* ConfigMap */}
               <div className={cn(
                  "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center gap-2",
                  ['etcd', 'controller', 'scheduler', 'node-assign', 'complete'].includes(state.phase) 
                      ? "border-accent-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-100" 
                      : "border-surface-700 opacity-30"
               )}>
                   <div className="text-3xl">📄</div>
                   <span className="font-semibold text-surface-100">app-config</span>
                   <div className="text-[10px] text-surface-400 font-mono bg-surface-900 px-2 py-1 rounded">
                       mode=production
                   </div>
               </div>
          </div>
      )}

      {/* Visual Feedback (Secret Scenario) */}
      {scenario === 'manage-secret' && (
          <div className="flex justify-center gap-12 items-center">
               {/* Pod */}
               <div className={cn(
                  "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center gap-2",
                  ['node-assign', 'complete'].includes(state.phase) 
                      ? "border-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] opacity-100" 
                      : "border-surface-700 opacity-30"
               )}>
                  <Box className="w-10 h-10 text-primary-400" />
                  <span className="font-semibold text-surface-100">db-client-secure</span>
                  {['node-assign', 'complete'].includes(state.phase) && (
                      <div className="flex gap-1 mt-2">
                          <span className="text-xs bg-surface-900 px-1 rounded text-warning-400 border border-warning-500/30">ENV: DB_PASS</span>
                      </div>
                  )}
               </div>

               {/* Connection Line */}
               {['node-assign', 'complete'].includes(state.phase) && (
                   <div className="h-0.5 w-16 bg-gradient-to-r from-primary-500 to-warning-500 animate-in fade-in duration-1000" />
               )}

               {/* Secret */}
               <div className={cn(
                  "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 flex flex-col items-center gap-2",
                  ['etcd', 'controller', 'scheduler', 'node-assign', 'complete'].includes(state.phase) 
                      ? "border-warning-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] opacity-100" 
                      : "border-surface-700 opacity-30"
               )}>
                   <div className="text-3xl">🔒</div>
                   <span className="font-semibold text-surface-100">db-creds</span>
                   <div className="text-[10px] text-surface-400 font-mono bg-surface-900 px-2 py-1 rounded blur-[2px] hover:blur-none transition-all cursor-crosshair">
                       password=***
                   </div>
               </div>
          </div>
      )}
    </>
  );
}
