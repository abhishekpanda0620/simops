import type { K8sPod, K8sService, K8sIngress } from '@/types';

// Educational content for each Kubernetes resource type
export const educationalContent = {
  pod: {
    title: 'What is a Pod?',
    description: `A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.`,
    keyPoints: [
      'Contains one or more containers that share storage and network',
      'Has a unique IP address within the cluster',
      'Is ephemeral - can be created and destroyed at any time',
      'Managed by higher-level controllers like Deployments',
    ],
    analogy: '🏠 Think of a Pod like an apartment - it can have multiple rooms (containers) that share utilities (network, storage).',
    learnMore: 'https://kubernetes.io/docs/concepts/workloads/pods/',
  },
  
  service: {
    title: 'What is a Service?',
    description: `A Service provides a stable network endpoint to access a group of Pods. It acts as a load balancer and service discovery mechanism.`,
    keyPoints: [
      'Provides a stable IP address even when Pods change',
      'Load balances traffic across multiple Pods',
      'Uses label selectors to find target Pods',
      'Types: ClusterIP, NodePort, LoadBalancer, ExternalName',
    ],
    analogy: '📞 Think of a Service like a phone number for a business - customers call one number, and calls are routed to available employees (Pods).',
    learnMore: 'https://kubernetes.io/docs/concepts/services-networking/service/',
  },
  
  ingress: {
    title: 'What is an Ingress?',
    description: `An Ingress exposes HTTP/HTTPS routes from outside the cluster to Services within the cluster. It provides load balancing, SSL termination, and name-based virtual hosting.`,
    keyPoints: [
      'Routes external traffic to internal Services',
      'Supports path-based and host-based routing',
      'Can terminate SSL/TLS connections',
      'Requires an Ingress Controller to function',
    ],
    analogy: '🚪 Think of an Ingress like a reception desk - visitors (requests) arrive, and the receptionist directs them to the right department (Service).',
    learnMore: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
  },
  
  node: {
    title: 'What is a Node?',
    description: `A Node is a worker machine in Kubernetes. It can be a physical or virtual machine that runs Pods.`,
    keyPoints: [
      'Runs the kubelet agent that manages Pods',
      'Contains container runtime (Docker, containerd)',
      'Has CPU, memory, and storage resources',
      'Can be control-plane or worker nodes',
    ],
    analogy: '🖥️ Think of a Node like a computer in a data center - it provides the actual computing power to run your applications.',
    learnMore: 'https://kubernetes.io/docs/concepts/architecture/nodes/',
  },
};

export type ResourceType = keyof typeof educationalContent;

// Generate detailed info for a specific resource
export function getPodDetails(pod: K8sPod) {
  return {
    ...educationalContent.pod,
    specific: {
      name: pod.name,
      namespace: pod.namespace,
      status: pod.status,
      restarts: pod.restarts,
      containers: pod.containers.map(c => ({
        name: c.name,
        image: c.image,
        state: c.state,
        ready: c.ready,
      })),
      labels: pod.labels,
    },
    statusExplanation: getStatusExplanation('pod', pod.status),
  };
}

export function getServiceDetails(service: K8sService) {
  return {
    ...educationalContent.service,
    specific: {
      name: service.name,
      namespace: service.namespace,
      type: service.type,
      clusterIP: service.clusterIP,
      ports: service.ports,
      selector: service.selector,
      targetPods: service.podIds.length,
    },
    typeExplanation: getServiceTypeExplanation(service.type),
  };
}

export function getIngressDetails(ingress: K8sIngress) {
  return {
    ...educationalContent.ingress,
    specific: {
      name: ingress.name,
      namespace: ingress.namespace,
      host: ingress.host,
      paths: ingress.paths,
    },
  };
}

function getStatusExplanation(resourceType: string, status: string): string {
  const explanations: Record<string, Record<string, string>> = {
    pod: {
      running: '✅ The Pod is healthy and all containers are running.',
      pending: '⏳ The Pod is waiting to be scheduled or containers are starting.',
      failed: '❌ The Pod has terminated with an error. Check logs for details.',
      succeeded: '✓ The Pod has completed successfully (usually for Jobs).',
      unknown: '❓ The Pod state cannot be determined.',
    },
  };
  
  return explanations[resourceType]?.[status] || 'Status information unavailable.';
}

function getServiceTypeExplanation(type: string): string {
  const explanations: Record<string, string> = {
    ClusterIP: '🔒 ClusterIP: Only accessible within the cluster. Default type.',
    NodePort: '🌐 NodePort: Accessible on each Node\'s IP at a static port.',
    LoadBalancer: '⚖️ LoadBalancer: Exposes service via cloud provider\'s load balancer.',
    ExternalName: '🔗 ExternalName: Maps service to an external DNS name.',
  };
  
  return explanations[type] || 'Service type information unavailable.';
}
