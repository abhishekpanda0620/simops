// Pipeline scenario utilities - following ControlPlaneUtils.ts pattern
import type { PipelineScenario, PipelineScenarioOption } from '@/types/pipeline';

export const PIPELINE_SCENARIOS: PipelineScenarioOption[] = [
  { 
    value: 'successful-deploy', 
    label: 'Successful Deployment', 
    description: 'Full pipeline: Build → Test → Security → Deploy (all pass)' 
  },
  { 
    value: 'test-failure', 
    label: 'Test Failure', 
    description: 'Build passes, tests fail, deploy is skipped' 
  },
  { 
    value: 'flaky-tests', 
    label: 'Flaky Tests (Retry)', 
    description: 'Tests fail once, automatic retry succeeds' 
  },
  { 
    value: 'hotfix', 
    label: 'Hotfix Pipeline', 
    description: 'Minimal emergency path: Build → Deploy only' 
  },
  { 
    value: 'pull-request', 
    label: 'Pull Request', 
    description: 'PR workflow: Build → Test → Preview Deploy' 
  },
  { 
    value: 'rollback', 
    label: 'Rollback', 
    description: 'Deploy fails health checks, triggers automatic rollback' 
  },
  { 
    value: 'parallel-jobs', 
    label: 'Parallel Jobs', 
    description: 'Multiple test types running in parallel' 
  },
  { 
    value: 'manual-approval', 
    label: 'Manual Approval', 
    description: 'Pipeline pauses for human approval before deploy' 
  },
];

export function getScenarioStartMessage(scenario: PipelineScenario): string {
  switch (scenario) {
    case 'successful-deploy':
      return '$ git push origin main  # Triggering production deploy...';
    case 'test-failure':
      return '$ git push origin main  # Triggering CI/CD pipeline...';
    case 'flaky-tests':
      return '$ git push origin main  # Running with auto-retry enabled...';
    case 'hotfix':
      return '$ git push origin hotfix/critical-fix  # Emergency deploy...';
    case 'pull-request':
      return '$ gh pr create --base main  # Opening pull request...';
    case 'rollback':
      return '$ git push origin main  # Deploy with health checks...';
    case 'parallel-jobs':
      return '$ git push origin main  # Running parallel test matrix...';
    case 'manual-approval':
      return '$ git push origin release/v2.0  # Requires manual approval...';
    default:
      return '';
  }
}
