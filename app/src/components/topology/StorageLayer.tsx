import { Database, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import type { K8sPV, K8sPVC } from '@/types';
import { cn } from '@/utils/cn';

interface StorageLayerProps {
  pvs: K8sPV[];
  pvcs: K8sPVC[];
  onSelectPV: (pv: K8sPV) => void;
  onSelectPVC: (pvc: K8sPVC) => void;
  selectedPVId: string | null;
  selectedPVCId: string | null;
}

export function StorageLayer({ 
  pvs, 
  pvcs, 
  onSelectPV, 
  onSelectPVC,
  selectedPVId,
  selectedPVCId 
}: StorageLayerProps) {
  if (pvs.length === 0 && pvcs.length === 0) return null;

  return (
    <div className="mt-8 border-t border-surface-700/50 pt-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-surface-900 border border-surface-700 rounded-full text-xs font-medium text-surface-400 flex items-center gap-2">
        <Database className="w-3 h-3" />
        Storage Layer
      </div>

      <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* PVC Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-surface-400 mb-4 px-2 flex items-center justify-between">
            <span>PersistentVolumeClaims</span>
            <span className="text-xs text-surface-500">Namespace Scoped</span>
          </h3>
          <div className="space-y-3">
            {pvcs.map(pvc => (
              <motion.div
                key={pvc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={(e) => { e.stopPropagation(); onSelectPVC(pvc); }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all relative group",
                  selectedPVCId === pvc.id
                    ? "bg-accent-500/10 border-accent-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-surface-800 border-surface-700 hover:border-surface-600"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent-400" />
                    <div>
                      <div className="text-sm font-medium text-surface-200">{pvc.name}</div>
                      <div className="text-xs text-surface-500">{pvc.capacity} • {pvc.accessModes[0]}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                    pvc.status === 'Bound' ? "bg-success-500/10 border-success-500/20 text-success-400" :
                    pvc.status === 'Pending' ? "bg-warning-500/10 border-warning-500/20 text-warning-400" :
                    "bg-error-500/10 border-error-500/20 text-error-400"
                  )}>
                    {pvc.status}
                  </div>
                </div>
                
                {/* Visual Connection Line Start (Right side) */}
                {pvc.status === 'Bound' && (
                  <div className="absolute top-1/2 -right-3 w-3 h-0.5 bg-success-500/30" />
                )}
              </motion.div>
            ))}
            {pvcs.length === 0 && (
                <div className="text-sm text-surface-500 italic p-4 text-center border border-dashed border-surface-700 rounded-lg">
                    No PVCs defined
                </div>
            )}
          </div>
        </div>

        {/* PV Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-surface-400 mb-4 px-2 flex items-center justify-between">
            <span>PersistentVolumes</span>
            <span className="text-xs text-surface-500">Cluster Scoped</span>
          </h3>
          <div className="space-y-3">
             {pvs.map(pv => (
              <motion.div
                key={pv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={(e) => { e.stopPropagation(); onSelectPV(pv); }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all relative",
                  selectedPVId === pv.id
                    ? "bg-primary-500/10 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "bg-surface-800 border-surface-700 hover:border-surface-600"
                )}
              >
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-2">
                     <HardDrive className="w-4 h-4 text-primary-400" />
                     <div>
                       <div className="text-sm font-medium text-surface-200">{pv.name}</div>
                       <div className="text-xs text-surface-500">{pv.capacity} • {pv.reclaimPolicy}</div>
                     </div>
                   </div>
                   <div className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                    pv.status === 'Bound' ? "bg-success-500/10 border-success-500/20 text-success-400" :
                    pv.status === 'Available' ? "bg-primary-500/10 border-primary-500/20 text-primary-400" :
                    "bg-surface-500/10 border-surface-500/20 text-surface-400"
                  )}>
                    {pv.status}
                  </div>
                 </div>

                 {/* Visual Connection Line End (Left side) */}
                 {pv.status === 'Bound' && (
                  <div className="absolute top-1/2 -left-3 w-3 h-0.5 bg-success-500/30" />
                )}
              </motion.div>
             ))}
             {pvs.length === 0 && (
                <div className="text-sm text-surface-500 italic p-4 text-center border border-dashed border-surface-700 rounded-lg">
                    No PVs created
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Central binding indicators visualization could go here if we positioned them absolutely */}
    </div>
  );
}
