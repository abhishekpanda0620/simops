<?php

namespace Database\Seeders;

use App\Models\ControlPlaneScenario;
use Illuminate\Database\Seeder;

class ControlPlaneScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $scenarios = [
            // Pods
            ['slug' => 'create-pod', 'name' => 'Create Pod', 'category' => 'pods', 'description' => 'Watch a new pod get scheduled and started', 'icon' => 'plus', 'sort_order' => 1],
            ['slug' => 'delete-pod', 'name' => 'Delete Pod', 'category' => 'pods', 'description' => 'See how pods are gracefully terminated', 'icon' => 'trash', 'sort_order' => 2],
            
            // Workloads
            ['slug' => 'scale-deployment', 'name' => 'Scale Deployment', 'category' => 'workloads', 'description' => 'Scale a deployment up or down', 'icon' => 'scale', 'sort_order' => 3],
            ['slug' => 'deploy-statefulset', 'name' => 'Deploy StatefulSet', 'category' => 'workloads', 'description' => 'Deploy ordered, stable pods with persistent storage', 'icon' => 'database', 'sort_order' => 4],
            ['slug' => 'deploy-daemonset', 'name' => 'Deploy DaemonSet', 'category' => 'workloads', 'description' => 'Run a pod on every node in the cluster', 'icon' => 'server', 'sort_order' => 5],
            
            // Cluster
            ['slug' => 'node-failure', 'name' => 'Node Failure Recovery', 'category' => 'cluster', 'description' => 'See how the cluster recovers from a node failure', 'icon' => 'alert-triangle', 'sort_order' => 6],
            
            // Scaling
            ['slug' => 'simulate-hpa', 'name' => 'HPA Autoscaling', 'category' => 'scaling', 'description' => 'Watch horizontal pod autoscaler in action', 'icon' => 'trending-up', 'sort_order' => 7],
            
            // Scheduling
            ['slug' => 'simulate-node-affinity', 'name' => 'Node Affinity', 'category' => 'scheduling', 'description' => 'Schedule pods to specific nodes using affinity rules', 'icon' => 'magnet', 'sort_order' => 8],
            ['slug' => 'simulate-pod-antiaffinity', 'name' => 'Pod Anti-Affinity', 'category' => 'scheduling', 'description' => 'Spread pods across nodes for high availability', 'icon' => 'split', 'sort_order' => 9],
            ['slug' => 'simulate-node-selector', 'name' => 'Node Selector', 'category' => 'scheduling', 'description' => 'Select nodes using label matching', 'icon' => 'tag', 'sort_order' => 10],
            
            // Security
            ['slug' => 'simulate-rbac', 'name' => 'RBAC Access Control', 'category' => 'security', 'description' => 'See role-based access control in action', 'icon' => 'shield', 'sort_order' => 11],
            
            // GitOps
            ['slug' => 'argocd-sync', 'name' => 'ArgoCD Sync', 'category' => 'gitops', 'description' => 'Watch ArgoCD sync application state from Git', 'icon' => 'git-branch', 'sort_order' => 12],
            
            // Certificates
            ['slug' => 'certmanager-issue', 'name' => 'Cert-Manager TLS', 'category' => 'security', 'description' => 'Issue and manage TLS certificates', 'icon' => 'lock', 'sort_order' => 13],
        ];

        foreach ($scenarios as $scenario) {
            ControlPlaneScenario::updateOrCreate(
                ['slug' => $scenario['slug']],
                $scenario
            );
        }
    }
}
