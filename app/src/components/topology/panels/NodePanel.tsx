import { Server } from 'lucide-react';
import { cn, formatMemory } from '@/utils';
import { educationalContent } from '../content/enhancedContent';
import { PanelHeader, AnalogyBox, TroubleshootingSection } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';
import type { ClusterSnapshot } from '@/types';

interface NodePanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
}

export function NodePanel({ selected, cluster, onClose }: NodePanelProps) {
  if (!selected || selected.type !== 'node') return null;

  const node = cluster.nodes.find(n => n.id === selected.data.id) || selected.data;
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
        status={node.conditions.some((c) => c.status === 'False') ? 'degraded' : 'healthy'} 
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
