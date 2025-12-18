import { cn } from '@/utils';
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from '../SelectionTypes';

interface DeploymentsLayerProps {
  cluster: ClusterSnapshot;
  selected: SelectedItem;
  onSelect: (item: SelectedItem) => void;
}

export function DeploymentsLayer({
  cluster,
  selected,
  onSelect
}: DeploymentsLayerProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          Workload Controllers (Deployments)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cluster.deployments?.map((deploy) => {
              const isSelected = selected?.type === 'deployment' && selected.data.id === deploy.id;
              return (
              <div
                  key={deploy.id}
                  onClick={() => onSelect({ type: 'deployment', data: deploy })}
                  className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                  'border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/15',
                  isSelected && 'ring-2 ring-primary-400 scale-105'
                  )}
              >
                  <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-surface-200">{deploy.name}</p>
                      <p className="text-xs text-surface-400">
                      {deploy.replicas.ready} / {deploy.replicas.desired} Ready
                      </p>
                  </div>
                  <div className="bg-surface-800/50 px-2 py-1 rounded text-xs text-primary-300 font-mono">
                      ReplicaSet
                  </div>
                  </div>
              </div>
              );
          })}
      </div>
    </div>
  );
}
