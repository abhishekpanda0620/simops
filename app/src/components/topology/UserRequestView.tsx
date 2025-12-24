import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { ScenarioSelector, ScenarioDescription } from './ScenarioSelector';
import { ControlPlaneNode } from './nodes';
import { StorageLayer } from './StorageLayer';
import { ConfigurationLayer } from './ConfigurationLayer';
import { TrafficControlsLayer } from './layers/TrafficControlsLayer';
import { IngressLayer } from './layers/IngressLayer';
import { ServicesLayer } from './layers/ServicesLayer';
import { NodesLayer } from './layers/NodesLayer';
import { PendingPodsLayer } from './layers/PendingPodsLayer';
import { DeploymentsLayer } from './layers/DeploymentsLayer';
import type { ClusterSnapshot, K8sPod } from '@/types';
import type { ScenarioId } from '@/store/slices/clusterSlice';
import type { SelectedItem } from './SelectionTypes';
import type { TrafficState } from './TrafficUtils';
import type { ControlPlaneState, ControlPlaneScenario } from './ControlPlaneUtils';

interface UserRequestViewProps {
  cluster: ClusterSnapshot;
  trafficState: TrafficState;
  trafficEndpoints: string[];
  onSetTrafficEndpoint: (endpoint: string) => void;
  onStartTrafficSimulation: () => void;
  onStopTrafficSimulation: () => void;
  controlPlaneState: ControlPlaneState;
  controlPlaneScenario: ControlPlaneScenario;
  currentScenarioId: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
  selected: SelectedItem;
  onSelect: (item: SelectedItem) => void;
}

export function UserRequestView({
  cluster,
  trafficState,
  trafficEndpoints,
  onSetTrafficEndpoint,
  onStartTrafficSimulation,
  onStopTrafficSimulation,
  controlPlaneState,
  controlPlaneScenario,
  currentScenarioId,
  onSelectScenario,
  selected,
  onSelect
}: UserRequestViewProps) {
  
  // Get pods for each node
  const podsByNode = useMemo(() => {
    const map: Record<string, K8sPod[]> = {};
    cluster.pods.forEach((pod) => {
      if (!map[pod.nodeId]) map[pod.nodeId] = [];
      map[pod.nodeId].push(pod);
    });
    return map;
  }, [cluster.pods]);

  // Worker nodes only
  const workerNodes = cluster.nodes.filter((n) => n.role === 'worker');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Scenario Presets - top control bar */}
      <div className="flex items-center justify-between gap-4 py-2 px-4 bg-surface-800/30 rounded-lg border border-surface-700/30">
        <ScenarioSelector
          currentScenarioId={currentScenarioId}
          onSelectScenario={onSelectScenario}
        />
        <ScenarioDescription scenarioId={currentScenarioId} />
      </div>

      <TrafficControlsLayer
        trafficState={trafficState}
        trafficEndpoints={trafficEndpoints}
        onSetTrafficEndpoint={onSetTrafficEndpoint}
        onStartTrafficSimulation={onStartTrafficSimulation}
        onStopTrafficSimulation={onStopTrafficSimulation}
      />

      <IngressLayer
        cluster={cluster}
        selected={selected}
        trafficState={trafficState}
        onSelect={onSelect}
      />

      <ServicesLayer
        cluster={cluster}
        selected={selected}
        trafficState={trafficState}
        onSelect={onSelect}
      />

      <NodesLayer
        workerNodes={workerNodes}
        podsByNode={podsByNode}
        selected={selected}
        trafficState={trafficState}
        controlPlaneState={controlPlaneState}
        controlPlaneScenario={controlPlaneScenario}
        onSelect={onSelect}
      />

      {/* Divider */}
      <div className="border-t border-surface-700 my-4" />

      {/* Control Plane - Separate section (not in traffic path) */}
      <div>
        <h3 
          onClick={() => onSelect({ type: 'info', data: { id: 'controlPlaneIntro' } })}
          className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2 cursor-pointer hover:text-surface-200 transition-colors group"
        >
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          Control Plane Components (Cluster Management)
          <Info className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </h3>
        <ControlPlaneNode
          controlPlane={cluster.controlPlane}
          selectedComponent={selected?.type === 'controlPlane' ? selected.data : null}
          onSelectComponent={(component) => onSelect({ type: 'controlPlane', data: component })}
        />
      </div>

      <PendingPodsLayer
        cluster={cluster}
        selected={selected}
        onSelect={onSelect}
      />

      {/* Storage Layer */}
      {cluster && (cluster.pvs?.length > 0 || cluster.pvcs?.length > 0) && (
        <StorageLayer 
          pvs={cluster.pvs} 
          pvcs={cluster.pvcs}
          onSelectPV={(pv) => onSelect({ type: 'pv', data: pv })}
          onSelectPVC={(pvc) => onSelect({ type: 'pvc', data: pvc })}
          selectedPVId={selected?.type === 'pv' ? selected.data.id : null}
          selectedPVCId={selected?.type === 'pvc' ? selected.data.id : null}
        />
      )}

      {/* Configuration Layer */}
      {cluster && (cluster.configMaps?.length > 0 || cluster.secrets?.length > 0) && (
        <ConfigurationLayer 
          configMaps={cluster.configMaps}
          secrets={cluster.secrets}
          onSelectConfigMap={(cm) => onSelect({ type: 'configMap', data: cm })}
          onSelectSecret={(secret) => onSelect({ type: 'secret', data: secret })}
          selectedConfigMapId={selected?.type === 'configMap' ? selected.data.id : null}
          selectedSecretId={selected?.type === 'secret' ? selected.data.id : null}
        />
      )}

      <DeploymentsLayer
        cluster={cluster}
        selected={selected}
        onSelect={onSelect}
      />

    </div>
  );
}
