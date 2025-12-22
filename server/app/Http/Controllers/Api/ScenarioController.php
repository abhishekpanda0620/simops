<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{
    /**
     * List available scenarios
     * Returns static list of K8s simulation scenarios
     */
    public function index()
    {
        $scenarios = [
            ['id' => 'create-pod', 'name' => 'Create Pod', 'category' => 'pods'],
            ['id' => 'delete-pod', 'name' => 'Delete Pod', 'category' => 'pods'],
            ['id' => 'scale-deployment', 'name' => 'Scale Deployment', 'category' => 'workloads'],
            ['id' => 'node-failure', 'name' => 'Node Failure Recovery', 'category' => 'cluster'],
            ['id' => 'deploy-statefulset', 'name' => 'Deploy StatefulSet', 'category' => 'workloads'],
            ['id' => 'deploy-daemonset', 'name' => 'Deploy DaemonSet', 'category' => 'workloads'],
            ['id' => 'simulate-hpa', 'name' => 'HPA Autoscaling', 'category' => 'scaling'],
            ['id' => 'simulate-rbac', 'name' => 'RBAC Access Control', 'category' => 'security'],
            ['id' => 'argocd-sync', 'name' => 'ArgoCD Sync', 'category' => 'gitops'],
            ['id' => 'certmanager-issue', 'name' => 'Cert-Manager TLS', 'category' => 'security'],
        ];

        return response()->json(['scenarios' => $scenarios]);
    }

    /**
     * Get scenario status (for polling)
     * In a real implementation, this would check simulation state
     */
    public function status(string $scenario)
    {
        // For now, return simulated status
        // This endpoint is for polling current simulation state
        return response()->json([
            'scenario' => $scenario,
            'status' => 'idle',
            'phase' => null,
            'message' => null,
            'timestamp' => now(),
        ]);
    }
}
