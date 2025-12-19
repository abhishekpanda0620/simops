import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { Construction, Moon, Sun, User, Bell, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotificationStore } from '@/store';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="h-full flex flex-col">
      <Header title={title} />
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-4 rounded-full bg-primary-900/30">
              <Construction className="w-12 h-12 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-surface-100 mb-2">
                Coming Soon
              </h2>
              <p className="text-surface-400">{description}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PipelinePage() {
  return (
    <PlaceholderPage
      title="CI/CD Pipeline"
      description="Calculate build metrics, visualize DAGs, and explore deployment logs in this interactive module."
    />
  );
}

export function LabsPage() {
  return (
    <PlaceholderPage
      title="Interactive Labs"
      description="Practice your skills with guided, hands-on scenarios and real-time feedback."
    />
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { clearAll, notifications } = useNotificationStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings" subtitle="Configure your preferences" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Profile Section */}
          <Card>
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Profile
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Name</span>
                <span className="text-surface-100">{user?.name || 'Guest'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Email</span>
                <span className="text-surface-100">{user?.email || 'guest@simops.academy'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Role</span>
                <span className="text-primary-400 capitalize">{user?.role || 'Student'}</span>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card>
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-primary-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                Appearance
              </h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-surface-100">Theme</p>
                  <p className="text-sm text-surface-500">Choose your preferred color scheme</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 'bg-primary-500/20 text-primary-300 border border-primary-500' : 'bg-surface-800 text-surface-400 border border-surface-700'}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'light' ? 'bg-primary-500/20 text-primary-300 border border-primary-500' : 'bg-surface-800 text-surface-400 border border-surface-700'}`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-400" />
                Notifications
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-surface-100">Enable Notifications</p>
                  <p className="text-sm text-surface-500">Receive simulation completion alerts</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-500' : 'bg-surface-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-surface-100">Clear All Notifications</p>
                  <p className="text-sm text-surface-500">{notifications.length} notification(s)</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-error-400 hover:text-error-300">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card>
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                Privacy
              </h3>
            </div>
            <div className="p-4">
              <p className="text-surface-400 text-sm">
                SimOps Academy stores all data locally in your browser. No personal data is sent to any server.
              </p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

