import { NavLink } from 'react-router-dom';
import { Bell, Compass, Inbox, LayoutDashboard, MessageSquare, Sparkles, User, X } from 'lucide-react';
import Logo from './Logo';
import { useNotifications } from '../../context/NotificationContext';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Find skills', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Sparkles },
  { to: '/requests', label: 'Requests', icon: Inbox },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/profile', label: 'My profile', icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { unreadCount } = useNotifications();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Logo to="/dashboard" />
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="App">
          {items.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
