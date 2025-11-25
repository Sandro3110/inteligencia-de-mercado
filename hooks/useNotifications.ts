"use client";

/**
 * useNotifications - Hook for managing notifications
 * Provides notifications list, unread count, and actions
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  isConnected: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setConnected: (connected: boolean) => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],
  isConnected: false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  setConnected: (connected) => set({ isConnected: connected }),
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const useUnreadNotifications = () =>
  useNotifications((state) => state.notifications.filter((n) => !n.read));

export const useUnreadNotificationsCountFromNotifications = () =>
  useNotifications((state) => state.notifications.filter((n) => !n.read).length);

export const useNotificationsConnection = () =>
  useNotifications((state) => state.isConnected);
