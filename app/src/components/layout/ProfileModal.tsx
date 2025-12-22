import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserCircle, Mail, User, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotificationStore } from '@/store';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, isGuest } = useAuth();
  const { addNotification } = useNotificationStore();
  
  // Use user values as initial state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset form when modal opens
  const resetForm = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (!name.trim() || !email.trim()) return;
    
    setIsSaving(true);
    
    // TODO: Add profile update API call here
    // For now, just simulate and show coming soon
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addNotification('Profile update coming soon!', 'info');
    setIsSaving(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            onAnimationStart={resetForm}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-surface-100">Edit Profile</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-4 space-y-4">
              {/* Guest Warning */}
              {isGuest && (
                <div className="flex items-center gap-2 p-3 bg-warning-500/10 border border-warning-500/30 rounded-lg text-warning-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Guest accounts cannot edit profile. Register for a full account.</span>
                </div>
              )}

              {/* Avatar Preview */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isGuest}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isGuest}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Role
                </label>
                <div className="px-3 py-2 bg-surface-800/50 border border-surface-700 rounded-lg text-surface-400 capitalize">
                  {user?.role || 'Student'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                {isGuest ? (
                  <Button variant="primary" onClick={onClose} type="button">
                    Close
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={onClose} type="button">
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={!name.trim() || !email.trim() || isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
