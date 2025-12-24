<?php

namespace Database\Seeders;

use App\Models\Pipeline;
use Illuminate\Database\Seeder;

class PipelineSeeder extends Seeder
{
    public function run(): void
    {
        $pipelines = [
            [
                'slug' => 'success',
                'name' => 'Deploy to Production',
                'status' => 'succeeded',
                'data' => $this->getSuccessfulPipeline(),
            ],
            [
                'slug' => 'failed',
                'name' => 'Deploy to Production (Failed)',
                'status' => 'failed',
                'data' => $this->getFailedPipeline(),
            ],
            [
                'slug' => 'security-scan',
                'name' => 'Security Scan Pipeline',
                'status' => 'succeeded',
                'data' => $this->getSecurityScanPipeline(),
            ],
            [
                'slug' => 'parallel-jobs',
                'name' => 'Parallel Test Suite',
                'status' => 'succeeded',
                'data' => $this->getParallelJobsPipeline(),
            ],
            [
                'slug' => 'multi-env',
                'name' => 'Multi-Environment Deploy',
                'status' => 'succeeded',
                'data' => $this->getMultiEnvPipeline(),
            ],
        ];

        foreach ($pipelines as $pipeline) {
            Pipeline::updateOrCreate(
                ['slug' => $pipeline['slug']],
                $pipeline
            );
        }
    }

    private function getSuccessfulPipeline(): array
    {
        return [
            'id' => 'pipeline-success',
            'name' => 'Deploy to Production',
            'status' => 'succeeded',
            'trigger' => [
                'type' => 'push',
                'ref' => 'refs/heads/main',
                'actor' => 'developer',
                'commit' => [
                    'sha' => 'a1b2c3d4e5f6',
                    'message' => 'feat: add user authentication',
                    'author' => 'developer@example.com',
                ],
            ],
            'startTime' => '2024-12-11T10:00:00Z',
            'endTime' => '2024-12-11T10:15:00Z',
            'duration' => 900,
            'stages' => [
                [
                    'id' => 'stage-build',
                    'name' => 'Build',
                    'status' => 'succeeded',
                    'startTime' => '2024-12-11T10:00:00Z',
                    'endTime' => '2024-12-11T10:04:00Z',
                    'duration' => 240,
                    'jobs' => [[
                        'id' => 'job-build-app',
                        'name' => 'Build Application',
                        'status' => 'succeeded',
                        'runner' => 'ubuntu-latest',
                        'duration' => 240,
                        'steps' => [
                            ['id' => 'step-checkout', 'name' => 'Checkout Code', 'status' => 'succeeded', 'duration' => 5],
                            ['id' => 'step-install', 'name' => 'Install Dependencies', 'status' => 'succeeded', 'duration' => 45],
                            ['id' => 'step-build', 'name' => 'Build', 'status' => 'succeeded', 'duration' => 120],
                            ['id' => 'step-docker', 'name' => 'Build Docker Image', 'status' => 'succeeded', 'duration' => 70],
                        ],
                    ]],
                ],
                [
                    'id' => 'stage-test',
                    'name' => 'Test',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-build'],
                    'duration' => 240,
                    'jobs' => [
                        ['id' => 'job-unit-tests', 'name' => 'Unit Tests', 'status' => 'succeeded', 'duration' => 180, 'steps' => []],
                        ['id' => 'job-lint', 'name' => 'Lint', 'status' => 'succeeded', 'duration' => 60, 'steps' => []],
                    ],
                ],
                [
                    'id' => 'stage-deploy',
                    'name' => 'Deploy',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-test'],
                    'duration' => 420,
                    'jobs' => [[
                        'id' => 'job-deploy-prod',
                        'name' => 'Deploy to Production',
                        'status' => 'succeeded',
                        'duration' => 420,
                        'steps' => [
                            ['id' => 'step-push', 'name' => 'Push to Registry', 'status' => 'succeeded', 'duration' => 60],
                            ['id' => 'step-kubectl', 'name' => 'Apply Manifests', 'status' => 'succeeded', 'duration' => 30],
                            ['id' => 'step-rollout', 'name' => 'Wait for Rollout', 'status' => 'succeeded', 'duration' => 330],
                        ],
                    ]],
                ],
            ],
        ];
    }

