'use client';

import { Search, Bell, Menu, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/components/providers/notification-provider';
import { useState } from 'react';

export function DashboardHeader() {
  const { notifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex h-16 items-center border-b border-[#e7e5e4] bg-white px-6 shrink-0 gap-4">
      {/* Mobile Menu Toggle (Placeholder) */}
      <button className="md:hidden p-2 text-gray-500 hover:text-gray-900">
        <Menu className="w-5 h-5" />
      </button>

      {/* Expand/Collapse sidebar toggle (Placeholder logic for now) */}
      <button className="hidden md:block p-1 text-gray-400 hover:text-gray-600 rounded">
        <Menu className="w-5 h-5" />
      </button>

      {/* Spacer to replace search bar */}
      <div className="flex-1"></div>

      <div className="flex items-center gap-6 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c26941] text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#e7e5e4] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e7e5e4] bg-[#fafafa]">
                <h3 className="text-sm font-semibold text-[#2d2621]">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-[#e7e5e4]">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-[#fafafa] transition-colors flex gap-3 items-start">
                        <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                          notification.type === 'error' ? 'text-red-500' : 'text-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm text-[#2d2621]">{notification.message}</p>
                          <p className="text-xs text-[#78716c] mt-1">
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c26941] text-xs font-bold text-white">
            JD
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-[#2d2621] leading-tight">John Doe</p>
            <p className="text-xs text-[#78716c]">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
