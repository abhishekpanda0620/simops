
import type { ClusterSnapshot } from '@/types';
import type { SelectedItem } from './SelectionTypes';

// Import modular panels
import { ControlPlanePanel } from './panels/ControlPlanePanel';
import { PodPanel } from './panels/PodPanel';
import { NodePanel } from './panels/NodePanel';
import { WorkloadPanel } from './panels/WorkloadPanel';
import { NetworkPanel } from './panels/NetworkPanel';
import { ConfigurationPanel } from './panels/ConfigurationPanel';
import { StoragePanel } from './panels/StoragePanel';
import { InfoPanel } from './panels/InfoPanel';

interface EnhancedInfoPanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
  onKillPod?: (podId: string) => void;
}

export function EnhancedInfoPanel({ selected, cluster, onClose }: EnhancedInfoPanelProps) {
  // We keep this hook usage here or in sub-components. 
  // PodPanel and WorkloadPanel use actions internally now, but we can verify if we need to pass anything.
  // Seems sub-components import useClusterStore directly, so we don't need it here unless for props.
  // Checking previous implementation: EnhancedInfoPanel destructured actions.
  // PodPanel and WorkloadPanel now import store directly.
  
  if (!selected) return null;

  switch (selected.type) {
    case 'controlPlane':
      return <ControlPlanePanel selected={selected} onClose={onClose} />;
    
    case 'pod':
      return <PodPanel selected={selected} cluster={cluster} onClose={onClose} />;
    
    case 'node':
      return <NodePanel selected={selected} cluster={cluster} onClose={onClose} />;
    
    case 'deployment':
      return <WorkloadPanel selected={selected} cluster={cluster} onClose={onClose} />;
    
    case 'service':
    case 'ingress':
      return <NetworkPanel selected={selected} onClose={onClose} />;
    
    case 'configMap':
    case 'secret':
      return <ConfigurationPanel selected={selected} onClose={onClose} />;
    
    case 'pv':
    case 'pvc':
      return <StoragePanel selected={selected} onClose={onClose} />;

    case 'info':
    case 'nodeComponent':
      return <InfoPanel selected={selected} onClose={onClose} />;

    default:
      return null;
  }
}
