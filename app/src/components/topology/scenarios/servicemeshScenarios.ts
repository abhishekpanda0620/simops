import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

/**
 * Istio Canary Deployment Scenario
 * 
 * Flow:
 * 1. Apply VirtualService with 90/10 weight split
 * 2. Envoy sidecars receive configuration
 * 3. Traffic is distributed: 90% to v1, 10% to v2
 * 4. Monitor canary metrics
 */
export function runIstioCanaryScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const vsId = `vs-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Apply VirtualService
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying VirtualService for canary deployment...' }));
  }, 1000));

  // 2. API Server Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating VirtualService spec...' }));
  }, 3000));

  // 3. Istiod (Pilot) receives config
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Istiod: Processing routing rules...' }));
    if (actions?.addVirtualService) {
      actions.addVirtualService({
        id: vsId,
        name: 'reviews-canary',
        namespace: 'default',
        hosts: ['reviews'],
        http: [{
          route: [
            { destination: { host: 'reviews', subset: 'v1' }, weight: 90 },
            { destination: { host: 'reviews', subset: 'v2' }, weight: 10 }
          ]
        }]
      });
    }
  }, 5500));

  // 4. Push to Envoy Sidecars
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Istiod: Pushing xDS configuration to Envoy sidecars...' }));
  }, 8000));

  // 5. Sidecars Updated
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Envoy: Route tables updated (ACK received from 6 sidecars)' }));
  }, 10500));

  // 6. Traffic Distribution
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Traffic Flow: 90% → reviews-v1, 10% → reviews-v2' }));
  }, 13000));

  // 7. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Canary Active ✓ Traffic split 90/10' }));
  }, 15500));

  timeouts.push(setTimeout(stop, 17500));

  return timeouts;
}

/**
 * Istio A/B Testing Scenario
 * 
 * Flow:
 * 1. Apply VirtualService with header-based routing
 * 2. Users with x-user-type: beta header get v2
 * 3. All other users get v1
 */
export function runIstioABTestingScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const vsId = `vs-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Apply VirtualService
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying VirtualService for A/B testing...' }));
  }, 1000));

  // 2. API Server Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating header match rules...' }));
  }, 3000));

  // 3. Istiod Processing
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Istiod: Configuring header-based routing...' }));
    if (actions?.addVirtualService) {
      actions.addVirtualService({
        id: vsId,
        name: 'frontend-ab',
        namespace: 'default',
        hosts: ['frontend'],
        http: [
          {
            match: [{ headers: { 'x-user-type': { exact: 'beta' } } }],
            route: [{ destination: { host: 'frontend', subset: 'v2' } }]
          },
          {
            route: [{ destination: { host: 'frontend', subset: 'v1' } }]
          }
        ]
      });
    }
  }, 5500));

  // 4. Push to Envoy
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Istiod: Pushing header match configuration...' }));
  }, 8000));

  // 5. Test Request A (Regular User)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Request: GET /home [no header] → Routed to frontend-v1' }));
  }, 10500));

  // 6. Test Request B (Beta User)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Request: GET /home [x-user-type: beta] → Routed to frontend-v2' }));
  }, 13000));

  // 7. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'A/B Test Active ✓ Header-based routing enabled' }));
  }, 15500));

  timeouts.push(setTimeout(stop, 17500));

  return timeouts;
}

/**
 * Istio Fault Injection Scenario
 * 
 * Flow:
 * 1. Apply VirtualService with fault injection
 * 2. Configure 5s delay for 50% of requests
 * 3. Configure abort (500) for 10% of requests
 * 4. Test resilience of upstream services
 */
