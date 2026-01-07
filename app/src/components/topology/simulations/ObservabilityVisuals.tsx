import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';
import { BarChart2, Bell, Activity, AlertTriangle, CheckCircle, XCircle, Database, ArrowRight, Zap } from 'lucide-react';

interface ObservabilityVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function ObservabilityVisuals({ scenario, state }: ObservabilityVisualsProps) {
  if (!['prometheus-scrape', 'prometheus-alert', 'jaeger-trace', 'jaeger-error-trace'].includes(scenario)) {
    return null;
  }

  if (scenario === 'prometheus-scrape') {
    return <PrometheusScrapingVisuals state={state} />;
  }
  
  if (scenario === 'prometheus-alert') {
    return <PrometheusAlertVisuals state={state} />;
  }
  
  if (scenario === 'jaeger-trace' || scenario === 'jaeger-error-trace') {
    return <JaegerTracingVisuals state={state} isError={scenario === 'jaeger-error-trace'} />;
  }

  return null;
}

// ============ Prometheus Scraping Visuals ============
function PrometheusScrapingVisuals({ state }: { state: ControlPlaneState }) {
  const isDiscovering = state.phase === 'controller';
  const isScraping = state.phase === 'node-flow';
  const isStoring = state.phase === 'etcd';
  const isQueryReady = state.phase === 'api-server' || state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-orange-400">
        <BarChart2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Prometheus Metrics Collection</span>
      </div>

      {/* Architecture Flow */}
      <div className="flex items-center gap-3">
        {/* Targets */}
        <div className={cn(
          "flex flex-col gap-2 p-3 rounded-lg border transition-all duration-500",
          isDiscovering || isScraping ? "border-orange-500 bg-orange-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <span className="text-xs font-semibold text-surface-400 uppercase">Targets</span>
          <div className="flex flex-col gap-1">
            {['pod/web-0', 'pod/web-1', 'pod/api-0'].map((target, i) => (
              <div key={i} className={cn(
                "flex items-center gap-2 px-2 py-1 rounded text-xs",
                isScraping ? "bg-orange-500/20 text-orange-300" : "bg-surface-700 text-surface-400"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isScraping ? "bg-green-400 animate-pulse" : "bg-surface-600"
                )} />
                <span className="font-mono">{target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className={cn(
          "w-6 h-6 transition-colors duration-300",
          isScraping ? "text-orange-400" : "text-surface-600"
        )} />

        {/* Prometheus */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-500",
          isScraping || isStoring ? "border-orange-500 bg-orange-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <BarChart2 className={cn(
            "w-8 h-8 transition-colors duration-300",
            isScraping ? "text-orange-400" : "text-surface-500"
          )} />
          <span className="text-xs font-semibold text-surface-300">Prometheus</span>
          {isScraping && (
            <span className="text-[10px] text-orange-300 animate-pulse">Scraping...</span>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className={cn(
          "w-6 h-6 transition-colors duration-300",
          isStoring ? "text-yellow-400" : "text-surface-600"
        )} />

        {/* TSDB */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-500",
          isStoring ? "border-yellow-500 bg-yellow-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <Database className={cn(
            "w-8 h-8 transition-colors duration-300",
            isStoring ? "text-yellow-400" : "text-surface-500"
          )} />
          <span className="text-xs font-semibold text-surface-300">TSDB</span>
          {isStoring && (
            <span className="text-[10px] text-yellow-300 animate-pulse">Writing...</span>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className={cn(
          "w-6 h-6 transition-colors duration-300",
          isQueryReady ? "text-green-400" : "text-surface-600"
        )} />

        {/* PromQL */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-500",
          isQueryReady ? "border-green-500 bg-green-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <Zap className={cn(
            "w-8 h-8 transition-colors duration-300",
            isQueryReady ? "text-green-400" : "text-surface-500"
          )} />
          <span className="text-xs font-semibold text-surface-300">PromQL</span>
          {isQueryReady && (
            <span className="text-[10px] text-green-300">Ready ✓</span>
          )}
        </div>
      </div>

      {/* Metrics Sample */}
      {(isScraping || isStoring || isQueryReady) && (
        <div className="p-3 rounded-lg bg-surface-800 border border-surface-700 font-mono text-xs text-surface-300 animate-fade-in">
          <code>
            http_requests_total{'{'} pod="web-0" {'}'} 1247<br/>
            container_cpu_usage_seconds{'{'} pod="api-0" {'}'} 0.42
          </code>
        </div>
      )}
    </div>
  );
}

// ============ Prometheus Alert Visuals ============
function PrometheusAlertVisuals({ state }: { state: ControlPlaneState }) {
  const isEvaluating = state.phase === 'controller';
  const isPending = state.phase === 'scheduler';
  const isFiring = state.phase === 'node-flow';
  const isRouting = state.phase === 'api-server';
  const isNotifying = state.phase === 'node-assign';
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-red-400">
        <Bell className="w-5 h-5" />
        <span className="text-sm font-semibold">Prometheus Alerting Pipeline</span>
      </div>

      {/* Alert State Machine */}
      <div className="flex items-center gap-4">
        {/* Evaluate */}
        <div className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
          isEvaluating ? "border-blue-500 bg-blue-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <Activity className={cn("w-6 h-6", isEvaluating ? "text-blue-400" : "text-surface-500")} />
          <span className="text-[10px] font-medium text-surface-400">Evaluate</span>
        </div>

        <ArrowRight className="w-4 h-4 text-surface-600" />

        {/* Pending */}
        <div className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
          isPending ? "border-yellow-500 bg-yellow-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <AlertTriangle className={cn("w-6 h-6", isPending ? "text-yellow-400" : "text-surface-500")} />
          <span className="text-[10px] font-medium text-surface-400">Pending</span>
        </div>

        <ArrowRight className="w-4 h-4 text-surface-600" />

        {/* Firing */}
        <div className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
          isFiring ? "border-red-500 bg-red-500/10 animate-pulse" : "border-surface-700 bg-surface-800"
        )}>
          <Bell className={cn("w-6 h-6", isFiring ? "text-red-400" : "text-surface-500")} />
          <span className="text-[10px] font-medium text-surface-400">Firing</span>
        </div>

        <ArrowRight className="w-4 h-4 text-surface-600" />

        {/* Alertmanager */}
        <div className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
          isRouting || isNotifying ? "border-purple-500 bg-purple-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <Zap className={cn("w-6 h-6", isRouting || isNotifying ? "text-purple-400" : "text-surface-500")} />
          <span className="text-[10px] font-medium text-surface-400">Alertmanager</span>
        </div>

        <ArrowRight className="w-4 h-4 text-surface-600" />

        {/* Slack */}
        <div className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
          isNotifying || isComplete ? "border-green-500 bg-green-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <CheckCircle className={cn("w-6 h-6", isNotifying || isComplete ? "text-green-400" : "text-surface-500")} />
          <span className="text-[10px] font-medium text-surface-400">Slack</span>
        </div>
      </div>

      {/* Alert Card */}
      {isFiring && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold text-red-300">HighCPUUsage</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/30 text-red-200">FIRING</span>
          </div>
          <p className="text-xs text-surface-400 mt-2">CPU usage is above 80% for pod web-0</p>
        </div>
      )}
    </div>
  );
}

// ============ Jaeger Tracing Visuals ============
function JaegerTracingVisuals({ state, isError }: { state: ControlPlaneState; isError: boolean }) {
  const isTraceStart = state.phase === 'api-server';
  const isSpan1 = state.phase === 'controller';
  const isSpan2 = state.phase === 'scheduler';
  const isSpan3 = state.phase === 'node-flow';
  const isSpan4 = state.phase === 'etcd';
  const isComplete = state.phase === 'complete';

  const services = isError 
    ? [
        { name: 'checkout-service', time: '15ms', status: 'ok', active: isSpan1 },
        { name: 'inventory-service', time: '22ms', status: 'ok', active: isSpan2 },
        { name: 'payment-service', time: '3000ms', status: 'error', active: isSpan3 },
      ]
    : [
        { name: 'api-gateway', time: '12ms', status: 'ok', active: isSpan1 },
        { name: 'user-service', time: '8ms', status: 'ok', active: isSpan2 },
        { name: 'order-service', time: '45ms', status: 'ok', active: isSpan3 },
        { name: 'postgres', time: '32ms', status: 'ok', active: isSpan4 },
      ];

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2",
        isError ? "text-red-400" : "text-cyan-400"
      )}>
        <Activity className="w-5 h-5" />
        <span className="text-sm font-semibold">
          Distributed Trace {isError ? '(Error Flow)' : '(Healthy Flow)'}
        </span>
      </div>

      {/* Trace ID */}
      {(isTraceStart || isComplete) && (
        <div className="px-3 py-1 rounded-full bg-surface-800 border border-surface-700">
          <span className="text-xs font-mono text-surface-400">
            TraceID: <span className="text-cyan-400">abc123def</span>
          </span>
        </div>
      )}

      {/* Waterfall */}
      <div className="w-full max-w-md space-y-2">
        {services.map((service, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Service Name */}
            <span className="text-xs font-mono text-surface-400 w-28 truncate">
              {service.name}
            </span>
            
            {/* Span Bar */}
            <div className="flex-1 relative h-6">
              <div 
                className={cn(
                  "absolute h-full rounded transition-all duration-500",
                  service.active && "animate-pulse",
                  service.status === 'error' 
                    ? "bg-red-500/40 border border-red-500" 
                    : service.active 
                      ? "bg-cyan-500/40 border border-cyan-500"
                      : "bg-surface-700"
                )}
                style={{ 
                  left: `${i * 15}%`, 
                  width: service.status === 'error' ? '70%' : `${30 + Math.random() * 20}%` 
                }}
              />
            </div>

            {/* Duration */}
            <span className={cn(
              "text-xs font-mono w-16 text-right",
              service.status === 'error' ? "text-red-400" : "text-surface-400"
            )}>
              {service.time}
            </span>

            {/* Status Icon */}
            {service.active && (
              service.status === 'error' 
                ? <XCircle className="w-4 h-4 text-red-400" />
                : <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
        ))}
      </div>

      {/* Total Duration */}
      {isComplete && (
        <div className={cn(
          "px-4 py-2 rounded-lg",
          isError ? "bg-red-500/10 border border-red-500" : "bg-green-500/10 border border-green-500"
        )}>
          <span className={cn(
            "text-sm font-semibold",
            isError ? "text-red-300" : "text-green-300"
          )}>
            {isError ? '❌ Error: payment-service timeout' : ' Total: 97ms (4 spans)'}
          </span>
        </div>
      )}
    </div>
  );
}
