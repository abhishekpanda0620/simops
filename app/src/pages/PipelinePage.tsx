import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/layout';
import { Play, Pause } from 'lucide-react';
import { usePipelineAnimation } from '@/hooks/usePipelineAnimation';
import { 
  pipelineEducation, 
  getEducationForStage, 
  getEducationForStatus,
  type PipelineEducation 
} from '@/data/pipelineEducation';
import { pipelineScenarios } from '@/data/pipelines';

// Import modular pipeline components
import { 
  PipelineInfoPanel,
  StagesTimeline,
  StageCard,
  PipelineScenarioSelector,
  PipelineHeader,
  ScenarioBadge,
  type PipelineScenario
} from '@/components/pipeline';

import type { Stage, StageStatus } from '@/types/pipeline';

// Main Pipeline Page - Now with multiple scenario support
export function PipelinePage() {
  const [selectedScenario, setSelectedScenario] = useState<PipelineScenario>('successful-deploy');
  const [selectedEducation, setSelectedEducation] = useState<PipelineEducation | null>(null);

  // Derive pipeline from scenario (no setState in effect)
  const pipeline = useMemo(() => {
    return pipelineScenarios[selectedScenario] || null;
  }, [selectedScenario]);

  // Derive initial expanded stages from pipeline
  const [expandedStages, setExpandedStages] = useState<Set<string>>(() => {
    const initialPipeline = pipelineScenarios['successful-deploy'];
    if (initialPipeline?.stages?.length > 0) {
      return new Set([initialPipeline.stages[0].id]);
    }
    return new Set();
  });

  // Pipeline animation - starts with CTA button, not auto-start
  const animation = usePipelineAnimation({
    stages: pipeline?.stages || [],
    autoStart: false,
    speed: 1500,
  });

  // Reset animation and expand first stage when scenario changes
  const handleScenarioChange = useCallback((newScenario: PipelineScenario) => {
    setSelectedScenario(newScenario);
    const newPipeline = pipelineScenarios[newScenario];
    if (newPipeline?.stages?.length > 0) {
      setExpandedStages(new Set([newPipeline.stages[0].id]));
    }
    animation.reset();
  }, [animation]);

  // Determine if we're in simulation mode
  const isSimulating = animation.isAnimating || animation.activeStageIndex >= 0;

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

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="CI/CD Pipeline" 
        subtitle="Select a scenario to learn about CI/CD concepts"
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Scenario Selector + Controls Row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <PipelineScenarioSelector 
                selected={selectedScenario} 
                onSelect={handleScenarioChange}
                disabled={animation.isAnimating}
              />
              
              {/* Simulation Controls */}
              {pipeline && (
                <div className="flex items-center gap-2 shrink-0">
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <PipelineHeader pipeline={pipeline} onLearnMore={handleLearnPipeline} />
                  </div>
                  <div className="ml-4">
                    <ScenarioBadge scenario={selectedScenario} isAnimating={animation.isAnimating} />
                  </div>
                </div>
                
                <StagesTimeline 
                  stages={pipeline.stages} 
                  onSelectStage={handleLearnStage}
                  isStageActive={animation.isStageActive}
                  isStageComplete={animation.isStageComplete}
                  isStagePending={animation.isStagePending}
                  isSimulating={isSimulating}
                  scenario={selectedScenario}
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
