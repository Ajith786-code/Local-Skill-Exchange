import api, { unwrap } from './axios';

export const listMessages = (requestId, params) => unwrap(api.get(`/requests/${requestId}/messages`, { params }));
export const sendMessage = (requestId, text) => unwrap(api.post(`/requests/${requestId}/messages`, { text }));
export const listConversations = () => unwrap(api.get('/conversations'));
