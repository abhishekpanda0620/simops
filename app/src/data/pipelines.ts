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

export const pipelineScenarios = {
  success: successfulPipeline,
  failed: failedPipeline,
};
