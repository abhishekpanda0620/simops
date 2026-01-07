import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';
import { GitMerge, GitBranch, Zap, Shield, Power, ArrowRight, CheckCircle, XCircle, Lock } from 'lucide-react';

interface ServiceMeshVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function ServiceMeshVisuals({ scenario, state }: ServiceMeshVisualsProps) {
  if (!['istio-canary', 'istio-ab-testing', 'istio-fault-injection', 'istio-mtls', 'istio-circuit-breaker'].includes(scenario)) {
    return null;
  }

  if (scenario === 'istio-canary') {
    return <CanaryVisuals state={state} />;
  }
  
  if (scenario === 'istio-ab-testing') {
    return <ABTestingVisuals state={state} />;
  }
  
  if (scenario === 'istio-fault-injection') {
    return <FaultInjectionVisuals state={state} />;
  }
  
  if (scenario === 'istio-mtls') {
    return <MTLSVisuals state={state} />;
  }
  
  if (scenario === 'istio-circuit-breaker') {
    return <CircuitBreakerVisuals state={state} />;
  }

  return null;
}

// ============ Canary Deployment Visuals ============
function CanaryVisuals({ state }: { state: ControlPlaneState }) {
  const isActive = state.phase === 'node-assign' || state.phase === 'scheduler';
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-blue-400">
        <GitMerge className="w-5 h-5" />
        <span className="text-sm font-semibold">Istio Canary Deployment</span>
      </div>

      {/* Traffic Split Visualization */}
      <div className="flex items-center gap-6">
        {/* Ingress */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          isActive || isComplete ? "border-blue-500 bg-blue-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <span className="text-xs font-semibold text-surface-300">Ingress</span>
        </div>

        {/* Split */}
        <div className="flex flex-col items-center gap-2">
          {/* Traffic Flow Lines */}
          <div className="relative w-32 h-24">
            {/* 90% Line */}
            <div className={cn(
              "absolute top-2 left-0 w-full h-0.5 transition-all duration-500",
              isActive || isComplete ? "bg-green-400" : "bg-surface-600"
            )} style={{ transform: 'rotate(-20deg)', transformOrigin: 'left center' }} />
            
            {/* 10% Line */}
            <div className={cn(
              "absolute bottom-2 left-0 w-full h-0.5 transition-all duration-500",
              isActive || isComplete ? "bg-yellow-400" : "bg-surface-600"
            )} style={{ transform: 'rotate(20deg)', transformOrigin: 'left center' }} />
          </div>
        </div>

        {/* Versions */}
        <div className="flex flex-col gap-3">
          {/* V1 */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg border transition-all",
            isActive || isComplete ? "border-green-500 bg-green-500/10" : "border-surface-700 bg-surface-800"
          )}>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-green-400">v1</span>
              <span className="text-[10px] text-surface-400">90%</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "w-3 h-3 rounded-sm",
                  isActive || isComplete ? "bg-green-500" : "bg-surface-600"
                )} />
              ))}
            </div>
          </div>

          {/* V2 (Canary) */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg border transition-all",
            isActive || isComplete ? "border-yellow-500 bg-yellow-500/10" : "border-surface-700 bg-surface-800"
          )}>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-yellow-400">v2</span>
              <span className="text-[10px] text-surface-400">10%</span>
            </div>
            <div className="flex gap-1">
              <div className={cn(
                "w-3 h-3 rounded-sm",
                isActive || isComplete ? "bg-yellow-500 animate-pulse" : "bg-surface-600"
              )} />
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">CANARY</span>
          </div>
        </div>
      </div>

      {/* Status */}
      {isComplete && (
        <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500">
          <span className="text-sm text-green-300">✓ Traffic split active: 90% → v1, 10% → v2</span>
        </div>
      )}
    </div>
  );
}