    private function getFailedPipeline(): array
    {
        return [
            'id' => 'pipeline-failed',
            'name' => 'Deploy to Production',
            'status' => 'failed',
            'trigger' => [
                'type' => 'push',
                'ref' => 'refs/heads/main',
                'actor' => 'developer',
                'commit' => [
                    'sha' => 'f6e5d4c3b2a1',
                    'message' => 'fix: resolve database connection issue',
                    'author' => 'developer@example.com',
                ],
            ],
            'startTime' => '2024-12-11T11:00:00Z',
            'endTime' => '2024-12-11T11:06:00Z',
            'duration' => 360,
            'stages' => [
                [
                    'id' => 'stage-build-fail',
                    'name' => 'Build',
                    'status' => 'succeeded',
                    'duration' => 240,
                    'jobs' => [[
                        'id' => 'job-build-fail',
                        'name' => 'Build Application',
                        'status' => 'succeeded',
                        'duration' => 240,
                        'steps' => [],
                    ]],
                ],
                [
                    'id' => 'stage-test-fail',
                    'name' => 'Test',
                    'status' => 'failed',
                    'dependsOn' => ['stage-build-fail'],
                    'duration' => 120,
                    'jobs' => [[
                        'id' => 'job-unit-fail',
                        'name' => 'Unit Tests',
                        'status' => 'failed',
                        'duration' => 120,
                        'steps' => [[
                            'id' => 'step-test-fail',
                            'name' => 'Run Unit Tests',
                            'status' => 'failed',
                            'duration' => 120,
                            'logs' => [
                                ['timestamp' => '11:05:30', 'level' => 'error', 'message' => 'FAIL: src/db/connection.test.ts'],
                                ['timestamp' => '11:05:32', 'level' => 'error', 'message' => 'Error: Connection refused at 127.0.0.1:5432'],
                            ],
                        ]],
                    ]],
                ],
                [
                    'id' => 'stage-deploy-skipped',
                    'name' => 'Deploy',
                    'status' => 'skipped',
                    'dependsOn' => ['stage-test-fail'],
                    'jobs' => [[
                        'id' => 'job-deploy-skipped',
                        'name' => 'Deploy to Production',
                        'status' => 'skipped',
                        'steps' => [],
                    ]],
                ],
            ],
        ];
    }

