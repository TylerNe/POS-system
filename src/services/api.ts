import axios from 'axios';
import type { Product, PaymentMethod } from '../types';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if it's a token expiration error
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          // Try to refresh the token
          const response = await api.post('/auth/refresh');
          const { token } = response.data;
          
          // Update token in localStorage
          localStorage.setItem('auth_token', token);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Other 401 errors, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, role = 'cashier') => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: {
    items: { product_id: string; quantity: number }[];
    payment_method: PaymentMethod;
    discount?: number;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/orders/stats', { params });
    return response.data;
  },
};

// Analytics API (Admin only)
export const analyticsAPI = {
  getDailySales: async (params?: { days?: number }) => {
    const response = await api.get('/orders/analytics/daily', { params });
    return response.data;
  },

  getMonthlySales: async (params?: { months?: number }) => {
    const response = await api.get('/orders/analytics/monthly', { params });
    return response.data;
  },

  getYearlySales: async () => {
    const response = await api.get('/orders/analytics/yearly');
    return response.data;
  },

  getTopProducts: async (params?: { limit?: number; period?: string }) => {
    const response = await api.get('/orders/analytics/top-products', { params });
    return response.data;
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  create: async (userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'cashier';
  }) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },

  update: async (id: string, userData: {
    username: string;
    email: string;
    role: 'admin' | 'cashier';
    password?: string;
  }) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

// VietQR Settings API
export const vietQRAPI = {
  getSettings: async () => {
    const response = await api.get('/vietqr/settings');
    return response.data;
  },

  saveSettings: async (settings: {
    bankAccounts: Array<{
      accountNumber: string;
      accountName: string;
      bankCode: string;
      bankName: string;
      isActive: boolean;
    }>;
    defaultBankCode: string;
    qrCodeSize: number;
    autoRefresh: boolean;
    timeoutMinutes: number;
  }) => {
    const response = await api.post('/vietqr/settings', settings);
    return response.data;
  },

  updateSettings: async (settings: {
    bankAccounts: Array<{
      accountNumber: string;
      accountName: string;
      bankCode: string;
      bankName: string;
      isActive: boolean;
    }>;
    defaultBankCode: string;
    qrCodeSize: number;
    autoRefresh: boolean;
    timeoutMinutes: number;
  }) => {
    const response = await api.put('/vietqr/settings', settings);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (key: string, value: any) => {
    const response = await api.put('/settings', { key, value });
    return response.data;
  },
  getCurrency: async () => {
    const response = await api.get('/settings/currency');
    return response.data;
  },
  updateCurrency: async (currency: { code: string; symbol: string; name: string }) => {
    const response = await api.put('/settings/currency', currency);
    return response.data;
  },
  getLanguage: async () => {
    const response = await api.get('/settings/language');
    return response.data;
  },
  updateLanguage: async (language: { code: string; name: string }) => {
    const response = await api.put('/settings/language', language);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Kitchen API
export const kitchenAPI = {
  getOrders: async () => {
    const response = await api.get('/kitchen/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: 'Pending' | 'In Progress' | 'Done') => {
    const response = await api.put(`/kitchen/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default api;
