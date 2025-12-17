import { Network, Globe } from 'lucide-react';
import { educationalContent } from '../content/enhancedContent';
import { PanelHeader, AnalogyBox, InfoRow, YamlBlock } from './EnhancedPanelComponents';
import type { SelectedItem } from '../SelectionTypes';

interface NetworkPanelProps {
  selected: SelectedItem;
  onClose: () => void;
}

export function NetworkPanel({ selected, onClose }: NetworkPanelProps) {
  if (!selected) return null;

  // Services
  if (selected.type === 'service') {
    const service = selected.data;
    const info = educationalContent.service;
    
    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={service.name} 
          icon={Network} 
          status="healthy" 
          onClose={onClose} 
        />

        <div className="flex-1 overflow-auto p-6">
           <AnalogyBox analogy={info.analogy} />
           
           <div className="mb-6">
             <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Service Configuration</h3>
             <div className="space-y-2 bg-surface-800/50 p-4 rounded-xl">
                <InfoRow label="Type" value={service.type} highlight={true} />
                <InfoRow label="Cluster IP" value={service.clusterIP} />
                <InfoRow label="Port mapping" value={`${service.ports[0].port} → ${service.ports[0].targetPort}`} />
                <InfoRow label="Target Pods" value={`${service.podIds.length} Endpoints`} />
             </div>
             <p className="mt-3 text-sm text-surface-400 italic">
               {info.types[service.type as keyof typeof info.types]}
             </p>
           </div>
           <YamlBlock data={service} kind="Service" />
        </div>
      </div>
    );
  }

  // Ingress
  if (selected.type === 'ingress') {
    const ingress = selected.data;
    
    return (
      <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <PanelHeader 
          title={ingress.name} 
          icon={Globe} 
          status="healthy" 
          onClose={onClose} 
        />

        <div className="flex-1 overflow-auto p-6">
           <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 mb-6">
             <div className="flex items-center gap-2 mb-2">
               <Globe className="w-4 h-4 text-purple-400" />
               <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Traffic Routing</span>
             </div>
             <p className="text-sm text-surface-200">
               Routing <span className="text-white font-mono">{ingress.host}</span> traffic to internal services using an Nginx controller.
             </p>
           </div>
           
           <div className="mb-6">
             <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">Route Rules</h3>
             <div className="space-y-2">
               {ingress.paths.map((path, i: number) => (
                 <div key={i} className="flex flex-col p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-1.5 py-0.5 rounded bg-surface-700 text-xs font-mono text-surface-300">{path.path}</span>
                       <span className="text-surface-600">→</span>
                       <span className="text-sm font-medium text-purple-300">{path.serviceId.replace('svc-', 'service-')}</span>
                    </div>
                    <div className="text-xs text-surface-500">Service Port: 80</div>
                 </div>
               ))}
             </div>
            </div>
            <YamlBlock data={ingress} kind="Ingress" />
         </div>
      </div>
    );
  }

  return null;
}
