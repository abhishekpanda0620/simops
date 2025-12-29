import { GitBranch, Clock, User, GitCommit, CheckCircle } from 'lucide-react';
import { Card, Combobox } from '@/components/ui';
import type { Pipeline } from '@/types/pipeline';
import { statusConfig, formatDuration } from './pipelineConfig';
import { StatusBadge } from './ScenarioIndicators';
import { PIPELINE_SCENARIOS } from './PipelineUtils';
import type { PipelineScenario } from '@/types/pipeline';

// Pipeline Scenario Selector - Main scenario selection component
interface PipelineScenarioSelectorProps {
  selected: PipelineScenario;
  onSelect: (scenario: PipelineScenario) => void;
  disabled?: boolean;
}

export function PipelineScenarioSelector({ selected, onSelect, disabled }: PipelineScenarioSelectorProps) {
  const options = PIPELINE_SCENARIOS.map(s => ({
    value: s.value,
    label: s.label
  }));

  const selectedScenario = PIPELINE_SCENARIOS.find(s => s.value === selected);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-surface-300 whitespace-nowrap">Scenario:</span>
        <Combobox
          options={options}
          value={selected}
          onChange={(val) => onSelect(val as PipelineScenario)}
          placeholder="Select scenario..."
          searchPlaceholder="Search scenarios..."
          className="w-72"
          disabled={disabled}
        />
      </div>
      {selectedScenario && (
        <p className="text-xs text-surface-400 ml-[72px]">{selectedScenario.description}</p>
      )}
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
