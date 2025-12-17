import { Box, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface PolicyVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function PolicyVisuals({ scenario, state }: PolicyVisualsProps) {
  return (
    <>
      {/* Visual Feedback (HPA Scenario) */}
      {scenario === 'simulate-hpa' && (
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
      )}

      {/* Visual Feedback (RBAC Scenario) */}
      {scenario === 'simulate-rbac' && (
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
      )}
    </>
  );
}
