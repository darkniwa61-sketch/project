'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Notification = {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setAlerts: (alerts: Omit<Notification, 'timestamp'>[]) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'timestamp'>) => {
    setNotifications((prev) => [
      ...prev,
      { ...notification, timestamp: new Date() },
    ]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Useful for completely replacing alerts (like a system sync from a table)
  const setAlerts = useCallback((alerts: Omit<Notification, 'timestamp'>[]) => {
    // Only update if stringified objects are different to prevent loops on identical alerts
    setNotifications((prev) => {
      const isSame = prev.length === alerts.length && prev.every((p, i) => p.id === alerts[i].id && p.message === alerts[i].message);
      if (isSame) return prev;
      return alerts.map(a => ({ ...a, timestamp: new Date() }));
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        setAlerts
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
