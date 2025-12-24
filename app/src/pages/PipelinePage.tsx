import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Play, Pause } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { usePipelineAnimation } from '@/hooks/usePipelineAnimation';
import { 
  pipelineEducation, 
  getEducationForStage, 
  getEducationForStatus,
  type PipelineEducation 
} from '@/data/pipelineEducation';

// Import modular pipeline components
import { 
  PipelineInfoPanel,
  StagesTimeline,
  StageCard,
  PipelineSelector,
  PipelineHeader
} from '@/components/pipeline';

import type { Pipeline, Stage, StageStatus } from '@/types/pipeline';

// Main Pipeline Page - Now much smaller thanks to modular components
export function PipelinePage() {
  const [pipelines, setPipelines] = useState<Array<{ slug: string; name: string; status: string }>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<PipelineEducation | null>(null);

  // Pipeline animation - starts with CTA button, not auto-start
  const animation = usePipelineAnimation({
    stages: pipeline?.stages || [],
    autoStart: false,
    speed: 1500,
  });

  // Reset animation when pipeline changes
  useEffect(() => {
    animation.reset();
  }, [selectedSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine if we're in simulation mode
  const isSimulating = animation.isAnimating || animation.activeStageIndex >= 0;

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
    if (!selectedSlug) return;
    
    async function loadPipeline() {
      setLoading(true);
      setError(null);
      try {
        const data = await dataService.getPipeline(selectedSlug) as Pipeline | undefined;
        if (data) {
          setPipeline(data);
          if (data.stages && data.stages.length > 0) {
            setExpandedStages(new Set([data.stages[0].id]));
          }
        }
      } catch (err) {
        console.error('Failed to load pipeline:', err);
        setError('Failed to load pipeline');
        setPipeline(null);
      } finally {
        setLoading(false);
      }
    }
    loadPipeline();
  }, [selectedSlug]);

  // Handlers
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

  const handleLearnPipeline = () => {
    setSelectedEducation(pipelineEducation.pipeline);
  };

  const handleLearnStage = (stage: Stage) => {
    const education = getEducationForStage(stage.name.toLowerCase());
    if (education) {
      setSelectedEducation(education);
    }
  };

  const handleLearnStatus = (status: StageStatus) => {
    const education = getEducationForStatus(status);
    if (education) {
      setSelectedEducation(education);
    }
  };

  // Loading state
  if (loading && !pipeline) {
    return (
      <div className="h-full flex flex-col">
        <Header title="CI/CD Pipeline" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-surface-400">Loading pipeline data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <Header title="CI/CD Pipeline" subtitle="Error" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
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
        <div className="flex-1 min-w-0 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Pipeline Selector + Controls Row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <PipelineSelector 
                pipelines={pipelines} 
                selected={selectedSlug} 
                onSelect={setSelectedSlug} 
              />
              
              {/* Simulation Controls */}
              {pipeline && (
                <div className="flex items-center gap-2">
                  {!animation.isAnimating && (
                    <button
                      onClick={() => {
                        if (animation.activeStageIndex >= 0) animation.reset();
                        setTimeout(animation.start, 50);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <Play className="w-4 h-4" />
                      {animation.activeStageIndex >= 0 ? 'Run Again' : 'Run Pipeline'}
                    </button>
                  )}
                  {animation.isAnimating && (
                    <button
                      onClick={animation.isPaused ? animation.resume : animation.pause}
                      className="flex items-center gap-2 px-3 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg transition-colors text-sm"
                    >
                      {animation.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {animation.isPaused ? 'Resume' : 'Pause'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {pipeline && (
              <>
                <PipelineHeader pipeline={pipeline} onLearnMore={handleLearnPipeline} />
                
                <StagesTimeline 
                  stages={pipeline.stages} 
                  onSelectStage={handleLearnStage}
                  isStageActive={animation.isStageActive}
                  isStageComplete={animation.isStageComplete}
                  isStagePending={animation.isStagePending}
                  isSimulating={isSimulating}
                />
                
                <div className="space-y-4">
                  {pipeline.stages.map((stage, index) => {
                    const simulatedStatus: StageStatus = isSimulating && animation.isStagePending(index) 
                      ? 'pending' 
                      : stage.status;
                    
                    return (
                      <StageCard 
                        key={stage.id} 
                        stage={{ ...stage, status: simulatedStatus }} 
                        isExpanded={expandedStages.has(stage.id)}
                        onToggle={() => toggleStage(stage.id)}
                        onLearnStage={() => handleLearnStage(stage)}
                        onLearnStatus={() => handleLearnStatus(simulatedStatus)}
                      />
                    );
                  })}
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
