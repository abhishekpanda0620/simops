import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { User, Bell, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotificationStore } from '@/store';

export function SettingsPage() {
  const { user } = useAuth();
  const { clearAll, notifications, enabled: notificationsEnabled, setEnabled } = useNotificationStore();

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
                  onClick={() => setEnabled(!notificationsEnabled)}
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
