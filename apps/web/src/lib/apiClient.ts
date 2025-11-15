/**
 * Centralized API Client for Frontend
 * All API calls to BFF should use this client to ensure environment-driven configuration
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Get BFF URL from environment variable
const baseURL = import.meta.env.VITE_BFF_URL || 'http://localhost:3005';

// Create axios instance with default configuration
export const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true, // Include cookies for authentication
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID if available
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenantId');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please try again later.');
    }

    // Handle 500+ Server Errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

/**
 * Health check endpoint - verifies BFF and database connectivity
 */
export const checkHealth = async () => {
  return api.get('/ai/health');
};

/**
 * Generic GET request helper
 */
export const get = async <T = any>(url: string, config?: AxiosRequestConfig) => {
  const response = await api.get<T>(url, config);
  return response.data;
};

/**
 * Generic POST request helper
 */
export const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

/**
 * Generic PUT request helper
 */
export const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

/**
 * Generic PATCH request helper
 */
export const patch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

/**
 * Generic DELETE request helper
 */
export const del = async <T = any>(url: string, config?: AxiosRequestConfig) => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
