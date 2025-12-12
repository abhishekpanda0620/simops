import { useEffect } from 'react';
import { Header } from '@/components/layout';
import { ArchitectureView } from '@/components/topology';
import { useClusterStore } from '@/store';


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

      {/* Architecture View - handles both User Request and Control Plane modes */}
      <div className="flex-1 overflow-hidden">
        <ArchitectureView 
          cluster={currentCluster} 
          currentScenarioId={currentScenarioId}
          onSelectScenario={(id) => loadScenario(id)}
          onKillPod={killPod} 
        />
      </div>
    </div>
  );
}
