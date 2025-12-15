import { Server, X, Lightbulb, CheckCircle, AlertTriangle, FileCode } from 'lucide-react';
import { cn } from '@/utils';

// Helper Components

interface PanelHeaderProps {
  title: string;
  icon: typeof Server;
  status: 'healthy' | 'degraded' | 'unhealthy';
  onClose: () => void;
}

export function PanelHeader({ title, icon: Icon, status, onClose }: PanelHeaderProps) {
  return (
    <div className="p-6 border-b border-surface-700/50 flex items-center justify-between sticky top-0 bg-surface-900/95 backdrop-blur-sm z-10">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          status === 'healthy' ? "bg-success-500/10 text-success-400" :
          status === 'degraded' ? "bg-warning-500/10 text-warning-400" :
          "bg-error-500/10 text-error-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-50 leading-tight">{title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === 'healthy' ? "bg-success-500" :
              status === 'degraded' ? "bg-warning-500" :
              "bg-error-500"
            )} />
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider",
              status === 'healthy' ? "text-success-400" :
              status === 'degraded' ? "text-warning-400" :
              "text-error-400"
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function AnalogyBox({ analogy }: { analogy: string }) {
  if (!analogy) return null;
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-accent-500/10 to-transparent border border-accent-500/20 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-accent-400" />
        <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">Analogy</span>
      </div>
      <p className="text-sm text-surface-200 italic leading-relaxed">"{analogy}"</p>
    </div>
  );
}

export function KeyPointsList({ points }: { points: string[] }) {
  if (!points?.length) return null;
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider">Key Functions</h3>
      <ul className="grid gap-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-surface-300 p-2 rounded-lg bg-surface-800/50">
            <CheckCircle className="w-4 h-4 text-success-500/70 mt-0.5 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TroubleshootingSection({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-8 p-4 rounded-xl bg-surface-800/30 border border-surface-700/50">
      <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning-500/70" />
        Troubleshooting
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-surface-400 flex items-start gap-2">
            <span className="text-surface-600 mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-surface-800 last:border-0">
      <span className="text-sm text-surface-400">{label}</span>
      <span className={cn(
        "text-sm font-mono",
        highlight ? "text-accent-400 font-medium" : "text-surface-200"
      )}>
        {value}
      </span>
    </div>
  );
}

// Simple YAML serializer (since we can't use js-yaml)
function toYaml(obj: unknown, indent = 0): string {
    const spacer = ' '.repeat(indent);
    if (!obj) return '';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(obj as Record<string, any>).map(([key, value]) => {
        if (value === undefined || value === null) return '';
        
        if (Array.isArray(value)) {
            if (value.length === 0) return `${spacer}${key}: []`;
            return `${spacer}${key}:\n` + value.map(v => {
                if (typeof v === 'object') {
                    // Start array item with dash, indent subsequent lines
                    const str = toYaml(v, indent + 2);
                    return `${spacer}- ${str.trimStart()}`; 
                }
                return `${spacer}- ${v}`;
            }).join('\n');
        }
        
        if (typeof value === 'object') {
            if (Object.keys(value as object).length === 0) return `${spacer}${key}: {}`;
            return `${spacer}${key}:\n${toYaml(value, indent + 2)}`;
        }
        
        return `${spacer}${key}: ${value}`;
    }).filter(Boolean).join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function YamlBlock({ data, kind }: { data: any; kind: string }) {
    // Construct K8s-like object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const k8sObj: any = {
        apiVersion: kind === 'Deployment' ? 'apps/v1' : 'v1',
        kind: kind,
        metadata: {
            name: data.name,
            namespace: data.namespace || 'default',
            labels: data.selector || data.labels || undefined,
            ...(data.strategy ? { strategy: data.strategy } : {}) // deployment specific really but fit into metadata sometimes or spec
        },
        spec: {
            ...data
        }
    };

    // Cleanup internal fields from Spec
    const internalKeys = ['id', 'name', 'namespace', 'status', 'conditions', 'events', 'podIds', 'createdAt', 'startedAt', 'strategy', 'selector', 'labels'];
    internalKeys.forEach(key => delete k8sObj.spec[key]);
    
    // Move specific fields to spec where appropriate if they were effectively root in our model
    if (kind === 'Deployment') {
         if (data.replicas) k8sObj.spec.replicas = data.replicas.desired;
         if (data.selector) k8sObj.spec.selector = { matchLabels: data.selector };
         if (data.strategy) k8sObj.spec.strategy = { type: data.strategy };
    }
    if (kind === 'Service') {
         if (data.type) k8sObj.spec.type = data.type;
         if (data.ports) k8sObj.spec.ports = data.ports;
         if (data.selector) k8sObj.spec.selector = data.selector;
         if (data.clusterIP) k8sObj.spec.clusterIP = data.clusterIP;
    }

    // Sort of hacky cleanup to make it look nicer
    if (Object.keys(k8sObj.spec).length === 0) delete k8sObj.spec;

    const yamlString = toYaml(k8sObj);

    return (
        <div className="mt-8">
            <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4" /> YAML Configuration
            </h3>
            <div className="bg-surface-950 p-4 rounded-lg font-mono text-xs text-surface-300 overflow-x-auto border border-surface-800 max-h-[300px] overflow-y-auto">
                <pre>{yamlString}</pre>
            </div>
        </div>
    );
}