export function runIstioFaultInjectionScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const vsId = `vs-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Apply Fault Injection
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying fault injection rules...' }));
  }, 1000));

  // 2. API Server
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating fault injection config...' }));
  }, 3000));

  // 3. Istiod Configuration
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Istiod: Configuring delay + abort faults...' }));
    if (actions?.addVirtualService) {
      actions.addVirtualService({
        id: vsId,
        name: 'ratings-fault',
        namespace: 'default',
        hosts: ['ratings'],
        http: [{
          fault: {
            delay: { percentage: 50, fixedDelay: '5s' },
            abort: { percentage: 10, httpStatus: 500 }
          },
          route: [{ destination: { host: 'ratings', subset: 'v1' } }]
        }]
      });
    }
  }, 5500));

  // 4. Push to Sidecars
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Envoy: Fault injection filters activated' }));
  }, 8000));

  // 5. Simulate Delay
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: '⏳ Request 1: Injecting 5s delay...' }));
  }, 10000));

  // 6. Simulate Abort
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: '❌ Request 2: Injecting HTTP 500 abort' }));
  }, 13000));

  // 7. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Fault Injection Active ✓ 50% delay, 10% abort' }));
  }, 15500));

  timeouts.push(setTimeout(stop, 17500));

  return timeouts;
}

/**
 * Istio mTLS Scenario
 * 
 * Flow:
 * 1. Apply PeerAuthentication (STRICT mode)
 * 2. Citadel issues certificates
 * 3. Sidecars perform mTLS handshake
 * 4. All traffic encrypted
 */
export function runIstioMTLSScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const paId = `pa-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Apply PeerAuthentication
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying PeerAuthentication (STRICT)...' }));
  }, 1000));

  // 2. API Server
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating authentication policy...' }));
  }, 3000));

  // 3. Istiod/Citadel
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Citadel: Issuing SPIFFE certificates to workloads...' }));
    if (actions?.setPeerAuthentication) {
      actions.setPeerAuthentication({
        id: paId,
        name: 'default',
        namespace: 'default',
        mtls: { mode: 'STRICT' }
      });
    }
  }, 5500));

  // 4. Certificate Distribution
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Pilot: Distributing certificates to Envoy proxies...' }));
  }, 8000));

  // 5. TLS Handshake
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: '🔐 Envoy: mTLS handshake initiated...' }));
  }, 10500));

  // 6. Certificate Validation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Envoy: Certificate verified (SPIFFE ID: spiffe://cluster.local/ns/default/sa/frontend)' }));
  }, 13000));

  // 7. Encrypted Channel
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: '🔒 TLS 1.3 connection established (ECDHE-RSA-AES256-GCM-SHA384)' }));
  }, 15500));

  // 8. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'mTLS Enabled ✓ All traffic encrypted' }));
  }, 18000));

  timeouts.push(setTimeout(stop, 20000));

  return timeouts;
}

/**
 * Istio Circuit Breaker Scenario
 * 
 * Flow:
 * 1. Apply DestinationRule with outlier detection
 * 2. Monitor service health
 * 3. Detect consecutive failures
 * 4. Eject unhealthy endpoint
 * 5. Half-open: test recovery
 * 6. Circuit closed again
 */
export function runIstioCircuitBreakerScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const drId = `dr-${Math.random().toString(36).substr(2, 5)}`;
  const cbId = `cb-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Apply DestinationRule
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying DestinationRule with circuit breaker...' }));
  }, 1000));

  // 2. API Server
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'API Server: Validating outlier detection config...' }));
  }, 3000));

  // 3. Istiod Configuration
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Istiod: Configuring outlier detection policy...' }));
    if (actions?.addDestinationRule) {
      actions.addDestinationRule({
        id: drId,
        name: 'reviews-circuit-breaker',
        namespace: 'default',
        host: 'reviews',
        trafficPolicy: {
          connectionPool: { tcp: { maxConnections: 100 } },
          outlierDetection: {
            consecutive5xxErrors: 5,
            interval: '10s',
            baseEjectionTime: '30s',
            maxEjectionPercent: 50
          }
        }
      });
    }
  }, 5500));

  // 4. Circuit Closed (normal)
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: '🟢 Circuit: CLOSED - All endpoints healthy' }));
    if (actions?.updateCircuitBreaker) {
      actions.updateCircuitBreaker({
        id: cbId,
        serviceName: 'reviews',
        state: 'closed',
        failureCount: 0,
        successCount: 100,
        threshold: 5,
        lastStateChange: new Date().toISOString()
      });
    }
  }, 8000));

  // 5. Failures Detected
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: '⚠️ Envoy: Detected 5 consecutive 5xx errors from reviews-v2-xyz' }));
  }, 10500));

  // 6. Circuit Open
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: '🔴 Circuit: OPEN - Endpoint reviews-v2-xyz ejected for 30s' }));
    if (actions?.updateCircuitBreaker) {
      actions.updateCircuitBreaker({
        id: cbId,
        serviceName: 'reviews',
        state: 'open',
        failureCount: 5,
        successCount: 0,
        threshold: 5,
        lastStateChange: new Date().toISOString(),
        nextAttempt: new Date(Date.now() + 30000).toISOString()
      });
    }
  }, 13000));

  // 7. Half-Open
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: '🟡 Circuit: HALF-OPEN - Testing endpoint recovery...' }));
    if (actions?.updateCircuitBreaker) {
      actions.updateCircuitBreaker({
        id: cbId,
        serviceName: 'reviews',
        state: 'half-open',
        failureCount: 5,
        successCount: 1,
        threshold: 5,
        lastStateChange: new Date().toISOString()
      });
    }
  }, 16000));

  // 8. Recovery Success
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: '✓ Probe request succeeded - Endpoint recovered' }));
  }, 18500));

  // 9. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Circuit Breaker ✓ Endpoint recovered and re-added to pool' }));
    if (actions?.updateCircuitBreaker) {
      actions.updateCircuitBreaker({
        id: cbId,
        serviceName: 'reviews',
        state: 'closed',
        failureCount: 0,
        successCount: 5,
        threshold: 5,
        lastStateChange: new Date().toISOString()
      });
    }
  }, 21000));

  timeouts.push(setTimeout(stop, 23000));

  return timeouts;
}
