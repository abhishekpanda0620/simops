import { create } from 'zustand';

export interface Notification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    // Welcome notification for new users
    {
      id: 'welcome-1',
      text: 'Welcome to SimOps Academy! Start exploring Kubernetes scenarios.',
      type: 'info',
      time: new Date(),
      read: false,
    },
  ],

  addNotification: (text, type = 'info') => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text,
      type,
      time: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep max 50
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