// ============ A/B Testing Visuals ============
function ABTestingVisuals({ state }: { state: ControlPlaneState }) {
  const isRouting = state.phase === 'scheduler';
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-purple-400">
        <GitBranch className="w-5 h-5" />
        <span className="text-sm font-semibold">Istio A/B Testing (Header-Based)</span>
      </div>

      {/* Routing Rules */}
      <div className="space-y-3">
        {/* Regular User */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all",
          isRouting && state.message.includes('no header') ? "border-blue-500 bg-blue-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface-700">
            <span className="text-xs text-surface-400">GET /home</span>
          </div>
          <ArrowRight className="w-4 h-4 text-surface-500" />
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-blue-500/20">
            <span className="text-xs text-blue-300">frontend-v1</span>
          </div>
        </div>

        {/* Beta User */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all",
          isRouting && state.message.includes('beta') ? "border-purple-500 bg-purple-500/10 animate-pulse" : "border-surface-700 bg-surface-800"
        )}>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface-700">
            <span className="text-xs text-surface-400">GET /home</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/30 text-purple-300">x-user-type: beta</span>
          </div>
          <ArrowRight className="w-4 h-4 text-surface-500" />
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-purple-500/20">
            <span className="text-xs text-purple-300">frontend-v2</span>
          </div>
        </div>
      </div>

      {/* Status */}
      {isComplete && (
        <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500">
          <span className="text-sm text-purple-300">✓ Header-based routing active</span>
        </div>
      )}
    </div>
  );
}

// ============ Fault Injection Visuals ============
function FaultInjectionVisuals({ state }: { state: ControlPlaneState }) {
  const isDelay = state.phase === 'scheduler' && state.message.includes('delay');
  const isAbort = state.phase === 'node-assign' && state.message.includes('abort');
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-red-400">
        <Zap className="w-5 h-5" />
        <span className="text-sm font-semibold">Istio Fault Injection</span>
      </div>

      {/* Fault Types */}
      <div className="flex gap-4">
        {/* Delay Fault */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          isDelay ? "border-yellow-500 bg-yellow-500/10 animate-pulse" : "border-surface-700 bg-surface-800"
        )}>
          <div className="text-2xl">⏳</div>
          <span className="text-xs font-semibold text-surface-300">Delay</span>
          <span className="text-xs text-surface-400">50% → 5s</span>
          {isDelay && (
            <span className="text-[10px] text-yellow-300 animate-pulse">Injecting...</span>
          )}
        </div>

        {/* Abort Fault */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          isAbort ? "border-red-500 bg-red-500/10 animate-pulse" : "border-surface-700 bg-surface-800"
        )}>
          <div className="text-2xl">❌</div>
          <span className="text-xs font-semibold text-surface-300">Abort</span>
          <span className="text-xs text-surface-400">10% → HTTP 500</span>
          {isAbort && (
            <span className="text-[10px] text-red-300 animate-pulse">Returning 500</span>
          )}
        </div>
      </div>

      {/* Status */}
      {isComplete && (
        <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500">
          <span className="text-sm text-orange-300">⚡ Fault injection active for resilience testing</span>
        </div>
      )}
    </div>
  );
}

