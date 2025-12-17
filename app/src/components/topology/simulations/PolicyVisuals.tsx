import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';
import { NodeAffinityVisuals } from './policies/NodeAffinityVisuals';
import { PodAntiAffinityVisuals } from './policies/PodAntiAffinityVisuals';
import { NodeSelectorVisuals } from './policies/NodeSelectorVisuals';
import { TaintVisuals } from './policies/TaintVisuals';
import { NetworkPolicyVisuals } from './policies/NetworkPolicyVisuals';
import { HPAVisuals } from './policies/HPAVisuals';
import { RBACVisuals } from './policies/RBACVisuals';

interface PolicyVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function PolicyVisuals({ scenario, state }: PolicyVisualsProps) {
  return (
    <>
      {/* Visual Feedback Refactored Components */}
      {scenario === 'simulate-hpa' && <HPAVisuals state={state} />}
      {scenario === 'simulate-rbac' && <RBACVisuals state={state} />}
      {scenario === 'simulate-node-affinity' && <NodeAffinityVisuals state={state} />}
      {scenario === 'simulate-pod-antiaffinity' && <PodAntiAffinityVisuals state={state} />}
      {scenario === 'simulate-node-selector' && <NodeSelectorVisuals state={state} />}
      {scenario === 'simulate-taints' && <TaintVisuals state={state} />}
      {scenario === 'simulate-netpol' && <NetworkPolicyVisuals state={state} />}
    </>
  );
}
