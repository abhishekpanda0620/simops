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

  export const generalContent = {
    controlPlaneIntro: {
        title: 'Control Plane (The Brain)',
        description: 'The Control Plane manages the worker nodes and the Pods in the cluster. It makes global decisions about the cluster (like scheduling), as well as detecting and responding to cluster events.',
        analogy: '🧠 The Brain: It doesn\'t do the heavy lifting (lifting boxes), but it tells the muscles (Worker Nodes) what to do.',
        keyPoints: [
            'Maintains the desired state of the cluster',
            'Completely separate from where your apps run',
            'Can run across multiple machines for high availability'
        ]
    },
    workerNodesIntro: {
        title: 'Worker Nodes (The Muscle)',
        description: 'Worker nodes are the machines (VMs or physical servers) that actually run your applications. Each node is managed by the control plane.',
        analogy: '💪 The Muscle: These do the actual heavy lifting. If you add more apps, you might need more muscle.',
        keyPoints: [
            'Runs the Kubelet agent to talk to the Control Plane',
            'Contains the Container Runtime (like Docker/containerd)',
            'Maintains network rules via kube-proxy'
        ]
    }
  };

  export const nodeComponentContent = {
    kubelet: {
        title: 'Kubelet',
        description: 'An agent that runs on each node in the cluster. It ensures that containers are running in a Pod according to the PodSpec.',
        analogy: '👷 Site Foreman: Reads the blueprints (PodSpec) sent from HQ (Control Plane) and ensures the workers (Container Runtime) build it exactly right.',
        keyPoints: [
            'Registers the node with the API Server',
            'Reports node status and health',
            'Manages Pod lifecycle on the node'
        ],
        troubleshooting: [
            'If Pods are stuck in "Pending" on a node, check Kubelet logs',
            'Kubelet needs valid certificates to talk to API Server',
            'High CPU usage by Kubelet can indicate node stress'
        ]
    },
    'kube-proxy': {
        title: 'kube-proxy',
        description: 'A network proxy that runs on each node. It maintains network rules on nodes which allow network communication to your Pods from inside or outside of the cluster.',
        analogy: '🚦 Traffic Controller: Updates the road signs (iptables/IPVS) so traffic knows how to reach the new Service IPs.',
        keyPoints: [
            'Implements the Kubernetes Service concept',
            'Load balances traffic across Pods',
            'Updates iptables or IPVS rules'
        ],
        troubleshooting: [
            'If Services are unreachable, check kube-proxy logs',
            'Often uses iptables - check for rule limits',
            'Essential for Service Discovery'
        ]
    }
  };
