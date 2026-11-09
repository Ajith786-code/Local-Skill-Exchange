import api, { unwrap } from './axios';

export const listNotifications = (params) => unwrap(api.get('/notifications', { params }));
export const markRead = (id) => unwrap(api.patch(`/notifications/${id}/read`));
export const markAllRead = () => unwrap(api.patch('/notifications/read-all'));
