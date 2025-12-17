import { Box, ImageOff, RotateCcw, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui';
import { useClusterStore } from '@/store';
import { cn, formatMemory } from '@/utils';
import { educationalContent } from '../content/enhancedContent';
import { PanelHeader, InfoRow } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';
import type { ClusterSnapshot } from '@/types';

interface PodPanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
}

export function PodPanel({ selected, cluster, onClose }: PodPanelProps) {
  const { killPod, triggerCrashLoop, breakImage, causeOOM, restartPod } = useClusterStore();

  if (!selected || selected.type !== 'pod') return null;

  const pod = cluster.pods.find(p => p.id === selected.data.id) || selected.data;
  const isCrashLoop = (pod.status as string) === 'CrashLoopBackOff';
  const isError = ['CrashLoopBackOff', 'OOMKilled', 'ImagePullBackOff'].includes(pod.status as string);
  const isPending = (pod.status as string).toLowerCase() === 'pending';
  
  // Get educational content based on status
  const statusInfo = educationalContent.pod.states[pod.status as keyof typeof educationalContent.pod.states];

  return (
    <div className="fixed right-0 top-0 h-full w-[500px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <PanelHeader 
        title={pod.name} 
        icon={Box} 
        status={(pod.status as string).toLowerCase() === 'running' ? 'healthy' : isPending ? 'degraded' : 'unhealthy'} 
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
              variant="ghost" 
              className="border border-error-500/50 hover:bg-error-500/10 text-error-400 justify-start w-full"
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
