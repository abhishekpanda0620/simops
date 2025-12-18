import { ArrowDown } from 'lucide-react';
import { cn } from '@/utils';
import { isInTrafficPath, type TrafficState } from '../TrafficUtils';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from '../SelectionTypes';

interface ServicesLayerProps {
  cluster: ClusterSnapshot;
  selected: SelectedItem;
  trafficState: TrafficState;
  onSelect: (item: SelectedItem) => void;
}

export function ServicesLayer({
  cluster,
  selected,
  trafficState,
  onSelect
}: ServicesLayerProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-500" />
        Services
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cluster.services.map((svc) => {
          const isSelected = selected?.type === 'service' && selected.data.id === svc.id;
          return (
            <div
              key={svc.id}
              onClick={() => onSelect({ type: 'service', data: svc })}
              className={cn(
                'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                'border-accent-500/30 bg-accent-500/5 hover:bg-accent-500/15',
                isSelected && 'ring-2 ring-primary-400 scale-105',
                isInTrafficPath('service', svc.id, trafficState) && 'traffic-active border-success-500/50 bg-success-500/5'
              )}
            >
              <p className="text-sm font-medium text-surface-200">{svc.name}</p>
              <p className="text-xs text-surface-400">
                {svc.type} · {svc.ports[0]?.port}
              </p>
              <p className="text-xs text-accent-400">
                → {svc.podIds.length} pod{svc.podIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>
      <ArrowDown className={cn(
        "w-5 h-5 my-2 mx-auto transition-colors",
        trafficState.isFlowing ? "text-success-400" : "text-accent-500/50"
      )} />
    </div>
  );
}
