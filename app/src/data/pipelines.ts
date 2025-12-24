import type { Pipeline } from '@/types';

export const successfulPipeline: Pipeline = {
  id: 'pipeline-success',
  name: 'Deploy to Production',
  status: 'succeeded',
  trigger: {
    type: 'push',
    ref: 'refs/heads/main',
    actor: 'developer',
    commit: {
      sha: 'a1b2c3d4e5f6',
      message: 'feat: add user authentication',
      author: 'developer@example.com',
    },
  },
  startTime: '2024-12-11T10:00:00Z',
  endTime: '2024-12-11T10:15:00Z',
  duration: 900,
  stages: [
    {
      id: 'stage-build',
      name: 'Build',
      status: 'succeeded',
      startTime: '2024-12-11T10:00:00Z',
      endTime: '2024-12-11T10:04:00Z',
      duration: 240,
      jobs: [
        {
          id: 'job-build-app',
          name: 'Build Application',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          startTime: '2024-12-11T10:00:00Z',
          endTime: '2024-12-11T10:04:00Z',
          duration: 240,
          steps: [
            {
              id: 'step-checkout',
              name: 'Checkout Code',
              status: 'succeeded',
              command: 'git checkout',
              duration: 5,
              logs: [
                { timestamp: '10:00:01', level: 'info', message: 'Cloning repository...' },
                { timestamp: '10:00:05', level: 'info', message: 'Checkout complete' },
              ],
            },
            {
              id: 'step-install',
              name: 'Install Dependencies',
              status: 'succeeded',
              command: 'npm ci',
              duration: 45,
              logs: [
                { timestamp: '10:00:06', level: 'info', message: 'Installing dependencies...' },
                { timestamp: '10:00:50', level: 'info', message: 'Added 1,234 packages' },
              ],
            },
            {
              id: 'step-build',
              name: 'Build',
              status: 'succeeded',
              command: 'npm run build',
              duration: 120,
              logs: [
                { timestamp: '10:00:51', level: 'info', message: 'Building application...' },
                { timestamp: '10:02:50', level: 'info', message: 'Build successful' },
              ],
            },
            {
              id: 'step-docker',
              name: 'Build Docker Image',
              status: 'succeeded',
              command: 'docker build -t api:latest .',
              duration: 70,
              logs: [
                { timestamp: '10:02:51', level: 'info', message: 'Building Docker image...' },
                { timestamp: '10:04:00', level: 'info', message: 'Image built: api:a1b2c3d' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-test',
      name: 'Test',
      status: 'succeeded',
      dependsOn: ['stage-build'],
      startTime: '2024-12-11T10:04:00Z',
      endTime: '2024-12-11T10:08:00Z',
      duration: 240,
      jobs: [
        {
          id: 'job-unit-tests',
          name: 'Unit Tests',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 180,
          steps: [
            {
              id: 'step-run-tests',
              name: 'Run Unit Tests',
              status: 'succeeded',
              command: 'npm test',
              duration: 180,
              logs: [
                { timestamp: '10:04:01', level: 'info', message: 'Running 234 tests...' },
                { timestamp: '10:07:00', level: 'info', message: '234 passed, 0 failed' },
              ],
            },
          ],
        },
        {
          id: 'job-lint',
          name: 'Lint',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 60,
          steps: [
            {
              id: 'step-lint',
              name: 'ESLint',
              status: 'succeeded',
              command: 'npm run lint',
              duration: 60,
              logs: [
                { timestamp: '10:04:01', level: 'info', message: 'Linting codebase...' },
                { timestamp: '10:05:00', level: 'info', message: 'No issues found' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-security',
      name: 'Security Scan',
      status: 'succeeded',
      dependsOn: ['stage-build'],
      startTime: '2024-12-11T10:04:00Z',
      endTime: '2024-12-11T10:07:00Z',
      duration: 180,
      jobs: [
        {
          id: 'job-trivy',
          name: 'Trivy Scan',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 120,
          steps: [
            {
              id: 'step-trivy',
              name: 'Container Scan',
              status: 'succeeded',
              command: 'trivy image api:latest',
              duration: 120,
              logs: [
                { timestamp: '10:04:01', level: 'info', message: 'Scanning image...' },
                { timestamp: '10:06:00', level: 'info', message: '0 critical, 2 high, 5 medium' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy',
      name: 'Deploy',
      status: 'succeeded',
      dependsOn: ['stage-test', 'stage-security'],
      startTime: '2024-12-11T10:08:00Z',
      endTime: '2024-12-11T10:15:00Z',
      duration: 420,
      jobs: [
        {
          id: 'job-deploy-prod',
          name: 'Deploy to Production',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 420,
          steps: [
            {
              id: 'step-push',
              name: 'Push to Registry',
              status: 'succeeded',
              command: 'docker push registry/api:latest',
              duration: 60,
              logs: [
                { timestamp: '10:08:01', level: 'info', message: 'Pushing image...' },
                { timestamp: '10:09:00', level: 'info', message: 'Push complete' },
              ],
            },
            {
              id: 'step-kubectl',
              name: 'Apply Kubernetes Manifests',
              status: 'succeeded',
              command: 'kubectl apply -f k8s/',
              duration: 30,
              logs: [
                { timestamp: '10:09:01', level: 'info', message: 'Applying manifests...' },
                { timestamp: '10:09:30', level: 'info', message: 'deployment.apps/api configured' },
              ],
            },
            {
              id: 'step-rollout',
              name: 'Wait for Rollout',
              status: 'succeeded',
              command: 'kubectl rollout status deployment/api',
              duration: 330,
              logs: [
                { timestamp: '10:09:31', level: 'info', message: 'Waiting for rollout...' },
                { timestamp: '10:15:00', level: 'info', message: 'Rollout complete' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const failedPipeline: Pipeline = {
  id: 'pipeline-failed',
  name: 'Deploy to Production',
  status: 'failed',
  trigger: {
    type: 'push',
    ref: 'refs/heads/main',
    actor: 'developer',
    commit: {
      sha: 'f6e5d4c3b2a1',
      message: 'fix: resolve database connection issue',
      author: 'developer@example.com',
    },
  },
  startTime: '2024-12-11T11:00:00Z',
  endTime: '2024-12-11T11:06:00Z',
  duration: 360,
  stages: [
    {
      id: 'stage-build-fail',
      name: 'Build',
      status: 'succeeded',
      startTime: '2024-12-11T11:00:00Z',
      endTime: '2024-12-11T11:04:00Z',
      duration: 240,
      jobs: [
        {
          id: 'job-build-fail',
          name: 'Build Application',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 240,
          steps: [
            {
              id: 'step-checkout-fail',
              name: 'Checkout Code',
              status: 'succeeded',
              duration: 5,
              logs: [{ timestamp: '11:00:05', level: 'info', message: 'Checkout complete' }],
            },
            {
              id: 'step-build-fail',
              name: 'Build',
              status: 'succeeded',
              duration: 120,
              logs: [{ timestamp: '11:02:00', level: 'info', message: 'Build successful' }],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-test-fail',
      name: 'Test',
      status: 'failed',
      dependsOn: ['stage-build-fail'],
      startTime: '2024-12-11T11:04:00Z',
      endTime: '2024-12-11T11:06:00Z',
      duration: 120,
      jobs: [
        {
          id: 'job-unit-fail',
          name: 'Unit Tests',
          status: 'failed',
          runner: 'ubuntu-latest',
          duration: 120,
          steps: [
            {
              id: 'step-test-fail',
              name: 'Run Unit Tests',
              status: 'failed',
              command: 'npm test',
              duration: 120,
              logs: [
                { timestamp: '11:04:01', level: 'info', message: 'Running 234 tests...' },
                { timestamp: '11:05:30', level: 'error', message: 'FAIL: src/db/connection.test.ts' },
                { timestamp: '11:05:31', level: 'error', message: '  ✕ should connect to database (50ms)' },
                { timestamp: '11:05:32', level: 'error', message: '    Error: Connection refused at 127.0.0.1:5432' },
                { timestamp: '11:06:00', level: 'error', message: '231 passed, 3 failed' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy-skipped',
      name: 'Deploy',
      status: 'skipped',
      dependsOn: ['stage-test-fail'],
      jobs: [
        {
          id: 'job-deploy-skipped',
          name: 'Deploy to Production',
          status: 'skipped',
          steps: [],
        },
      ],
    },
  ],
};

// Flaky Tests Pipeline - Tests fail once, retry succeeds
export const flakyTestsPipeline: Pipeline = {
  id: 'pipeline-flaky',
  name: 'Deploy with Retry',
  status: 'succeeded',
  trigger: {
    type: 'push',
    ref: 'refs/heads/main',
    actor: 'developer',
    commit: {
      sha: 'b2c3d4e5f6a7',
      message: 'feat: add caching layer',
      author: 'developer@example.com',
    },
  },
  startTime: '2024-12-11T12:00:00Z',
  endTime: '2024-12-11T12:20:00Z',
  duration: 1200,
  stages: [
    {
      id: 'stage-build-flaky',
      name: 'Build',
      status: 'succeeded',
      startTime: '2024-12-11T12:00:00Z',
      endTime: '2024-12-11T12:04:00Z',
      duration: 240,
      jobs: [
        {
          id: 'job-build-flaky',
          name: 'Build Application',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 240,
          steps: [
            { id: 'step-checkout-flaky', name: 'Checkout', status: 'succeeded', duration: 5, logs: [{ timestamp: '12:00:05', level: 'info', message: 'Checkout complete' }] },
            { id: 'step-build-flaky', name: 'Build', status: 'succeeded', duration: 120, logs: [{ timestamp: '12:02:00', level: 'info', message: 'Build successful' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-test-flaky',
      name: 'Test (Retry 1/2)',
      status: 'succeeded',
      dependsOn: ['stage-build-flaky'],
      startTime: '2024-12-11T12:04:00Z',
      endTime: '2024-12-11T12:12:00Z',
      duration: 480,
      jobs: [
        {
          id: 'job-test-flaky',
          name: 'Unit Tests',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 480,
          steps: [
            {
              id: 'step-test-attempt1',
              name: 'Run Tests (Attempt 1)',
              status: 'failed',
              command: 'npm test',
              duration: 180,
              logs: [
                { timestamp: '12:04:01', level: 'info', message: 'Running 234 tests...' },
                { timestamp: '12:06:30', level: 'error', message: 'FAIL: Timeout in async test' },
                { timestamp: '12:07:00', level: 'warn', message: 'Flaky test detected, retrying...' },
              ],
            },
            {
              id: 'step-test-attempt2',
              name: 'Run Tests (Attempt 2)',
              status: 'succeeded',
              command: 'npm test --retry',
              duration: 200,
              logs: [
                { timestamp: '12:07:01', level: 'info', message: 'Retrying tests...' },
                { timestamp: '12:10:20', level: 'info', message: '234 passed, 0 failed' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy-flaky',
      name: 'Deploy',
      status: 'succeeded',
      dependsOn: ['stage-test-flaky'],
      startTime: '2024-12-11T12:12:00Z',
      endTime: '2024-12-11T12:20:00Z',
      duration: 480,
      jobs: [
        {
          id: 'job-deploy-flaky',
          name: 'Deploy to Production',
          status: 'succeeded',
          duration: 480,
          steps: [
            { id: 'step-push-flaky', name: 'Push Image', status: 'succeeded', duration: 60, logs: [{ timestamp: '12:13:00', level: 'info', message: 'Push complete' }] },
            { id: 'step-deploy-flaky', name: 'Deploy', status: 'succeeded', duration: 420, logs: [{ timestamp: '12:20:00', level: 'info', message: 'Deployment successful' }] },
          ],
        },
      ],
    },
  ],
};

// Hotfix Pipeline - Emergency minimal path
export const hotfixPipeline: Pipeline = {
  id: 'pipeline-hotfix',
  name: 'Hotfix Deploy',
  status: 'succeeded',
  trigger: {
    type: 'push',
    ref: 'refs/heads/hotfix/critical-fix',
    actor: 'senior-dev',
    commit: {
      sha: 'c3d4e5f6a7b8',
      message: 'hotfix: critical security patch',
      author: 'senior@example.com',
    },
  },
  startTime: '2024-12-11T03:00:00Z',
  endTime: '2024-12-11T03:08:00Z',
  duration: 480,
  stages: [
    {
      id: 'stage-build-hotfix',
      name: 'Build',
      status: 'succeeded',
      startTime: '2024-12-11T03:00:00Z',
      endTime: '2024-12-11T03:03:00Z',
      duration: 180,
      jobs: [
        {
          id: 'job-build-hotfix',
          name: 'Quick Build',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 180,
          steps: [
            { id: 'step-checkout-hotfix', name: 'Checkout', status: 'succeeded', duration: 5, logs: [{ timestamp: '03:00:05', level: 'info', message: 'Checkout complete' }] },
            { id: 'step-build-hotfix', name: 'Build (Skip Cache)', status: 'succeeded', command: 'npm run build:fast', duration: 175, logs: [{ timestamp: '03:03:00', level: 'info', message: 'Fast build complete' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy-hotfix',
      name: 'Emergency Deploy',
      status: 'succeeded',
      dependsOn: ['stage-build-hotfix'],
      startTime: '2024-12-11T03:03:00Z',
      endTime: '2024-12-11T03:08:00Z',
      duration: 300,
      jobs: [
        {
          id: 'job-deploy-hotfix',
          name: 'Direct Deploy (Bypass Staging)',
          status: 'succeeded',
          duration: 300,
          steps: [
            { id: 'step-push-hotfix', name: 'Push Image', status: 'succeeded', duration: 30, logs: [{ timestamp: '03:03:30', level: 'info', message: 'Push complete' }] },
            { id: 'step-deploy-hotfix', name: 'Rolling Update', status: 'succeeded', command: 'kubectl set image deployment/api api=api:hotfix --record', duration: 270, logs: [{ timestamp: '03:08:00', level: 'info', message: 'Hotfix deployed to production' }] },
          ],
        },
      ],
    },
  ],
};

// Pull Request Pipeline - Preview deployment
export const pullRequestPipeline: Pipeline = {
  id: 'pipeline-pr',
  name: 'Pull Request #42',
  status: 'succeeded',
  trigger: {
    type: 'pull_request',
    ref: 'refs/pull/42/head',
    actor: 'contributor',
    commit: {
      sha: 'd4e5f6a7b8c9',
      message: 'feat: new dashboard component',
      author: 'contributor@example.com',
    },
  },
  startTime: '2024-12-11T14:00:00Z',
  endTime: '2024-12-11T14:12:00Z',
  duration: 720,
  stages: [
    {
      id: 'stage-build-pr',
      name: 'Build',
      status: 'succeeded',
      duration: 240,
      jobs: [
        {
          id: 'job-build-pr',
          name: 'Build Application',
          status: 'succeeded',
          duration: 240,
          steps: [
            { id: 'step-checkout-pr', name: 'Checkout PR', status: 'succeeded', duration: 10, logs: [{ timestamp: '14:00:10', level: 'info', message: 'Checkout PR #42' }] },
            { id: 'step-build-pr', name: 'Build', status: 'succeeded', duration: 230, logs: [{ timestamp: '14:04:00', level: 'info', message: 'Build successful' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-test-pr',
      name: 'Test',
      status: 'succeeded',
      dependsOn: ['stage-build-pr'],
      duration: 300,
      jobs: [
        {
          id: 'job-test-pr',
          name: 'Unit + Integration Tests',
          status: 'succeeded',
          duration: 300,
          steps: [
            { id: 'step-unit-pr', name: 'Unit Tests', status: 'succeeded', duration: 180, logs: [{ timestamp: '14:07:00', level: 'info', message: '234 passed' }] },
            { id: 'step-integration-pr', name: 'Integration Tests', status: 'succeeded', duration: 120, logs: [{ timestamp: '14:09:00', level: 'info', message: '45 passed' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-preview-pr',
      name: 'Preview Deploy',
      status: 'succeeded',
      dependsOn: ['stage-test-pr'],
      duration: 180,
      jobs: [
        {
          id: 'job-preview-pr',
          name: 'Deploy to Preview',
          status: 'succeeded',
          duration: 180,
          steps: [
            { id: 'step-preview-pr', name: 'Deploy Preview', status: 'succeeded', command: 'vercel deploy --preview', duration: 180, logs: [{ timestamp: '14:12:00', level: 'info', message: 'Preview: https://app-pr-42.vercel.app' }] },
          ],
        },
      ],
    },
  ],
};

// Rollback Pipeline - Deploy fails, automatic rollback
export const rollbackPipeline: Pipeline = {
  id: 'pipeline-rollback',
  name: 'Deploy with Rollback',
  status: 'failed',
  trigger: {
    type: 'push',
    ref: 'refs/heads/main',
    actor: 'developer',
    commit: {
      sha: 'e5f6a7b8c9d0',
      message: 'feat: new payment gateway',
      author: 'developer@example.com',
    },
  },
  startTime: '2024-12-11T16:00:00Z',
  endTime: '2024-12-11T16:18:00Z',
  duration: 1080,
  stages: [
    {
      id: 'stage-build-rollback',
      name: 'Build',
      status: 'succeeded',
      duration: 240,
      jobs: [
        {
          id: 'job-build-rollback',
          name: 'Build Application',
          status: 'succeeded',
          duration: 240,
          steps: [
            { id: 'step-build-rollback', name: 'Build', status: 'succeeded', duration: 240, logs: [{ timestamp: '16:04:00', level: 'info', message: 'Build successful' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy-rollback',
      name: 'Deploy',
      status: 'failed',
      dependsOn: ['stage-build-rollback'],
      duration: 600,
      jobs: [
        {
          id: 'job-deploy-rollback',
          name: 'Deploy to Production',
          status: 'failed',
          duration: 600,
          steps: [
            { id: 'step-push-rollback', name: 'Push Image', status: 'succeeded', duration: 60, logs: [{ timestamp: '16:05:00', level: 'info', message: 'Push complete' }] },
            { id: 'step-apply-rollback', name: 'Apply Manifests', status: 'succeeded', duration: 30, logs: [{ timestamp: '16:05:30', level: 'info', message: 'Manifests applied' }] },
            {
              id: 'step-healthcheck-rollback',
              name: 'Health Check',
              status: 'failed',
              command: 'kubectl rollout status deployment/api',
              duration: 300,
              logs: [
                { timestamp: '16:06:00', level: 'info', message: 'Waiting for pods...' },
                { timestamp: '16:09:00', level: 'error', message: 'Pod api-6f8b9c7d-x2k4j: CrashLoopBackOff' },
                { timestamp: '16:10:00', level: 'error', message: 'Health check failed after 5 attempts' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-rollback-action',
      name: 'Rollback',
      status: 'succeeded',
      dependsOn: ['stage-deploy-rollback'],
      duration: 180,
      jobs: [
        {
          id: 'job-rollback-action',
          name: 'Automatic Rollback',
          status: 'succeeded',
          duration: 180,
          steps: [
            {
              id: 'step-rollback-action',
              name: 'Rollback to Previous',
              status: 'succeeded',
              command: 'kubectl rollout undo deployment/api',
              duration: 180,
              logs: [
                { timestamp: '16:14:00', level: 'warn', message: 'Initiating automatic rollback...' },
                { timestamp: '16:17:00', level: 'info', message: 'Rolled back to revision 5' },
                { timestamp: '16:18:00', level: 'info', message: 'Service restored' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Parallel Jobs Pipeline - Multiple test types
export const parallelJobsPipeline: Pipeline = {
  id: 'pipeline-parallel',
  name: 'Parallel Test Matrix',
  status: 'succeeded',
  trigger: {
    type: 'push',
    ref: 'refs/heads/main',
    actor: 'developer',
    commit: {
      sha: 'f6a7b8c9d0e1',
      message: 'chore: update dependencies',
      author: 'developer@example.com',
    },
  },
  startTime: '2024-12-11T18:00:00Z',
  endTime: '2024-12-11T18:10:00Z',
  duration: 600,
  stages: [
    {
      id: 'stage-build-parallel',
      name: 'Build',
      status: 'succeeded',
      duration: 180,
      jobs: [
        {
          id: 'job-build-parallel',
          name: 'Build',
          status: 'succeeded',
          duration: 180,
          steps: [
            { id: 'step-build-parallel', name: 'Build', status: 'succeeded', duration: 180, logs: [{ timestamp: '18:03:00', level: 'info', message: 'Build complete' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-test-parallel',
      name: 'Test Matrix',
      status: 'succeeded',
      dependsOn: ['stage-build-parallel'],
      duration: 300,
      jobs: [
        {
          id: 'job-unit-parallel',
          name: 'Unit Tests',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 180,
          steps: [
            { id: 'step-unit-parallel', name: 'npm test:unit', status: 'succeeded', duration: 180, logs: [{ timestamp: '18:06:00', level: 'info', message: '234 passed' }] },
          ],
        },
        {
          id: 'job-e2e-parallel',
          name: 'E2E Tests',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 300,
          steps: [
            { id: 'step-e2e-parallel', name: 'npm test:e2e', status: 'succeeded', duration: 300, logs: [{ timestamp: '18:08:00', level: 'info', message: '45 passed' }] },
          ],
        },
        {
          id: 'job-lint-parallel',
          name: 'Lint',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 60,
          steps: [
            { id: 'step-lint-parallel', name: 'npm run lint', status: 'succeeded', duration: 60, logs: [{ timestamp: '18:04:00', level: 'info', message: 'No issues' }] },
          ],
        },
        {
          id: 'job-types-parallel',
          name: 'Type Check',
          status: 'succeeded',
          runner: 'ubuntu-latest',
          duration: 90,
          steps: [
            { id: 'step-types-parallel', name: 'npm run typecheck', status: 'succeeded', duration: 90, logs: [{ timestamp: '18:04:30', level: 'info', message: 'No errors' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-deploy-parallel',
      name: 'Deploy',
      status: 'succeeded',
      dependsOn: ['stage-test-parallel'],
      duration: 120,
      jobs: [
        {
          id: 'job-deploy-parallel',
          name: 'Deploy',
          status: 'succeeded',
          duration: 120,
          steps: [
            { id: 'step-deploy-parallel', name: 'Deploy', status: 'succeeded', duration: 120, logs: [{ timestamp: '18:10:00', level: 'info', message: 'Deployed' }] },
          ],
        },
      ],
    },
  ],
};

// Manual Approval Pipeline - Waiting for human approval
export const manualApprovalPipeline: Pipeline = {
  id: 'pipeline-approval',
  name: 'Release v2.0',
  status: 'running',
  trigger: {
    type: 'tag',
    ref: 'refs/tags/v2.0.0',
    actor: 'release-manager',
    commit: {
      sha: 'a7b8c9d0e1f2',
      message: 'chore: release v2.0.0',
      author: 'release@example.com',
    },
  },
  startTime: '2024-12-11T20:00:00Z',
  duration: 840,
  stages: [
    {
      id: 'stage-build-approval',
      name: 'Build',
      status: 'succeeded',
      duration: 240,
      jobs: [
        {
          id: 'job-build-approval',
          name: 'Build Release',
          status: 'succeeded',
          duration: 240,
          steps: [
            { id: 'step-build-approval', name: 'Build', status: 'succeeded', duration: 240, logs: [{ timestamp: '20:04:00', level: 'info', message: 'Release build complete' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-test-approval',
      name: 'Test',
      status: 'succeeded',
      dependsOn: ['stage-build-approval'],
      duration: 300,
      jobs: [
        {
          id: 'job-test-approval',
          name: 'Full Test Suite',
          status: 'succeeded',
          duration: 300,
          steps: [
            { id: 'step-test-approval', name: 'All Tests', status: 'succeeded', duration: 300, logs: [{ timestamp: '20:09:00', level: 'info', message: 'All 523 tests passed' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-staging-approval',
      name: 'Staging Deploy',
      status: 'succeeded',
      dependsOn: ['stage-test-approval'],
      duration: 180,
      jobs: [
        {
          id: 'job-staging-approval',
          name: 'Deploy to Staging',
          status: 'succeeded',
          duration: 180,
          steps: [
            { id: 'step-staging-approval', name: 'Deploy Staging', status: 'succeeded', duration: 180, logs: [{ timestamp: '20:12:00', level: 'info', message: 'Deployed to staging' }] },
          ],
        },
      ],
    },
    {
      id: 'stage-approval-gate',
      name: '⏸ Manual Approval',
      status: 'running',
      dependsOn: ['stage-staging-approval'],
      duration: 0,
      jobs: [
        {
          id: 'job-approval-gate',
          name: 'Waiting for Approval',
          status: 'running',
          steps: [
            {
              id: 'step-approval-gate',
              name: 'Approval Required',
              status: 'running',
              logs: [
                { timestamp: '20:14:00', level: 'info', message: 'Waiting for approval from: @team-leads' },
                { timestamp: '20:14:00', level: 'info', message: 'Staging URL: https://staging.app.com' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'stage-prod-approval',
      name: 'Production Deploy',
      status: 'pending',
      dependsOn: ['stage-approval-gate'],
      jobs: [
        {
          id: 'job-prod-approval',
          name: 'Deploy to Production',
          status: 'pending',
          steps: [],
        },
      ],
    },
  ],
};

// Export all scenarios with proper mapping
export const pipelineScenarios = {
  'successful-deploy': successfulPipeline,
  'test-failure': failedPipeline,
  'flaky-tests': flakyTestsPipeline,
  'hotfix': hotfixPipeline,
  'pull-request': pullRequestPipeline,
  'rollback': rollbackPipeline,
  'parallel-jobs': parallelJobsPipeline,
  'manual-approval': manualApprovalPipeline,
};
