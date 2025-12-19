import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '@/store';

// Scenario data for search
const SEARCHABLE_SCENARIOS = [
  { id: 'create-pod', label: 'Create Pod', category: 'Basic Operations' },
  { id: 'get-pods', label: 'Get Pods', category: 'Basic Operations' },
  { id: 'delete-pod', label: 'Delete Pod', category: 'Basic Operations' },
  { id: 'scale-deployment', label: 'Scale Deployment', category: 'Workloads' },
  { id: 'node-failure', label: 'Node Failure Recovery', category: 'Cluster' },
  { id: 'worker-flow', label: 'Worker Node Flow', category: 'Cluster' },
  { id: 'deploy-statefulset', label: 'Deploy StatefulSet', category: 'Workloads' },
  { id: 'deploy-daemonset', label: 'Deploy DaemonSet', category: 'Workloads' },
  { id: 'run-job', label: 'Run Job', category: 'Workloads' },
  { id: 'manage-configmap', label: 'Manage ConfigMap', category: 'Configuration' },
  { id: 'manage-secret', label: 'Manage Secret', category: 'Configuration' },
  { id: 'simulate-hpa', label: 'HPA Autoscaling', category: 'Autoscaling' },
  { id: 'simulate-rbac', label: 'RBAC Access Control', category: 'Security' },
  { id: 'simulate-node-affinity', label: 'Node Affinity', category: 'Scheduling' },
  { id: 'simulate-pod-antiaffinity', label: 'Pod Anti-Affinity', category: 'Scheduling' },
  { id: 'simulate-node-selector', label: 'Node Selector', category: 'Scheduling' },
  { id: 'simulate-taints', label: 'Taints & Tolerations', category: 'Scheduling' },
  { id: 'simulate-netpol', label: 'Network Policy', category: 'Security' },
  { id: 'argocd-sync', label: 'ArgoCD Sync', category: 'Operators' },
  { id: 'certmanager-issue', label: 'Cert-Manager TLS', category: 'Operators' },
  { id: 'resource-quota', label: 'ResourceQuota', category: 'Admission' },
  { id: 'cluster-autoscaler', label: 'Cluster Autoscaler', category: 'Autoscaling' },
];

interface CommandSearchProps {
  onSelectScenario?: (scenarioId: string) => void;
}

export function CommandSearch({ onSelectScenario }: CommandSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  // Filter scenarios based on query
  const filteredScenarios = query.trim() === ''
    ? SEARCHABLE_SCENARIOS
    : SEARCHABLE_SCENARIOS.filter(s => 
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase())
      );

  // Keyboard shortcut to open (Cmd/Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredScenarios.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredScenarios[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredScenarios[selectedIndex]);
    }
  };

  const handleSelect = (scenario: typeof SEARCHABLE_SCENARIOS[0]) => {
    setIsOpen(false);
    
    // Wait for exit animation to complete, then navigate
    setTimeout(() => {
      navigate('/topology');
      
      // Dispatch custom event for scenario selection (switches to control-plane mode)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scenario-select', { detail: scenario.id }));
      }, 150); // Delay to ensure navigation completes
    }, 200); // Match exit animation duration
    
    // Notify user
    addNotification(`Loading "${scenario.label}" scenario...`, 'info');
    
    onSelectScenario?.(scenario.id);
  };

  return (
    <>
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative hidden md:flex items-center gap-2 pl-3 pr-2 py-2 w-64 bg-surface-950/50 border border-surface-800 rounded-lg text-sm text-surface-500 hover:border-surface-700 transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        <span>Search scenarios...</span>
        <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-surface-800 text-surface-400 rounded">
          Ctrl+K
        </kbd>
      </button>

      {/* Dialog Portal - renders at document body to avoid stacking context issues */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
                onClick={() => setIsOpen(false)}
              />

              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.15 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-[9999] overflow-hidden"
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800">
                  <Search className="w-5 h-5 text-surface-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search scenarios..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-surface-100 placeholder:text-surface-500 focus:outline-none"
                  />
                  <kbd className="px-2 py-1 text-xs font-medium bg-surface-800 text-surface-400 rounded">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {filteredScenarios.length === 0 ? (
                    <div className="px-4 py-8 text-center text-surface-500">
                      No scenarios found for "{query}"
                    </div>
                  ) : (
                    filteredScenarios.map((scenario, index) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleSelect(scenario)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          index === selectedIndex 
                            ? "bg-primary-500/10 text-primary-300"
                            : "text-surface-300 hover:bg-surface-800"
                        )}
                      >
                        <span className="flex-1">{scenario.label}</span>
                        <span className="text-xs text-surface-500">{scenario.category}</span>
                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-primary-400" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-surface-800 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-surface-800 text-surface-400 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-surface-800 text-surface-400 rounded">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-surface-800 text-surface-400 rounded">↵</kbd>
                    select
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
