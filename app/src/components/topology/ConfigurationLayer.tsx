import { FileJson, Lock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { K8sConfigMap, K8sSecret } from '@/types';
import { cn } from '@/utils/cn';

interface ConfigurationLayerProps {
  configMaps: K8sConfigMap[];
  secrets: K8sSecret[];
  onSelectConfigMap: (cm: K8sConfigMap) => void;
  onSelectSecret: (secret: K8sSecret) => void;
  selectedConfigMapId: string | null;
  selectedSecretId: string | null;
}

export function ConfigurationLayer({
  configMaps,
  secrets,
  onSelectConfigMap,
  onSelectSecret,
  selectedConfigMapId,
  selectedSecretId
}: ConfigurationLayerProps) {
  if (configMaps.length === 0 && secrets.length === 0) return null;

  return (
    <div className="mt-8 border-t border-surface-700/50 pt-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-surface-900 border border-surface-700 rounded-full text-xs font-medium text-surface-400 flex items-center gap-2">
            <Settings className="w-3 h-3" />
            Configuration Layer
        </div>

        <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* ConfigMaps Column */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-surface-400 mb-4 px-2 flex items-center justify-between">
                    <span>ConfigMaps</span>
                    <span className="text-xs text-surface-500">Namespace Scoped</span>
                </h3>
                <div className="space-y-3">
                    {configMaps.map(cm => (
                        <motion.div
                            key={cm.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => { e.stopPropagation(); onSelectConfigMap(cm); }}
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-all relative group",
                                selectedConfigMapId === cm.id
                                    ? "bg-info-500/10 border-info-500 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                                    : "bg-surface-800 border-surface-700 hover:border-surface-600"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="w-4 h-4 text-info-400" />
                                    <div>
                                        <div className="text-sm font-medium text-surface-200">{cm.name}</div>
                                        <div className="text-xs text-surface-500">{Object.keys(cm.data).length} keys</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {configMaps.length === 0 && (
                        <div className="text-sm text-surface-500 italic p-4 text-center border border-dashed border-surface-700 rounded-lg">
                            No ConfigMaps defined
                        </div>
                    )}
                </div>
            </div>

            {/* Secrets Column */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-surface-400 mb-4 px-2 flex items-center justify-between">
                    <span>Secrets</span>
                    <span className="text-xs text-surface-500">Namespace Scoped (Encrypted)</span>
                </h3>
                <div className="space-y-3">
                    {secrets.map(secret => (
                        <motion.div
                            key={secret.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => { e.stopPropagation(); onSelectSecret(secret); }}
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-all relative group",
                                selectedSecretId === secret.id
                                    ? "bg-error-500/10 border-error-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                    : "bg-surface-800 border-surface-700 hover:border-surface-600"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-error-400" />
                                    <div>
                                        <div className="text-sm font-medium text-surface-200">{secret.name}</div>
                                        <div className="text-xs text-surface-500">{secret.type}</div>
                                    </div>
                                </div>
                                <div className="px-1.5 py-0.5 rounded text-[10px] font-medium border bg-surface-900/50 border-surface-700 text-surface-400">
                                    {Object.keys(secret.data).length} keys
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {secrets.length === 0 && (
                        <div className="text-sm text-surface-500 italic p-4 text-center border border-dashed border-surface-700 rounded-lg">
                            No Secrets defined
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