// ============ mTLS Visuals ============
function MTLSVisuals({ state }: { state: ControlPlaneState }) {
  const isIssuing = state.phase === 'controller';
  const isDistributing = state.phase === 'node-flow';
  const isHandshake = state.phase === 'scheduler';
  const isValidating = state.phase === 'node-assign';
  const isEncrypted = state.phase === 'etcd';
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-green-400">
        <Shield className="w-5 h-5" />
        <span className="text-sm font-semibold">Istio Mutual TLS</span>
      </div>

      {/* Services with mTLS */}
      <div className="flex items-center gap-6">
        {/* Service A */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          isHandshake || isValidating || isEncrypted || isComplete ? "border-green-500 bg-green-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
            <span className="text-xs font-bold text-surface-300">SVC A</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className={cn(
              "w-3 h-3",
              isComplete ? "text-green-400" : "text-surface-500"
            )} />
            <span className="text-[10px] text-surface-400">Envoy</span>
          </div>
        </div>

        {/* Connection */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "w-20 h-1 rounded transition-all duration-500",
            isEncrypted || isComplete ? "bg-gradient-to-r from-green-500 via-green-400 to-green-500" : 
            isHandshake ? "bg-yellow-500 animate-pulse" : "bg-surface-600"
          )} />
          {isHandshake && (
            <span className="text-[10px] text-yellow-300 animate-pulse">🔐 TLS Handshake</span>
          )}
          {isEncrypted && (
            <span className="text-[10px] text-green-300">🔒 TLS 1.3</span>
          )}
        </div>

        {/* Service B */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          isHandshake || isValidating || isEncrypted || isComplete ? "border-green-500 bg-green-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
            <span className="text-xs font-bold text-surface-300">SVC B</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className={cn(
              "w-3 h-3",
              isComplete ? "text-green-400" : "text-surface-500"
            )} />
            <span className="text-[10px] text-surface-400">Envoy</span>
          </div>
        </div>
      </div>

      {/* Certificate Info */}
      {(isIssuing || isDistributing) && (
        <div className="p-3 rounded-lg bg-surface-800 border border-surface-700">
          <span className="text-xs font-mono text-surface-400">
            SPIFFE ID: <span className="text-green-400">spiffe://cluster.local/ns/default/sa/frontend</span>
          </span>
        </div>
      )}

      {/* Status */}
      {isComplete && (
        <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500">
          <span className="text-sm text-green-300">🔒 mTLS enabled - all traffic encrypted</span>
        </div>
      )}
    </div>
  );
}

// ============ Circuit Breaker Visuals ============
function CircuitBreakerVisuals({ state }: { state: ControlPlaneState }) {
  const isNormal = state.phase === 'scheduler' && state.message.includes('CLOSED');
  const isDetecting = state.phase === 'node-flow';
  const isOpen = state.phase === 'node-assign';
  const isHalfOpen = (state.phase === 'scheduler' && state.message.includes('HALF-OPEN'));
  const isComplete = state.phase === 'complete';

  const circuitState = isOpen ? 'open' : isHalfOpen ? 'half-open' : 'closed';

  return (
    <div className="flex flex-col items-center gap-6 mt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-orange-400">
        <Power className="w-5 h-5" />
        <span className="text-sm font-semibold">Istio Circuit Breaker</span>
      </div>

      {/* Circuit State */}
      <div className="flex items-center gap-6">
        {/* Caller */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          "border-surface-700 bg-surface-800"
        )}>
          <span className="text-xs font-bold text-surface-300">Client</span>
        </div>

        {/* Circuit */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500",
            circuitState === 'closed' ? "border-green-500 bg-green-500/10" :
            circuitState === 'half-open' ? "border-yellow-500 bg-yellow-500/10 animate-pulse" :
            "border-red-500 bg-red-500/10"
          )}>
            <Power className={cn(
              "w-6 h-6",
              circuitState === 'closed' ? "text-green-400" :
              circuitState === 'half-open' ? "text-yellow-400" : "text-red-400"
            )} />
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-bold uppercase",
            circuitState === 'closed' ? "bg-green-500/20 text-green-300" :
            circuitState === 'half-open' ? "bg-yellow-500/20 text-yellow-300" :
            "bg-red-500/20 text-red-300"
          )}>
            {circuitState}
          </span>
        </div>

        {/* Target Service */}
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
          isOpen ? "border-red-500 bg-red-500/10" : "border-surface-700 bg-surface-800"
        )}>
          <span className="text-xs font-bold text-surface-300">Service</span>
          {isOpen && (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          {(isNormal || isComplete) && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
        </div>
      </div>

      {/* Failure Counter */}
      {isDetecting && (
        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500">
          <span className="text-xs text-red-300">⚠️ Consecutive 5xx errors: 5/5</span>
        </div>
      )}

      {/* Status */}
      {isComplete && (
        <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500">
          <span className="text-sm text-green-300">✓ Circuit breaker recovered - endpoint healthy</span>
        </div>
      )}
    </div>
  );
}
