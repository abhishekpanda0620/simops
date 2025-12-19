import { AlertTriangle, Check, Cloud, Server, XCircle, Scale, ArrowDown } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface AdmissionVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function AdmissionVisuals({ scenario, state }: AdmissionVisualsProps) {
  // ResourceQuota Scenario
  if (scenario === 'resource-quota') {
    return <ResourceQuotaVisuals state={state} />;
  }
  
  // Cluster Autoscaler Scenario
  if (scenario === 'cluster-autoscaler') {
    return <ClusterAutoscalerVisuals state={state} />;
  }

  return null;
}

// ============ ResourceQuota Visuals ============
function ResourceQuotaVisuals({ state }: { state: ControlPlaneState }) {
  const showQuotaCheck = state.message.includes('ResourceQuota') || state.message.includes('Quota');
  const showUsage = state.message.includes('usage') || state.message.includes('Usage');
  const showRejection = state.message.includes('EXCEEDED') || state.message.includes('REJECTED');
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* Admission Controller Card */}
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all duration-500 flex items-center gap-4",
        showQuotaCheck 
          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          : "bg-surface-800 border-surface-600"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          showQuotaCheck ? "bg-orange-500/30" : "bg-surface-700"
        )}>
          <Scale className={cn(
            "w-6 h-6 transition-all",
            showQuotaCheck ? "text-orange-400" : "text-surface-400"
          )} />
        </div>
        <div>
          <p className="font-semibold text-surface-100">Admission Controller</p>
          <p className="text-xs text-surface-400">ResourceQuota Validation</p>
        </div>
      </div>

      {/* Quota Usage Bar */}
      {(showUsage || showRejection || isComplete) && (
        <>
          <ArrowDown className="w-5 h-5 text-orange-400 animate-bounce" />
          <div className={cn(
            "relative p-4 rounded-lg border-2 transition-all duration-500 w-80",
            showRejection || isComplete
              ? "bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              : "bg-surface-800 border-surface-600"
          )}>
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded-full">
              ResourceQuota: default-quota
            </div>
            
            <div className="mt-2 space-y-3">
              {/* CPU Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-300">CPU</span>
                  <span className={cn(
                    "font-mono",
                    showRejection || isComplete ? "text-red-400" : "text-surface-400"
                  )}>3.5 / 4 cores</span>
                </div>
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      showRejection || isComplete ? "bg-red-500" : "bg-orange-500"
                    )}
                    style={{ width: '87.5%' }}
                  />
                </div>
              </div>
              
              {/* Memory Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-300">Memory</span>
                  <span className="text-surface-400 font-mono">7 / 8 Gi</span>
                </div>
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '87.5%' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rejection Banner */}
      {(showRejection || isComplete) && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-center animate-in zoom-in duration-500">
          <p className="text-red-300 font-semibold flex items-center gap-2 justify-center">
            <XCircle className="w-5 h-5" />
            Pod Creation Rejected!
          </p>
          <p className="text-xs text-surface-400 mt-1">
            Requested: 2 cores | Available: 0.5 cores
          </p>
        </div>
      )}
    </div>
  );
}

// ============ Cluster Autoscaler Visuals ============
function ClusterAutoscalerVisuals({ state }: { state: ControlPlaneState }) {
  const showPending = state.message.includes('Pending') || state.message.includes('Insufficient');
  const showAutoscaler = state.message.includes('Autoscaler') || state.message.includes('Cloud Provider');
  const showProvisioning = state.message.includes('Provisioning') || state.message.includes('worker-3');
  const showNodeReady = state.message.includes('Ready') || state.message.includes('Joined');
  const isComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* Cluster Autoscaler Card */}
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all duration-500 flex items-center gap-4",
        showAutoscaler 
          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          : "bg-surface-800 border-surface-600"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          showAutoscaler ? "bg-blue-500/30" : "bg-surface-700"
        )}>
          <Scale className={cn(
            "w-6 h-6 transition-all",
            showAutoscaler ? "text-blue-400 animate-pulse" : "text-surface-400"
          )} />
        </div>
        <div>
          <p className="font-semibold text-surface-100">Cluster Autoscaler</p>
          <p className="text-xs text-surface-400">Monitoring pending pods</p>
        </div>
      </div>

      {/* Pending Pods Warning */}
      {showPending && !showNodeReady && !isComplete && (
        <>
          <ArrowDown className="w-5 h-5 text-yellow-400" />
          <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-surface-100">4 Pods Pending</p>
              <p className="text-[10px] text-surface-400">Insufficient cluster resources</p>
            </div>
          </div>
        </>
      )}

      {/* Cloud Provider / Node Provisioning */}
      {showProvisioning && (
        <>
          <ArrowDown className="w-5 h-5 text-blue-400 animate-bounce" />
          <div className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-all duration-500",
            showNodeReady || isComplete
              ? "bg-success-500/10 border-success-500/50"
              : "bg-blue-500/10 border-blue-500/50 animate-pulse"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              showNodeReady || isComplete ? "bg-success-500/30" : "bg-blue-500/30"
            )}>
              <Cloud className={cn(
                "w-5 h-5",
                showNodeReady || isComplete ? "text-success-400" : "text-blue-400"
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-100">Cloud Provider</p>
              <p className="text-[10px] text-surface-400 font-mono">
                {showNodeReady || isComplete ? "✓ Node provisioned" : "Provisioning worker-3..."}
              </p>
            </div>
          </div>
        </>
      )}

      {/* New Node Ready */}
      {(showNodeReady || isComplete) && (
        <>
          <ArrowDown className="w-5 h-5 text-green-400" />
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success-500/10 border border-success-500/50">
            <Server className="w-5 h-5 text-success-400" />
            <div>
              <p className="text-sm font-medium text-surface-100">worker-3</p>
              <p className="text-[10px] text-surface-400">Node Ready • Joined cluster</p>
            </div>
            <Check className="w-4 h-4 text-success-400" />
          </div>
        </>
      )}

      {/* Success Banner */}
      {isComplete && (
        <div className="p-3 rounded-lg bg-success-500/20 border border-success-500/50 text-center animate-in zoom-in duration-500">
          <p className="text-success-300 font-semibold flex items-center gap-2 justify-center">
            <Check className="w-5 h-5" />
            Cluster Scaled Successfully!
          </p>
          <p className="text-xs text-surface-400 mt-1">
            All 10 pods now running across 3 nodes
          </p>
        </div>
      )}
    </div>
  );
}
