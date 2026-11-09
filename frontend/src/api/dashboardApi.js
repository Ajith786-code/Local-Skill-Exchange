import api, { unwrap } from './axios';

export const getDashboard = () => unwrap(api.get('/dashboard'));
