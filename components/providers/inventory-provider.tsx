'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Core item type matching the table structure
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
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: number, updatedData: Partial<InventoryItem>) => void;
  deleteItem: (id: number) => void;
  updateQuantity: (id: number, change: number) => void;
};

// Start with the initial hardcoded data
const initialInventoryData: InventoryItem[] = [
  { id: 1, name: 'Cement Portland Type I - 50kg', sku: 'CEM-001', category: 'Cement', stock: 450, min: 100, unit: 'bag', status: 'In Stock', location: 'Warehouse A - Rack 1' },
  { id: 2, name: 'Steel Rebar #16 - 6m', sku: 'STL-016', category: 'Steel', stock: 320, min: 50, unit: 'pc', status: 'In Stock', location: 'Warehouse B - Rack 3' },
  { id: 3, name: 'Paint Latex White - 4L', sku: 'PLW-004', category: 'Paints', stock: 5, min: 20, unit: 'can', status: 'Low Stock', location: 'Warehouse A - Rack 5' },
  { id: 4, name: 'Plywood Marine 3/4 - 4x8', sku: 'PLY-034', category: 'Wood', stock: 85, min: 30, unit: 'sheet', status: 'In Stock', location: 'Warehouse C - Rack 1' },
  { id: 5, name: 'Nail Common 2in - 1kg', sku: 'NC2-001', category: 'Hardware', stock: 8, min: 50, unit: 'kg', status: 'Low Stock', location: 'Warehouse A - Rack 7' },
  { id: 6, name: 'GI Pipe 1/2 × 20ft', sku: 'GIP-012', category: 'Plumbing', stock: 120, min: 40, unit: 'pc', status: 'In Stock', location: 'Warehouse B - Rack 5' },
  { id: 7, name: 'PVC Pipe 4in x 10ft', sku: 'PVC4-010', category: 'Plumbing', stock: 3, min: 15, unit: 'pc', status: 'Low Stock', location: 'Warehouse B - Rack 6' },
  { id: 8, name: 'Electrical Wire #14 - 75m', sku: 'EW14-075', category: 'Electrical', stock: 2, min: 10, unit: 'roll', status: 'Low Stock', location: 'Warehouse A - Rack 9' },
  { id: 9, name: 'Hollow Blocks 4in', sku: 'HB4-001', category: 'Masonry', stock: 45, min: 200, unit: 'pc', status: 'Low Stock', location: 'Warehouse C - Rack 3' },
  { id: 10, name: 'Safety Helmet - Yellow', sku: 'SHY-001', category: 'PPE', stock: 300, min: 50, unit: 'pc', status: 'In Stock', location: 'Warehouse A - Rack 2' },
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialInventoryData);

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = {
      ...item,
      id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: number, updatedItem: Partial<InventoryItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, ...updatedItem };
          newItem.status = newItem.stock === 0 ? 'Out of Stock' : newItem.stock <= newItem.min ? 'Low Stock' : 'In Stock';
          return newItem;
        }
        return item;
      })
    );
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, change: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + change);
          return {
            ...item,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= item.min ? 'Low Stock' : 'In Stock',
          };
        }
        return item;
      })
    );
  };

  return (
    <InventoryContext.Provider 
      value={{ 
        items, 
        addItem, 
        updateItem, 
        deleteItem, 
        updateQuantity 
      }}
    >
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
