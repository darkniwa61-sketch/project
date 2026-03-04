'use client';

import { 
  PackagePlus, 
  PackageMinus, 
  Edit2, 
  LogIn, 
  Search, 
  ArrowDownUp, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const tabs = [
  { name: 'Stock Added', icon: PackagePlus, active: true },
  { name: 'Stock Removed', icon: PackageMinus, active: false },
  { name: 'Product Edits', icon: Edit2, active: false },
  { name: 'Login History', icon: LogIn, active: false },
];

const reportData = [
  { id: 1, date: '2026-03-02', time: '10:30 AM', user: 'Carlos Reyes', role: 'Warehouse Staff', product: 'Deformed Bar 10mm x 6m', sku: 'STL-082', qtyAdded: '+200', newTotal: '1,350', notes: 'Monthly restock from Pacific Steel' },
  { id: 2, date: '2026-03-02', time: '09:15 AM', user: 'Maria Santos', role: 'Warehouse Staff', product: 'Portland Cement Type I - 40kg', sku: 'CEM-001', qtyAdded: '+500', newTotal: '2,450', notes: 'Delivery from Eagle Cement Corp' },
  { id: 3, date: '2026-03-01', time: '11:45 AM', user: 'Maria Santos', role: 'Warehouse Staff', product: 'GI Pipe 1/2 × 20ft', sku: 'PIP-005', qtyAdded: '+100', newTotal: '520', notes: 'Regular delivery from Metro Pipes' },
  { id: 4, date: '2026-03-01', time: '02:00 PM', user: 'Ana Cruz', role: 'Inventory Manager', product: 'Plywood Marine 3/4 - 4x8', sku: 'PLY-034', qtyAdded: '+75', newTotal: '245', notes: 'Emergency restock - low stock alert' },
  { id: 5, date: '2026-02-28', time: '08:00 AM', user: 'Carlos Reyes', role: 'Warehouse Staff', product: 'Hollow Blocks 4 inch', sku: 'BLK-007', qtyAdded: '+2,000', newTotal: '8,500', notes: 'Weekly delivery from ABC Blocks' },
  { id: 6, date: '2026-02-28', time: '03:20 PM', user: 'John Doe', role: 'Admin', product: 'Paint Latex White - 4L', sku: 'PNT-006', qtyAdded: '+60', newTotal: '290', notes: 'Supplier promo bulk order' },
];

export function ReportsView() {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7e5e4] pb-px overflow-x-auto scbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab.active
                ? 'border-[#c26941] text-[#2d2621] bg-white rounded-t-md border-t border-l border-r border-t-[#e7e5e4] border-l-[#e7e5e4] border-r-[#e7e5e4] -mb-px'
                : 'border-transparent text-[#78716c] hover:text-[#2d2621] hover:border-[#e7e5e4] rounded-t-md'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search by user, product, or SKU..." 
            className="pl-9 w-full bg-white border-[#e7e5e4] focus-visible:ring-[#c26941]"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7e5e4] text-[#2d2621] rounded-md text-sm font-medium hover:bg-[#f5f5f4] transition-colors shrink-0">
          <ArrowDownUp className="w-4 h-4" />
          Newest first
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#fafafa] border-b border-[#e7e5e4] text-[#78716c] font-medium">
              <tr>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Qty Added</th>
                <th className="px-6 py-4">New Total</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e5e4]">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-[#fafafa]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#2d2621]">{row.date}</p>
                    <p className="text-xs text-[#78716c] mt-0.5">{row.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#2d2621]">{row.user}</p>
                    <p className="text-xs text-[#78716c] mt-0.5">{row.role}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#2d2621]">{row.product}</td>
                  <td className="px-6 py-4 text-[#78716c]">{row.sku}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{row.qtyAdded}</td>
                  <td className="px-6 py-4 font-bold text-[#2d2621]">{row.newTotal}</td>
                  <td className="px-6 py-4 text-[#78716c] text-xs max-w-xs truncate" title={row.notes}>
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination overflow handling */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e7e5e4] bg-white">
          <p className="text-sm text-[#78716c]">Showing 1 to 6 of 8 entries</p>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded hover:bg-[#f5f5f4] text-gray-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 rounded bg-[#c26941] text-white text-sm font-medium">1</button>
            <button className="px-3 py-1 rounded hover:bg-[#f5f5f4] text-[#2d2621] text-sm font-medium transition-colors">2</button>
            <button className="p-2 rounded hover:bg-[#f5f5f4] text-[#2d2621] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
