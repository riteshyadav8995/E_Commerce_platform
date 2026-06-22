import api from './api';

export const getUsers = (params) => api.get('/users', { params });
export const createUser = (data) => api.post('/users', data);
