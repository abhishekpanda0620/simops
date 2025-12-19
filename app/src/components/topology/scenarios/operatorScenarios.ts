import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

/**
 * ArgoCD Sync Scenario - Demonstrates CRD/Operator Pattern
 * 
 * Flow:
 * 1. User applies Application CR
 * 2. API Server validates against CRD schema
 * 3. etcd stores Application resource
 * 4. ArgoCD Controller detects new Application (watch)
 * 5. Controller fetches manifests from Git
 * 6. Controller creates child resources (Deployment, Service)
 * 7. Scheduler assigns pods
 * 8. Kubelet starts containers
 * 9. Application status: Synced ✅ Healthy ✅
 */
export function runArgoCDScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const appId = `app-${Math.random().toString(36).substr(2, 5)}`;
  const podId = `guestbook-ui-${Math.random().toString(36).substr(2, 5)}`;

  // 1. kubectl apply (User creates Application CR)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying Application CR (guestbook)...' }));
  }, 1000));

  // 2. API Server - CRD Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating against Application CRD schema...' }));
  }, 3000));

  // 3. etcd - Store Application Resource
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Application "guestbook" resource...' }));
    if (actions && actions.addArgoApplication) {
      actions.addArgoApplication({
        id: appId,
        name: 'guestbook',
        namespace: 'argocd',
        project: 'default',
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD'
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default'
        },
        syncStatus: 'OutOfSync',
        healthStatus: 'Missing'
      });
    }
  }, 5000));

  // 4. ArgoCD Controller - Watch Triggered
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ArgoCD Controller: 🔔 Watch triggered! New Application detected.' }));
  }, 7500));

  // 5. Controller - Fetch Git Manifests
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ArgoCD Controller: Fetching manifests from Git repo...' }));
  }, 9500));

  // 6. Controller - Compare & Create Resources
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ArgoCD Controller: Diff detected. Creating Deployment "guestbook-ui"...' }));
  }, 12000));

  // 7. Controller - Create Service
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ArgoCD Controller: Creating Service "guestbook-svc"...' }));
  }, 14000));

  // 8. Scheduler - Assign Pod
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Scheduler: Assigning guestbook-ui pod to worker-1...' }));
  }, 16000));

  // 9. Kubelet - Start Container
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Kubelet: Pulling image & starting container...' }));
    if (actions && actions.addPod) {
      actions.addPod({
        id: podId,
        name: 'guestbook-ui',
        namespace: 'default',
        nodeId: 'node-worker-1',
        nodeName: 'worker-1',
        phase: 'Running',
        status: 'running',
        createdAt: new Date().toISOString(),
        restarts: 0,
        conditions: [],
        containers: [{ 
          name: 'guestbook', 
          image: 'gcr.io/google-samples/gb-frontend:v5', 
          state: 'running', 
          ready: true, 
          restarts: 0 
        }],
        events: [],
        labels: { app: 'guestbook', tier: 'frontend' },
        serviceIds: []
      });
    }
  }, 18500));

  // 10. Update Application Status
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ArgoCD Controller: Updating Application status...' }));
    if (actions && actions.updateArgoApplication) {
      actions.updateArgoApplication(appId, {
        syncStatus: 'Synced',
        healthStatus: 'Healthy'
      });
    }
  }, 21000));

  // 11. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Application "guestbook": Synced ✅ Healthy ✅' }));
  }, 23500));

  timeouts.push(setTimeout(stop, 25500));

  return timeouts;
}

/**
 * Cert-Manager Scenario - Demonstrates TLS Certificate Issuance
 * 
 * Flow:
 * 1. User applies Certificate CR
 * 2. API Server validates against CRD schema
 * 3. etcd stores Certificate resource
 * 4. cert-manager controller watches & creates CertificateRequest
 * 5. ACME Issuer: HTTP-01 challenge begins
 * 6. Challenge pod created, awaiting validation
 * 7. Challenge complete, certificate fetched
 * 8. TLS Secret created with certificate data
 * 9. Ingress consumes the certificate
 */
export function runCertManagerScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // 1. kubectl apply (User creates Certificate CR)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying Certificate CR (myapp-tls)...' }));
  }, 1000));

  // 2. API Server - CRD Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating against Certificate CRD schema...' }));
  }, 3000));

  // 3. etcd - Store Certificate Resource
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: 'etcd: Storing Certificate "myapp-tls" resource...' }));
  }, 5000));

  // 4. cert-manager Controller - Watch Triggered
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'cert-manager: 🔔 Watch triggered! Creating CertificateRequest...' }));
  }, 7500));

  // 5. ACME Issuer - HTTP-01 Challenge
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'ACME Issuer: Starting HTTP-01 challenge for myapp.example.com...' }));
  }, 10000));

  // 6. Challenge Pod Created
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'cert-manager: Challenge solver pod created, awaiting ACME validation...' }));
  }, 12500));

  // 7. Challenge Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'cert-manager: ✓ HTTP-01 challenge passed! Fetching certificate...' }));
  }, 15500));

  // 8. TLS Secret Created
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'cert-manager: Creating TLS Secret "myapp-tls-secret" with cert data...' }));
  }, 18000));

  // 9. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Certificate "myapp-tls": Ready ✓ Secret created ✓' }));
  }, 21000));

  timeouts.push(setTimeout(stop, 23000));

  return timeouts;
}
