import { Network, ArrowDown } from 'lucide-react';
import { cn } from '@/utils';
import { isInTrafficPath, type TrafficState } from '../TrafficUtils';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from '../SelectionTypes';

interface IngressLayerProps {
  cluster: ClusterSnapshot;
  selected: SelectedItem;
  trafficState: TrafficState;
  onSelect: (item: SelectedItem) => void;
}

export function IngressLayer({
  cluster,
  selected,
  trafficState,
  onSelect
}: IngressLayerProps) {
  return (
    <div className="flex flex-col items-center">
      {cluster.ingresses.map((ingress) => {
        const isSelected = selected?.type === 'ingress' && selected.data.id === ingress.id;
        return (
          <div
            key={ingress.id}
            onClick={() => onSelect({ type: 'ingress', data: ingress })}
            className={cn(
              'px-6 py-3 rounded-lg border-2 cursor-pointer transition-all',
              'border-accent-500 bg-accent-500/10 hover:bg-accent-500/20',
              isSelected && 'ring-2 ring-primary-400 scale-105',
              isInTrafficPath('ingress', ingress.id, trafficState) && 'traffic-active border-success-500 bg-success-500/10'
            )}
          >
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-accent-400" />
              <div>
                <p className="font-semibold text-surface-100">Ingress: {ingress.name}</p>
                <p className="text-xs text-surface-400">
                  {ingress.host} • {ingress.paths.length} route{ingress.paths.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <ArrowDown className="w-5 h-5 text-accent-500/50 my-2" />
    </div>
  );
}
