'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { useInventory } from '@/components/providers/inventory-provider';
import { useActivity } from '@/components/providers/activity-provider';

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `Just now`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function DashboardPage() {
  const { items } = useInventory();
  const { activities } = useActivity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Dynamically calculate metrics
  const inStockCount = items.filter(i => i.status === 'In Stock').length;
  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = items.filter(i => i.status === 'Out of Stock').length;
  
  // Derive low stock objects directly from context
  const lowStockItems = items.filter(i => i.stock <= i.min && i.stock > 0);

  const stats = [
    {
      name: 'Total Products',
      value: items.length.toString(),
      change: '+1',
      changeText: 'this session',
      icon: Package,
      changeType: 'positive',
    },
    {
      name: 'In Stock',
      value: inStockCount.toString(),
      change: '100%',
      changeText: 'accurate',
      icon: TrendingUp,
      changeType: 'positive',
    },
    {
      name: 'Low Stock Alerts',
      value: lowStockCount.toString(),
      change: 'Active',
      changeText: 'needs attention',
      icon: AlertTriangle,
      changeType: 'negative',
    },
    {
      name: 'Out of Stock',
      value: outOfStockCount.toString(),
      change: 'Critical',
      changeText: 'immediate action required',
      icon: XCircle,
      changeType: 'negative',
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2621]">Dashboard</h1>
        <p className="text-sm text-[#78716c] mt-1">Welcome back. Here's an overview of your inventory.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-[#78716c]">{stat.name}</p>
              <stat.icon className="w-4 h-4 text-[#78716c]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2d2621]">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className={stat.changeType === 'positive' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {stat.change}
                </span>
                <span className="text-[#78716c]">{stat.changeText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2d2621]">Recent Activity</h2>
            <p className="text-sm text-[#78716c]">Latest inventory movements and updates</p>
          </div>
          <div className="relative border-l-2 border-[#f5f5f4] ml-3 mt-4 space-y-8 pl-6">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, i) => (
                <div key={activity.id} className="relative">
                  <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                    activity.type === 'update' ? 'bg-[#78716c]' : 
                    activity.type === 'add' ? 'bg-green-500' : 
                    activity.type === 'delete' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-[#2d2621]">{activity.action}</p>
                      <p className="text-sm text-[#78716c]">{activity.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[#2d2621]">{activity.user}</p>
                      <p className="text-xs text-[#78716c]">{mounted ? formatTimeAgo(activity.time) : ' '}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#78716c] py-4">No recent activity detected.</div>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2d2621]">Low Stock Items</h2>
            <p className="text-sm text-[#78716c]">Items that need to be restocked soon</p>
          </div>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#f5f5f4] bg-[#fafafa]">
                  <div>
                    <p className="text-sm font-semibold text-[#2d2621]">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#78716c] mt-0.5">
                      <span>{item.sku}</span>
                      <span className="w-1 h-1 rounded-full bg-[#e7e5e4]" />
                      <span className="bg-white px-1.5 py-0.5 rounded border border-[#e7e5e4]">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{item.stock}</p>
                    <p className="text-[10px] text-[#78716c]">min: {item.min}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-gray-500 border border-dashed border-[#e7e5e4] rounded-lg">
                No items currently running low.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
