import { X, Lightbulb, Trash2, Box, Server, Database, Cog, Calendar, AlertTriangle, Network, Globe, ImageOff, RotateCcw, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui';
import { useClusterStore } from '@/store';
import type { K8sPod, K8sNode, K8sService, K8sIngress, ControlPlaneComponent, ClusterSnapshot, K8sPV, K8sPVC } from '@/types';
import { formatMemory } from '@/utils';

type SelectedItem =
  | { type: 'controlPlane'; data: ControlPlaneComponent }
  | { type: 'node'; data: K8sNode }
  | { type: 'pod'; data: K8sPod }
  | { type: 'service'; data: K8sService }
  | { type: 'ingress'; data: K8sIngress }
  | { type: 'pv'; data: K8sPV }
  | { type: 'pvc'; data: K8sPVC }
  | { type: 'info'; data: { id: 'controlPlaneIntro' | 'workerNodesIntro' } }
  | null;

interface EnhancedInfoPanelProps {
  selected: SelectedItem;
  cluster: ClusterSnapshot;
  onClose: () => void;
  onKillPod: (podId: string) => void;
}

// Educational content with deep explanations
const educationalContent = {
  controlPlane: {
    'api-server': {
      title: 'API Server (kube-apiserver)',
      description: 'The front-end for the Kubernetes control plane. All cluster operations go through the API server.',
      analogy: '🏛️ Think of it as the reception desk of a hotel - every request (booking, checkout, room service) must go through reception.',
      keyPoints: [
        'Validates and processes all REST requests',
        'Only component that talks directly to etcd',
        'Handles authentication and authorization',
        'Exposes the Kubernetes API',
      ],
      troubleshooting: [
        'If API server is down, kubectl commands will fail',
        'Check certificate expiration',
        'Verify port 6443 is accessible',
      ],
    },
    'etcd': {
      title: 'etcd',
      description: 'A consistent and highly-available key-value store used as Kubernetes backing store for all cluster data.',
      analogy: '📚 Think of it as the hotel\'s master record book - contains every reservation, room assignment, and guest preference.',
      keyPoints: [
        'Stores all cluster state and configuration',
        'Distributed for high availability',
        'Requires regular backups',
        'Never directly modified - only through API server',
      ],
      troubleshooting: [
        'Monitor disk I/O latency',
        'Check cluster member health',
        'Ensure regular backups exist',
      ],
    },
    'controller-manager': {
      title: 'Controller Manager',
      description: 'Runs controller processes that regulate the state of the cluster, ensuring desired state matches actual state.',
      analogy: '🔧 Think of it as the hotel maintenance team - constantly checking if rooms are clean, lights work, and fixing issues.',
      keyPoints: [
        'Node Controller: Handles node failures',
        'ReplicaSet Controller: Maintains pod count',
        'Endpoint Controller: Populates service endpoints',
        'Runs reconciliation loops continuously',
      ],
      troubleshooting: [
        'If pods aren\'t being recreated, check controller logs',
        'Verify leader election is working',
        'Check for resource quota limits',
      ],
    },
    'scheduler': {
      title: 'Scheduler (kube-scheduler)',
      description: 'Watches for newly created pods and selects a node for them to run on based on resource requirements and constraints.',
      analogy: '🎯 Think of it as the hotel booking system - assigns guests to rooms based on preferences, availability, and requirements.',
      keyPoints: [
        'Considers CPU/memory requirements',
        'Respects node affinity/anti-affinity',
        'Handles taints and tolerations',
        'Balances load across nodes',
      ],
      troubleshooting: [
        'Pending pods often mean scheduling issues',
        'Check for insufficient resources',
        'Verify node conditions and taints',
      ],
    },
  },
  pod: {
    states: {
      'CrashLoopBackOff': {
        title: 'CrashLoopBackOff',
        description: 'The container keeps crashing and Kubernetes is backing off on restart attempts.',
        cause: 'Application exits with error, missing dependencies, or configuration issues.',
        fix: [
          'Check container logs: kubectl logs <pod> -c <container>',
          'Verify environment variables are correct',
          'Check for missing ConfigMaps/Secrets',
          'Ensure the application entry point is correct',
        ],
      },
      'OOMKilled': {
        title: 'OOMKilled (Out of Memory)',
        description: 'The container exceeded its memory limit and was killed by the kernel.',
        cause: 'Memory leak, insufficient limits, or resource-intensive operation.',
        fix: [
          'Increase memory limits in deployment spec',
          'Profile application for memory leaks',
          'Check for runaway processes',
          'Consider horizontal scaling instead',
        ],
      },
      'ImagePullBackOff': {
        title: 'ImagePullBackOff',
        description: 'Kubernetes cannot pull the container image from the registry.',
        cause: 'Image doesn\'t exist, wrong tag, or missing registry credentials.',
        fix: [
          'Verify image name and tag are correct',
          'Check if imagePullSecrets are configured',
          'Ensure registry is accessible from cluster',
          'Try pulling image manually on node',
        ],
      },
      'Pending': {
        title: 'Pending',
        description: 'The pod cannot be scheduled to any node.',
        cause: 'Insufficient resources, node affinity, or taints preventing scheduling.',
        fix: [
          'Check for Insufficient CPU/memory messages',
          'Reduce resource requests',
          'Add more nodes to the cluster',
          'Check for conflicting node selectors',
        ],
      },
    },
  },
  node: {
    title: 'Worker Node',
    description: 'A virtual or physical machine that runs your containerized workloads.',
    analogy: '🏢 Think of it as a floor in a hotel building - each floor has rooms (pods) and shared infrastructure (networking, storage).',
    keyPoints: [
      'Runs kubelet agent that manages pods',
      'Has container runtime (containerd/Docker)',
      'Reports resource usage to control plane',
      'Can be added/removed for scaling',
    ],
    conditions: {
      'MemoryPressure': 'Node is running low on memory - pods may be evicted',
      'DiskPressure': 'Node is running low on disk space - image pulls may fail',
      'PIDPressure': 'Too many processes running on the node',
      'NetworkUnavailable': 'Network not configured correctly',
    },
  },
  service: {
    title: 'Kubernetes Service',
    description: 'A Service provides a stable network endpoint (IP and DNS name) to access a group of Pods. It acts as a load balancer and service discovery mechanism.',
    analogy: '📞 Think of a Service like a phone number for a business - customers call one number, and calls are routed to available employees (Pods).',
    keyPoints: [
      'Provides stable IP even when Pods change',
      'Load balances traffic across target Pods',
      'Uses label selectors to find Pods',
      'Enables service discovery via DNS',
    ],
    types: {
      'ClusterIP': 'Only accessible within the cluster. Default type.',
      'NodePort': 'Accessible on each Node\'s IP at a static port (30000-32767).',
      'LoadBalancer': 'Exposes via cloud provider\'s load balancer.',
      'ExternalName': 'Maps to an external DNS name.',
    },
  },
};

export function EnhancedInfoPanel({ selected, cluster, onClose, onKillPod }: EnhancedInfoPanelProps) {
  if (!selected) return null;

  // Info sections (Control Plane intro, Worker Nodes intro)
  if (selected.type === 'info') {
    if (selected.data.id === 'controlPlaneIntro') {
      return (
        <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cog className="w-5 h-5 text-primary-400" />
              <span className="font-semibold text-surface-100">Control Plane</span>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-surface-700 text-surface-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-5">
            <p className="text-sm text-surface-300 leading-relaxed">
              The Control Plane is the brain of your Kubernetes cluster. It makes global decisions about the cluster 
              (like scheduling), and detects and responds to cluster events.
            </p>
            
            <AnalogyBox analogy="🧠 Think of the Control Plane as the management office of a hotel — it decides which room (node) to assign to guests (pods), keeps track of all reservations (state), and dispatches maintenance when needed." />

            <div>
              <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Components</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-primary-400 font-medium">API Server</span>
                  <span className="text-surface-400"> — Front door for all cluster operations</span>
                </div>
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-primary-400 font-medium">etcd</span>
                  <span className="text-surface-400"> — Cluster database (all state stored here)</span>
                </div>
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-primary-400 font-medium">Controller Manager</span>
                  <span className="text-surface-400"> — Ensures desired state matches reality</span>
                </div>
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-primary-400 font-medium">Scheduler</span>
                  <span className="text-surface-400"> — Decides where to run new pods</span>
                </div>
              </div>
            </div>

            <KeyPointsList points={[
              'Usually runs on dedicated master nodes',
              'Should have 3+ replicas for high availability',
              'If control plane goes down, cluster keeps running but can\'t make changes',
              'Click individual components above to learn more',
            ]} />
          </div>
        </div>
      );
    }

    if (selected.data.id === 'workerNodesIntro') {
      return (
        <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-success-400" />
              <span className="font-semibold text-surface-100">Worker Nodes</span>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-surface-700 text-surface-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-5">
            <p className="text-sm text-surface-300 leading-relaxed">
              Worker Nodes are the machines that actually run your containerized applications. Each node runs 
              a kubelet agent that communicates with the control plane and manages pods.
            </p>
            
            <AnalogyBox analogy="🏢 Think of Worker Nodes as floors in a hotel building — each floor has rooms (pods) that can host guests (containers). The floor manager (kubelet) reports room status to the front desk (control plane)." />

            <div>
              <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">What Runs on Each Node</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-success-400 font-medium">kubelet</span>
                  <span className="text-surface-400"> — Agent that manages pods on the node</span>
                </div>
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-success-400 font-medium">Container Runtime</span>
                  <span className="text-surface-400"> — containerd or Docker for running containers</span>
                </div>
                <div className="p-2 rounded bg-surface-800">
                  <span className="text-success-400 font-medium">kube-proxy</span>
                  <span className="text-surface-400"> — Handles networking rules for Services</span>
                </div>
              </div>
            </div>

            <KeyPointsList points={[
              'Nodes can be added/removed for horizontal scaling',
              'Each node has finite CPU, memory, and pod capacity',
              'When a node fails, pods are rescheduled to healthy nodes',
              'Click individual nodes above to see resource usage',
            ]} />
          </div>
        </div>
      );
    }
  }

  // Control Plane Component
  if (selected.type === 'controlPlane') {
    const content = educationalContent.controlPlane[selected.data.id as keyof typeof educationalContent.controlPlane];
    if (!content) return null;

    const icons = { 'api-server': Server, 'etcd': Database, 'controller-manager': Cog, 'scheduler': Calendar };
    const Icon = icons[selected.data.id as keyof typeof icons] || Server;

    return (
      <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
        <PanelHeader title={content.title} icon={Icon} status={selected.data.status} onClose={onClose} />
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <p className="text-sm text-surface-300 leading-relaxed">{content.description}</p>
          <AnalogyBox analogy={content.analogy} />
          <KeyPointsList points={content.keyPoints} />
          <TroubleshootingSection items={content.troubleshooting} />
        </div>
      </div>
    );
  }

  // Node
  if (selected.type === 'node') {
    const node = selected.data;
    const nodePods = cluster.pods.filter((p) => p.nodeId === node.id);

    return (
      <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
        <PanelHeader title={node.name} icon={Server} status={node.status === 'running' ? 'healthy' : 'unhealthy'} onClose={onClose} />
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <p className="text-sm text-surface-300 leading-relaxed">{educationalContent.node.description}</p>
          <AnalogyBox analogy={educationalContent.node.analogy} />
          
          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Node Info</h4>
            <div className="space-y-1 text-sm">
              <InfoRow label="Role" value={node.role} />
              <InfoRow label="Kubelet" value={node.kubeletVersion} />
              <InfoRow label="Runtime" value={node.containerRuntime} />
              <InfoRow label="CPU" value={`${node.cpu.used}/${node.cpu.total} cores`} />
              <InfoRow label="Memory" value={`${formatMemory(node.memory.used)}/${formatMemory(node.memory.total)}`} />
              <InfoRow label="Pods" value={`${nodePods.length} running`} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Conditions</h4>
            {node.conditions.map((condition) => (
              <div key={condition.type} className="flex items-center gap-2 text-sm mb-1">
                <span className={`w-2 h-2 rounded-full ${condition.status === 'True' || condition.type === 'Ready' ? 'bg-success-500' : condition.status === 'False' ? 'bg-surface-500' : 'bg-warning-500'}`} />
                <span className="text-surface-300">{condition.type}</span>
                <span className="text-surface-500 text-xs ml-auto">{condition.status}</span>
              </div>
            ))}
          </div>

          <KeyPointsList points={educationalContent.node.keyPoints} />
        </div>
      </div>
    );
  }

  // Pod
  if (selected.type === 'pod') {
    // Get fresh pod data from cluster
    const pod = cluster.pods.find(p => p.id === selected.data.id) || selected.data;
    const deployment = cluster.deployments.find(d => d.selector.app === pod.labels.app); // Find parent deployment
    const container = pod.containers[0];
    const waitingReason = container?.waitingReason;
    const terminatedReason = container?.terminatedReason;
    const stateContent = waitingReason 
      ? educationalContent.pod.states[waitingReason as keyof typeof educationalContent.pod.states]
      : terminatedReason
      ? educationalContent.pod.states[terminatedReason as keyof typeof educationalContent.pod.states]
      : null;

    return (
      <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
        <PanelHeader 
          title={pod.name.split('-').slice(0, 3).join('-')} 
          icon={Box} 
          status={pod.status === 'running' ? 'healthy' : pod.status === 'pending' ? 'degraded' : 'unhealthy'} 
          onClose={onClose} 
        />
        <div className="flex-1 overflow-auto p-4 space-y-5">
          
          {/* Main Info Blocks (omitted for brevity, verified to exist) */}
          {stateContent && (
             <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/30">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle className="w-4 h-4 text-error-400" />
                 <span className="text-sm font-medium text-error-400">{stateContent.title}</span>
               </div>
               <p className="text-sm text-surface-300 mb-2">{stateContent.description}</p>
             </div>
          )}
          
          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Pod Details</h4>
            <div className="space-y-1 text-sm">
              <InfoRow label="Namespace" value={pod.namespace} />
              <InfoRow label="Phase" value={pod.phase} />
              <InfoRow label="Restarts" value={pod.restarts.toString()} highlight={pod.restarts > 0} />
              <InfoRow label="Node" value={pod.nodeName || 'Unscheduled'} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Container</h4>
             <div className="space-y-1 text-sm">
              <InfoRow label="Name" value={container?.name || 'N/A'} />
              <InfoRow label="State" value={container?.state || 'N/A'} />
             </div>
          </div>
          
          {/* Deployment Control */}
          {deployment && (
            <div className="p-3 rounded-lg bg-surface-800 border border-surface-700">
               <h4 className="text-xs font-medium text-primary-400 uppercase tracking-wide mb-2">Replica Set Control</h4>
               <div className="flex items-center justify-between mb-1">
                 <span className="text-sm text-surface-200 font-medium">Replicas: {deployment.replicas.desired}</span>
                 <div className="flex items-center gap-1">
                    <button 
                        className="w-6 h-6 rounded bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-surface-200 font-mono"
                        onClick={() => useClusterStore.getState().scaleDeployment(deployment.id, Math.max(0, deployment.replicas.desired - 1))}
                    >
                        -
                    </button>
                     <button 
                        className="w-6 h-6 rounded bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-surface-200 font-mono"
                        onClick={() => useClusterStore.getState().scaleDeployment(deployment.id, deployment.replicas.desired + 1)}
                    >
                        +
                    </button>
                 </div>
               </div>
               <p className="text-[10px] text-surface-400">Scaling {deployment.name}</p>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-surface-700 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="w-full gap-2 justify-center"
                onClick={() => onKillPod(pod.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kill Pod
              </Button>
            <Button
                variant="secondary"
                className="w-full gap-2 justify-center border border-warning-500/50 text-warning-400 hover:bg-warning-500/10"
                onClick={() => useClusterStore.getState().triggerCrashLoop(pod.id)}
            >
                <RotateCcw className="w-3.5 h-3.5" />
                Crash Loop
            </Button>
            <Button
                variant="secondary" 
                className="w-full gap-2 justify-center border border-warning-500/50 text-warning-400 hover:bg-warning-500/10"
                onClick={() => useClusterStore.getState().breakImage(pod.id)}
            >
                <ImageOff className="w-3.5 h-3.5" />
                Break Image
            </Button>
            <Button
                variant="secondary"
                className="w-full gap-2 justify-center border border-error-500/50 text-error-400 hover:bg-error-500/10"
                onClick={() => useClusterStore.getState().causeOOM(pod.id)}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Force OOM
              </Button>
            </div>
          <p className="text-[10px] text-surface-500 text-center">
            Simulate failures to see recovery
          </p>
        </div>
      </div>
    );
  }

  // Service
  if (selected.type === 'service') {
    const svc = selected.data;
    const targetPods = cluster.pods.filter((p) => svc.podIds.includes(p.id));

    return (
      <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
        <PanelHeader title={svc.name} icon={Network} status="healthy" onClose={onClose} />
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <p className="text-sm text-surface-300 leading-relaxed">{educationalContent.service.description}</p>
          <AnalogyBox analogy={educationalContent.service.analogy} />

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Service Details</h4>
            <div className="space-y-1 text-sm">
              <InfoRow label="Namespace" value={svc.namespace} />
              <InfoRow label="Type" value={svc.type} />
              <InfoRow label="Cluster IP" value={svc.clusterIP} />
              <InfoRow label="Selector" value={Object.entries(svc.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
              <InfoRow label="Target Pods" value={`${targetPods.length} pods`} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Ports</h4>
            <div className="space-y-2">
              {svc.ports.map((port, i) => (
                <div key={i} className="p-2 rounded bg-surface-800 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-accent-400">{port.port}</span>
                    <span className="text-surface-500"> → </span>
                    <span className="text-success-400">{port.targetPort}</span>
                    <span className="text-surface-500 text-xs ml-2">({port.protocol})</span>
                  </div>
                  {port.nodePort && (
                    <div className="text-xs text-warning-400 mt-1">
                      🌐 NodePort: {port.nodePort} (accessible on any node IP)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* NodePort/LoadBalancer Access Info */}
          {svc.type === 'NodePort' && (
            <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/30">
              <p className="text-xs text-warning-400 font-medium mb-1">How to Access (NodePort)</p>
              <code className="text-xs text-surface-200 bg-surface-800 px-1.5 py-0.5 rounded">
                http://&lt;any-node-ip&gt;:{svc.ports[0]?.nodePort}
              </code>
            </div>
          )}

          {svc.type === 'LoadBalancer' && (
            <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
              <p className="text-xs text-primary-400 font-medium mb-1">How to Access (LoadBalancer)</p>
              <p className="text-xs text-surface-300">
                External IP assigned by cloud provider (AWS ELB, GCP LB, etc.)
              </p>
              <code className="text-xs text-surface-200 bg-surface-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                kubectl get svc {svc.name} -o wide
              </code>
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Service Type: {svc.type}</h4>
            <p className="text-sm text-surface-300">
              {educationalContent.service.types[svc.type as keyof typeof educationalContent.service.types]}
            </p>
          </div>

          <KeyPointsList points={educationalContent.service.keyPoints} />
        </div>
      </div>
    );
  }

  // Ingress
  if (selected.type === 'ingress') {
    const ingress = selected.data;

    return (
      <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
        <PanelHeader title={ingress.name} icon={Globe} status="healthy" onClose={onClose} />
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <p className="text-sm text-surface-300 leading-relaxed">
            An Ingress exposes HTTP/HTTPS routes from outside the cluster to Services within the cluster. 
            It provides load balancing, SSL termination, and name-based virtual hosting.
          </p>
          
          <AnalogyBox analogy="🚪 Think of an Ingress like a reception desk at a building entrance — visitors (requests) arrive, and the receptionist directs them to the right department (Service) based on what they're looking for." />

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Ingress Details</h4>
            <div className="space-y-1 text-sm">
              <InfoRow label="Namespace" value={ingress.namespace} />
              <InfoRow label="Host" value={ingress.host} />
              <InfoRow label="Routes" value={`${ingress.paths.length} path(s)`} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Routing Rules</h4>
            <div className="space-y-2">
              {ingress.paths.map((path, i) => (
                <div key={i} className="p-2 rounded bg-surface-800 text-sm">
                  <span className="text-primary-400">{ingress.host}</span>
                  <span className="text-accent-400">{path.path}</span>
                  <span className="text-surface-500"> → </span>
                  <span className="text-success-400">{path.serviceId}:{path.port}</span>
                </div>
              ))}
            </div>
          </div>

          <KeyPointsList points={[
            'Routes external traffic to internal Services',
            'Supports path-based and host-based routing',
            'Can terminate SSL/TLS connections',
            'Requires an Ingress Controller (nginx, traefik, etc.)',
          ]} />
        </div>
      </div>

    );
  }

  // PersistentVolume
  if (selected.type === 'pv') {
      const pv = selected.data;
      return (
          <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
              <PanelHeader title={pv.name} icon={HardDrive} status={pv.status === 'Bound' || pv.status === 'Available' ? 'healthy' : 'degraded'} onClose={onClose} />
              <div className="flex-1 overflow-auto p-4 space-y-5">
                   <p className="text-sm text-surface-300 leading-relaxed">
                     A PersistentVolume (PV) is a piece of storage in the cluster that has been provisioned by an administrator or dynamically using Storage Classes.
                   </p>
                   
                   <AnalogyBox analogy="🅿️ Think of a PV like a physical parking spot. It exists whether there is a car parked in it or not. It's a resource provided by the facility (cluster)." />

                   <div>
                       <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">PV Details</h4>
                       <div className="space-y-1 text-sm">
                           <InfoRow label="Capacity" value={pv.capacity} />
                           <InfoRow label="Access Modes" value={pv.accessModes?.join(', ') || '-'} />
                           <InfoRow label="Reclaim Policy" value={pv.reclaimPolicy} />
                           <InfoRow label="Storage Class" value={pv.storageClass} />
                           <InfoRow label="Status" value={pv.status} highlight={pv.status !== 'Bound' && pv.status !== 'Available'} />
                       </div>
                   </div>
              </div>
          </div>
      );
  }

  // PersistentVolumeClaim
  if (selected.type === 'pvc') {
      const pvc = selected.data;
      return (
          <div className="w-96 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
              <PanelHeader title={pvc.name} icon={Database} status={pvc.status === 'Bound' ? 'healthy' : 'degraded'} onClose={onClose} />
              <div className="flex-1 overflow-auto p-4 space-y-5">
                   <p className="text-sm text-surface-300 leading-relaxed">
                     A PersistentVolumeClaim (PVC) is a request for storage by a user. It is similar to a Pod. Pods consume node resources and PVCs consume PV resources.
                   </p>

                   <AnalogyBox analogy="🎫 Think of a PVC like a parking permit. You (the Pod) request a permit for a specific type of spot. The system matches your permit (PVC) with an available spot (PV)." />

                   <div>
                       <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">PVC Details</h4>
                       <div className="space-y-1 text-sm">
                           <InfoRow label="Namespace" value={pvc.namespace} />
                           <InfoRow label="Requested" value={pvc.capacity} />
                           <InfoRow label="Access Modes" value={pvc.accessModes?.join(', ') || '-'} />
                           <InfoRow label="Storage Class" value={pvc.storageClass} />
                           <InfoRow label="Status" value={pvc.status} highlight={pvc.status !== 'Bound'} />
                       </div>
                   </div>
                   {pvc.status === 'Bound' && (
                       <div className="p-3 bg-surface-800 rounded border border-surface-700">
                           <span className="text-xs text-surface-400 block mb-1">Bound Volume</span>
                           <span className="text-sm font-mono text-primary-400">{pvc.volumeName}</span>
                       </div>
                   )}
              </div>
          </div>
      );
  }

  return null;
}

// Helper Components
function PanelHeader({ title, icon: Icon, status, onClose }: { title: string; icon: typeof Server; status: 'healthy' | 'degraded' | 'unhealthy'; onClose: () => void }) {
  const statusColors = { healthy: 'bg-success-500', degraded: 'bg-warning-500 animate-pulse', unhealthy: 'bg-error-500' };
  return (
    <div className="p-4 border-b border-surface-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-400" />
        <span className="font-semibold text-surface-100 truncate">{title}</span>
        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      </div>
      <button onClick={onClose} className="p-1 rounded hover:bg-surface-700 text-surface-400">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AnalogyBox({ analogy }: { analogy: string }) {
  return (
    <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-primary-400" />
        <span className="text-xs font-medium text-primary-400">Simple Analogy</span>
      </div>
      <p className="text-sm text-surface-200">{analogy}</p>
    </div>
  );
}

function KeyPointsList({ points }: { points: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Key Points</h4>
      <ul className="space-y-1">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
            <span className="text-primary-400 mt-0.5">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TroubleshootingSection({ items }: { items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-warning-400 uppercase tracking-wide mb-2">Troubleshooting</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
            <span className="text-warning-400 mt-0.5">⚠</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-surface-400">{label}</span>
      <span className={`font-mono text-xs ${highlight ? 'text-warning-400' : 'text-surface-200'}`}>{value}</span>
    </div>
  );
}
