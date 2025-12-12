import { create } from 'zustand';
import type { Pipeline, Stage, Job, Step } from '@/types';
import { pipelineScenarios } from '@/data';

interface PipelineState {
  currentPipeline: Pipeline | null;
  selectedStage: Stage | null;
  selectedJob: Job | null;
  selectedStep: Step | null;
  scenarios: typeof pipelineScenarios;
  
  // Actions
  loadScenario: (scenarioId: keyof typeof pipelineScenarios) => void;
  selectStage: (stage: Stage | null) => void;
  selectJob: (job: Job | null) => void;
  selectStep: (step: Step | null) => void;
  clearSelection: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  currentPipeline: null,
  selectedStage: null,
  selectedJob: null,
  selectedStep: null,
  scenarios: pipelineScenarios,
  
  loadScenario: (scenarioId) => {
    set({
      currentPipeline: pipelineScenarios[scenarioId],
      selectedStage: null,
      selectedJob: null,
      selectedStep: null,
    });
  },
  
  selectStage: (stage) => {
    set({ selectedStage: stage, selectedJob: null, selectedStep: null });
  },
  
  selectJob: (job) => {
    set({ selectedJob: job, selectedStep: null });
  },
  
  selectStep: (step) => {
    set({ selectedStep: step });
  },
  
  clearSelection: () => {
    set({ selectedStage: null, selectedJob: null, selectedStep: null });
  },
}));
