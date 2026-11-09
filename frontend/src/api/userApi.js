import api, { unwrap } from './axios';

export const discoverUsers = (params) => unwrap(api.get('/users', { params }));
export const getUser = (id) => unwrap(api.get(`/users/${id}`));
export const updateMe = (payload) => unwrap(api.patch('/users/me', payload));
export const deleteMe = (password) => unwrap(api.delete('/users/me', { data: { password } }));
