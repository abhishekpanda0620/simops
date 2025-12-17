import { useState, useEffect } from 'react';
import { useClusterStore } from '@/store';
import { useTrafficSimulation } from './useTrafficSimulation';
import { useControlPlaneSimulation } from './useControlPlaneSimulation';
import { FlowModeSelector, type FlowMode } from './FlowModeSelector';
import { EnhancedInfoPanel } from './EnhancedInfoPanel';
import { TrafficAnimationLayer } from './TrafficAnimationLayer';
import { ControlPlaneView } from './ControlPlaneView';
import { UserRequestView } from './UserRequestView';
import type { ClusterSnapshot } from '@/types';
import type { ScenarioId } from '@/data';
import type { SelectedItem } from './SelectionTypes';

interface ArchitectureViewProps {
  cluster: ClusterSnapshot;
  currentScenarioId: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
  onKillPod: (podId: string) => void;
}

export function ArchitectureView({ cluster, currentScenarioId, onSelectScenario, onKillPod }: ArchitectureViewProps) {
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [flowMode, setFlowMode] = useState<FlowMode>('user-request');

  const { 
    addPod, 
    addPVC, 
    removePod, 
    deletePodByName, 
    toggleNodeFailure, 
    evictNodePods, 
    scaleDeployment,
    addStatefulSet,
    addDaemonSet,
    addJob,
    completeJob,
    addConfigMap,
    addSecret,
    addHPA,
    updateHPA,
    addRole,
    addRoleBinding,
    updateNode
  } = useClusterStore();
  
  // Local state for traffic simulation (visual only)
  const traffic = useTrafficSimulation(
    cluster.ingresses,
    cluster.services,
    cluster.pods
  );

  // Control Plane Simulation State
  const controlPlane = useControlPlaneSimulation({ 
    addPod, 
    addPVC,
    removePod, 
    deletePodByName,
    toggleNodeFailure, 
    evictNodePods, 
    scaleDeployment,
    addStatefulSet,
    addDaemonSet,
    addJob,
    completeJob,
    addConfigMap,
    addSecret,
    addHPA,
    updateHPA,
    addRole,
    addRoleBinding,
    updateNode
  });

  // Reset selection when switching modes
  useEffect(() => {
    // eslint-disable-next-line
    setSelected(null);
  }, [flowMode]);

  return (
    <div className="flex h-full">
      {/* Main Architecture Canvas */}
      <div className="flex-1 overflow-auto p-6 bg-surface-950 relative">
        {/* Traffic Flow Animation - visual packets */}
        <TrafficAnimationLayer trafficState={traffic.state} />
        
        {/* Flow Mode Selector */}
        <div className="mb-4">
          <FlowModeSelector mode={flowMode} onModeChange={setFlowMode} />
        </div>
        
        {/* Control Plane Flow View */}
        {flowMode === 'control-plane' && (
          <ControlPlaneView
            cluster={cluster}
            controlPlaneState={controlPlane.state}
            controlPlaneScenario={controlPlane.state.scenario} // scenario is part of state in useControlPlaneSimulation hook return? 
            // Wait, check useControlPlaneSimulation hook return structure. ArchitectureView line 130: scenario={controlPlane.state.scenario}
            // But ArchitectureView line 131: onScenarioChange={controlPlane.setScenario}
            // So controlPlane object returned by hook has { state, setScenario, startSimulation, stopSimulation }
            onScenarioChange={controlPlane.setScenario}
            onStartSimulation={controlPlane.startSimulation}
            onStopSimulation={controlPlane.stopSimulation}
            onSelect={setSelected}
          />
        )}
        
        {/* User Request Flow Content */}
        {flowMode === 'user-request' && (
          <UserRequestView
            cluster={cluster}
            trafficState={traffic.state}
            trafficEndpoints={traffic.endpoints}
            onSetTrafficEndpoint={traffic.setEndpoint}
            onStartTrafficSimulation={traffic.startSimulation}
            onStopTrafficSimulation={traffic.stopSimulation}
            controlPlaneState={controlPlane.state}
            controlPlaneScenario={controlPlane.state.scenario}
            currentScenarioId={currentScenarioId}
            onSelectScenario={onSelectScenario}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      {/* Enhanced Info Panel */}
      <EnhancedInfoPanel
        selected={selected}
        cluster={cluster}
        onClose={() => setSelected(null)}
        onKillPod={onKillPod}
      />
    </div>
  );
}
