# Control Plane Scenario Development Guide

This guide explains how to add a new Control Plane simulation scenario to SimOps.

## Files to Modify

When adding a new scenario, you must update the following files:

| File | What to Add |
|------|-------------|
| `types/kubernetes.ts` | New types (if needed) |
| `ControlPlaneUtils.ts` | Scenario type + SimulationActions |
| `scenarios/*.ts` | Scenario runner function |
| `scenarios/index.ts` | Export the new function |
| `ControlPlaneFlow.tsx` | Dropdown option |
| `ControlPlaneView.tsx` | Terminal command display |
| `useControlPlaneSimulation.ts` | Switch case |
| `simulations/*.tsx` | Visual component |
| `store/slices/*.ts` | Store actions (if needed) |
| `ArchitectureView.tsx` | Wire new store actions |
| `data/scenarios/healthy.ts` | Add empty array for new types |

## Step-by-Step Checklist

### 1. Add Types (if needed)
```typescript
// types/kubernetes.ts
export interface MyNewResource {
  id: string;
  name: string;
  // ... fields
}
```

### 2. Update ControlPlaneUtils.ts
```typescript
// Add to ControlPlaneScenario type
| 'my-new-scenario'

// Add to SimulationActions interface (if needed)
addMyResource: (resource: MyResource) => void;

// Add to getStartMessage()
case 'my-new-scenario': return '$ kubectl apply -f resource.yaml';
```

### 3. Create Scenario Runner
```typescript
// scenarios/myScenarios.ts
export function runMyNewScenario(
  setState: React.Dispatch<React.SetStateAction<ControlPlaneState>>,
  stop: () => void,
  actions?: SimulationActions
): ReturnType<typeof setTimeout>[] {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  timeouts.push(setTimeout(() => {
    setState(p => ({ ...p, phase: 'kubectl', message: 'User: Applying...' }));
  }, 1000));
  
  // ... more steps
  
  timeouts.push(setTimeout(stop, 15000));
  return timeouts;
}
```

### 4. Export from scenarios/index.ts
```typescript
export * from './myScenarios';
```

### 5. Add to Dropdown (ControlPlaneFlow.tsx)
```typescript
{ value: 'my-new-scenario', label: 'My New Scenario' },
```

### 6. Add Terminal Command (ControlPlaneView.tsx)
```tsx
{controlPlaneScenario === 'my-new-scenario' && 'kubectl apply -f resource.yaml'}
```

### 7. Wire in useControlPlaneSimulation.ts
```typescript
case 'my-new-scenario':
  newTimeouts = runMyNewScenario(setState, stop, actions);
  break;
```

### 8. Create Visual Component

Create or update a visual component in `simulations/`:

```tsx
// simulations/MyVisuals.tsx
import { cn } from '@/utils';
import type { ControlPlaneState, ControlPlaneScenario } from '../ControlPlaneUtils';

interface MyVisualsProps {
  scenario: ControlPlaneScenario;
  state: ControlPlaneState;
}

export function MyVisuals({ scenario, state }: MyVisualsProps) {
  // Return null if not this scenario
  if (scenario !== 'my-new-scenario') return null;

  // Show different visuals based on phase
  const showStep1 = ['api-server', 'etcd', 'controller'].includes(state.phase);
  const showComplete = state.phase === 'complete';

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* Your visual elements here */}
      {showStep1 && (
        <div className="p-4 rounded-lg bg-primary-500/20 border border-primary-500">
          Step 1 Visual
        </div>
      )}
      {showComplete && (
        <div className="p-3 rounded-lg bg-success-500/20 text-success-300">
          ✓ Complete!
        </div>
      )}
    </div>
  );
}
```

### 9. Wire Visuals in ControlPlaneView.tsx

**Import the component:**
```tsx
import { MyVisuals } from './simulations/MyVisuals';
```

**Add to render (after other visual components):**
```tsx
<PodVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
<WorkloadVisuals scenario={controlPlaneScenario} state={controlPlaneState} cluster={cluster} />
<ConfigVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
<NodeVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
<PolicyVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
<OperatorVisuals scenario={controlPlaneScenario} state={controlPlaneState} />
<MyVisuals scenario={controlPlaneScenario} state={controlPlaneState} />  {/* ADD THIS */}
```

### 10. Add Store Actions (if needed)
```typescript
// store/slices/workloadSlice.ts
addMyResource: (resource) => {
  const cluster = get().currentCluster;
  if (!cluster) return;
  set({
    currentCluster: {
      ...cluster,
      myResources: [...(cluster.myResources || []), resource],
    },
  });
},
```

### 11. Wire Store to ArchitectureView
```typescript
const { addMyResource } = useClusterStore();

const controlPlane = useControlPlaneSimulation({
  // ... existing actions
  addMyResource,
});
```

### 12. Update healthy.ts (if new type)
```typescript
myResources: [],
```

## Verification

Always run before committing:
```bash
npm run build && npm run lint
```

## Example Scenarios

Reference existing implementations:
- Simple: `podScenarios.ts` (Create Pod)
- With Store Actions: `workloadScenarios.ts` (Scale Deployment, StatefulSet)
- Operator Pattern: `operatorScenarios.ts` (ArgoCD)
- Policy-based: `schedulingScenarios.ts` (Node Affinity)
