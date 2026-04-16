'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { useProfile } from '@/components/providers/profile-provider';
import { Users } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Admin', href: '/dashboard/users', icon: Users, reqAdmin: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { profile, isLoading } = useProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleToggle = () => setIsOpen(prev => !prev);
    document.addEventListener('toggleMobileSidebar', handleToggle);
    return () => document.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  // auto-close on navigate on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Force refresh to clear any cached states
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1c1917] text-[#fafafa] border-r border-[#2d2621] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Sidebar Header / Logo */}
      <div className="flex items-center gap-3 p-6 shrink-0 border-b border-white/5">
        <div className="bg-[#06b6d4] p-1.5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Zap className="w-5 h-5 text-black" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-[10px] font-bold tracking-widest text-[#06b6d4] leading-tight uppercase">Management</h1>
          <h2 className="text-sm font-bold leading-tight text-white tracking-tight">R&J</h2>
          <h3 className="text-[9px] text-white/40 font-medium mt-1 uppercase tracking-tighter">Role: {profile ? profile.role : (isLoading ? 'loading...' : 'none')}</h3>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-white/50 mb-4 tracking-wider">Main Menu</p>
        {navItems.map((item) => {
          if (item.reqAdmin) {
            if (!isMounted) return null; // Prevent hydration error by waiting for client
            if (profile?.role !== 'admin') return null;
          }
          
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive 
                  ? 'bg-[#06b6d4]/10 text-[#06b6d4] font-semibold' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#06b6d4]' : ''}`} />
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
    </>
  );
}
