'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Photo Gallery', path: '/admin/gallery', icon: '🖼️' },
  { label: 'Video Gallery', path: '/admin/videos', icon: '🎥' },
  { label: 'Live Darshan', path: '/admin/live-darshan', icon: '🛕' },
  { label: 'Members', path: '/admin/members', icon: '👥' },
  { label: 'Donations', path: '/admin/donations', icon: '💰' },
  { label: 'Contacts', path: '/admin/contacts', icon: '📩' },
  { label: 'Instagram CMS', path: '/admin/instagram', icon: '📸' },
  { label: 'Announcements', path: '/admin/announcements', icon: '📢' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  { label: 'Aarti Booking', path: '/admin/aarti', icon: '🏵️' },
  { label: 'Events CMS', path: '/admin/events', icon: '📅' },
  { label: 'Google Map', path: '/admin/map', icon: '🗺️' },
  { label: 'Media Manager', path: '/admin/media', icon: '📁' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const res = await fetch(getApiUrl('/auth/me'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        if (data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch(getApiUrl('/auth/logout'), { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-amber-400 font-mono">Loading Admin Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#3F3528] flex selection:bg-[#D8BD72] selection:text-[#3F3528]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FFFDF7] border-r border-[#B89A4A]/25 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#B89A4A]/20">
          <div className="flex items-center space-x-3">
            <img src="/logo/official_logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm tracking-wider text-[#8F7430] font-heading">
              GANESH ADMIN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#776B5B] hover:text-[#3F3528]"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-[#B89A4A]/15 text-[#8F7430] border border-[#B89A4A]/30'
                    : 'text-[#776B5B] hover:bg-[#EEE7D8] hover:text-[#3F3528]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & logout bottom panel */}
        <div className="p-4 border-t border-[#B89A4A]/20 bg-[#FAF7EF]">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-[#3F3528] truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[10px] text-[#8F7430] uppercase font-mono">{admin?.role || 'Superadmin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#776B5B] hover:text-red-600 hover:bg-[#EEE7D8] rounded-lg transition-colors"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#FFFDF7]/90 border-b border-[#B89A4A]/20 sticky top-0 z-30 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-[#776B5B] hover:text-[#3F3528] text-xl"
            >
              ☰
            </button>
            <h2 className="text-sm font-semibold text-[#3F3528]">
              {navItems.find((i) => i.path === pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#8F7430] hover:underline flex items-center space-x-1 border border-[#B89A4A]/30 px-3 py-1.5 rounded-lg bg-[#B89A4A]/10"
            >
              <span>🌐 View Main Website</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 bg-[#F7F3EA] overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
