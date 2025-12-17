import { Server } from 'lucide-react';
import { educationalContent } from '../content/enhancedContent';
import { 
  PanelHeader, 
  AnalogyBox, 
  KeyPointsList, 
  TroubleshootingSection 
} from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';

interface ControlPlanePanelProps {
  selected: SelectedItem;
  onClose: () => void;
}

export function ControlPlanePanel({ selected, onClose }: ControlPlanePanelProps) {
  if (!selected || selected.type !== 'controlPlane') return null;

  const nameMap: Record<string, keyof typeof educationalContent.controlPlane> = {
    'API Server': 'api-server',
    'etcd': 'etcd',
    'Controller Manager': 'controller-manager',
    'Scheduler': 'scheduler'
  };
  const info = educationalContent.controlPlane[nameMap[selected.data.name] || 'api-server'];
  const status = selected.data.status === 'healthy' ? 'healthy' : 'degraded';
  
  return (
    <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <PanelHeader 
        title={info?.title || selected.data.name} 
        icon={Server} 
        status={status} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-auto p-6">
        <AnalogyBox analogy={info?.analogy} />
        
        <div className="mb-6">
          <p className="text-sm text-surface-300 leading-relaxed">{info?.description}</p>
        </div>

        <KeyPointsList points={info?.keyPoints} />
        <TroubleshootingSection items={info?.troubleshooting} />
      </div>
    </div>
  );
}
