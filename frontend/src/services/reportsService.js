import api from './api';

export const getDashboardStats = () => api.get('/reports/dashboard');
export const getAiSummary = () => api.get('/reports/ai-summary');
