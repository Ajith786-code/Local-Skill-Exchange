import api, { unwrap } from './axios';

export const register = (payload) => unwrap(api.post('/auth/register', payload));
export const login = (payload) => unwrap(api.post('/auth/login', payload));
export const logout = () => unwrap(api.post('/auth/logout'));
export const getSession = () => unwrap(api.get('/auth/me'));
