import { Button, Badge } from '@/components/ui';
import { CheckCircle, AlertTriangle, Database, Server, Clock, Skull } from 'lucide-react';
import type { ScenarioId } from '@/data';

interface ScenarioSelectorProps {
  currentScenarioId: ScenarioId | null;
  onSelectScenario: (scenarioId: ScenarioId) => void;
}

const scenariosList: { id: ScenarioId; label: string; icon: typeof CheckCircle; description: string; variant: 'success' | 'warning' | 'error' }[] = [
  {
    id: 'healthy',
    label: 'Healthy Cluster',
    icon: CheckCircle,
    description: 'All systems operational',
    variant: 'success',
  },
  {
    id: 'crashLoopBackOff',
    label: 'CrashLoopBackOff',
    icon: AlertTriangle,
    description: 'Container keeps crashing',
    variant: 'error',
  },
  {
    id: 'oomKilled',
    label: 'OOMKilled',
    icon: Skull,
    description: 'Out of memory',
    variant: 'error',
  },
  {
    id: 'imagePullBackOff',
    label: 'ImagePullBackOff',
    icon: Database,
    description: 'Can\'t pull image',
    variant: 'warning',
  },
  {
    id: 'pending',
    label: 'Pending Pod',
    icon: Clock,
    description: 'No resources available',
    variant: 'warning',
  },
  {
    id: 'nodeNotReady',
    label: 'Node Not Ready',
    icon: Server,
    description: 'Worker node down',
    variant: 'error',
  },
];

export function ScenarioSelector({ currentScenarioId, onSelectScenario }: ScenarioSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-sm text-surface-400 whitespace-nowrap">Simulate:</span>
      {scenariosList.map((scenario) => {
        const Icon = scenario.icon;
        const isActive = currentScenarioId === scenario.id;
        
        return (
          <Button
            key={scenario.id}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSelectScenario(scenario.id)}
            className="whitespace-nowrap gap-1.5"
          >
            <Icon className="w-3.5 h-3.5" />
            {scenario.label}
          </Button>
        );
      })}
    </div>
  );
}

export function ScenarioDescription({ scenarioId }: { scenarioId: ScenarioId | null }) {
  if (!scenarioId) return null;
  
  const scenario = scenariosList.find((s) => s.id === scenarioId);
  if (!scenario) return null;

  const Icon = scenario.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-800/50 rounded-lg">
      <Badge variant={scenario.variant} dot pulse={scenario.variant !== 'success'}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {scenario.label}
      </Badge>
      <span className="text-sm text-surface-400">{scenario.description}</span>
    </div>
  );
}
