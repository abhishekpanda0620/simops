import { GitBranch, Clock, User, GitCommit, CheckCircle } from 'lucide-react';
import { Card, Combobox } from '@/components/ui';
import type { Pipeline } from '@/types/pipeline';
import { statusConfig, formatDuration, StatusBadge } from './pipelineUtils';

// Pipeline Selector using Combobox
interface PipelineSelectorProps {
  pipelines: Array<{ slug: string; name: string; status: string }>;
  selected: string;
  onSelect: (slug: string) => void;
}

export function PipelineSelector({ pipelines, selected, onSelect }: PipelineSelectorProps) {
  const options = pipelines.map(p => ({
    value: p.slug,
    label: `${p.name} (${p.status})`
  }));

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-surface-300 whitespace-nowrap">Pipeline:</span>
      <Combobox
        options={options}
        value={selected}
        onChange={onSelect}
        placeholder="Select pipeline..."
        searchPlaceholder="Search pipelines..."
        className="w-64"
      />
    </div>
  );
}

// Pipeline Header with trigger info
interface PipelineHeaderProps {
  pipeline: Pipeline;
  onLearnMore: () => void;
}

export function PipelineHeader({ pipeline, onLearnMore }: PipelineHeaderProps) {
  const Icon = statusConfig[pipeline.status]?.Icon || CheckCircle;
  
  return (
    <Card className="mb-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className={`w-12 h-12 rounded-lg ${statusConfig[pipeline.status]?.bgColor} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all`}
            onClick={onLearnMore}
            title="Click to learn about CI/CD pipelines"
          >
            <Icon className={`w-6 h-6 ${statusConfig[pipeline.status]?.color}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-100">{pipeline.name}</h2>
            <div className="flex items-center gap-4 text-sm text-surface-400 mt-1">
              <span className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                {pipeline.trigger.ref.replace('refs/heads/', '')}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {pipeline.trigger.actor}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(pipeline.duration)}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={pipeline.status} />
      </div>
      
      <div className="px-4 pb-4 border-t border-surface-700 pt-3">
        <div className="flex items-center gap-2 text-sm">
          <GitCommit className="w-4 h-4 text-surface-500" />
          <code className="text-primary-400 font-mono">{pipeline.trigger.commit.sha.slice(0, 7)}</code>
          <span className="text-surface-300">{pipeline.trigger.commit.message}</span>
        </div>
      </div>
    </Card>
  );
}
