import api from './api';

export const getAllInventory = (params = {}) => api.get('/inventory', { params });
export const getInventoryByProduct = (productId) => api.get(`/inventory/${productId}`);
export const getStockHistory = (productId, params = {}) =>
  api.get(`/inventory/${productId}/history`, { params });
export const initializeInventory = (data) => api.post('/inventory/initialize', data);
export const adjustStock = (productId, data) =>
  api.put(`/inventory/${productId}/adjust`, data);
export const updateInventorySettings = (productId, data) =>
  api.put(`/inventory/${productId}`, data);
