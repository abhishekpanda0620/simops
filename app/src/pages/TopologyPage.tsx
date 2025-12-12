import { useEffect } from 'react';
import { Header } from '@/components/layout';
import { ArchitectureView, ScenarioSelector, ScenarioDescription } from '@/components/topology';
import { useClusterStore } from '@/store';
import type { ScenarioId } from '@/data';

export function TopologyPage() {
  const { currentCluster, currentScenarioId, loadScenario, killPod } = useClusterStore();

  useEffect(() => {
    if (!currentCluster) {
      loadScenario('healthy');
    }
  }, [currentCluster, loadScenario]);

  if (!currentCluster) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Kubernetes Architecture"
        subtitle="Click any component to learn what it does"
      />

      {/* Scenario Selector */}
      <div className="px-6 py-3 border-b border-surface-700 bg-surface-900/50 space-y-3">
        <ScenarioSelector
          currentScenarioId={currentScenarioId}
          onSelectScenario={(id: ScenarioId) => loadScenario(id)}
        />
        <ScenarioDescription scenarioId={currentScenarioId} />
      </div>

      {/* Architecture View */}
      <div className="flex-1 overflow-hidden">
        <ArchitectureView cluster={currentCluster} onKillPod={killPod} />
      </div>
    </div>
  );
}
