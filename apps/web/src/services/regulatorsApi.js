/**
 * Regulators API Service
 * Handles regulatory body management, rules, and compliance tracking
 */

import axios from 'axios';
import { translationAPI } from './translationApi';

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

export const regulatorsApi = {
  // Get all regulators
  getRegulators: async (params = {}) => {
    const response = await api.get('/api/regulators', { params });
    return response.data;
  },

  // Get regulator by ID
  getRegulator: async (id) => {
    const response = await api.get(`/api/regulators/${id}`);
    return response.data;
  },

  // Create new regulator
  createRegulator: async (regulatorData) => {
    const response = await api.post('/api/regulators', regulatorData);
    return response.data;
  },

  // Update regulator
  updateRegulator: async (id, regulatorData) => {
    const response = await api.put(`/api/regulators/${id}`, regulatorData);
    return response.data;
  },

  // Delete regulator
  deleteRegulator: async (id) => {
    const response = await api.delete(`/api/regulators/${id}`);
    return response.data;
  },

  // Get regulator rules
  getRegulatorRules: async (regulatorId, params = {}) => {
    const response = await api.get(`/api/regulators/${regulatorId}/rules`, { params });
    return response.data;
  },

  // Create regulator rule
  createRegulatorRule: async (regulatorId, ruleData) => {
    const response = await api.post(`/api/regulators/${regulatorId}/rules`, ruleData);
    return response.data;
  },

  // Get regulator frameworks
  getRegulatorFrameworks: async (regulatorId) => {
    const response = await api.get(`/api/regulators/${regulatorId}/frameworks`);
    return response.data;
  },

  // Get regulator updates
  getRegulatorUpdates: async (regulatorId, params = {}) => {
    const response = await api.get(`/api/regulators/${regulatorId}/updates`, { params });
    return response.data;
  },

  // Get KSA specific regulators
  getKSARegulators: async () => {
    const response = await api.get('/api/ksa-grc/regulators');
    return response.data;
  },

  // Get regulator statistics
  getRegulatorStats: async () => {
    const response = await api.get('/api/regulators/stats');
    return response.data;
  },

  // Get regulatory changes with translation support
  getRegulatoryChanges: async (regulatorId = null, params = {}) => {
    const endpoint = regulatorId 
      ? `/api/regulators/${regulatorId}/changes` 
      : '/api/regulators/changes';
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  // Get translated regulatory content
  getTranslatedContent: async (contentId, targetLanguage = 'en') => {
    try {
      const response = await api.get(`/api/regulators/content/${contentId}`);
      const content = response.data;
      
      // Translate if needed
      if (targetLanguage !== content.original_language) {
        const translatedContent = await translationAPI.translateRegulatoryChange(
          content, 
          targetLanguage
        );
        return translatedContent;
      }
      
      return content;
    } catch (error) {
      console.error('Error fetching translated content:', error);
      throw error;
    }
  },

  // Get regulatory intelligence feed
  getRegulatoryFeed: async (params = {}) => {
    const response = await api.get('/api/regulatory-intelligence/feed', { params });
    return response.data;
  },

  // Get compliance calendar events
  getComplianceCalendar: async (params = {}) => {
    const response = await api.get('/api/regulatory-intelligence/calendar', { params });
    return response.data;
  },

  // Get impact assessment for regulatory change
  getImpactAssessment: async (changeId) => {
    const response = await api.get(`/api/regulatory-intelligence/impact/${changeId}`);
    return response.data;
  },

  // Subscribe to regulatory updates
  subscribeToUpdates: async (subscriptionData) => {
    const response = await api.post('/api/regulatory-intelligence/subscribe', subscriptionData);
    return response.data;
  },

  // Get regulatory statistics with real-time data
  getRegulatoryStats: async () => {
    const response = await api.get('/api/regulatory-intelligence/stats');
    return response.data;
  }
};

export default regulatorsApi;
