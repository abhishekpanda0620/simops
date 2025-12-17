import { Globe, Server } from 'lucide-react';
import { cn } from '@/utils';
import { generalContent, nodeComponentContent } from '../content/enhancedContent';
import { PanelHeader, AnalogyBox, KeyPointsList, TroubleshootingSection } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';

interface InfoPanelProps {
  selected: SelectedItem;
  onClose: () => void;
}

export function InfoPanel({ selected, onClose }: InfoPanelProps) {
  if (!selected) return null;
  // General Info (Headers)
  if (selected.type === 'info') {
    const info = generalContent[selected.data.id];
    if (!info) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={info.title} 
          icon={Globe} 
          status="healthy" 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-6">
            <AnalogyBox analogy={info.analogy} />
            <div className="mb-6">
                <p className="text-sm text-surface-300 leading-relaxed bg-surface-800/50 p-4 rounded-lg border border-surface-700">
                    {info.description}
                </p>
            </div>
            <KeyPointsList points={info.keyPoints} />
        </div>
      </div>
    );
  }

  // Node Components (Kubelet / Kube-proxy)
  if (selected.type === 'nodeComponent') {
      const { component, nodeName } = selected.data;
      const info = nodeComponentContent[component];
      
      return (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <PanelHeader 
            title={`${info.title} (${nodeName})`}
            icon={Server} 
            status="healthy" 
            onClose={onClose} 
          />
          <div className="flex-1 overflow-auto p-6">
              <AnalogyBox analogy={info.analogy} />
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-mono font-medium",
                        component === 'kubelet' ? "bg-primary-500/20 text-primary-300" : "bg-accent-500/20 text-accent-300"
                    )}>
                        System Component
                    </span>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">
                    {info.description}
                </p>
              </div>
  
              <KeyPointsList points={info.keyPoints} />
              <TroubleshootingSection items={info.troubleshooting} />
          </div>
        </div>
      );
  }

  return null;
}
