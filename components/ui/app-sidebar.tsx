'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Hexagon
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Force refresh to clear any cached states
  };

  return (
    <div className="flex w-64 flex-col bg-[#1c1917] text-[#fafafa] border-r border-[#2d2621]">
      {/* Sidebar Header / Logo */}
      <div className="flex items-center gap-3 p-6 shrink-0 border-b border-[#2d2621]/50">
        <div className="bg-[#c26941] p-1.5 rounded-md flex items-center justify-center">
          <Hexagon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-[10px] font-bold tracking-wider text-white/70 leading-tight">INVENTORY SYSTEM</h1>
          <h2 className="text-sm font-semibold leading-tight">St. Joseph Amity Prime</h2>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-white/50 mb-4 tracking-wider">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#c26941]' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <nav className="p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === '/dashboard/settings'
              ? 'bg-white/10 text-white font-medium'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}
