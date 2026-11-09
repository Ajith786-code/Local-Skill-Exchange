import api, { unwrap } from './axios';

export const listMatches = (params) => unwrap(api.get('/matches', { params }));
export const matchWithUser = (id) => unwrap(api.get(`/matches/${id}`));
