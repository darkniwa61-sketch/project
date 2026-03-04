'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export type ActivityType = 'add' | 'update' | 'alert' | 'delete';

export type LogEvent = {
  id: string;
  action: string;
  item: string;
  user: string;
  time: number;
  type: ActivityType;
  details?: string;
};

type ActivityContextType = {
  activities: LogEvent[];
  logActivity: (event: Omit<LogEvent, 'id' | 'time'>) => Promise<void>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<LogEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch initial activities
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('time', { ascending: false })
        .limit(20);
        
      if (data) setActivities(data as LogEvent[]);
      if (error) console.error("Error fetching activities:", error);
    };

    fetchActivities();

    // 2. Subscribe to new activities via Realtime
    const channel = supabase
      .channel('activities_db_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen for new logs
          schema: 'public',
          table: 'activities',
        },
        (payload) => {
          console.log('New activity received!', payload);
          setActivities((prev) => [payload.new as LogEvent, ...prev].slice(0, 20)); // Keep last 20
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 3. Write new activity logs to Supabase
  const logActivity = async (event: Omit<LogEvent, 'id' | 'time'>) => {
    const newEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: Date.now(),
    };
    
    const { error } = await supabase.from('activities').insert([newEvent]);
    if (error) console.error("Error logging activity:", error);
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
