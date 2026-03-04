'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

export function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    min: '',
    unit: '',
    location: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine status based on stock vs min
    const stockNum = parseInt(formData.stock) || 0;
    const minNum = parseInt(formData.min) || 0;
    let status = 'In Stock';
    if (stockNum === 0) status = 'Out of Stock';
    else if (stockNum <= minNum) status = 'Low Stock';

    onAdd({
      id: Date.now(),
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      stock: stockNum,
      min: minNum,
      unit: formData.unit,
      status: status,
      location: formData.location,
    });
    
    // Reset form
    setFormData({
      name: '',
      sku: '',
      category: '',
      stock: '',
      min: '',
      unit: '',
      location: '',
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-[#e7e5e4]">
          <h2 className="text-xl font-bold text-[#2d2621]">Add New Item</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#f5f5f4] rounded-md transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Hammer Drill" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">Description</Label>
              <Input id="sku" name="sku" required value={formData.sku} onChange={handleChange} placeholder="e.g., Heavy Duty..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required value={formData.category} onChange={handleChange} placeholder="Tools" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input id="stock" name="stock" type="number" required value={formData.stock} onChange={handleChange} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Min Stock Level</Label>
              <Input id="min" name="min" type="number" required value={formData.min} onChange={handleChange} placeholder="10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" required value={formData.unit} onChange={handleChange} placeholder="pc, box, kg..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required value={formData.location} onChange={handleChange} placeholder="Warehouse A - Rack 2" />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#2d2621] bg-white border border-[#e7e5e4] rounded-md hover:bg-[#f5f5f4] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#c26941] rounded-md hover:bg-[#a55633] transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
