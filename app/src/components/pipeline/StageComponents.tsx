import { useState } from 'react';
import { ChevronRight, ChevronDown, Terminal } from 'lucide-react';
import { Card } from '@/components/ui';
import type { Stage, Job, Step, LogEntry, StageStatus } from '@/types/pipeline';
import { statusConfig, formatDuration } from './pipelineConfig';
import { StatusBadge } from './ScenarioIndicators';

// Stage Card Component
interface StageCardProps {
  stage: Stage;
  isExpanded: boolean;
  onToggle: () => void;
  onLearnStage: () => void;
  onLearnStatus: () => void;
}

export function StageCard({ 
  stage, 
  isExpanded, 
  onToggle,
  onLearnStage,
  onLearnStatus 
}: StageCardProps) {
  const config = statusConfig[stage.status] || statusConfig.pending;
  const stageIsPending = stage.status === 'pending';
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="p-1 hover:bg-surface-800 rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-surface-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-surface-400" />
            )}
          </button>
          <div 
            className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all`}
            onClick={onLearnStage}
            title="Click to learn about this stage"
          >
            <config.Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="cursor-pointer" onClick={onToggle}>
            <h3 className="font-medium text-surface-100">{stage.name}</h3>
            <span className="text-xs text-surface-500">{stage.jobs.length} job(s) • {formatDuration(stage.duration)}</span>
          </div>
        </div>
        <StatusBadge status={stage.status} onClick={onLearnStatus} />
      </div>
      
      {isExpanded && (
        <div className="border-t border-surface-700 bg-surface-900/50">
          {stage.jobs.map((job) => (
            <JobRow 
              key={job.id} 
              job={job} 
              simulatedStatus={stageIsPending ? 'pending' : undefined}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// Job Row Component
interface JobRowProps {
  job: Job;
  simulatedStatus?: StageStatus;
}

export function JobRow({ job, simulatedStatus }: JobRowProps) {
  const [expanded, setExpanded] = useState(false);
  const displayStatus = simulatedStatus || job.status;
  const config = statusConfig[displayStatus] || statusConfig.pending;
  
  return (
    <div className="border-b border-surface-700/50 last:border-b-0">
      <div 
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {job.steps.length > 0 ? (
            expanded ? <ChevronDown className="w-4 h-4 text-surface-500" /> : <ChevronRight className="w-4 h-4 text-surface-500" />
          ) : (
            <div className="w-4" />
          )}
          <config.Icon className={`w-4 h-4 ${config.color}`} />
          <span className="text-surface-200">{job.name}</span>
          {job.runner && (
            <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
              {job.runner}
            </span>
          )}
        </div>
        <span className="text-sm text-surface-400">{formatDuration(job.duration)}</span>
      </div>
      
      {expanded && job.steps.length > 0 && (
        <div className="pl-12 pr-4 pb-3 space-y-1">
          {job.steps.map((step) => (
            <StepRow key={step.id} step={step} simulatedStatus={simulatedStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

// Step Row Component
interface StepRowProps {
  step: Step;
  simulatedStatus?: StageStatus;
}

export function StepRow({ step, simulatedStatus }: StepRowProps) {
  const [showLogs, setShowLogs] = useState(false);
  const displayStatus = simulatedStatus || step.status;
  const config = statusConfig[displayStatus] || statusConfig.pending;
  const hasLogs = step.logs && step.logs.length > 0;
  
  return (
    <div>
      <div 
        className={`flex items-center justify-between py-1.5 px-2 rounded ${hasLogs ? 'cursor-pointer hover:bg-surface-800/50' : ''}`}
        onClick={() => hasLogs && setShowLogs(!showLogs)}
      >
        <div className="flex items-center gap-2">
          <config.Icon className={`w-3 h-3 ${config.color}`} />
          <span className="text-sm text-surface-300">{step.name}</span>
          {hasLogs && (
            <Terminal className="w-3 h-3 text-surface-500" />
          )}
        </div>
        <span className="text-xs text-surface-500">{formatDuration(step.duration)}</span>
      </div>
      
      {showLogs && hasLogs && (
        <div className="mt-1 mb-2 bg-surface-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
          {step.logs.map((log: LogEntry, i: number) => (
            <div 
              key={i} 
              className={`py-0.5 ${
                log.level === 'error' ? 'text-red-400' : 
                log.level === 'warn' ? 'text-yellow-400' : 
                'text-surface-400'
              }`}
            >
              <span className="text-surface-600">[{log.timestamp}]</span> {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
