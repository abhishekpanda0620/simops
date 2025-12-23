<?php

namespace Database\Seeders;

use App\Models\K8sScenario;
use Illuminate\Database\Seeder;

class K8sScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $scenarios = [
            [
                'slug' => 'healthy',
                'name' => 'Healthy Cluster',
                'description' => 'All systems operational. All pods running, no errors.',
                'data' => $this->getHealthyScenario(),
            ],
            [
                'slug' => 'crashLoopBackOff',
                'name' => 'CrashLoopBackOff',
                'description' => 'A pod is repeatedly crashing and being restarted by Kubernetes.',
                'data' => $this->getCrashLoopScenario(),
            ],
            [
                'slug' => 'oomKilled',
                'name' => 'OOMKilled',
                'description' => 'A container was terminated due to exceeding memory limits.',
                'data' => $this->getOOMKilledScenario(),
            ],
            [
                'slug' => 'imagePullBackOff',
                'name' => 'ImagePullBackOff',
                'description' => 'Kubernetes cannot pull the container image from the registry.',
                'data' => $this->getImagePullBackOffScenario(),
            ],
            [
                'slug' => 'pending',
                'name' => 'Pending Pod',
                'description' => 'A pod is stuck in Pending state, waiting for resources.',
                'data' => $this->getPendingScenario(),
            ],
            [
                'slug' => 'nodeNotReady',
                'name' => 'Node Not Ready',
                'description' => 'A worker node has become unresponsive or unhealthy.',
                'data' => $this->getNodeNotReadyScenario(),
            ],
        ];

        foreach ($scenarios as $scenario) {
            K8sScenario::updateOrCreate(
                ['slug' => $scenario['slug']],
                $scenario
            );
        }
    }

    private function getHealthyControlPlane(): array
    {
        return [
            'apiServer' => [
                'id' => 'api-server',
                'name' => 'kube-apiserver',
                'status' => 'healthy',
                'description' => 'The API server validates and configures data for pods, services, and controllers.',
            ],
            'etcd' => [
                'id' => 'etcd',
                'name' => 'etcd',
                'status' => 'healthy',
                'description' => 'Consistent and highly-available key-value store for all cluster data.',
            ],
            'controllerManager' => [
                'id' => 'controller-manager',
                'name' => 'kube-controller-manager',
                'status' => 'healthy',
                'description' => 'Runs controller processes (node controller, replication controller, etc.).',
            ],
            'scheduler' => [
                'id' => 'scheduler',
                'name' => 'kube-scheduler',
                'status' => 'healthy',
                'description' => 'Watches for newly created pods and selects nodes for them to run on.',
            ],
        ];
    }

    private function getBaseNodes(): array
    {
        return [
            [
                'id' => 'node-cp-1',
                'name' => 'control-plane-1',
                'status' => 'running',
                'role' => 'control-plane',
                'labels' => ['kubernetes.io/hostname' => 'control-plane-1'],
                'conditions' => [['type' => 'Ready', 'status' => 'True']],
                'cpu' => ['used' => 1.2, 'total' => 4, 'unit' => 'cores'],
                'memory' => ['used' => 3072, 'total' => 8192, 'unit' => 'Mi'],
                'pods' => [],
                'kubeletVersion' => 'v1.34.0',
                'containerRuntime' => 'containerd://1.7.0',
            ],
            [
                'id' => 'node-worker-1',
                'name' => 'worker-1',
                'status' => 'running',
                'role' => 'worker',
                'labels' => ['kubernetes.io/hostname' => 'worker-1'],
                'conditions' => [['type' => 'Ready', 'status' => 'True']],
                'cpu' => ['used' => 2.5, 'total' => 8, 'unit' => 'cores'],
                'memory' => ['used' => 6144, 'total' => 16384, 'unit' => 'Mi'],
                'pods' => ['pod-frontend-1', 'pod-frontend-2', 'pod-api-1'],
                'kubeletVersion' => 'v1.34.0',
                'containerRuntime' => 'containerd://1.7.0',
            ],
            [
                'id' => 'node-worker-2',
                'name' => 'worker-2',
                'status' => 'running',
                'role' => 'worker',
                'labels' => ['kubernetes.io/hostname' => 'worker-2'],
                'conditions' => [['type' => 'Ready', 'status' => 'True']],
                'cpu' => ['used' => 1.8, 'total' => 8, 'unit' => 'cores'],
                'memory' => ['used' => 4096, 'total' => 16384, 'unit' => 'Mi'],
                'pods' => ['pod-api-2', 'pod-db-1', 'pod-cache-1'],
                'kubeletVersion' => 'v1.34.0',
                'containerRuntime' => 'containerd://1.7.0',
            ],
        ];
    }

    private function createPod(string $id, string $name, string $nodeId, string $nodeName, string $phase = 'Running', string $status = 'running', array $events = []): array
    {
        return [
            'id' => $id,
            'name' => $name,
            'namespace' => 'default',
            'phase' => $phase,
            'status' => $status,
            'conditions' => [['type' => 'Ready', 'status' => $phase === 'Running' ? 'True' : 'False']],
            'restarts' => 0,
            'containers' => [[
                'name' => 'main',
                'image' => 'nginx:1.25',
                'state' => $phase === 'Running' ? 'running' : 'waiting',
                'ready' => $phase === 'Running',
                'restarts' => 0,
            ]],
            'labels' => ['app' => 'demo'],
            'nodeId' => $nodeId,
            'nodeName' => $nodeName,
            'serviceIds' => [],
            'events' => $events,
            'createdAt' => now()->toISOString(),
        ];
    }

    private function getHealthyScenario(): array
    {
        return [
            'id' => 'healthy-cluster',
            'name' => 'Production Cluster',
            'description' => 'All systems operational. All pods running, no errors.',
            'timestamp' => now()->toISOString(),
            'controlPlane' => $this->getHealthyControlPlane(),
            'nodes' => $this->getBaseNodes(),
            'pods' => [
                $this->createPod('pod-frontend-1', 'frontend-abc12', 'node-worker-1', 'worker-1'),
                $this->createPod('pod-frontend-2', 'frontend-def34', 'node-worker-1', 'worker-1'),
                $this->createPod('pod-api-1', 'api-ghi56', 'node-worker-1', 'worker-1'),
                $this->createPod('pod-api-2', 'api-jkl78', 'node-worker-2', 'worker-2'),
                $this->createPod('pod-db-1', 'postgres-0', 'node-worker-2', 'worker-2'),
                $this->createPod('pod-cache-1', 'redis-0', 'node-worker-2', 'worker-2'),
            ],
            'services' => [
                [
                    'id' => 'svc-frontend',
                    'name' => 'frontend',
                    'namespace' => 'default',
                    'type' => 'NodePort',
                    'clusterIP' => '10.96.45.12',
                    'ports' => [['port' => 80, 'targetPort' => 80, 'protocol' => 'TCP', 'nodePort' => 30080]],
                    'selector' => ['app' => 'frontend'],
                    'podIds' => ['pod-frontend-1', 'pod-frontend-2'],
                ],
                [
                    'id' => 'svc-api',
                    'name' => 'api',
                    'namespace' => 'default',
                    'type' => 'LoadBalancer',
                    'clusterIP' => '10.96.78.34',
                    'ports' => [['port' => 8080, 'targetPort' => 8080, 'protocol' => 'TCP']],
                    'selector' => ['app' => 'api'],
                    'podIds' => ['pod-api-1', 'pod-api-2'],
                ],
                [
                    'id' => 'svc-postgres',
                    'name' => 'postgres',
                    'namespace' => 'default',
                    'type' => 'ClusterIP',
                    'clusterIP' => '10.96.120.56',
                    'ports' => [['port' => 5432, 'targetPort' => 5432, 'protocol' => 'TCP']],
                    'selector' => ['app' => 'postgres'],
                    'podIds' => ['pod-db-1'],
                ],
            ],
            'ingresses' => [
                [
                    'id' => 'ingress-main',
                    'name' => 'main-ingress',
                    'namespace' => 'default',
                    'host' => 'app.example.com',
                    'paths' => [
                        ['path' => '/', 'pathType' => 'Prefix', 'serviceId' => 'svc-frontend', 'port' => 80],
                        ['path' => '/api', 'pathType' => 'Prefix', 'serviceId' => 'svc-api', 'port' => 8080],
                    ],
                ],
            ],
            'deployments' => [
                [
                    'id' => 'deploy-frontend',
                    'name' => 'frontend',
                    'namespace' => 'default',
                    'replicas' => ['desired' => 2, 'ready' => 2, 'available' => 2],
                    'selector' => ['app' => 'frontend'],
                    'podIds' => ['pod-frontend-1', 'pod-frontend-2'],
                    'strategy' => 'RollingUpdate',
                ],
                [
                    'id' => 'deploy-api',
                    'name' => 'api',
                    'namespace' => 'default',
                    'replicas' => ['desired' => 2, 'ready' => 2, 'available' => 2],
                    'selector' => ['app' => 'api'],
                    'podIds' => ['pod-api-1', 'pod-api-2'],
                    'strategy' => 'RollingUpdate',
                ],
            ],
            'statefulSets' => [],
            'daemonSets' => [],
            'pvs' => [],
            'pvcs' => [],
            'configMaps' => [],
            'secrets' => [],
            'jobs' => [],
            'cronJobs' => [],
            'hpas' => [],
            'roles' => [],
            'roleBindings' => [],
            'argoApplications' => [],
        ];
    }

    private function getCrashLoopScenario(): array
    {
        $scenario = $this->getHealthyScenario();
        $scenario['id'] = 'crashloop-cluster';
        $scenario['name'] = 'CrashLoopBackOff Scenario';
        $scenario['description'] = 'A pod is repeatedly crashing and being restarted.';
        
        // Add a crashing pod
        $scenario['pods'][] = [
            'id' => 'pod-crash',
            'name' => 'buggy-app-xyz',
            'namespace' => 'default',
            'phase' => 'Running',
            'status' => 'failed',
            'conditions' => [['type' => 'Ready', 'status' => 'False']],
            'restarts' => 5,
            'containers' => [[
                'name' => 'app',
                'image' => 'myapp:buggy',
                'state' => 'waiting',
                'waitingReason' => 'CrashLoopBackOff',
                'ready' => false,
                'restarts' => 5,
            ]],
            'labels' => ['app' => 'buggy'],
            'nodeId' => 'node-worker-1',
            'nodeName' => 'worker-1',
            'serviceIds' => [],
            'events' => [
                ['type' => 'Warning', 'reason' => 'BackOff', 'message' => 'Back-off restarting failed container', 'timestamp' => now()->toISOString(), 'count' => 5],
            ],
            'createdAt' => now()->toISOString(),
        ];

        return $scenario;
    }

    private function getOOMKilledScenario(): array
    {
        $scenario = $this->getHealthyScenario();
        $scenario['id'] = 'oom-cluster';
        $scenario['name'] = 'OOMKilled Scenario';
        $scenario['description'] = 'A container was terminated due to exceeding memory limits.';
        
        $scenario['pods'][] = [
            'id' => 'pod-oom',
            'name' => 'memory-hog-123',
            'namespace' => 'default',
            'phase' => 'Running',
            'status' => 'failed',
            'conditions' => [['type' => 'Ready', 'status' => 'False']],
            'restarts' => 3,
            'containers' => [[
                'name' => 'app',
                'image' => 'myapp:memory-leak',
                'state' => 'terminated',
                'terminatedReason' => 'OOMKilled',
                'ready' => false,
                'restarts' => 3,
            ]],
            'labels' => ['app' => 'memory-hog'],
            'nodeId' => 'node-worker-2',
            'nodeName' => 'worker-2',
            'serviceIds' => [],
            'events' => [
                ['type' => 'Warning', 'reason' => 'OOMKilled', 'message' => 'Container killed due to OOM', 'timestamp' => now()->toISOString(), 'count' => 3],
            ],
            'createdAt' => now()->toISOString(),
        ];

        return $scenario;
    }

    private function getImagePullBackOffScenario(): array
    {
        $scenario = $this->getHealthyScenario();
        $scenario['id'] = 'imagepull-cluster';
        $scenario['name'] = 'ImagePullBackOff Scenario';
        $scenario['description'] = 'Kubernetes cannot pull the container image from the registry.';
        
        $scenario['pods'][] = [
            'id' => 'pod-imagepull',
            'name' => 'new-deploy-abc',
            'namespace' => 'default',
            'phase' => 'Pending',
            'status' => 'pending',
            'conditions' => [['type' => 'Ready', 'status' => 'False']],
            'restarts' => 0,
            'containers' => [[
                'name' => 'app',
                'image' => 'private-registry/app:v99',
                'state' => 'waiting',
                'waitingReason' => 'ImagePullBackOff',
                'ready' => false,
                'restarts' => 0,
            ]],
            'labels' => ['app' => 'new-deploy'],
            'nodeId' => 'node-worker-1',
            'nodeName' => 'worker-1',
            'serviceIds' => [],
            'events' => [
                ['type' => 'Warning', 'reason' => 'Failed', 'message' => 'Failed to pull image: unauthorized', 'timestamp' => now()->toISOString(), 'count' => 3],
            ],
            'createdAt' => now()->toISOString(),
        ];

        return $scenario;
    }

    private function getPendingScenario(): array
    {
        $scenario = $this->getHealthyScenario();
        $scenario['id'] = 'pending-cluster';
        $scenario['name'] = 'Pending Pod Scenario';
        $scenario['description'] = 'A pod is stuck in Pending state, waiting for resources.';
        
        $scenario['pods'][] = [
            'id' => 'pod-pending',
            'name' => 'resource-heavy-xyz',
            'namespace' => 'default',
            'phase' => 'Pending',
            'status' => 'pending',
            'conditions' => [
                ['type' => 'PodScheduled', 'status' => 'False', 'reason' => 'Unschedulable', 'message' => 'Insufficient cpu'],
            ],
            'restarts' => 0,
            'containers' => [[
                'name' => 'app',
                'image' => 'myapp:v1',
                'state' => 'waiting',
                'waitingReason' => 'ContainerCreating',
                'ready' => false,
                'restarts' => 0,
            ]],
            'labels' => ['app' => 'resource-heavy'],
            'nodeId' => '',
            'nodeName' => '',
            'serviceIds' => [],
            'events' => [
                ['type' => 'Warning', 'reason' => 'FailedScheduling', 'message' => '0/3 nodes available: insufficient cpu', 'timestamp' => now()->toISOString(), 'count' => 10],
            ],
            'createdAt' => now()->toISOString(),
        ];

        return $scenario;
    }

    private function getNodeNotReadyScenario(): array
    {
        $scenario = $this->getHealthyScenario();
        $scenario['id'] = 'nodedown-cluster';
        $scenario['name'] = 'Node Not Ready Scenario';
        $scenario['description'] = 'A worker node has become unresponsive.';
        
        // Mark worker-2 as NotReady
        $scenario['nodes'][2]['status'] = 'failed';
        $scenario['nodes'][2]['conditions'] = [
            ['type' => 'Ready', 'status' => 'False', 'reason' => 'KubeletNotReady', 'message' => 'PLEG is not healthy'],
        ];
        
        // Pods on that node become pending
        foreach ($scenario['pods'] as &$pod) {
            if ($pod['nodeId'] === 'node-worker-2') {
                $pod['phase'] = 'Pending';
                $pod['status'] = 'pending';
                $pod['events'][] = [
                    'type' => 'Warning',
                    'reason' => 'NodeNotReady',
                    'message' => 'Node worker-2 is not ready',
                    'timestamp' => now()->toISOString(),
                    'count' => 1,
                ];
            }
        }

        return $scenario;
    }
}
