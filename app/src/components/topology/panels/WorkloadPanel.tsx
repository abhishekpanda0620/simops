import { Box } from 'lucide-react';
import { Button } from '@/components/ui';
import { useClusterStore } from '@/store';
import { PanelHeader, AnalogyBox, InfoRow, YamlBlock } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';
import type { ClusterSnapshot } from '@/types';

interface WorkloadPanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
}

export function WorkloadPanel({ selected, cluster, onClose }: WorkloadPanelProps) {
  const { scaleDeployment } = useClusterStore();

  if (!selected || selected.type !== 'deployment') return null;

  const deployment = cluster.deployments?.find(d => d.id === selected.data.id) || selected.data;
  
  // Safety check - if deployment or replicas is undefined, don't render
  if (!deployment || !deployment.replicas) return null;
  
  return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <PanelHeader 
        title={deployment.name} 
        icon={Box} 
        status={deployment.replicas.ready === deployment.replicas.desired ? 'healthy' : 'degraded'} 
        onClose={onClose} 
      />
      <div className="flex-1 overflow-auto p-6">
          <AnalogyBox analogy="🏭 Think of a Deployment as a factory manager. You tell them 'I want 3 replicas of this product', and they ensure exactly 3 are always available." />
           
           <div className="bg-surface-800/50 p-4 rounded-xl space-y-4 mb-6">
              <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider">Replica Status</h3>
              <div className="flex items-center justify-between bg-surface-900/50 p-3 rounded-lg border border-surface-700">
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-surface-100">{deployment.replicas.desired}</span>
                      <span className="text-xs text-surface-400 uppercase">Desired</span>
                  </div>
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-success-400">{deployment.replicas.ready}</span>
                      <span className="text-xs text-surface-400 uppercase">Ready</span>
                  </div>
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-primary-400">{deployment.replicas.available}</span>
                      <span className="text-xs text-surface-400 uppercase">Available</span>
                  </div>
              </div>

              <div className="flex gap-2">
                  <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => scaleDeployment(deployment.id, deployment.replicas.desired - 1)}
                      disabled={deployment.replicas.desired <= 0}
                  >
                      <span className="mr-2">Scale Down</span>
                  </Button>
                  <Button 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => scaleDeployment(deployment.id, deployment.replicas.desired + 1)}
                  >
                       <span className="mr-2">Scale Up</span>
                  </Button>
              </div>
          </div>

           <div className="space-y-6">
              <div className="bg-surface-800/50 p-4 rounded-xl space-y-2">
                  <InfoRow label="Namespace" value={deployment.namespace} />
                  <InfoRow label="Strategy" value={deployment.strategy} />
                  <InfoRow label="Selector" value={Object.entries(deployment.selector || {}).map(([k, v]) => `${k}=${v}`).join(', ')} />
              </div>
          </div>
          <YamlBlock data={deployment} kind="Deployment" />
      </div>
    </div>
  );
}
