import { memo } from 'react';
import { cn, percentage } from '@/utils';
import type { K8sNode, K8sPod } from '@/types';
import { Server, Cpu, HardDrive, Container, Box } from 'lucide-react';

interface WorkerNodeProps {
  node: K8sNode;
  pods: K8sPod[];
  selectedPodId: string | null;
  trafficTargetPodId?: string | null;
  isSelected: boolean;
  activeComponent?: 'kubelet' | 'kube-proxy' | null;
  onSelectNode: (nodeId: string) => void;
  onSelectPod: (pod: K8sPod) => void;
}

function WorkerNodeComponent({
  node,
  pods,
  selectedPodId,
  trafficTargetPodId,
  isSelected,
  activeComponent,
  onSelectNode,
  onSelectPod,
}: WorkerNodeProps) {
  const cpuPercent = percentage(node.cpu.used, node.cpu.total);
  const memPercent = percentage(node.memory.used, node.memory.total);

  const statusColors = {
    running: 'border-success-500',
    pending: 'border-warning-500',
    failed: 'border-error-500',
    unknown: 'border-surface-500',
    succeeded: 'border-success-500',
  };

  const podStatusColors: Record<string, string> = {
    running: 'bg-success-500/20 border-success-500/50',
    pending: 'bg-warning-500/20 border-warning-500/50',
    failed: 'bg-error-500/20 border-error-500/50',
    unknown: 'bg-surface-500/20 border-surface-500/50',
    succeeded: 'bg-success-500/20 border-success-500/50',
  };

  const podDotColors: Record<string, string> = {
    running: 'bg-success-500',
    pending: 'bg-warning-500 animate-pulse',
    failed: 'bg-error-500',
    unknown: 'bg-surface-500',
    succeeded: 'bg-success-500',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 min-w-[280px]',
        statusColors[node.status],
        node.status === 'running' ? 'bg-surface-800/60' : 'bg-error-500/10',
        isSelected && 'ring-2 ring-primary-400 ring-offset-2 ring-offset-surface-950'
      )}
    >
      {/* Node Header */}
      <div
        onClick={() => onSelectNode(node.id)}
        className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-700 cursor-pointer hover:opacity-80"
      >
        <Server className="w-5 h-5 text-accent-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-surface-100 truncate">{node.name}</p>
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                node.status === 'running' && 'bg-success-500',
                node.status === 'failed' && 'bg-error-500 animate-pulse',
                node.status === 'unknown' && 'bg-warning-500 animate-pulse'
              )}
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-surface-400 mt-0.5">
            <span>{node.kubeletVersion}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-surface-500" />
            <div className="flex items-center gap-1" title={node.containerRuntime || 'containerd'}>
               <Box className="w-3 h-3 text-surface-500" />
               <span className="truncate max-w-[80px]">
                 {node.containerRuntime || 'containerd'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Bars */}
      <div className="space-y-2 mb-4">
        {/* CPU */}
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-surface-400" />
          <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                cpuPercent > 80 ? 'bg-error-500' : cpuPercent > 60 ? 'bg-warning-500' : 'bg-success-500'
              )}
              style={{ width: `${cpuPercent}%` }}
            />
          </div>
          <span className="text-xs text-surface-400 w-12 text-right">{cpuPercent}%</span>
        </div>

        {/* Memory */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-surface-400" />
          <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                memPercent > 80 ? 'bg-error-500' : memPercent > 60 ? 'bg-warning-500' : 'bg-success-500'
              )}
              style={{ width: `${memPercent}%` }}
            />
          </div>
          <span className="text-xs text-surface-400 w-12 text-right">{memPercent}%</span>
        </div>
      </div>
      
      {/* System Components */}
      <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={cn(
             "p-2 rounded bg-surface-900 border text-center transition-all duration-300",
             activeComponent === 'kubelet' ? "border-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-primary-500/10" : "border-surface-700"
          )}>
             <div className="text-[10px] font-mono text-surface-300 uppercase tracking-wider mb-1">Node Agent</div>
             <div className={cn("font-semibold text-xs", activeComponent === 'kubelet' ? "text-primary-300" : "text-surface-200")}>kubelet</div>
          </div>
          <div className={cn(
             "p-2 rounded bg-surface-900 border text-center transition-all duration-300",
             activeComponent === 'kube-proxy' ? "border-accent-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-accent-500/10" : "border-surface-700"
          )}>
             <div className="text-[10px] font-mono text-surface-300 uppercase tracking-wider mb-1">Network</div>
             <div className={cn("font-semibold text-xs", activeComponent === 'kube-proxy' ? "text-accent-300" : "text-surface-200")}>kube-proxy</div>
          </div>
      </div>

      {/* Pods */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Container className="w-3.5 h-3.5" />
          <span>Pods ({pods.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {pods.map((pod) => (
            <div
              key={pod.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPod(pod);
              }}
              className={cn(
                'p-2 rounded-lg border cursor-pointer transition-all duration-200',
                podStatusColors[pod.status] || podStatusColors.unknown,
                selectedPodId === pod.id && 'ring-2 ring-primary-400 scale-105',
                selectedPodId !== pod.id && 'hover:scale-102',
                trafficTargetPodId === pod.id && 'traffic-target-pod'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={cn('w-2 h-2 rounded-full', podDotColors[pod.status] || podDotColors.unknown)} />
                <span className="text-xs text-surface-200 truncate font-medium">
                  {pod.name.split('-').slice(0, 2).join('-')}
                </span>
              </div>
              
              {/* Internal Container Visualization */}
              <div className="flex flex-col gap-1 mb-1.5 px-0.5">
                {/* Init Containers */}
                {pod.initContainers && pod.initContainers.length > 0 && (
                   <div className="flex gap-1 items-center">
                      <span className="text-[8px] text-surface-400 uppercase tracking-tight mr-1">Init</span>
                      {pod.initContainers.map((c, i) => (
                        <div
                          key={`init-${i}`}
                          className={cn(
                            "h-1.5 w-1.5 rounded-sm transition-all duration-300",
                            c.state === 'terminated' && c.terminatedReason === 'Completed' ? "bg-success-500" : 
                            c.state === 'running' ? "bg-accent-400 animate-pulse" : "bg-surface-600"
                          )}
                          title={`Init: ${c.name} (${c.state})`}
                        />
                      ))}
                   </div>
                )}
                
                {/* App Containers */}
                <div className="flex gap-1 flex-wrap">
                  {pod.containers.map((c, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-sm transition-all duration-300 border-[0.5px] border-surface-950",
                        c.state === 'running' ? "bg-success-400 shadow-[0_0_4px_rgba(74,222,128,0.4)]" :
                        c.state === 'waiting' ? "bg-warning-400 animate-pulse" :
                        c.state === 'terminated' ? "bg-surface-500" :
                        "bg-surface-600"
                      )}
                      title={`${c.name} (${c.state})`}
                    />
                  ))}
                  {/* Fallback if no containers array yet */}
                  {(!pod.containers || pod.containers.length === 0) && (
                     <div className="h-2 w-2 rounded-sm bg-accent-400/50" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                {pod.restarts > 0 && (
                  <span className="text-[10px] text-error-400">
                    {pod.restarts} restart{pod.restarts > 1 ? 's' : ''}
                  </span>
                )}
                {pod.containers[0]?.waitingReason && (
                  <span className="text-[10px] text-warning-400 block truncate">
                    {pod.containers[0].waitingReason}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const WorkerNode = memo(WorkerNodeComponent);
