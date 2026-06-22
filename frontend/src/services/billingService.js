import api from './api';

export const createBill      = (data)     => api.post('/billing', data);
export const getAllBills      = (params)   => api.get('/billing', { params });
export const getBillById     = (id)       => api.get(`/billing/${id}`);
export const cancelBill      = (id)       => api.put(`/billing/${id}/cancel`);
export const updateShippingStatus = (id, status, location, message) => api.patch(`/billing/${id}/shipping`, { status, location, message });
export const assignDeliveryBoy = (id, deliveryBoyId) => api.patch(`/billing/${id}/assign-delivery`, { deliveryBoyId });
export const getDeliveryTasks = () => api.get('/billing/delivery-tasks');
export const markPaid = (id) => api.put(`/billing/${id}/mark-paid`);
