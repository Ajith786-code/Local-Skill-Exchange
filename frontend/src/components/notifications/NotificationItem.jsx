import { Bell, Ban, Check, CheckCircle2, MessageSquare, Send, X } from 'lucide-react';
import { timeAgo } from '../../utils/formatters';

const ICONS = {
  request_received: { icon: Send, color: 'bg-brand-100 text-brand-700' },
  request_accepted: { icon: Check, color: 'bg-emerald-100 text-emerald-700' },
  request_rejected: { icon: X, color: 'bg-red-100 text-red-700' },
  request_cancelled: { icon: Ban, color: 'bg-slate-200 text-slate-700' },
  completion_requested: { icon: CheckCircle2, color: 'bg-amber-100 text-amber-700' },
  request_completed: { icon: CheckCircle2, color: 'bg-brand-100 text-brand-700' },
  new_message: { icon: MessageSquare, color: 'bg-sky-100 text-sky-700' },
};

export default function NotificationItem({ notification, onOpen }) {
  const { icon: Icon, color } = ICONS[notification.type] || { icon: Bell, color: 'bg-slate-100 text-slate-600' };
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-slate-50 ${
          notification.read ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/50'
        }`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm ${notification.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{notification.message}</span>
          <span className="mt-0.5 block text-xs text-slate-500">{timeAgo(notification.createdAt)}</span>
        </span>
        {!notification.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
      </button>
    </li>
  );
}
