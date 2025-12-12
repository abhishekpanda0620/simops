// CI/CD Pipeline Types

export type StageStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'cancelled';

export interface Pipeline {
  id: string;
  name: string;
  status: StageStatus;
  trigger: PipelineTrigger;
  stages: Stage[];
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface PipelineTrigger {
  type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'tag';
  ref: string;
  actor: string;
  commit: {
    sha: string;
    message: string;
    author: string;
  };
}

export interface Stage {
  id: string;
  name: string;
  status: StageStatus;
  jobs: Job[];
  startTime?: string;
  endTime?: string;
  duration?: number;
  dependsOn?: string[];
}

export interface Job {
  id: string;
  name: string;
  status: StageStatus;
  steps: Step[];
  runner?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface Step {
  id: string;
  name: string;
  status: StageStatus;
  command?: string;
  logs: LogEntry[];
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// Pipeline visualization types
export interface PipelineNode {
  id: string;
  type: 'stage' | 'job' | 'step';
  data: Stage | Job | Step;
  position: { x: number; y: number };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'contains';
  animated?: boolean;
}