    private function getSecurityScanPipeline(): array
    {
        return [
            'id' => 'pipeline-security',
            'name' => 'Security Scan Pipeline',
            'status' => 'succeeded',
            'trigger' => [
                'type' => 'schedule',
                'ref' => 'refs/heads/main',
                'actor' => 'cron',
                'commit' => [
                    'sha' => 'sec123abc',
                    'message' => 'Scheduled security scan',
                    'author' => 'ci-bot@example.com',
                ],
            ],
            'startTime' => '2024-12-12T02:00:00Z',
            'endTime' => '2024-12-12T02:25:00Z',
            'duration' => 1500,
            'stages' => [
                [
                    'id' => 'stage-sast',
                    'name' => 'SAST',
                    'status' => 'succeeded',
                    'duration' => 300,
                    'jobs' => [[
                        'id' => 'job-sast',
                        'name' => 'Static Analysis',
                        'status' => 'succeeded',
                        'runner' => 'security-runner',
                        'duration' => 300,
                        'steps' => [
                            ['id' => 'step-semgrep', 'name' => 'Semgrep Scan', 'status' => 'succeeded', 'duration' => 180, 'logs' => [
                                ['timestamp' => '02:01:00', 'level' => 'info', 'message' => 'Scanning 156 files...'],
                                ['timestamp' => '02:04:00', 'level' => 'info', 'message' => 'Found 0 critical, 2 warnings'],
                            ]],
                            ['id' => 'step-codeql', 'name' => 'CodeQL Analysis', 'status' => 'succeeded', 'duration' => 120, 'logs' => []],
                        ],
                    ]],
                ],
                [
                    'id' => 'stage-dast',
                    'name' => 'DAST',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-sast'],
                    'duration' => 600,
                    'jobs' => [[
                        'id' => 'job-zap',
                        'name' => 'OWASP ZAP Scan',
                        'status' => 'succeeded',
                        'runner' => 'security-runner',
                        'duration' => 600,
                        'steps' => [
                            ['id' => 'step-spider', 'name' => 'Spider Scan', 'status' => 'succeeded', 'duration' => 180, 'logs' => []],
                            ['id' => 'step-active', 'name' => 'Active Scan', 'status' => 'succeeded', 'duration' => 420, 'logs' => [
                                ['timestamp' => '02:12:00', 'level' => 'info', 'message' => 'Testing 45 endpoints...'],
                                ['timestamp' => '02:18:00', 'level' => 'info', 'message' => 'No vulnerabilities found'],
                            ]],
                        ],
                    ]],
                ],
                [
                    'id' => 'stage-deps',
                    'name' => 'Dependencies',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-sast'],
                    'duration' => 180,
                    'jobs' => [[
                        'id' => 'job-deps',
                        'name' => 'Dependency Check',
                        'status' => 'succeeded',
                        'duration' => 180,
                        'steps' => [
                            ['id' => 'step-npm-audit', 'name' => 'npm audit', 'status' => 'succeeded', 'duration' => 60, 'logs' => []],
                            ['id' => 'step-snyk', 'name' => 'Snyk Scan', 'status' => 'succeeded', 'duration' => 120, 'logs' => [
                                ['timestamp' => '02:22:00', 'level' => 'info', 'message' => 'Found 0 high, 3 medium vulnerabilities'],
                            ]],
                        ],
                    ]],
                ],
                [
                    'id' => 'stage-report',
                    'name' => 'Report',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-dast', 'stage-deps'],
                    'duration' => 60,
                    'jobs' => [[
                        'id' => 'job-report',
                        'name' => 'Generate Report',
                        'status' => 'succeeded',
                        'duration' => 60,
                        'steps' => [],
                    ]],
                ],
            ],
        ];
    }

    private function getParallelJobsPipeline(): array
    {
        return [
            'id' => 'pipeline-parallel',
            'name' => 'Parallel Test Suite',
            'status' => 'succeeded',
            'trigger' => [
                'type' => 'pull_request',
                'ref' => 'refs/pull/42/merge',
                'actor' => 'developer',
                'commit' => [
                    'sha' => 'pr42head',
                    'message' => 'Add new feature',
                    'author' => 'developer@example.com',
                ],
            ],
            'startTime' => '2024-12-12T14:00:00Z',
            'endTime' => '2024-12-12T14:08:00Z',
            'duration' => 480,
            'stages' => [
                [
                    'id' => 'stage-build-parallel',
                    'name' => 'Build',
                    'status' => 'succeeded',
                    'duration' => 120,
                    'jobs' => [[
                        'id' => 'job-build-parallel',
                        'name' => 'Build Application',
                        'status' => 'succeeded',
                        'duration' => 120,
                        'steps' => [],
                    ]],
                ],
                [
                    'id' => 'stage-test-parallel',
                    'name' => 'Test (Parallel)',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-build-parallel'],
                    'duration' => 300,
                    'jobs' => [
                        ['id' => 'job-unit-1', 'name' => 'Unit Tests (Shard 1/4)', 'status' => 'succeeded', 'runner' => 'ubuntu-latest', 'duration' => 280, 'steps' => []],
                        ['id' => 'job-unit-2', 'name' => 'Unit Tests (Shard 2/4)', 'status' => 'succeeded', 'runner' => 'ubuntu-latest', 'duration' => 300, 'steps' => []],
                        ['id' => 'job-unit-3', 'name' => 'Unit Tests (Shard 3/4)', 'status' => 'succeeded', 'runner' => 'ubuntu-latest', 'duration' => 290, 'steps' => []],
                        ['id' => 'job-unit-4', 'name' => 'Unit Tests (Shard 4/4)', 'status' => 'succeeded', 'runner' => 'ubuntu-latest', 'duration' => 295, 'steps' => []],
                    ],
                ],
                [
                    'id' => 'stage-e2e',
                    'name' => 'E2E Tests',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-test-parallel'],
                    'duration' => 60,
                    'jobs' => [[
                        'id' => 'job-e2e',
                        'name' => 'Playwright Tests',
                        'status' => 'succeeded',
                        'runner' => 'ubuntu-latest',
                        'duration' => 60,
                        'steps' => [],
                    ]],
                ],
            ],
        ];
    }

