<?php

namespace Database\Seeders;

use App\Models\Lab;
use Illuminate\Database\Seeder;

class LabSeeder extends Seeder
{
    /**
     * Seed sample labs for SimOps platform
     */
    public function run(): void
    {
        $labs = [
            [
                'title' => 'Kubernetes Basics: Create Your First Pod',
                'slug' => 'k8s-first-pod',
                'description' => 'Learn how to create and manage Kubernetes pods. Understand the pod lifecycle, container specs, and basic kubectl commands.',
                'difficulty' => 'beginner',
                'estimated_time' => 15,
                'steps' => [
                    ['id' => 1, 'title' => 'Introduction to Pods', 'description' => 'Understanding what a Pod is'],
                    ['id' => 2, 'title' => 'Create a Pod YAML', 'description' => 'Write your first pod manifest'],
                    ['id' => 3, 'title' => 'Apply and Verify', 'description' => 'Deploy the pod and check its status'],
                ],
            ],
            [
                'title' => 'Understanding Traffic Flow',
                'slug' => 'traffic-flow',
                'description' => 'Visualize how external requests flow through Ingress → Service → Pod and back. Master Kubernetes networking concepts.',
                'difficulty' => 'beginner',
                'estimated_time' => 20,
                'steps' => [
                    ['id' => 1, 'title' => 'Ingress Controllers', 'description' => 'Learn about ingress routing'],
                    ['id' => 2, 'title' => 'ClusterIP Services', 'description' => 'Internal service discovery'],
                    ['id' => 3, 'title' => 'Pod Selection', 'description' => 'How services find pods via labels'],
                    ['id' => 4, 'title' => 'End-to-End Flow', 'description' => 'Trace a complete request path'],
                ],
            ],
            [
                'title' => 'Control Plane Deep Dive',
                'slug' => 'control-plane',
                'description' => 'Explore how the Kubernetes control plane works: API Server, etcd, Scheduler, and Controller Manager interactions.',
                'difficulty' => 'intermediate',
                'estimated_time' => 30,
                'steps' => [
                    ['id' => 1, 'title' => 'API Server', 'description' => 'The gateway to your cluster'],
                    ['id' => 2, 'title' => 'etcd Storage', 'description' => 'Cluster state persistence'],
                    ['id' => 3, 'title' => 'Scheduler Logic', 'description' => 'Pod placement decisions'],
                    ['id' => 4, 'title' => 'Controller Manager', 'description' => 'Reconciliation loops'],
                ],
            ],
            [
                'title' => 'Troubleshooting CrashLoopBackOff',
                'slug' => 'crashloop-troubleshoot',
                'description' => 'Learn to diagnose and fix the dreaded CrashLoopBackOff status. Practice real debugging techniques.',
                'difficulty' => 'intermediate',
                'estimated_time' => 25,
                'steps' => [
                    ['id' => 1, 'title' => 'Identify the Problem', 'description' => 'Use kubectl describe'],
                    ['id' => 2, 'title' => 'Check Logs', 'description' => 'Read container logs for errors'],
                    ['id' => 3, 'title' => 'Common Causes', 'description' => 'Resource limits, config errors'],
                    ['id' => 4, 'title' => 'Apply the Fix', 'description' => 'Patch and verify recovery'],
                ],
            ],
        ];

        foreach ($labs as $labData) {
            Lab::create($labData);
        }
    }
}
