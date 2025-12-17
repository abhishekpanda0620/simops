import { HardDrive, Database } from 'lucide-react';
import { PanelHeader, AnalogyBox, InfoRow, YamlBlock, TroubleshootingSection } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';

interface StoragePanelProps {
  selected: SelectedItem;
  onClose: () => void;
}

export function StoragePanel({ selected, onClose }: StoragePanelProps) {
  if (!selected) return null;
  // PersistentVolumes
  if (selected.type === 'pv') {
    const pv = selected.data;
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={pv.name} 
          icon={HardDrive} 
          status={pv.status === 'Bound' ? 'healthy' : 'degraded'} 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
            <AnalogyBox analogy="📦 Think of a PV like a physical hard drive you plug into a computer. It exists independently of the computer." />
             <div className="space-y-6">
                <div className="bg-surface-800/50 p-4 rounded-xl space-y-2">
                    <InfoRow label="Capacity" value={pv.capacity} />
                    <InfoRow label="Access Mode" value={pv.accessModes.join(', ')} />
                    <InfoRow label="Reclaim Policy" value={pv.reclaimPolicy} />
                    <InfoRow label="Status" value={pv.status} highlight={pv.status === 'Bound'} />
                </div>
             </div>
             <YamlBlock data={pv} kind="PersistentVolume" />
        </div>
      </div>
    );
  }

  // PersistentVolumeClaims
  if (selected.type === 'pvc') {
    const pvc = selected.data;
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={pvc.name} 
          icon={Database} 
          status={pvc.status === 'Bound' ? 'healthy' : 'degraded'} 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
            <AnalogyBox analogy="🎫 Think of a PVC like a voucher or ticket to claim a specific amount of storage (PV). Pods use this ticket." />
             <div className="space-y-6">
                <div className="bg-surface-800/50 p-4 rounded-xl space-y-2">
                    <InfoRow label="Namespace" value={pvc.namespace} />
                    <InfoRow label="Requested" value={pvc.capacity} />
                    <InfoRow label="Status" value={pvc.status} highlight={pvc.status === 'Bound'} />
                </div>
                {pvc.status === 'Pending' && (
                    <TroubleshootingSection items={[
                        'Check if a matching PV exists',
                        'StorageClass must match',
                        'Capacity and AccessModes must be compatible'
                    ]} />
                )}
             </div>
             <YamlBlock data={pvc} kind="PersistentVolumeClaim" />
        </div>
      </div>
    );
  }

  return null;
}
