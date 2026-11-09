import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
            </Link>
            <button type="button" onClick={handleLogout} className="btn-ghost btn-sm" aria-label="Log out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
