import { Badge } from '@/components/ui';
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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-surface-300 whitespace-nowrap">Scenario:</span>
      <div className="relative">
        <select
          value={currentScenarioId || 'healthy'}
          onChange={(e) => onSelectScenario(e.target.value as ScenarioId)}
          className="appearance-none bg-surface-800 border border-surface-600 text-surface-200 text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer min-w-[200px]"
        >
          {scenariosList.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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
