import { Server, X, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
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
