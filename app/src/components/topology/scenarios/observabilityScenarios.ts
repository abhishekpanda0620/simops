import type { ControlPlaneState } from '../ControlPlaneUtils';
import type { SimulationActions } from '../ControlPlaneUtils';

/**
 * Prometheus Metrics Scraping Scenario
 * 
 * Flow:
 * 1. Prometheus discovers targets via ServiceMonitor/PodMonitor
 * 2. Scrapes metrics from /metrics endpoint
 * 3. Stores time series in TSDB
 * 4. PromQL queries can now access the data
 */
export function runPrometheusScrapingScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const targetId = `target-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Service Discovery
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Prometheus: Discovering targets via ServiceMonitor...' }));
  }, 1000));

  // 2. Target Registration
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Prometheus: Found 3 scrape targets in namespace "default"' }));
    if (actions?.addPrometheusTarget) {
      actions.addPrometheusTarget({
        id: targetId,
        endpoint: 'http://app-service:8080/metrics',
        job: 'kubernetes-pods',
        labels: { app: 'web-frontend', namespace: 'default' },
        status: 'up',
        lastScrape: new Date().toISOString(),
        scrapeInterval: '15s'
      });
    }
  }, 3500));

  // 3. Scraping Metrics
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Prometheus: Scraping /metrics from targets...' }));
  }, 6000));

  // 4. Metrics Received
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Prometheus: Received 847 metrics samples' }));
  }, 8500));

  // 5. Store in TSDB
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: 'Prometheus TSDB: Writing to head block...' }));
  }, 10500));

  // 6. Query Ready
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'PromQL: Metrics available for querying' }));
  }, 13000));

  // 7. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Scrape Complete ✓ 3/3 targets UP' }));
  }, 15500));

  timeouts.push(setTimeout(stop, 17500));

  return timeouts;
}

/**
 * Prometheus Alert Firing Scenario
 * 
 * Flow:
 * 1. Prometheus evaluates alert rules
 * 2. Rule condition matches (CPU > 80%)
 * 3. Alert enters PENDING state (for duration)
 * 4. Alert enters FIRING state
 * 5. Alertmanager receives alert
 * 6. Alertmanager routes to Slack/PagerDuty
 */
export function runPrometheusAlertScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const alertId = `alert-${Math.random().toString(36).substr(2, 5)}`;

  // 1. Rule Evaluation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Prometheus: Evaluating alert rules...' }));
  }, 1000));

  // 2. Condition Match
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Rule "HighCPUUsage": cpu_usage_percent{pod="web-0"} = 92% > 80%' }));
  }, 3500));

  // 3. Alert Pending
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Alert: HighCPUUsage → PENDING (waiting 1m for duration)' }));
    if (actions?.firePrometheusAlert) {
      actions.firePrometheusAlert({
        id: alertId,
        name: 'HighCPUUsage',
        state: 'pending',
        severity: 'warning',
        message: 'CPU usage is above 80% for pod web-0',
        labels: { pod: 'web-0', namespace: 'default', severity: 'warning' },
        startsAt: new Date().toISOString()
      });
    }
  }, 6000));

  // 4. Alert Firing
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: '🔥 Alert: HighCPUUsage → FIRING' }));
    if (actions?.firePrometheusAlert) {
      actions.firePrometheusAlert({
        id: alertId,
        name: 'HighCPUUsage',
        state: 'firing',
        severity: 'warning',
        message: 'CPU usage is above 80% for pod web-0',
        labels: { pod: 'web-0', namespace: 'default', severity: 'warning' },
        startsAt: new Date().toISOString()
      });
    }
  }, 9000));

  // 5. Alertmanager Receives
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: 'Alertmanager: Received alert, applying routing rules...' }));
  }, 11500));

  // 6. Notification Sent
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-assign', message: 'Alertmanager: Sending notification to #alerts-warning Slack channel' }));
  }, 14000));

  // 7. Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: 'Alert Dispatched ✓ Notification sent to Slack' }));
  }, 16500));

  timeouts.push(setTimeout(stop, 18500));

  return timeouts;
}

/**
 * Jaeger Distributed Trace Scenario (Healthy)
 * 
 * Flow:
 * 1. Request enters via API Gateway
 * 2. Trace context propagated to UserService
 * 3. UserService calls OrderService
 * 4. OrderService queries Database
 * 5. Response flows back with trace complete
 */
export function runJaegerTraceScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const traceId = `trace-${Math.random().toString(36).substr(2, 8)}`;

  // 1. Request Entry
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'Ingress: Incoming request GET /api/orders' }));
  }, 1000));

  // 2. Trace Created
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: `API Gateway: Creating trace ${traceId.substring(0, 8)}...` }));
  }, 3000));

  // 3. Span 1: API Gateway
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Span: api-gateway.handleRequest [12ms]' }));
  }, 5000));

  // 4. Span 2: User Service
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Span: user-service.validateToken [8ms]' }));
  }, 7000));

  // 5. Span 3: Order Service
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: 'Span: order-service.getOrders [45ms]' }));
  }, 9500));

  // 6. Span 4: Database
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'etcd', message: 'Span: postgres.query [32ms]' }));
  }, 12000));

  // 7. Trace Complete
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: `Trace Complete ✓ 4 spans, total: 97ms` }));
    if (actions?.addJaegerTrace) {
      actions.addJaegerTrace({
        id: traceId,
        traceId,
        rootSpan: 'api-gateway.handleRequest',
        serviceName: 'api-gateway',
        operationName: 'GET /api/orders',
        duration: 97,
        spanCount: 4,
        status: 'ok',
        startTime: Date.now(),
        spans: [
          { id: 's1', traceId, operationName: 'handleRequest', serviceName: 'api-gateway', duration: 12, startTime: 0, status: 'ok' },
          { id: 's2', traceId, parentId: 's1', operationName: 'validateToken', serviceName: 'user-service', duration: 8, startTime: 12, status: 'ok' },
          { id: 's3', traceId, parentId: 's1', operationName: 'getOrders', serviceName: 'order-service', duration: 45, startTime: 20, status: 'ok' },
          { id: 's4', traceId, parentId: 's3', operationName: 'query', serviceName: 'postgres', duration: 32, startTime: 33, status: 'ok' },
        ]
      });
    }
  }, 14500));

  timeouts.push(setTimeout(stop, 16500));

  return timeouts;
}

/**
 * Jaeger Distributed Trace Scenario (Error)
 * 
 * Flow:
 * 1. Request enters via API Gateway
 * 2. Trace context propagated
 * 3. PaymentService times out
 * 4. Error propagates up the call chain
 * 5. Trace marked as error
 */
export function runJaegerErrorTraceScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const traceId = `trace-${Math.random().toString(36).substr(2, 8)}`;

  // 1. Request Entry
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'Ingress: Incoming request POST /api/checkout' }));
  }, 1000));

  // 2. Trace Created
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'api-server', message: `API Gateway: Creating trace ${traceId.substring(0, 8)}...` }));
  }, 3000));

  // 3. Span 1: Checkout Service
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: 'Span: checkout-service.processOrder [15ms]' }));
  }, 5000));

  // 4. Span 2: Inventory Check
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'scheduler', message: 'Span: inventory-service.checkStock [22ms] ✓' }));
  }, 7500));

  // 5. Span 3: Payment - TIMEOUT!
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: '⏳ Span: payment-service.process [3000ms] ... waiting' }));
  }, 10000));

  // 6. Error
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'node-flow', message: '❌ Span: payment-service.process [TIMEOUT] Error: Connection refused' }));
  }, 13000));

  // 7. Error Propagation
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'controller', message: '❌ Span: checkout-service → Error propagated: PaymentFailed' }));
  }, 15500));

  // 8. Trace Complete with Error
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'complete', message: `Trace Error ❌ 3 spans, payment-service timeout` }));
    if (actions?.addJaegerTrace) {
      actions.addJaegerTrace({
        id: traceId,
        traceId,
        rootSpan: 'checkout-service.processOrder',
        serviceName: 'checkout-service',
        operationName: 'POST /api/checkout',
        duration: 3037,
        spanCount: 3,
        status: 'error',
        startTime: Date.now(),
        spans: [
          { id: 's1', traceId, operationName: 'processOrder', serviceName: 'checkout-service', duration: 3037, startTime: 0, status: 'error', logs: [{ timestamp: 3015, message: 'PaymentFailed: downstream timeout', level: 'error' }] },
          { id: 's2', traceId, parentId: 's1', operationName: 'checkStock', serviceName: 'inventory-service', duration: 22, startTime: 15, status: 'ok' },
          { id: 's3', traceId, parentId: 's1', operationName: 'process', serviceName: 'payment-service', duration: 3000, startTime: 37, status: 'error', logs: [{ timestamp: 3000, message: 'Connection refused to payment gateway', level: 'error' }] },
        ]
      });
    }
  }, 18000));

  timeouts.push(setTimeout(stop, 20000));

  return timeouts;
}
