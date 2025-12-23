import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { dataService } from '@/services/dataService';
import { 
  pipelineEducation, 
  getEducationForStage, 
  getEducationForStatus,
  type PipelineEducation 
} from '@/data/pipelineEducation';
import { PanelHeader, AnalogyBox, KeyPointsList } from '@/components/topology/panels/EnhancedPanelComponents';
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  Terminal,
  User,
  GitCommit,
  Link2,
  Info,
  GitMerge
} from 'lucide-react';
import type { Pipeline, Stage, Job, Step, LogEntry, StageStatus } from '@/types/pipeline';

// Status colors and icons
const statusConfig: Record<StageStatus, { color: string; bgColor: string; Icon: typeof CheckCircle }> = {
  succeeded: { color: 'text-green-400', bgColor: 'bg-green-500/20', Icon: CheckCircle },
  failed: { color: 'text-red-400', bgColor: 'bg-red-500/20', Icon: XCircle },
  running: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', Icon: Play },
  pending: { color: 'text-surface-400', bgColor: 'bg-surface-500/20', Icon: Pause },
  skipped: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', Icon: AlertTriangle },
  cancelled: { color: 'text-surface-500', bgColor: 'bg-surface-600/20', Icon: XCircle },
};

function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function StatusBadge({ status, onClick }: { status: StageStatus; onClick?: () => void }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.Icon;
  const badge = (
    <Badge 
      variant={status === 'succeeded' ? 'success' : status === 'failed' ? 'error' : 'warning'} 
      dot
    >
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
  
  if (onClick) {
    return (
      <span onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
        {badge}
      </span>
    );
  }
  return badge;
}

// Educational Info Panel - Reuses existing panel components for DRY

function PipelineInfoPanel({ 
  education, 
  onClose 
}: { 
  education: PipelineEducation | null; 
  onClose: () => void;
}) {
  if (!education) {
    return (
      <div className="w-80 bg-surface-900 border-l border-surface-700 p-4 flex flex-col items-center justify-center text-center">
        <Info className="w-12 h-12 text-surface-600 mb-3" />
        <p className="text-surface-400 text-sm">Click on a stage, job, or status badge to learn more about CI/CD concepts</p>
      </div>
    );
  }

  return (
    <div className="w-[380px] bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
      {/* Reuse PanelHeader from EnhancedPanelComponents */}
      <PanelHeader 
        title={education.title} 
        icon={GitMerge} 
        status="healthy" 
        onClose={onClose} 
      />
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Reuse AnalogyBox */}
        {education.analogy && <AnalogyBox analogy={education.analogy} />}
        
        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-surface-300 leading-relaxed bg-surface-800/50 p-4 rounded-lg border border-surface-700">
            {education.description}
          </p>
        </div>
        
        {/* Reuse KeyPointsList for tips */}
        {education.tips && <KeyPointsList points={education.tips} />}
        
        {/* Reuse TroubleshootingSection for related concepts as tips */}
        {education.relatedConcepts && education.relatedConcepts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Related Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {education.relatedConcepts.map((concept, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-surface-800 text-surface-300 px-2 py-1 rounded"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pipeline Selector
function PipelineSelector({ 
  pipelines, 
  selected, 
  onSelect 
}: { 
  pipelines: Array<{ slug: string; name: string; status: string }>; 
  selected: string; 
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-sm font-medium text-surface-300">Pipeline Run:</span>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none bg-surface-800 border border-surface-600 text-surface-200 text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
      >
        {pipelines.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name} ({p.status})
          </option>
        ))}
      </select>
    </div>
  );
}

// Pipeline Header with trigger info
function PipelineHeader({ pipeline, onLearnMore }: { pipeline: Pipeline; onLearnMore: () => void }) {
  return (
    <Card className="mb-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className={`w-12 h-12 rounded-lg ${statusConfig[pipeline.status]?.bgColor} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all`}
            onClick={onLearnMore}
            title="Click to learn about CI/CD pipelines"
          >
            {(() => {
              const Icon = statusConfig[pipeline.status]?.Icon || CheckCircle;
              return <Icon className={`w-6 h-6 ${statusConfig[pipeline.status]?.color}`} />;
            })()}
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
      
      {/* Commit Info */}
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

// Stage Card Component
function StageCard({ 
  stage, 
  isExpanded, 
  onToggle,
  onLearnStage,
  onLearnStatus 
}: { 
  stage: Stage; 
  isExpanded: boolean; 
  onToggle: () => void;
  onLearnStage: () => void;
  onLearnStatus: () => void;
}) {
  const config = statusConfig[stage.status] || statusConfig.pending;
  
  return (
    <Card className="overflow-hidden">
      {/* Stage Header */}
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
      
      {/* Jobs */}
      {isExpanded && (
        <div className="border-t border-surface-700 bg-surface-900/50">
          {stage.jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </Card>
  );
}

// Job Row Component
function JobRow({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[job.status] || statusConfig.pending;
  
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
      
      {/* Steps */}
      {expanded && job.steps.length > 0 && (
        <div className="pl-12 pr-4 pb-3 space-y-1">
          {job.steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

// Step Row Component
function StepRow({ step }: { step: Step }) {
  const [showLogs, setShowLogs] = useState(false);
  const config = statusConfig[step.status] || statusConfig.pending;
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
      
      {/* Logs */}
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

// Stages Timeline View
function StagesTimeline({ stages, onSelectStage }: { stages: Stage[]; onSelectStage: (stage: Stage) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto py-4">
      {stages.map((stage, index) => {
        const config = statusConfig[stage.status] || statusConfig.pending;
        return (
          <div key={stage.id} className="flex items-center">
            {/* Stage Node */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center border-2 border-current ${config.color} cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all`}
                onClick={() => onSelectStage(stage)}
                title={`Click to learn about ${stage.name}`}
              >
                <config.Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <span className="text-xs text-surface-400 mt-2 whitespace-nowrap">{stage.name}</span>
            </div>
            
            {/* Connector */}
            {index < stages.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                stage.status === 'succeeded' ? 'bg-green-500' : 
                stage.status === 'failed' ? 'bg-red-500' : 
                'bg-surface-600'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Main Pipeline Page
export function PipelinePage() {
  const [pipelines, setPipelines] = useState<Array<{ slug: string; name: string; status: string }>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<PipelineEducation | null>(null);

  // Load pipeline list
  useEffect(() => {
    async function loadPipelines() {
      try {
        const list = await dataService.getPipelines();
        setPipelines(list);
        if (list.length > 0 && !selectedSlug) {
          setSelectedSlug(list[0].slug);
        }
      } catch (err) {
        console.error('Failed to load pipelines:', err);
        setError('Failed to load pipelines');
      }
    }
    loadPipelines();
  }, []);

  // Load selected pipeline
  useEffect(() => {
    async function loadPipeline() {
      if (!selectedSlug) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await dataService.getPipeline(selectedSlug);
        if (data) {
          setPipeline(data as Pipeline);
          // Auto-expand failed stages
          const failedStages = new Set<string>();
          (data as Pipeline).stages?.forEach((s: Stage) => {
            if (s.status === 'failed') failedStages.add(s.id);
          });
          setExpandedStages(failedStages);
        }
      } catch (err) {
        console.error('Failed to load pipeline:', err);
        setError('Failed to load pipeline details');
      } finally {
        setLoading(false);
      }
    }
    loadPipeline();
  }, [selectedSlug]);

  const toggleStage = (stageId: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const handleLearnStage = (stage: Stage) => {
    const education = getEducationForStage(stage.name);
    setSelectedEducation(education || pipelineEducation['pipeline-overview']);
  };

  const handleLearnStatus = (status: StageStatus) => {
    const education = getEducationForStatus(status);
    setSelectedEducation(education);
  };

  const handleLearnPipeline = () => {
    setSelectedEducation(pipelineEducation['pipeline-overview']);
  };

  if (loading && !pipeline) {
    return (
      <div className="h-full flex flex-col">
        <Header title="CI/CD Pipeline" subtitle="Visualize build and deployment workflows" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <Header title="CI/CD Pipeline" subtitle="Visualize build and deployment workflows" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
            <p className="text-surface-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="CI/CD Pipeline" 
        subtitle="Click any element to learn about CI/CD concepts"
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Pipeline Selector */}
            <PipelineSelector 
              pipelines={pipelines} 
              selected={selectedSlug} 
              onSelect={setSelectedSlug} 
            />
            
            {pipeline && (
              <>
                {/* Pipeline Header */}
                <PipelineHeader pipeline={pipeline} onLearnMore={handleLearnPipeline} />
                
                {/* Stages Timeline */}
                <StagesTimeline stages={pipeline.stages} onSelectStage={handleLearnStage} />
                
                {/* Stages Detail */}
                <div className="space-y-4">
                  {pipeline.stages.map((stage) => (
                    <StageCard 
                      key={stage.id} 
                      stage={stage} 
                      isExpanded={expandedStages.has(stage.id)}
                      onToggle={() => toggleStage(stage.id)}
                      onLearnStage={() => handleLearnStage(stage)}
                      onLearnStatus={() => handleLearnStatus(stage.status)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Info Panel */}
        <PipelineInfoPanel 
          education={selectedEducation} 
          onClose={() => setSelectedEducation(null)} 
        />
      </div>
    </div>
  );
}
