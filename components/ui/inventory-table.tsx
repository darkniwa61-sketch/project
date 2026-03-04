'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Minus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddItemModal } from './add-item-modal';
import { EditItemModal } from './edit-item-modal';
import { useNotifications } from '@/components/providers/notification-provider';
import { useInventory } from '@/components/providers/inventory-provider';
import { useActivity } from '@/components/providers/activity-provider';

export function InventoryTable() {
  const { items, addItem, updateItem, deleteItem, updateQuantity } = useInventory();
  const { logActivity } = useActivity();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Custom notification hook
  const { setAlerts } = useNotifications();

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  // Derive unique categories from items array
  const uniqueCategories = Array.from(new Set(items.map(item => item.category)));

  const handleAdd = (item: any) => {
    addItem(item);
    logActivity({
      action: 'New item added',
      item: item.name,
      user: 'Current User',
      type: 'add'
    });
  };

  const handleEdit = (updatedItem: any) => {
    // Find previous state to check if we crossed the threshold
    const previousItem = items.find(i => i.id === updatedItem.id);
    updateItem(updatedItem.id, updatedItem);
    
    logActivity({
      action: 'Item details updated',
      item: updatedItem.name,
      user: 'Current User',
      type: 'update'
    });

    // Check if the edit caused stock to drop below min
    if (previousItem && updatedItem.stock <= updatedItem.min && previousItem.stock > previousItem.min && updatedItem.stock > 0) {
      logActivity({
        action: 'Low stock alert',
        item: updatedItem.name,
        user: 'System',
        type: 'alert'
      });
    }
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const itemToDelete = items.find(i => i.id === id);
      deleteItem(id);
      if (itemToDelete) {
        logActivity({
          action: 'Item deleted',
          item: itemToDelete.name,
          user: 'Current User',
          type: 'delete'
        });
      }
    }
  };

  const handleQuantityUpdate = (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    updateQuantity(id, delta);
    
    logActivity({
      action: delta > 0 ? 'Stock added' : 'Stock removed',
      item: item.name,
      user: 'Current User',
      type: 'update'
    });

    const newStock = Math.max(0, item.stock + delta);
    // Fire low stock alert if it crossed the threshold downward
    if (newStock <= item.min && item.stock > item.min && newStock > 0) {
      logActivity({
        action: 'Low stock alert',
        item: item.name,
        user: 'System',
        type: 'alert'
      });
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Derive filtered items array
  const filteredItems = items.filter(item => {
    // Search match (name, sku, location, or category)
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Category match
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    
    // Status match
    const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Keep summaries based on overall inventory data to show global health
  const inStockCount = items.filter(i => i.status === 'In Stock').length;
  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = items.filter(i => i.status === 'Out of Stock').length;

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dispatch notifications per-item when stock logic crosses thresholds globally
  useEffect(() => {
    const newAlerts: any[] = [];
    
    // Check all items to generate notifications, not just filtered ones
    items.forEach(item => {
      const isLowStock = item.stock <= item.min && item.stock > 0;
      const isOutOfStock = item.stock === 0;

      if (isOutOfStock) {
        newAlerts.push({
          id: `out-of-stock-${item.id}`,
          type: 'error' as const,
          message: `${item.name} is Out of Stock! Location: ${item.location}`
        });
      } else if (isLowStock) {
        newAlerts.push({
          id: `low-stock-${item.id}`,
          type: 'warning' as const,
          message: `${item.name} is Low Stock (${item.stock} left). Location: ${item.location}`
        });
      }
    });

    // Replace current alert array
    setAlerts(newAlerts);
  }, [items, setAlerts]);

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input 
              type="search" 
              placeholder="Search by name, SKU, location, or category..." 
              className="pl-9 w-full bg-white border-[#e7e5e4] focus-visible:ring-[#c26941]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none flex items-center gap-2 pl-3 pr-8 py-2 bg-white border border-[#e7e5e4] rounded-md text-sm text-[#2d2621] hover:bg-[#f5f5f4] transition-colors focus:outline-none focus:ring-1 focus:ring-[#c26941] cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none flex items-center gap-2 pl-3 pr-8 py-2 bg-white border border-[#e7e5e4] rounded-md text-sm text-[#2d2621] hover:bg-[#f5f5f4] transition-colors focus:outline-none focus:ring-1 focus:ring-[#c26941] cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#c26941] text-white rounded-md text-sm font-medium hover:bg-[#a55633] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Summary Row */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-[#2d2621]">Total: {items.length} items</span>
        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">In Stock: {inStockCount}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Low Stock: {lowStockCount}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Out of Stock: {outOfStockCount}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#fafafa] border-b border-[#e7e5e4] text-[#78716c] font-medium">
              <tr>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2d2621]">
                    Product Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2d2621]">
                    Stock <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Min Stock</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e5e4]">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafafa]/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#2d2621]">{item.name}</td>
                    <td className="px-6 py-4 text-[#78716c]">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#78716c] bg-[#f5f5f4] px-2 py-1 rounded">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleQuantityUpdate(item.id, -1)}
                           className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                           aria-label="Decrease quantity"
                         >
                           <Minus className="w-3 h-3" />
                         </button>
                         <span className="font-semibold text-[#2d2621] w-8 text-center">{item.stock}</span>
                         <button 
                           onClick={() => handleQuantityUpdate(item.id, 1)}
                           className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                           aria-label="Increase quantity"
                         >
                           <Plus className="w-3 h-3" />
                         </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#78716c]">{item.min}</td>
                    <td className="px-6 py-4 text-[#78716c]">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-200' : 
                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'In Stock' ? 'bg-green-500' : 
                          item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#78716c] text-xs">{item.location}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1 hover:text-[#c26941] transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:text-red-500 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e7e5e4] bg-white mt-auto">
          <p className="text-sm text-[#78716c]">
            Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-[#f5f5f4] text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-[#c26941] text-white' 
                    : 'hover:bg-[#f5f5f4] text-[#2d2621]'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded hover:bg-[#f5f5f4] text-[#2d2621] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAdd} 
      />

      <EditItemModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEdit}
        initialData={editingItem}
      />
    </div>
  );
}
