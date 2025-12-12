import { memo } from 'react';
import { cn, percentage } from '@/utils';
import type { K8sNode, K8sPod } from '@/types';
import { Server, Cpu, HardDrive, Container } from 'lucide-react';

interface WorkerNodeProps {
  node: K8sNode;
  pods: K8sPod[];
  selectedPodId: string | null;
  isSelected: boolean;
  onSelectNode: (nodeId: string) => void;
  onSelectPod: (pod: K8sPod) => void;
}

function WorkerNodeComponent({
  node,
  pods,
  selectedPodId,
  isSelected,
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
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-100">{node.name}</p>
          <p className="text-xs text-surface-400">{node.kubeletVersion}</p>
        </div>
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-full',
            node.status === 'running' && 'bg-success-500',
            node.status === 'failed' && 'bg-error-500 animate-pulse',
            node.status === 'unknown' && 'bg-warning-500 animate-pulse'
          )}
        />
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
                selectedPodId !== pod.id && 'hover:scale-102'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn('w-2 h-2 rounded-full', podDotColors[pod.status] || podDotColors.unknown)} />
                <span className="text-xs text-surface-200 truncate">
                  {pod.name.split('-').slice(0, 2).join('-')}
                </span>
              </div>
              {pod.restarts > 0 && (
                <span className="text-xs text-error-400">
                  {pod.restarts} restart{pod.restarts > 1 ? 's' : ''}
                </span>
              )}
              {pod.containers[0]?.waitingReason && (
                <span className="text-xs text-warning-400 block truncate">
                  {pod.containers[0].waitingReason}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const WorkerNode = memo(WorkerNodeComponent);
