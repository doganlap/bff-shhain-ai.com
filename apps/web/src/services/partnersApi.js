/**
 * Partners API Service
 * Handles partner management, relationships, and integrations
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005'; // Use BFF port

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const partnersApi = {
  // Get all partners
  getPartners: async (params = {}) => {
    const response = await api.get('/api/partners', { params });
    return response.data;
  },

  // Get partner by ID
  getPartner: async (id) => {
    const response = await api.get(`/api/partners/${id}`);
    return response.data;
  },

  // Create new partner
  createPartner: async (partnerData) => {
    const response = await api.post('/api/partners', partnerData);
    return response.data;
  },

  // Update partner
  updatePartner: async (id, partnerData) => {
    const response = await api.put(`/api/partners/${id}`, partnerData);
    return response.data;
  },

  // Delete partner
  deletePartner: async (id) => {
    const response = await api.delete(`/api/partners/${id}`);
    return response.data;
  },

  // Get partner integrations
  getPartnerIntegrations: async (partnerId) => {
    const response = await api.get(`/api/partners/${partnerId}/integrations`);
    return response.data;
  },

  // Create partner integration
  createPartnerIntegration: async (partnerId, integrationData) => {
    const response = await api.post(`/api/partners/${partnerId}/integrations`, integrationData);
    return response.data;
  },

  // Get partner contracts
  getPartnerContracts: async (partnerId) => {
    const response = await api.get(`/api/partners/${partnerId}/contracts`);
    return response.data;
  },

  // Get partner statistics
  getPartnerStats: async () => {
    const response = await api.get('/api/partners/stats');
    return response.data;
  },

  // Get partner types
  getPartnerTypes: async () => {
    const response = await api.get('/api/partners/types');
    return response.data;
  }
};

export default partnersApi;
