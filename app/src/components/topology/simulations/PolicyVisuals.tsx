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
      
      {/* Visual Feedback (Node Affinity) */}
      {scenario === 'simulate-node-affinity' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
             <div className="flex flex-col items-center gap-4 w-full">
                 {/* Deployment Definition */}
                  <div className={cn(
                       "p-4 rounded-lg border-2 bg-surface-800 transition-all duration-500 w-64",
                       "border-primary-500"
                   )}>
                       <h4 className="font-semibold text-primary-300 mb-2">MyDeployment</h4>
                       <div className="text-xs font-mono bg-surface-900 p-2 rounded text-surface-400">
                           affinity:<br/>
                           &nbsp;&nbsp;nodeAffinity:<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;matchExpressions:<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- key: gpu<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;operator: In<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;values: ["true"]
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
                   {/* Node 1 (Match) */}
                   <div className={cn(
                       "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40",
                       ['scheduler', 'node-assign', 'complete'].includes(state.phase) ? "border-success-500 bg-success-500/10" : "border-surface-600 bg-surface-800"
                   )}>
                       <div className="text-2xl mb-1">🖥️</div>
                       <h4 className="font-semibold text-surface-200">worker-1</h4>
                       <span className="text-[10px] bg-accent-500/20 text-accent-300 px-1 rounded mt-1">gpu=true</span>
                       {['node-assign', 'complete'].includes(state.phase) && (
                           <div className="mt-2 text-xs bg-success-500 text-white px-2 py-1 rounded animate-in zoom-in">
                               Selected
                           </div>
                       )}
                   </div>

                   {/* Node 2 (No Match) */}
                   <div className={cn(
                       "p-4 rounded-lg border-2 transition-all duration-500 flex flex-col items-center w-40 opacity-50",
                       ['scheduler', 'node-assign', 'complete'].includes(state.phase) ? "border-error-500 grayscale" : "border-surface-600 bg-surface-800"
                   )}>
                       <div className="text-2xl mb-1">🖥️</div>
                       <h4 className="font-semibold text-surface-200">worker-2</h4>
                       <span className="text-[10px] bg-surface-700 text-surface-400 px-1 rounded mt-1">gpu=false</span>
                       {['scheduler', 'node-assign', 'complete'].includes(state.phase) && (
                           <div className="mt-2 text-xs text-error-400">
                               Mismatch
                           </div>
                       )}
                   </div>
              </div>
          </div>
      )}

      {/* Visual Feedback (Pod Anti-Affinity) */}
      {scenario === 'simulate-pod-antiaffinity' && (
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
      )}

      {/* Visual Feedback (Node Selector) */}
      {scenario === 'simulate-node-selector' && (
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
      )}

      {/* Visual Feedback (Taints & Tolerations) */}
      {scenario === 'simulate-taints' && (
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
      )}

      {/* Visual Feedback (Network Policies) */}
      {scenario === 'simulate-netpol' && (
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
      )}
    </>
  );
}
