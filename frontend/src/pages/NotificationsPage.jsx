import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { ListSkeleton } from '../components/common/Skeleton';
import NotificationItem from '../components/notifications/NotificationItem';
import useFetch from '../hooks/useFetch';
import { useNotifications } from '../context/NotificationContext';
import * as notificationApi from '../api/notificationApi';
import { getErrorMessage } from '../api/axios';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { setUnreadCount, latest } = useNotifications();
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { data, loading, error, reload, setData } = useFetch(
    () => notificationApi.listNotifications({ page, limit: 15, unread: onlyUnread ? 'true' : undefined }),
    [page, onlyUnread]
  );

  // A notification pushed over the socket while this page is open appears right away.
  useEffect(() => {
    if (latest && page === 1) {
      setData((d) => (d && !d.items.some((n) => n.id === latest.id) ? { ...d, items: [latest, ...d.items].slice(0, 15), unreadCount: d.unreadCount + 1 } : d));
    }
  }, [latest, page, setData]);

  const open = async (n) => {
    if (!n.read) {
      try {
        const res = await notificationApi.markRead(n.id);
        setUnreadCount(res.unreadCount);
        setData((d) => d && { ...d, unreadCount: res.unreadCount, items: d.items.map((x) => (x.id === n.id ? { ...x, read: true } : x)) });
      } catch (err) {
        toast.error(getErrorMessage(err));
        return;
      }
    }
    if (n.link) navigate(n.link);
  };

  const readAll = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={data ? `${data.unreadCount} unread` : undefined}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => { setOnlyUnread((v) => !v); setPage(1); }} aria-pressed={onlyUnread}>{onlyUnread ? 'Show all' : 'Unread only'}</button>
            <button type="button" className="btn-primary" onClick={readAll} disabled={!data || data.unreadCount === 0}><CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all as read</button>
          </>
        }
      />
      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Bell} title={onlyUnread ? 'No unread notifications' : 'No notifications yet'} description="You will be notified about requests, acceptances, completions and new messages." />
      ) : (
        <>
          <ul className="space-y-2">{data.items.map((n) => <NotificationItem key={n.id} notification={n} onOpen={open} />)}</ul>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
