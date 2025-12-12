import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-sm border-b border-surface-700 flex items-center justify-between px-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-surface-100">{title}</h1>
        {subtitle && <p className="text-sm text-surface-400">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 w-64 bg-surface-800/50"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </Button>

        {/* User */}
        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}
