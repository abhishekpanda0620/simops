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
}
