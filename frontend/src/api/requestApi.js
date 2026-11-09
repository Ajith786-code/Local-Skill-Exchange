import api, { unwrap } from './axios';

export const createRequest = (payload) => unwrap(api.post('/requests', payload));
export const listRequests = (params) => unwrap(api.get('/requests', { params }));
export const getRequest = (id) => unwrap(api.get(`/requests/${id}`));
export const changeRequest = (id, action) => unwrap(api.patch(`/requests/${id}/${action}`)); // accept | reject | cancel | complete
