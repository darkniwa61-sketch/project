'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ActivityType = 'add' | 'update' | 'alert' | 'delete';

export type LogEvent = {
  id: string;
  action: string;
  item: string;
  user: string;
  time: number; // Storing as timestamp for easier sorting, we'll format on render
  type: ActivityType;
  details?: string;
};

type ActivityContextType = {
  activities: LogEvent[];
  logActivity: (event: Omit<LogEvent, 'id' | 'time'>) => void;
};

// Initial placeholder data based on the dashboard design
const initialActivities: LogEvent[] = [
  { id: 'act-1', action: 'Stock updated', item: 'Cement Portland Type I - 50kg', user: 'Maria Santos', time: Date.now() - 1000 * 60 * 2, type: 'update' },
  { id: 'act-2', action: 'New item added', item: 'Steel Rebar #16 - 6m', user: 'John Doe', time: Date.now() - 1000 * 60 * 15, type: 'add' },
  { id: 'act-3', action: 'Low stock alert', item: 'Paint Latex White - 4L', user: 'System', time: Date.now() - 1000 * 60 * 60, type: 'alert' },
  { id: 'act-4', action: 'Stock updated', item: 'GI Pipe 1/2 × 20ft', user: 'Maria Santos', time: Date.now() - 1000 * 60 * 60 * 3, type: 'update' },
  { id: 'act-5', action: 'Low stock alert', item: 'Nail Common 2in - 1kg', user: 'System', time: Date.now() - 1000 * 60 * 60 * 5, type: 'alert' },
];

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<LogEvent[]>(initialActivities);

  const logActivity = (event: Omit<LogEvent, 'id' | 'time'>) => {
    const newEvent: LogEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: Date.now(),
    };
    
    // Add new event to the beginning of the array
    setActivities((prev) => [newEvent, ...prev]);
  };

  return (
    <ActivityContext.Provider value={{ activities, logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
