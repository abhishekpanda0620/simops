// Scenario-specific visual indicators for pipeline animations
import { RotateCcw, Pause, Zap, RefreshCw, Users, ArrowDown } from 'lucide-react';
import type { PipelineScenario } from './PipelineUtils';

interface ScenarioBadgeProps {
  scenario: PipelineScenario;
  isAnimating?: boolean;
}

// Main badge that shows scenario-specific indicators
export function ScenarioBadge({ scenario, isAnimating }: ScenarioBadgeProps) {
  if (!isAnimating) return null;
  
  switch (scenario) {
    case 'flaky-tests':
      return <RetryBadge />;
    case 'hotfix':
      return <HotfixBadge />;
    case 'manual-approval':
      return <ApprovalBadge />;
    case 'rollback':
      return <RollbackBadge />;
    case 'parallel-jobs':
      return <ParallelBadge />;
    default:
      return null;
  }
}

// Retry badge for flaky tests - shows attempt counter with shake
export function RetryBadge({ attempt = 1, maxAttempts = 2 }: { attempt?: number; maxAttempts?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning-500/20 border border-warning-500/50 rounded-full text-warning-400 text-xs font-medium animate-shake">
      <RefreshCw className="w-3 h-3 animate-spin-slow" />
      <span>Retry {attempt}/{maxAttempts}</span>
    </div>
  );
}

// Hotfix badge - shows FAST indicator with speed lines effect
export function HotfixBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-xs font-bold">
      <Zap className="w-3 h-3 animate-pulse" />
      <span>HOTFIX</span>
      <div className="flex gap-0.5">
        <div className="w-1 h-2 bg-orange-400/60 rounded animate-speed-line-1" />
        <div className="w-1 h-2 bg-orange-400/40 rounded animate-speed-line-2" />
        <div className="w-1 h-2 bg-orange-400/20 rounded animate-speed-line-3" />
      </div>
    </div>
  );
}

// Approval badge - shows waiting indicator with user icon
export function ApprovalBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-xs font-medium animate-blink-slow">
      <Pause className="w-3 h-3" />
      <span>Awaiting Approval</span>
      <Users className="w-3 h-3 animate-pulse" />
    </div>
  );
}

// Rollback badge - shows reverse indicator
export function RollbackBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-medium">
      <RotateCcw className="w-3 h-3 animate-spin-reverse" />
      <span>Rolling Back</span>
      <ArrowDown className="w-3 h-3 rotate-180 animate-bounce" />
    </div>
  );
}

// Parallel jobs badge - shows multiple progress indicators
export function ParallelBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-xs font-medium">
      <span>Parallel</span>
      <div className="flex gap-0.5 items-end">
        <div className="w-1 h-2 bg-cyan-400 rounded animate-parallel-bar-1" />
        <div className="w-1 h-3 bg-cyan-400 rounded animate-parallel-bar-2" />
        <div className="w-1 h-2.5 bg-cyan-400 rounded animate-parallel-bar-3" />
        <div className="w-1 h-2 bg-cyan-400 rounded animate-parallel-bar-4" />
      </div>
    </div>
  );
}

// Stage-specific indicators for timeline nodes
interface StageIndicatorProps {
  scenario: PipelineScenario;
  stageName: string;
  isActive: boolean;
}

export function StageIndicator({ scenario, stageName, isActive }: StageIndicatorProps) {
  if (!isActive) return null;
  
  const lowerName = stageName.toLowerCase();
  
  // Flaky tests - show retry on test stage
  if (scenario === 'flaky-tests' && lowerName.includes('test')) {
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
        <RetryBadge />
      </div>
    );
  }
  
  // Rollback - show rollback indicator on rollback stage
  if (scenario === 'rollback' && lowerName.includes('rollback')) {
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
        <RollbackBadge />
      </div>
    );
  }
  
  // Manual approval - show waiting on approval stage
  if (scenario === 'manual-approval' && lowerName.includes('approval')) {
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
        <ApprovalBadge />
      </div>
    );
  }
  
  // Parallel jobs - show parallel indicator on test matrix stage
  if (scenario === 'parallel-jobs' && lowerName.includes('matrix')) {
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
        <ParallelBadge />
      </div>
    );
  }
  
  return null;
}
