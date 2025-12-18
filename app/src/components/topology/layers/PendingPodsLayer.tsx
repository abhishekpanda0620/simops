import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from '../SelectionTypes';

interface PendingPodsLayerProps {
  cluster: ClusterSnapshot;
  selected: SelectedItem;
  onSelect: (item: SelectedItem) => void;
}

export function PendingPodsLayer({
  cluster,
  selected,
  onSelect
}: PendingPodsLayerProps) {
  const pendingPods = cluster.pods.filter(p => !p.nodeId);
  
  if (pendingPods.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-warning-400 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Unscheduled Pods (Pending)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pendingPods.map((pod) => {
          const isSelected = selected?.type === 'pod' && selected.data.id === pod.id;
          return (
            <div
              key={pod.id}
              onClick={() => onSelect({ type: 'pod', data: pod })}
              className={cn(
                'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                'border-warning-500/50 bg-warning-500/10 hover:bg-warning-500/20',
                isSelected && 'ring-2 ring-primary-400 scale-105'
              )}
            >
              <p className="text-sm font-medium text-surface-200 truncate">{pod.name.split('-').slice(0, 2).join('-')}</p>
              <p className="text-xs text-warning-400">Pending - No node</p>
              <p className="text-xs text-surface-400 truncate">
                {pod.conditions.find(c => c.reason)?.message?.slice(0, 30) || 'Waiting for scheduling'}...
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
