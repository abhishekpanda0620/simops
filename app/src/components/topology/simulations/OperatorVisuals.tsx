import { GitBranch, Eye, Box, ArrowDown, Check, RefreshCw, Lock, Shield, FileKey } from 'lucide-react';
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface OperatorVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function OperatorVisuals({ scenario, state }: OperatorVisualsProps) {
  // ArgoCD Sync Scenario
  if (scenario === 'argocd-sync') {
    return <ArgoCDVisuals state={state} />;
  }
  
  // Cert-Manager Scenario
  if (scenario === 'certmanager-issue') {
    return <CertManagerVisuals state={state} />;
  }

  return null;
}

// ============ ArgoCD Visuals (existing) ============
function ArgoCDVisuals({ state }: { state: ControlPlaneState }) {
  const showCRD = ['api-server', 'etcd', 'controller', 'scheduler', 'node-assign', 'complete'].includes(state.phase);
  const showGitFetch = ['controller'].includes(state.phase) && state.message.includes('Git');
  const showReconciling = ['controller', 'scheduler', 'node-assign'].includes(state.phase);
  const showSynced = state.phase === 'complete';
  const showPodCreation = ['scheduler', 'node-assign', 'complete'].includes(state.phase);

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* ArgoCD Operator Card */}
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all duration-500 flex items-center gap-4",
        showReconciling 
          ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          : "bg-surface-800 border-surface-600"
      )}>
        {/* ArgoCD Logo/Icon */}
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          showReconciling ? "bg-orange-500/30" : "bg-surface-700"
        )}>
          <RefreshCw className={cn(
            "w-6 h-6 transition-all",
            showReconciling ? "text-orange-400 animate-spin" : "text-surface-400"
          )} />
        </div>
        <div>
          <p className="font-semibold text-surface-100 flex items-center gap-2">
            ArgoCD Controller
            <Eye className={cn(
              "w-4 h-4 transition-all",
              showReconciling ? "text-orange-400 animate-pulse" : "text-surface-500"
            )} />
          </p>
          <p className="text-xs text-surface-400">Operator Pod (Watching for Applications)</p>
        </div>
      </div>

      {/* CRD / Application Resource */}
      {showCRD && (
        <>
          <ArrowDown className="w-5 h-5 text-purple-400 animate-bounce" />
          <div className={cn(
            "relative p-4 rounded-lg border-2 transition-all duration-500",
            showSynced 
              ? "bg-success-500/10 border-success-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          )}>
            {/* CRD Badge */}
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full">
              Custom Resource
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="p-2 bg-surface-900 rounded-lg border border-surface-700">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <p className="font-semibold text-surface-100">Application: guestbook</p>
                <p className="text-xs text-surface-400 font-mono">argoproj.io/v1alpha1</p>
                <div className="flex gap-2 mt-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-500",
                    showSynced ? "bg-success-500/20 text-success-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {showSynced ? "✓ Synced" : "⟳ OutOfSync"}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-500",
                    showSynced ? "bg-success-500/20 text-success-400" : "bg-surface-700 text-surface-400"
                  )}>
                    {showSynced ? "♥ Healthy" : "? Missing"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Git Fetch Visual */}
      {showGitFetch && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 border border-surface-600 animate-pulse">
          <GitBranch className="w-5 h-5 text-primary-400" />
          <div>
            <p className="text-sm text-surface-200">Fetching from Git...</p>
            <p className="text-[10px] text-surface-400 font-mono">github.com/argoproj/argocd-example-apps</p>
          </div>
        </div>
      )}

      {/* Child Resources Created */}
      {showPodCreation && (
        <>
          <ArrowDown className="w-5 h-5 text-primary-400" />
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-surface-400">Child Resources Created by Operator:</p>
            <div className="flex gap-4">
              {/* Deployment */}
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all duration-500",
                showSynced 
                  ? "bg-success-500/10 border-success-500/50" 
                  : "bg-primary-500/10 border-primary-500/50 animate-pulse"
              )}>
                <Box className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-surface-100">Deployment</p>
                  <p className="text-[10px] text-surface-400">guestbook-ui</p>
                </div>
                {showSynced && <Check className="w-4 h-4 text-success-400" />}
              </div>

              {/* Service */}
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all duration-500",
                showSynced 
                  ? "bg-success-500/10 border-success-500/50" 
                  : "bg-accent-500/10 border-accent-500/50 animate-pulse"
              )}>
                <span className="text-lg">🔗</span>
                <div>
                  <p className="text-sm font-medium text-surface-100">Service</p>
                  <p className="text-[10px] text-surface-400">guestbook-svc</p>
                </div>
                {showSynced && <Check className="w-4 h-4 text-success-400" />}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Final Success Banner */}
      {showSynced && (
        <div className="p-3 rounded-lg bg-success-500/20 border border-success-500/50 text-center animate-in zoom-in duration-500">
          <p className="text-success-300 font-semibold flex items-center gap-2 justify-center">
            <Check className="w-5 h-5" />
            Reconciliation Complete!
          </p>
          <p className="text-xs text-surface-400 mt-1">
            Operator successfully deployed resources from Git manifest
          </p>
        </div>
      )}
    </div>
  );
}

