import { FileJson, Lock } from 'lucide-react';
import { PanelHeader, YamlBlock } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';

interface ConfigurationPanelProps {
  selected: SelectedItem;
  onClose: () => void;
}

export function ConfigurationPanel({ selected, onClose }: ConfigurationPanelProps) {
  if (!selected) return null;
  // ConfigMaps
  if (selected.type === 'configMap') {
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={selected.data.name} 
          icon={FileJson} 
          status="healthy" 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
             <div className="mb-6">
                <p className="text-sm text-surface-300 mb-4">
                    ConfigMaps decouple configuration artifacts from image content to keep containerized applications portable.
                </p>
                <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Data</h3>
                <div className="bg-surface-950 p-4 rounded-lg font-mono text-xs text-surface-300 overflow-x-auto border border-surface-800">
                    <pre>{JSON.stringify(selected.data.data, null, 2)}</pre>
                </div>
            </div>
            <YamlBlock data={selected.data} kind="ConfigMap" />
        </div>
      </div>
    );
  }

  // Secrets
  if (selected.type === 'secret') {
    return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={selected.data.name} 
          icon={Lock} 
          status="healthy" 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
             <div className="mb-6">
                <p className="text-sm text-surface-300 mb-4">
                    Secrets let you store and manage sensitive information, such as passwords, OAuth tokens, and ssh keys.
                </p>
                <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20 mb-4">
                     <p className="text-xs text-warning-400 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Data is base64 encoded, not encrypted by default!
                     </p>
                </div>
                <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Data keys</h3>
                <div className="space-y-2">
                    {Object.keys(selected.data.data).map(key => (
                        <div key={key} className="flex justify-between items-center p-2 rounded bg-surface-800/50">
                            <span className="text-sm font-mono text-surface-300">{key}</span>
                            <span className="text-xs text-surface-500 italic">******</span>
                        </div>
                    ))}
                </div>
            </div>
            <YamlBlock data={selected.data} kind="Secret" />
        </div>
      </div>
    );
  }

  return null;
}
