import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  ControlPlaneScenario, 
  ControlPlaneState,
  SimulationActions
} from './ControlPlaneUtils';
import { getStartMessage } from './ControlPlaneUtils';
import { useNotificationStore } from '@/store';
import {
  runCreatePodScenario,
  runGetPodsScenario,
  runDeletePodScenario,
  runScaleDeploymentScenario,
  runDeployStatefulSetScenario,
  runDeployDaemonSetScenario,
  runJobScenario,
  runConfigMapScenario,
  runSecretScenario,
  runNodeFailureScenario,
  runWorkerFlowScenario,
  runHPAScenario,
  runRBACScenario,
  runNodeAffinityScenario,
  runPodAntiAffinityScenario,
  runNodeSelectorScenario,
  runTaintTolerationScenario,
  runArgoCDScenario,
  runCertManagerScenario,
  runResourceQuotaScenario,
  runClusterAutoscalerScenario
} from './scenarios';
import { runNetworkPolicyScenario } from './scenarios/advancedScenarios';

// Export from new location for backward compatibility if needed, or rely on ControlPlaneUtils
export type { SimulationActions };

export function useControlPlaneSimulation(actions?: SimulationActions) {
  const [state, setState] = useState<ControlPlaneState>({
    isFlowing: false,
    phase: 'idle',
    message: 'Ready to simulate Control Plane workflows',
    scenario: 'create-pod'
  });

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopSimulation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setState(prev => ({
      ...prev,
      isFlowing: false,
      phase: 'idle',
      message: 'Simulation stopped'
    }));
  }, []);

  const startSimulation = useCallback(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const scenario = state.scenario;
    setState(prev => ({
      ...prev,
      isFlowing: true,
      phase: 'kubectl',
      message: getStartMessage(scenario)
    }));

    const scenarioLabels: Record<ControlPlaneScenario, string> = {
      'create-pod': 'Create Pod',
      'get-pods': 'Get Pods',
      'delete-pod': 'Delete Pod',
      'scale-deployment': 'Scale Deployment',
      'node-failure': 'Node Failure Recovery',
      'worker-flow': 'Worker Node Flow',
      'deploy-statefulset': 'Deploy StatefulSet',
      'deploy-daemonset': 'Deploy DaemonSet',
      'run-job': 'Run Job',
      'manage-configmap': 'Manage ConfigMap',
      'manage-secret': 'Manage Secret',
      'simulate-hpa': 'HPA Autoscaling',
      'simulate-rbac': 'RBAC Access Control',
      'simulate-node-affinity': 'Node Affinity',
      'simulate-pod-antiaffinity': 'Pod Anti-Affinity',
      'simulate-node-selector': 'Node Selector',
      'simulate-taints': 'Taints & Tolerations',
      'simulate-netpol': 'Network Policy',
      'argocd-sync': 'ArgoCD Sync',
      'certmanager-issue': 'Cert-Manager TLS',
      'resource-quota': 'ResourceQuota',
      'cluster-autoscaler': 'Cluster Autoscaler',
    };

    const stop = () => {
      setState(prev => ({ ...prev, isFlowing: false }));
      // Trigger notification on completion
      const { addNotification } = useNotificationStore.getState();
      addNotification(`${scenarioLabels[scenario]} simulation completed!`, 'success');
    };

    let newTimeouts: ReturnType<typeof setTimeout>[] = [];

    switch (scenario) {
      case 'create-pod':
        newTimeouts = runCreatePodScenario(setState, stop, actions);
        break;
      case 'get-pods':
        newTimeouts = runGetPodsScenario(setState, stop);
        break;
      case 'delete-pod':
        newTimeouts = runDeletePodScenario(setState, stop, actions);
        break;
      case 'scale-deployment':
        newTimeouts = runScaleDeploymentScenario(setState, stop, actions);
        break;
      case 'deploy-statefulset':
        newTimeouts = runDeployStatefulSetScenario(setState, stop, actions);
        break;
      case 'deploy-daemonset':
        newTimeouts = runDeployDaemonSetScenario(setState, stop, actions);
        break;
      case 'run-job':
        newTimeouts = runJobScenario(setState, stop, actions);
        break;
      case 'manage-configmap':
        newTimeouts = runConfigMapScenario(setState, stop, actions);
        break;
      case 'manage-secret':
        newTimeouts = runSecretScenario(setState, stop, actions);
        break;
      case 'node-failure':
        newTimeouts = runNodeFailureScenario(setState, stop, actions);
        break;
      case 'worker-flow':
        newTimeouts = runWorkerFlowScenario(setState, stop);
        break;
      case 'simulate-hpa':
        newTimeouts = runHPAScenario(setState, stop, actions);
        break;
      case 'simulate-rbac':
        newTimeouts = runRBACScenario(setState, stop, actions);
        break;
      case 'simulate-node-affinity':
        newTimeouts = runNodeAffinityScenario(setState, stop, actions);
        break;
      case 'simulate-pod-antiaffinity':
        newTimeouts = runPodAntiAffinityScenario(setState, stop, actions);
        break;
      case 'simulate-node-selector':
        newTimeouts = runNodeSelectorScenario(setState, stop, actions);
        break;
      case 'simulate-taints':
        newTimeouts = runTaintTolerationScenario(setState, stop, actions);
        break;
      case 'simulate-netpol':
        newTimeouts = runNetworkPolicyScenario(setState, stop);
        break;
      case 'argocd-sync':
        newTimeouts = runArgoCDScenario(setState, stop, actions);
        break;
      case 'certmanager-issue':
        newTimeouts = runCertManagerScenario(setState, stop);
        break;
      case 'resource-quota':
        newTimeouts = runResourceQuotaScenario(setState, stop);
        break;
      case 'cluster-autoscaler':
        newTimeouts = runClusterAutoscalerScenario(setState, stop);
        break;
    }

    timeoutsRef.current = newTimeouts;
  }, [state.scenario, actions]);

  const setScenario = useCallback((scenario: ControlPlaneScenario) => {
    setState(prev => ({ ...prev, scenario, phase: 'idle', message: 'Ready' }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    state,
    setScenario,
    startSimulation,
    stopSimulation
  };
}
