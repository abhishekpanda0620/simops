import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Shield, CheckCircle, ShieldAlert, Play, RefreshCw, Lock } from 'lucide-react';

interface SimulationState {
  step: 'idle' | 'deploying' | 'validating' | 'result';
  allowed: boolean;
  message: string;
}

export function AdmissionController() {
  const [policy, setPolicy] = useState<'no-root' | 'required-labels'>('no-root');
  const [podConfig, setPodConfig] = useState<'compliant' | 'non-compliant'>('non-compliant');
  const [simulation, setSimulation] = useState<SimulationState>({
    step: 'idle',
    allowed: false,
    message: ''
  });

  const runSimulation = () => {
    setSimulation({ step: 'deploying', allowed: false, message: 'Deploying Pod...' });

    // Step 1: Webhook interception
    setTimeout(() => {
      setSimulation({ step: 'validating', allowed: false, message: 'OPA Gatekeeper Validating...' });
    }, 1000);

    // Step 2: Policy Decision
    setTimeout(() => {
      const allowed = podConfig === 'compliant';
      let message = '';
      
      if (allowed) {
        message = 'Pod definition satisfies all constraints.';
      } else {
        message = policy === 'no-root' 
          ? 'DENIED: Container running as root (runAsUser: 0)' 
          : 'DENIED: Missing required label "team"';
      }

      setSimulation({ step: 'result', allowed, message });
    }, 2500);
  };

  const reset = () => {
    setSimulation({ step: 'idle', allowed: false, message: '' });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-surface-800 bg-surface-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-surface-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent-400" />
          OPA Gatekeeper Simulation
        </h3>
        {simulation.step === 'result' && (
          <Button size="sm" variant="ghost" onClick={reset}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 block">
                1. Active Policy
              </label>
              <div className="space-y-2">
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    policy === 'no-root' 
                      ? 'bg-accent-500/10 border-accent-500/50 ring-1 ring-accent-500/50' 
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                  onClick={() => !['deploying', 'validating'].includes(simulation.step) && setPolicy('no-root')}
                >
                  <div className="font-medium text-surface-200">Disallow Root User</div>
                  <div className="text-xs text-surface-400 mt-1">Containers must not run as uid 0</div>
                </div>
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    policy === 'required-labels' 
                      ? 'bg-accent-500/10 border-accent-500/50 ring-1 ring-accent-500/50' 
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                  onClick={() => !['deploying', 'validating'].includes(simulation.step) && setPolicy('required-labels')}
                >
                  <div className="font-medium text-surface-200">Require Labels</div>
                  <div className="text-xs text-surface-400 mt-1">All pods must have 'team' label</div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 block">
                2. Pod Configuration
              </label>
              <div className="space-y-2">
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    podConfig === 'compliant' 
                      ? 'bg-success-500/10 border-success-500/50 ring-1 ring-success-500/50' 
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                  onClick={() => !['deploying', 'validating'].includes(simulation.step) && setPodConfig('compliant')}
                >
                  <div className="font-medium text-surface-200">Compliant Pod</div>
                  <div className="text-xs text-surface-400 mt-1 font-mono">
                    {policy === 'no-root' ? 'runAsUser: 1000' : 'labels: { team: "dev" }'}
                  </div>
                </div>
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    podConfig === 'non-compliant' 
                      ? 'bg-error-500/10 border-error-500/50 ring-1 ring-error-500/50' 
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                  }`}
                  onClick={() => !['deploying', 'validating'].includes(simulation.step) && setPodConfig('non-compliant')}
                >
                  <div className="font-medium text-surface-200">Bad Pod</div>
                  <div className="text-xs text-surface-400 mt-1 font-mono">
                    {policy === 'no-root' ? 'runAsUser: 0' : 'labels: {}'}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={runSimulation}
              disabled={simulation.step !== 'idle'}
            >
              <Play className="w-4 h-4" />
              Deploy Pod
            </Button>
          </div>

          {/* Visualization Panel */}
          <div className="bg-surface-950 rounded-xl p-6 border border-surface-800 relative flex flex-col items-center justify-center min-h-[300px]">
            {/* Status Indicators */}
            {simulation.step === 'idle' && (
              <div className="text-center text-surface-500">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ready to simulate admission control</p>
              </div>
            )}

            {['deploying', 'validating'].includes(simulation.step) && (
              <div className="text-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4 border border-accent-500">
                  <Lock className="w-8 h-8 text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-accent-100 mb-1">
                  {simulation.step === 'deploying' ? 'Intercepting...' : 'Validating Policy...'}
                </h3>
                <p className="text-sm text-accent-300">Evaluating constraints</p>
              </div>
            )}

            {simulation.step === 'result' && (
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${
                  simulation.allowed 
                    ? 'bg-success-500/20 border-success-500 text-success-400' 
                    : 'bg-error-500/20 border-error-500 text-error-400'
                }`}>
                  {simulation.allowed ? <CheckCircle className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                   simulation.allowed ? 'text-success-100' : 'text-error-100'
                }`}>
                  {simulation.allowed ? 'Admission Allowed' : 'Admission Denied'}
                </h3>
                <p className={`text-sm max-w-xs mx-auto ${
                  simulation.allowed ? 'text-success-300' : 'text-error-300'
                }`}>
                  {simulation.message}
                </p>
              </div>
            )}
            
            {/* Diagram Lines (Decoration) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-700/50 to-transparent" />
          </div>
        </div>
      </div>
    </Card>
  );
}