// ============ Cert-Manager Visuals (new) ============
function CertManagerVisuals({ state }: { state: ControlPlaneState }) {
  const showCR = ['api-server', 'etcd', 'controller', 'complete'].includes(state.phase);
  const showController = ['controller', 'complete'].includes(state.phase);
  const showChallenge = state.message.includes('challenge') || state.message.includes('Challenge');
  const showChallengeComplete = state.message.includes('passed') || state.message.includes('Secret');
  const showSecret = state.message.includes('Secret') || state.phase === 'complete';
  const showComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* cert-manager Controller Card */}
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all duration-500 flex items-center gap-4",
        showController 
          ? "bg-gradient-to-r from-teal-500/20 to-green-500/20 border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
          : "bg-surface-800 border-surface-600"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          showController ? "bg-teal-500/30" : "bg-surface-700"
        )}>
          <Shield className={cn(
            "w-6 h-6 transition-all",
            showController ? "text-teal-400 animate-pulse" : "text-surface-400"
          )} />
        </div>
        <div>
          <p className="font-semibold text-surface-100 flex items-center gap-2">
            cert-manager Controller
            <Eye className={cn(
              "w-4 h-4 transition-all",
              showController ? "text-teal-400 animate-pulse" : "text-surface-500"
            )} />
          </p>
          <p className="text-xs text-surface-400">Watching for Certificate CRs</p>
        </div>
      </div>

      {/* Certificate CR */}
      {showCR && (
        <>
          <ArrowDown className="w-5 h-5 text-teal-400 animate-bounce" />
          <div className={cn(
            "relative p-4 rounded-lg border-2 transition-all duration-500",
            showComplete 
              ? "bg-success-500/10 border-success-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "bg-teal-500/10 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
          )}>
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full">
              Certificate CR
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="p-2 bg-surface-900 rounded-lg border border-surface-700">
                <Lock className={cn(
                  "w-6 h-6 transition-all",
                  showComplete ? "text-success-400" : "text-teal-400"
                )} />
              </div>
              <div>
                <p className="font-semibold text-surface-100">Certificate: myapp-tls</p>
                <p className="text-xs text-surface-400 font-mono">cert-manager.io/v1</p>
                <div className="flex gap-2 mt-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-500",
                    showComplete ? "bg-success-500/20 text-success-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {showComplete ? "✓ Ready" : "⟳ Pending"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-700 text-surface-300">
                    myapp.example.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ACME Challenge Visual */}
      {showChallenge && (
        <>
          <ArrowDown className="w-5 h-5 text-yellow-400" />
          <div className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-all duration-500",
            showChallengeComplete 
              ? "bg-success-500/10 border-success-500/50"
              : "bg-yellow-500/10 border-yellow-500/50 animate-pulse"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              showChallengeComplete ? "bg-success-500/30" : "bg-yellow-500/30"
            )}>
              {showChallengeComplete ? (
                <Check className="w-5 h-5 text-success-400" />
              ) : (
                <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-100">HTTP-01 ACME Challenge</p>
              <p className="text-[10px] text-surface-400 font-mono">
                {showChallengeComplete 
                  ? "✓ Let's Encrypt validation passed" 
                  : "Waiting for validation..."}
              </p>
            </div>
          </div>
        </>
      )}

      {/* TLS Secret Created */}
      {showSecret && (
        <>
          <ArrowDown className="w-5 h-5 text-green-400" />
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-500",
            "bg-green-500/10 border-green-500/50",
            showComplete ? "" : "animate-pulse"
          )}>
            <FileKey className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-surface-100">TLS Secret Created</p>
              <p className="text-[10px] text-surface-400 font-mono">myapp-tls-secret</p>
            </div>
            {showComplete && <Check className="w-4 h-4 text-success-400" />}
          </div>
        </>
      )}

      {/* Final Success Banner */}
      {showComplete && (
        <div className="p-3 rounded-lg bg-success-500/20 border border-success-500/50 text-center animate-in zoom-in duration-500">
          <p className="text-success-300 font-semibold flex items-center gap-2 justify-center">
            <Lock className="w-5 h-5" />
            TLS Certificate Issued Successfully!
          </p>
          <p className="text-xs text-surface-400 mt-1">
            Ingress can now serve HTTPS traffic for myapp.example.com
          </p>
        </div>
      )}
    </div>
  );
}
