import { X, ExternalLink, Lightbulb, Info, Box, Network, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import type { K8sPod, K8sService, K8sIngress } from '@/types';
import {
  getPodDetails,
  getServiceDetails,
  getIngressDetails,
} from './content/educationalContent';


type SelectedResource =
  | { type: 'pod'; data: K8sPod }
  | { type: 'service'; data: K8sService }
  | { type: 'ingress'; data: K8sIngress }
  | null;

interface InfoPanelProps {
  selected: SelectedResource;
  onClose: () => void;
}

export function InfoPanel({ selected, onClose }: InfoPanelProps) {
  if (!selected) {
    return (
      <div className="w-80 bg-surface-900 border-l border-surface-700 p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-primary-500/10 mb-4">
          <Info className="w-8 h-8 text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">
          Click to Learn
        </h3>
        <p className="text-sm text-surface-400">
          Click on any component in the topology to learn what it does and how it works.
        </p>
      </div>
    );
  }

  const icons = {
    pod: Box,
    service: Network,
    ingress: Globe,
  };

  const Icon = icons[selected.type];
  const details = getDetails(selected);

  return (
    <div className="w-80 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-surface-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-400" />
          <span className="font-semibold text-surface-100">{details.title}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface-700 text-surface-400 hover:text-surface-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Description */}
        <div>
          <p className="text-sm text-surface-300 leading-relaxed">
            {details.description}
          </p>
        </div>

        {/* Analogy Box */}
        <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-medium text-primary-400">Simple Analogy</span>
          </div>
          <p className="text-sm text-surface-200">{details.analogy}</p>
        </div>

        {/* Key Points */}
        <div>
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">
            Key Points
          </h4>
          <ul className="space-y-2">
            {details.keyPoints.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                <span className="text-primary-400 mt-1">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Specific Details */}
        <div>
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">
            This {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
          </h4>
          <div className="space-y-2 text-sm">
            {Object.entries(details.specific).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-surface-400 capitalize">{formatKey(key)}</span>
                <span className="text-surface-200 font-mono text-xs">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Explanation (for pods) */}
        {'statusExplanation' in details && (
          <div className="p-3 rounded-lg bg-surface-800">
            <p className="text-sm text-surface-300">{details.statusExplanation}</p>
          </div>
        )}

        {/* Type Explanation (for services) */}
        {'typeExplanation' in details && (
          <div className="p-3 rounded-lg bg-surface-800">
            <p className="text-sm text-surface-300">{details.typeExplanation}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-surface-700">
        <a
          href={details.learnMore}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button variant="secondary" className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            Learn More
          </Button>
        </a>
      </div>
    </div>
  );
}

function getDetails(selected: NonNullable<SelectedResource>) {
  switch (selected.type) {
    case 'pod':
      return getPodDetails(selected.data);
    case 'service':
      return getServiceDetails(selected.data);
    case 'ingress':
      return getIngressDetails(selected.data);
  }
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').trim();
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length !== 1 ? 's' : ''}`;
  }
  if (typeof value === 'object' && value !== null) {
    return `${Object.keys(value).length} entries`;
  }
  return String(value);
}
