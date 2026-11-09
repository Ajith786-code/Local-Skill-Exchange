import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import * as notificationApi from '../api/notificationApi';
import { socket } from '../utils/socket';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState(null);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await notificationApi.listNotifications({ limit: 1 });
      setUnreadCount(data.unreadCount);
    } catch {
      /* the badge is not critical */
    }
  }, []);

  // Open the real-time connection while logged in; close it on logout.
  useEffect(() => {
    if (!userId) {
      socket.disconnect();
      setUnreadCount(0);
      setLatest(null);
      return undefined;
    }
    refreshUnread();

    const onNotification = (notification) => {
      setLatest(notification);
      setUnreadCount((n) => n + 1);
      toast(notification.message, { icon: '🔔' });
    };
    const onConnect = () => refreshUnread();
    socket.on('notification:new', onNotification);
    socket.on('connect', onConnect);
    socket.connect();
    return () => {
      socket.off('notification:new', onNotification);
      socket.off('connect', onConnect);
    };
  }, [userId, refreshUnread]);

  const value = useMemo(
    () => ({ unreadCount, setUnreadCount, refreshUnread, latest }),
    [unreadCount, refreshUnread, latest]
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}
