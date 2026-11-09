import api, { unwrap } from './axios';

export const listSkills = (params) => unwrap(api.get('/skills', { params }));
export const createSkill = (payload) => unwrap(api.post('/skills', payload));
export const deleteSkill = (id) => unwrap(api.delete(`/skills/${id}`));
