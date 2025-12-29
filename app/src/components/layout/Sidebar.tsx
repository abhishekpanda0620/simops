import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';
import {
  LayoutDashboard,
  Network,
  GitBranch,
  Settings,
  BookOpen,
  Lock,
} from 'lucide-react';

type NavItem = {
  to: string;
  icon: typeof Network;
  label: string;
  isNew?: boolean;
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    // Ungrouped items (Catalog)
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Catalog' },
    ]
  },
  {
    title: 'Simulations',
    items: [
      { to: '/topology', icon: Network, label: 'K8s Architecture' },
      { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
      { to: '/security', icon: Lock, label: 'DevSecOps', isNew: true },
    ]
  },
  {
    title: 'Practice',
    items: [
      { to: '/labs', icon: BookOpen, label: 'Labs' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  }
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
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map(({ to, icon: Icon, label, isNew }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg group',
                          'text-surface-300 transition-all duration-200',
                          'hover:bg-surface-800 hover:text-surface-100',
                          isActive && 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/30'
                        )
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium flex-1">{label}</span>
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-500/20 text-accent-400 border border-accent-500/30">
                          NEW
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-700">
        <div className="px-3 py-2 rounded-lg bg-surface-800/50 text-center">
          <p className="text-xs text-surface-400">SimOps Academy</p>
          <p className="text-sm text-surface-300 font-medium">v1.0.0 Beta</p>
        </div>
      </div>
    </aside>
  );
}
