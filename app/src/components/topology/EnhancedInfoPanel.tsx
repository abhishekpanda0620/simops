import { Trash2, Box, Server, Database, Network, Globe, ImageOff, RotateCcw, HardDrive, FileJson, Lock } from 'lucide-react';
import { Button } from '@/components/ui';
import { useClusterStore } from '@/store';
import type { ClusterSnapshot } from '@/types';
import { formatMemory } from '@/utils';
import type { SelectedItem } from './SelectionTypes';
import { educationalContent } from './content/enhancedContent';
import { 
  PanelHeader, 
  AnalogyBox, 
  KeyPointsList, 
  TroubleshootingSection, 
  InfoRow 
} from './panels/EnhancedPanelComponents';
import { cn } from '@/utils';

interface EnhancedInfoPanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
  onKillPod?: (podId: string) => void;
}

export function EnhancedInfoPanel({ selected, cluster, onClose }: EnhancedInfoPanelProps) {
  const { killPod, triggerCrashLoop, breakImage, causeOOM, restartPod } = useClusterStore();

  if (!selected) return null;

  // 1. Control Plane Components
  if (selected.type === 'controlPlane') {
    const nameMap: Record<string, keyof typeof educationalContent.controlPlane> = {
      'API Server': 'api-server',
      'etcd': 'etcd',
      'Controller Manager': 'controller-manager',
      'Scheduler': 'scheduler'
    };
    const info = educationalContent.controlPlane[nameMap[selected.data.name] || 'api-server'];
    const status = selected.data.status === 'healthy' ? 'healthy' : 'degraded';
    
    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={info?.title || selected.data.name} 
          icon={Server} 
          status={status} 
          onClose={onClose} 
        />
        
        <div className="flex-1 overflow-auto p-6">
          <AnalogyBox analogy={info?.analogy} />
          
          <div className="mb-6">
            <p className="text-sm text-surface-300 leading-relaxed">{info?.description}</p>
          </div>

          <KeyPointsList points={info?.keyPoints} />
          <TroubleshootingSection items={info?.troubleshooting} />
        </div>
      </div>
    );
  }

  // 2. Pods
  if (selected.type === 'pod') {
    const pod = selected.data;
    const isCrashLoop = (pod.status as string) === 'CrashLoopBackOff';
    const isError = ['CrashLoopBackOff', 'OOMKilled', 'ImagePullBackOff'].includes(pod.status as string);
    const isPending = (pod.status as string) === 'Pending';
    
    // Get educational content based on status
    const statusInfo = educationalContent.pod.states[pod.status as keyof typeof educationalContent.pod.states];

    return (
      <div className="fixed right-0 top-0 h-full w-[500px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={pod.name} 
          icon={Box} 
          status={(pod.status as string) === 'Running' ? 'healthy' : isPending ? 'degraded' : 'unhealthy'} 
          onClose={onClose} 
        />

        <div className="flex-1 overflow-auto p-6">
          {/* Status Alert Banner */}
          {statusInfo && (
            <div className={cn(
              "p-4 rounded-lg mb-6 border",
              isError ? "bg-error-500/10 border-error-500/30" : "bg-warning-500/10 border-warning-500/30"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {isError ? <ImageOff className="w-5 h-5 text-error-400" /> : <RotateCcw className="w-5 h-5 text-warning-400" />}
                <h3 className={cn("font-bold uppercase tracking-wide text-sm", isError ? "text-error-400" : "text-warning-400")}>
                  {statusInfo.title}
                </h3>
              </div>
              <p className="text-sm text-surface-200 mb-2">{statusInfo.description}</p>
              
              <div className="bg-surface-950/50 rounded-lg p-3 mt-3">
                <span className="text-xs font-mono text-surface-400 block mb-1">POSSIBLE CAUSE:</span>
                <span className="text-xs text-surface-200 font-mono">{statusInfo.cause}</span>
              </div>

              {statusInfo.fix && (
                <div className="mt-3">
                   <span className="text-xs font-mono text-surface-400 block mb-1">SUGGESTED FIXES:</span>
                   <ul className="list-disc pl-4 space-y-1">
                     {statusInfo.fix.map((fix, i) => (
                       <li key={i} className="text-xs text-surface-300">{fix}</li>
                     ))}
                   </ul>
                </div>
              )}
            </div>
          )}

          {/* Pod Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Container Info</h3>
              <div className="space-y-2 bg-surface-800/50 p-4 rounded-xl">
                 <InfoRow label="Namespace" value={pod.namespace} />
                 <InfoRow label="Node" value={pod.nodeId || 'Unassigned'} highlight={!pod.nodeId} />
                 <InfoRow label="Images" value={pod.containers.map(c => c.image).join(', ')} />
                 <InfoRow label="Restarts" value={pod.restarts.toString()} highlight={pod.restarts > 0} />
                 <InfoRow label="CPU Request" value="100m" />
                 <InfoRow label="Memory Limit" value={pod.containers[0].resources?.limits?.memory ? formatMemory(Number(pod.containers[0].resources.limits.memory)) : '512Mi'} />
              </div>
            </div>
          </div>

          {/* Simulation Controls - "Break" the pod */}
          <div className="mt-8 border-t border-surface-800 pt-6">
            <h3 className="text-sm font-medium text-error-400 uppercase tracking-wider mb-4">Chaos Engineering</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="danger" 
                className="border-error-500/30 hover:bg-error-500/10 text-error-400 justify-start"
                onClick={() => killPod(pod.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Kill Pod
              </Button>
              
              <Button 
                variant="secondary" 
                className="border-warning-500/30 hover:bg-warning-500/10 text-warning-400 justify-start"
                onClick={() => isCrashLoop ? restartPod(pod.id) : triggerCrashLoop(pod.id)}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> {isCrashLoop ? 'Fix CrashLoop' : 'Simulate Crash'}
              </Button>

              <Button 
                variant="secondary" 
                className="border-warning-500/30 hover:bg-warning-500/10 text-warning-400 justify-start"
                onClick={() => breakImage(pod.id)}
              >
                <ImageOff className="w-4 h-4 mr-2" /> Break ImageTag
              </Button>
              
              <Button 
                variant="secondary" 
                className="border-warning-500/30 hover:bg-warning-500/10 text-warning-400 justify-start"
                onClick={() => causeOOM(pod.id)}
              >
                <Database className="w-4 h-4 mr-2" /> Trigger OOM
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Worker Nodes
  if (selected.type === 'node') {
    const node = selected.data;
    const info = educationalContent.node;
    const podsOnNode = cluster.pods.filter(p => p.nodeId === node.id);
    const memoryUsage = podsOnNode.reduce((acc, p) => acc + Number(p.containers[0].resources?.requests?.memory || 256), 0);
    const memoryTotal = node.memory.total;
    const memoryPercent = Math.round((memoryUsage / memoryTotal) * 100);

    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={node.name} 
          icon={Server} 
          status={node.conditions.some(c => c.status === 'False') ? 'degraded' : 'healthy'} 
          onClose={onClose} 
        />

        <div className="flex-1 overflow-auto p-6">
           <AnalogyBox analogy={info.analogy} />
           
           {/* Node Capacity */}
           <div className="mb-6">
             <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Resource Capacity</h3>
             <div className="p-4 rounded-xl bg-surface-800/50 space-y-4">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-300">CPU Usage</span>
                    <span className="text-surface-200">{(podsOnNode.length * 10)}% / {node.cpu.total} Cores</span>
                  </div>
                  <div className="h-2 bg-surface-950 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-[25%]" />
                  </div>
                </div>
                {/* Memory */}
                <div>
                   <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-300">Memory Usage</span>
                    <span className="text-surface-200">{formatMemory(memoryUsage)} / {formatMemory(memoryTotal)} ({memoryPercent}%)</span>
                  </div>
                  <div className="h-2 bg-surface-950 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-500" style={{ width: `${memoryPercent}%` }} />
                  </div>
                </div>
             </div>
           </div>

           {/* Running Pods */}
           <div className="mb-6">
             <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">
               Running Pods ({podsOnNode.length})
             </h3>
             <div className="space-y-2">
               {podsOnNode.length > 0 ? podsOnNode.map(pod => (
                 <div key={pod.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-800/30 border border-surface-700/30">
                   <div className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", (pod.status as string) === 'Running' ? "bg-success-500" : "bg-warning-500")} />
                     <span className="text-sm text-surface-200">{pod.name}</span>
                   </div>
                   <span className="text-xs text-surface-500">{formatMemory(Number(pod.containers[0].resources?.requests?.memory || 0))}</span>
                 </div>
               )) : (
                 <div className="text-sm text-surface-500 italic p-2">No pods running on this node</div>
               )}
             </div>
           </div>

           <TroubleshootingSection items={[
             'High CPU load averages could delay pod scheduling',
             'Disk pressure causes eviction of unused images',
             'NotReady status usually means kubelet stopped posting heartbeats'
           ]} />
        </div>
      </div>
    );
  }

  // 4. Services
  if (selected.type === 'service') {
     const service = selected.data;
     const info = educationalContent.service;
     
     return (
       <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
         <PanelHeader 
           title={service.name} 
           icon={Network} 
           status="healthy" 
           onClose={onClose} 
         />
 
         <div className="flex-1 overflow-auto p-6">
            <AnalogyBox analogy={info.analogy} />
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Service Configuration</h3>
              <div className="space-y-2 bg-surface-800/50 p-4 rounded-xl">
                 <InfoRow label="Type" value={service.type} highlight={true} />
                 <InfoRow label="Cluster IP" value={service.clusterIP} />
                 <InfoRow label="Port mapping" value={`${service.ports[0].port} → ${service.ports[0].targetPort}`} />
                 <InfoRow label="Target Pods" value={`${service.podIds.length} Endpoints`} />
              </div>
              <p className="mt-3 text-sm text-surface-400 italic">
                {info.types[service.type as keyof typeof info.types]}
              </p>
            </div>
         </div>
       </div>
     );
  }

  // 5. Ingress
  if (selected.type === 'ingress') {
    const ingress = selected.data;
    
    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={ingress.name} 
          icon={Globe} 
          status="healthy" 
          onClose={onClose} 
        />

        <div className="flex-1 overflow-auto p-6">
           <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 mb-6">
             <div className="flex items-center gap-2 mb-2">
               <Globe className="w-4 h-4 text-purple-400" />
               <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Traffic Routing</span>
             </div>
             <p className="text-sm text-surface-200">
               Routing <span className="text-white font-mono">{ingress.host}</span> traffic to internal services using an Nginx controller.
             </p>
           </div>
           
           <div className="mb-6">
             <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Route Rules</h3>
             <div className="space-y-2">
               {ingress.paths.map((path, i) => (
                 <div key={i} className="flex flex-col p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-1.5 py-0.5 rounded bg-surface-700 text-xs font-mono text-surface-300">{path.path}</span>
                       <span className="text-surface-600">→</span>
                       <span className="text-sm font-medium text-purple-300">{path.serviceId.replace('svc-', 'service-')}</span>
                    </div>
                    <div className="text-xs text-surface-500">Service Port: 80</div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  // 6. ConfigMaps
  if (selected.type === 'configMap') {
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={selected.data.name} 
          icon={FileJson} 
          status="healthy" 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
             <div className="mb-6">
                <p className="text-sm text-surface-300 mb-4">
                    ConfigMaps decouple configuration artifacts from image content to keep containerized applications portable.
                </p>
                <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Data</h3>
                <div className="bg-surface-950 p-4 rounded-lg font-mono text-xs text-surface-300 overflow-x-auto border border-surface-800">
                    <pre>{JSON.stringify(selected.data.data, null, 2)}</pre>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 7. Secrets
  if (selected.type === 'secret') {
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={selected.data.name} 
          icon={Lock} 
          status="healthy" 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
             <div className="mb-6">
                <p className="text-sm text-surface-300 mb-4">
                    Secrets let you store and manage sensitive information, such as passwords, OAuth tokens, and ssh keys.
                </p>
                <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20 mb-4">
                     <p className="text-xs text-warning-400 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Data is base64 encoded, not encrypted by default!
                     </p>
                </div>
                <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Data keys</h3>
                <div className="space-y-2">
                    {Object.keys(selected.data.data).map(key => (
                        <div key={key} className="flex justify-between items-center p-2 rounded bg-surface-800/50">
                            <span className="text-sm font-mono text-surface-300">{key}</span>
                            <span className="text-xs text-surface-500 italic">******</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 8. PersistentVolumes
    if (selected.type === 'pv') {
        const pv = selected.data;
        return (
            <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <PanelHeader 
              title={pv.name} 
              icon={HardDrive} 
              status={pv.status === 'Bound' ? 'healthy' : 'degraded'} 
              onClose={onClose} 
            />
            <div className="flex-1 overflow-auto p-6">
                <AnalogyBox analogy="📦 Think of a PV like a physical hard drive you plug into a computer. It exists independently of the computer." />
                 <div className="space-y-6">
                    <div className="bg-surface-800/50 p-4 rounded-xl space-y-2">
                        <InfoRow label="Capacity" value={pv.capacity} />
                        <InfoRow label="Access Mode" value={pv.accessModes.join(', ')} />
                        <InfoRow label="Reclaim Policy" value={pv.reclaimPolicy} />
                        <InfoRow label="Status" value={pv.status} highlight={pv.status === 'Bound'} />
                    </div>
                </div>
            </div>
          </div>
        );
      }
    
      // 9. PersistentVolumeClaims
      if (selected.type === 'pvc') {
        const pvc = selected.data;
        return (
            <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <PanelHeader 
              title={pvc.name} 
              icon={Database} 
              status={pvc.status === 'Bound' ? 'healthy' : 'degraded'} 
              onClose={onClose} 
            />
            <div className="flex-1 overflow-auto p-6">
                <AnalogyBox analogy="🎫 Think of a PVC like a voucher or ticket to claim a specific amount of storage (PV). Pods use this ticket." />
                 <div className="space-y-6">
                    <div className="bg-surface-800/50 p-4 rounded-xl space-y-2">
                        <InfoRow label="Namespace" value={pvc.namespace} />
                        <InfoRow label="Requested" value={pvc.capacity} />
                        <InfoRow label="Status" value={pvc.status} highlight={pvc.status === 'Bound'} />
                    </div>
                    {pvc.status === 'Pending' && (
                        <TroubleshootingSection items={[
                            'Check if a matching PV exists',
                            'StorageClass must match',
                            'Capacity and AccessModes must be compatible'
                        ]} />
                    )}
                </div>
            </div>
          </div>
        );
      }


  // 10. Default Intro (When 'info' is selected) or Fallback
  // If 'selected' is not one of the above but exists, we might show a generic message or just null
  return null;
}
