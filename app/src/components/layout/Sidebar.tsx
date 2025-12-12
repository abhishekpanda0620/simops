import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';
import {
  LayoutDashboard,
  Network,
  GitBranch,
  Settings,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/topology', icon: Network, label: 'K8s Architecture' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { to: '/labs', icon: BookOpen, label: 'Labs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-surface-900 border-r border-surface-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">SimOps</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-surface-300 transition-all duration-200',
                    'hover:bg-surface-800 hover:text-surface-100',
                    isActive && 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/30'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-700">
        <div className="px-3 py-2 rounded-lg bg-surface-800/50 text-center">
          <p className="text-xs text-surface-400">Phase 1A</p>
          <p className="text-sm text-surface-300 font-medium">Static Visualization</p>
        </div>
      </div>
    </aside>
  );
}