    private function getMultiEnvPipeline(): array
    {
        return [
            'id' => 'pipeline-multi-env',
            'name' => 'Multi-Environment Deploy',
            'status' => 'succeeded',
            'trigger' => [
                'type' => 'tag',
                'ref' => 'refs/tags/v1.2.0',
                'actor' => 'release-bot',
                'commit' => [
                    'sha' => 'v120rel',
                    'message' => 'Release v1.2.0',
                    'author' => 'release@example.com',
                ],
            ],
            'startTime' => '2024-12-12T16:00:00Z',
            'endTime' => '2024-12-12T16:30:00Z',
            'duration' => 1800,
            'stages' => [
                [
                    'id' => 'stage-build-release',
                    'name' => 'Build',
                    'status' => 'succeeded',
                    'duration' => 240,
                    'jobs' => [[
                        'id' => 'job-build-release',
                        'name' => 'Build Release',
                        'status' => 'succeeded',
                        'duration' => 240,
                        'steps' => [],
                    ]],
                ],
                [
                    'id' => 'stage-staging',
                    'name' => 'Deploy Staging',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-build-release'],
                    'duration' => 360,
                    'jobs' => [[
                        'id' => 'job-deploy-staging',
                        'name' => 'Deploy to Staging',
                        'status' => 'succeeded',
                        'duration' => 180,
                        'steps' => [
                            ['id' => 'step-staging-deploy', 'name' => 'Apply Manifests', 'status' => 'succeeded', 'duration' => 60, 'logs' => []],
                            ['id' => 'step-staging-wait', 'name' => 'Wait for Rollout', 'status' => 'succeeded', 'duration' => 120, 'logs' => []],
                        ],
                    ],
                    [
                        'id' => 'job-smoke-staging',
                        'name' => 'Smoke Tests',
                        'status' => 'succeeded',
                        'duration' => 180,
                        'steps' => [
                            ['id' => 'step-health', 'name' => 'Health Check', 'status' => 'succeeded', 'duration' => 30, 'logs' => [
                                ['timestamp' => '16:10:00', 'level' => 'info', 'message' => 'All endpoints healthy'],
                            ]],
                            ['id' => 'step-smoke', 'name' => 'Run Smoke Tests', 'status' => 'succeeded', 'duration' => 150, 'logs' => []],
                        ],
                    ]],
                ],
                [
                    'id' => 'stage-production',
                    'name' => 'Deploy Production',
                    'status' => 'succeeded',
                    'dependsOn' => ['stage-staging'],
                    'duration' => 600,
                    'jobs' => [[
                        'id' => 'job-deploy-prod',
                        'name' => 'Deploy to Production',
                        'status' => 'succeeded',
                        'duration' => 600,
                        'steps' => [
                            ['id' => 'step-canary', 'name' => 'Canary Deploy (10%)', 'status' => 'succeeded', 'duration' => 120, 'logs' => [
                                ['timestamp' => '16:20:00', 'level' => 'info', 'message' => 'Canary pods healthy, error rate 0.1%'],
                            ]],
                            ['id' => 'step-rollout-50', 'name' => 'Rollout 50%', 'status' => 'succeeded', 'duration' => 180, 'logs' => []],
                            ['id' => 'step-rollout-100', 'name' => 'Rollout 100%', 'status' => 'succeeded', 'duration' => 300, 'logs' => [
                                ['timestamp' => '16:30:00', 'level' => 'info', 'message' => 'Production deployment complete'],
                            ]],
                        ],
                    ]],
                ],
            ],
        ];
    }
}
