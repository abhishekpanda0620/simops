/**
 * CI/CD Pipeline Educational Content
 * Click-to-learn explanations for pipeline concepts
 */

export interface PipelineEducation {
  title: string;
  description: string;
  analogy?: string;
  tips?: string[];
  relatedConcepts?: string[];
}

export const pipelineEducation: Record<string, PipelineEducation> = {
  // Stages
  'stage-build': {
    title: 'Build Stage',
    description: 'The Build stage compiles your source code, installs dependencies, and creates deployable artifacts (like Docker images or binaries). This ensures your code can be packaged consistently.',
    analogy: '🏭 Think of it like a car factory - raw materials (source code) go in, and a finished car (container image) comes out, ready to be tested and shipped.',
    tips: [
      'Cache dependencies to speed up builds (e.g., npm cache, pip cache)',
      'Use multi-stage Docker builds to create smaller final images',
      'Pin dependency versions for reproducible builds',
      'Run builds in isolated containers for consistency',
    ],
    relatedConcepts: ['Container Images', 'Artifacts', 'Build Cache'],
  },
  
  'stage-test': {
    title: 'Test Stage',
    description: 'The Test stage runs automated tests to verify your code works correctly. This includes unit tests, integration tests, and code quality checks like linting.',
    analogy: '🔬 Like a quality control lab - every product (code) is inspected and tested before it can move to the next station.',
    tips: [
      'Run tests in parallel to reduce pipeline duration',
      'Fail fast - run quick unit tests before slow integration tests',
      'Use test coverage thresholds to maintain code quality',
      'Consider matrix testing for multiple OS/language versions',
    ],
    relatedConcepts: ['Unit Tests', 'Integration Tests', 'Code Coverage', 'Linting'],
  },
  
  'stage-deploy': {
    title: 'Deploy Stage',
    description: 'The Deploy stage pushes your tested artifacts to production or staging environments. This typically involves pushing images to a registry and applying Kubernetes manifests.',
    analogy: '🚀 Like a rocket launch - after all checks pass, your software "lifts off" to reach users.',
    tips: [
      'Use rolling deployments to avoid downtime',
      'Implement canary releases for gradual rollouts',
      'Always have a rollback strategy ready',
      'Use infrastructure-as-code for reproducible deployments',
    ],
    relatedConcepts: ['Rolling Update', 'Canary Release', 'Blue-Green Deployment', 'GitOps'],
  },
  
  // Jobs
  'job-unit-tests': {
    title: 'Unit Tests Job',
    description: 'Unit tests verify individual functions and components work correctly in isolation. They are fast and provide immediate feedback on code changes.',
    analogy: '🧪 Testing individual LEGO pieces before building the full castle - each piece must work perfectly.',
    tips: [
      'Keep unit tests fast (< 100ms each)',
      'Mock external dependencies',
      'Aim for high code coverage on critical paths',
      'Write tests before or alongside code (TDD)',
    ],
    relatedConcepts: ['Mocking', 'Test-Driven Development', 'Code Coverage'],
  },
  
  'job-lint': {
    title: 'Lint Job',
    description: 'Linting analyzes code for potential errors, style issues, and best practice violations without running it. It catches problems early and enforces consistency.',
    analogy: '📝 Like a spell-checker and grammar checker for your code - it catches mistakes before they become problems.',
    tips: [
      'Fix lint errors locally before pushing',
      'Use pre-commit hooks to catch issues early',
      'Configure consistent rules across the team',
      'Treat warnings as errors in CI',
    ],
    relatedConcepts: ['ESLint', 'Prettier', 'Static Analysis', 'Pre-commit Hooks'],
  },
  
  'job-deploy-prod': {
    title: 'Production Deployment',
    description: 'Deploys the verified application to the production environment where real users will access it. This is the critical final step of the pipeline.',
    analogy: '🏠 Moving into a new house - everything has been inspected (tested), now it\'s time for people to actually live there.',
    tips: [
      'Never deploy on Fridays!',
      'Monitor deployments closely for the first hour',
      'Have runbooks ready for common issues',
      'Use feature flags for gradual feature rollouts',
    ],
    relatedConcepts: ['Production Environment', 'Monitoring', 'Feature Flags', 'Runbooks'],
  },
  
  // Concepts
  'trigger': {
    title: 'Pipeline Trigger',
    description: 'A trigger defines when a pipeline runs. Common triggers include code pushes, pull requests, scheduled times, or manual activation.',
    analogy: '🔔 Like a doorbell - different events (visitors) trigger different responses (actions).',
    tips: [
      'Use branch filters to run only on relevant branches',
      'Run full tests on main branch, quick tests on feature branches',
      'Schedule nightly builds for comprehensive testing',
      'Require CI pass before merging PRs',
    ],
    relatedConcepts: ['Git Hooks', 'Webhooks', 'Branch Protection'],
  },
  
  'status-succeeded': {
    title: 'Succeeded Status',
    description: 'All steps in this stage/job completed successfully. The pipeline can proceed to the next stage.',
    analogy: '✅ Green light - everything passed, safe to proceed!',
    tips: [
      'Success doesn\'t mean perfect - review test coverage',
      'Check for flaky tests that sometimes pass unexpectedly',
    ],
    relatedConcepts: ['Exit Codes', 'Health Checks'],
  },
  
  'status-failed': {
    title: 'Failed Status',
    description: 'One or more steps failed. The pipeline stops here to prevent deploying broken code. Check the logs to understand what went wrong.',
    analogy: '🛑 Red light - stop here and investigate before proceeding.',
    tips: [
      'Check logs for the specific error message',
      'Run the failing command locally to debug',
      'Look for flaky tests or environment issues',
      'Consider if dependencies changed recently',
    ],
    relatedConcepts: ['Build Logs', 'Debugging', 'Rollback'],
  },
  
  'status-skipped': {
    title: 'Skipped Status',
    description: 'This stage/job was not executed because a previous stage failed. It depends on the failed stage, so it cannot run.',
    analogy: '⏭️ Like a domino that didn\'t fall because an earlier domino was blocked.',
    tips: [
      'Fix the upstream failure first',
      'Consider if this dependency is necessary',
    ],
    relatedConcepts: ['Dependencies', 'DAG (Directed Acyclic Graph)'],
  },
  
  'pipeline-overview': {
    title: 'CI/CD Pipeline',
    description: 'A CI/CD pipeline automates the process of building, testing, and deploying code. It ensures every change goes through the same reliable process before reaching users.',
    analogy: '🏭 An assembly line for software - raw code comes in, tested, packaged product comes out, consistently every time.',
    tips: [
      'Start simple and add stages as needed',
      'Optimize the most frequently run pipelines first',
      'Keep pipelines fast - aim for < 10 minutes',
      'Make pipeline status visible to the whole team',
    ],
    relatedConcepts: ['Continuous Integration', 'Continuous Deployment', 'DevOps', 'GitOps'],
  },
};

export function getEducationForStage(stageName: string): PipelineEducation | null {
  // Match by stage name
  const key = `stage-${stageName.toLowerCase().replace(/\s+/g, '-')}`;
  return pipelineEducation[key] || null;
}

export function getEducationForJob(jobName: string): PipelineEducation | null {
  // Match by job name pattern
  const normalizedName = jobName.toLowerCase();
  if (normalizedName.includes('unit test')) return pipelineEducation['job-unit-tests'];
  if (normalizedName.includes('lint')) return pipelineEducation['job-lint'];
  if (normalizedName.includes('deploy') && normalizedName.includes('prod')) return pipelineEducation['job-deploy-prod'];
  return null;
}

export function getEducationForStatus(status: string): PipelineEducation | null {
  return pipelineEducation[`status-${status}`] || null;
}
