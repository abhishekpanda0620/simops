import { Bell, Search, User, MessageSquare, LogOut, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'none' | 'notifications' | 'user'>('none');
  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown('none');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "Welcome to SimOps Academy Beta!", time: "Just now", read: false },
    { id: 2, text: "New module 'Container Security' added.", time: "1 day ago", read: true },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface-900/80 backdrop-blur-sm border-b border-surface-700 flex items-center justify-between px-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-surface-100">{title}</h1>
        {subtitle && <p className="text-sm text-surface-400">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Search modules..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                alert('Search functionality coming soon!');
              }
            }}
            className="pl-10 pr-4 py-2 w-64 bg-surface-950/50 border border-surface-800 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200"
          />
        </div>

        {/* Feedback - Beta Feature */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex gap-2 text-surface-400 hover:text-primary-400"
          onClick={() => alert('Feedback form coming soon!')}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("relative", activeDropdown === 'notifications' && "bg-surface-800 text-surface-100")}
            onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? 'none' : 'notifications')}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
          </Button>

          <AnimatePresence>
            {activeDropdown === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-surface-900 border border-surface-700 rounded-lg shadow-xl overflow-hidden"
              >
                 <div className="p-3 border-b border-surface-800 flex justify-between items-center">
                    <h3 className="font-semibold text-surface-100">Notifications</h3>
                    <span className="text-xs text-primary-400 cursor-pointer hover:underline">Mark all read</span>
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                   {notifications.map(n => (
                     <div key={n.id} className={cn("p-3 border-b border-surface-800/50 hover:bg-surface-800 transition-colors cursor-pointer", !n.read && "bg-primary-500/5")}>
                       <div className="flex justify-between items-start mb-1">
                          <p className={cn("text-sm", !n.read ? "text-surface-100 font-medium" : "text-surface-300")}>{n.text}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />}
                       </div>
                       <p className="text-xs text-surface-500">{n.time}</p>
                     </div>
                   ))}
                 </div>
                 <div className="p-2 text-center border-t border-surface-800">
                   <button className="text-xs text-surface-400 hover:text-surface-200 transition-colors">View all history</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="relative flex items-center gap-3 pl-2 border-l border-surface-700" ref={userRef}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-surface-200">User</p>
            <p className="text-xs text-primary-400">Student</p>
          </div>
          <button 
            type="button"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ring-2 ring-surface-900 transition-transform hover:scale-105 active:scale-95"
            onClick={() => setActiveDropdown(activeDropdown === 'user' ? 'none' : 'user')}
          >
            <User className="w-5 h-5 text-white" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 bg-surface-900 border border-surface-700 rounded-lg shadow-xl overflow-hidden py-1"
              >
                  <div className="px-4 py-3 border-b border-surface-800 mb-1">
                      <p className="font-medium text-surface-100">Abhishek Panda</p>
                      <p className="text-xs text-surface-400 truncate">abhishek@simops.academy</p>
                  </div>
                  
                  <button type="button" className="w-full text-left px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-primary-400 flex items-center gap-2 transition-colors">
                    <UserCircle className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button type="button" className="w-full text-left px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-primary-400 flex items-center gap-2 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-surface-800 my-1"></div>
                  
                  <button 
                    type="button" 
                    className="w-full text-left px-4 py-2 text-sm text-error-400 hover:bg-error-500/10 hover:text-error-300 flex items-center gap-2 transition-colors"
                    onClick={() => {
                      logout();
                      setActiveDropdown('none');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
