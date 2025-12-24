import type { Stage, StageStatus } from '@/types/pipeline';
import { statusConfig } from './pipelineConfig';
import { StageIndicator } from './ScenarioIndicators';
import type { PipelineScenario } from './PipelineUtils';

interface StagesTimelineProps {
  stages: Stage[];
  onSelectStage: (stage: Stage) => void;
  isStageActive?: (index: number) => boolean;
  isStageComplete?: (index: number) => boolean;
  isStagePending?: (index: number) => boolean;
  isSimulating?: boolean;
  scenario?: PipelineScenario;
}

export function StagesTimeline({ 
  stages, 
  onSelectStage,
  isStageActive,
  isStageComplete,
  isStagePending,
  isSimulating = false,
  scenario
}: StagesTimelineProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto py-8">
      {stages.map((stage, index) => {
        const active = isStageActive?.(index) ?? false;
        const complete = isStageComplete?.(index) ?? false;
        const pending = isStagePending?.(index) ?? false;
        
        // During simulation: pending stages show as pending, active as running, complete as succeeded
        // If not simulating: show real status
        let displayStatus: StageStatus = stage.status;
        if (isSimulating) {
          if (pending) {
            displayStatus = 'pending';
          } else if (active) {
            displayStatus = 'running';
          } else if (complete) {
            displayStatus = stage.status;
          }
        }
        
        const config = statusConfig[displayStatus] || statusConfig.pending;
        
        return (
          <div key={stage.id} className="flex items-center">
            {/* Stage Node with Scenario Indicator */}
            <div className="relative flex flex-col items-center">
              {/* Scenario-specific indicator (shows above node when active) */}
              {scenario && (
                <StageIndicator 
                  scenario={scenario}
                  stageName={stage.name}
                  isActive={active}
                />
              )}
              
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 
                  cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all
                  ${config.bgColor} ${config.color}
                  ${active ? 'animate-pulse ring-2 ring-primary-400 ring-offset-2 ring-offset-surface-900' : ''}
                  ${complete && !active ? 'scale-100' : ''}
                `}
                onClick={() => onSelectStage(stage)}
                title={`Click to learn about ${stage.name}`}
              >
                <config.Icon className={`w-5 h-5 ${config.color} ${active ? 'animate-bounce' : ''}`} />
              </div>
              <span className={`text-xs mt-2 whitespace-nowrap transition-colors ${active ? 'text-primary-400 font-medium' : 'text-surface-400'}`}>
                {stage.name}
              </span>
            </div>
            
            {/* Animated Connector */}
            {index < stages.length - 1 && (
              <div className="relative w-16 h-1 mx-2">
                <div className="absolute inset-0 bg-surface-700 rounded-full" />
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    complete ? (stage.status === 'failed' ? 'bg-red-500 w-full' : 'bg-green-500 w-full') : 
                    active ? 'bg-primary-500 w-1/2 animate-pulse' : 
                    'bg-surface-700 w-0'
                  }`}
                />
                {active && (
                  <div className="absolute inset-y-0 left-0 w-full overflow-hidden">
                    <div className="h-full w-4 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-flow" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
