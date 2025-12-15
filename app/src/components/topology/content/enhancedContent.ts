export const educationalContent = {
    controlPlane: {
      'api-server': {
        title: 'API Server (kube-apiserver)',
        description: 'The front-end for the Kubernetes control plane. All cluster operations go through the API server.',
        analogy: '📞 Receptionist: The central point of contact. No one talks to anyone else without going through the receptionist first.',
        keyPoints: [
          'Validates and configures data for API objects (Pods, Services, etc.)',
          'Authenticates and authorizes requests',
          'Only component that talks directly to etcd',
        ],
        troubleshooting: [
          'Monitor disk I/O latency',
          'Check cluster member health',
          'Ensure regular backups exist',
        ],
      },
      'etcd': {
        title: 'etcd (Cluster Store)',
        description: 'Consistent and highly-available key value store used as Kubernetes\' backing store for all cluster data.',
        analogy: '🧠 Memory/Database: The brain that remembers everything about the cluster state.',
        keyPoints: [
          'Stores the entire state of the cluster',
          'Uses Raft consensus to ensure data consistency',
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
        analogy: '⚙️ Automation Manager: Constantly checks "Are we there yet?" and fixes things if they drift.',
        keyPoints: [
          'Includes Node Controller, Job Controller, Service Account Controller, etc.',
          'Watches for changes via API Server',
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
        analogy: '📅 Logistics Officer: Decides where to put the cargo (containers) based on available space and destination.',
        keyPoints: [
          'Filters nodes based on constraints (e.g., CPU/Memory)',
          'Scores valid nodes to find the best fit',
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
          cause: 'Application error, missing configuration, or resource limits.',
          fix: [
            'Check Pod logs: kubectl logs <pod-name>',
            'Verify environment variables and config maps',
            'Check command and arguments in PodSpec',
            'Ensure liveness probes are not failing',
          ],
        },
        'OOMKilled': {
          title: 'OOMKilled (Out of Memory)',
          description: 'The container tried to use more memory than its limit allowed.',
          cause: 'Memory leak or limit set too low.',
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
            'Check image pull secrets (kubectl get secrets)',
            'Ensure node has internet access to registry',
            'Check for rate limiting from registry',
          ],
        },
        'Pending': {
          title: 'Pending State',
          description: 'Pod is accepted by the cluster but not yet running.',
          cause: 'No node with enough resources, or node selector constraints not met.',
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
      analogy: '🏗️ Construction Site: Where the actual work happens. Needs resources (bricks/cement) and workers (kubelet).',
      conditions: {
        'Ready': 'Node is healthy and ready to accept pods',
        'MemoryPressure': 'Node is running low on memory',
        'DiskPressure': 'Node is running low on disk space - image pulls may fail',
        'PIDPressure': 'Too many processes running on the node',
        'NetworkUnavailable': 'Network not configured correctly',
      },
    },
    service: {
      title: 'Kubernetes Service',
      description: 'A Service provides a stable network endpoint (IP and DNS name) to access a group of Pods. It acts as a load balancer and service discovery mechanism.',
      analogy: '📞 Switchboard: Routes incoming calls to the right department extension.',
      types: {
        'ClusterIP': 'Only accessible within the cluster. Great for internal communication.',
        'NodePort': 'Accessible on each Node\'s IP at a static port (30000-32767).',
        'LoadBalancer': 'Exposes via cloud provider\'s load balancer.',
        'ExternalName': 'Maps to an external DNS name.',
      },
    },
  };
