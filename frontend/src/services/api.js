import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tokens last 30 days, and the account behind one can be removed or have its
// role changed at any time. Without this the app kept rendering as "signed in"
// while every request quietly failed. Clear the dead session and send the user
// to the login screen instead.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isAuthEndpoint && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
