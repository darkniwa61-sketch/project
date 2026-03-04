'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  status: string;
  location: string;
};

type InventoryContextType = {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: number, updatedData: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, change: number) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const supabase = createClient();

  // 1. Fetch initial data and set up realtime subscription on mount
  useEffect(() => {
    // Fetch initial items
    const fetchInventory = async () => {
      const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
      if (data) setItems(data);
      if (error) console.error("Error fetching inventory:", error);
    };

    fetchInventory();

    // 2. Subscribe to Realtime changes
    const channel = supabase
      .channel('inventory_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'inventory',
        },
        (payload) => {
          console.log('Realtime change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new as InventoryItem]);
          } 
          else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as InventoryItem) : item))
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 3. Update Database Functions (State is handled automatically by the Realtime listener above)
  
  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    // Determine status before saving
    const status = item.stock === 0 ? 'Out of Stock' : item.stock <= item.min ? 'Low Stock' : 'In Stock';
    
    // Remove id from the item before inserting since it's an auto-incrementing primary key in Supabase
    const { ...itemDataWithoutId } = item as any;
    
    const { error } = await supabase.from('inventory').insert([{ ...itemDataWithoutId, status }]);
    if (error) console.error("Error adding item:", error);
  };

  const updateItem = async (id: number, updatedItem: Partial<InventoryItem>) => {
    // If stock or min changed, we might need to recalculate status
    const currentItem = items.find(i => i.id === id);
    if (!currentItem) return;

    const newStock = updatedItem.stock ?? currentItem.stock;
    const newMin = updatedItem.min ?? currentItem.min;
    const newStatus = newStock === 0 ? 'Out of Stock' : newStock <= newMin ? 'Low Stock' : 'In Stock';

    const { error } = await supabase.from('inventory')
      .update({ ...updatedItem, status: newStatus })
      .eq('id', id);

    if (error) console.error("Error updating item:", error);
  };

  const deleteItem = async (id: number) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) console.error("Error deleting item:", error);
  };

  const updateQuantity = async (id: number, change: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newStock = Math.max(0, item.stock + change);
    const newStatus = newStock === 0 ? 'Out of Stock' : newStock <= item.min ? 'Low Stock' : 'In Stock';

    const { error } = await supabase.from('inventory')
      .update({ stock: newStock, status: newStatus })
      .eq('id', id);
      
    if (error) console.error("Error updating quantity:", error);
  };

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem, updateQuantity }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
