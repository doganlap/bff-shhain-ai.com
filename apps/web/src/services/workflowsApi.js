/**
 * Workflows API Service
 * Handles workflow management, automation, and process orchestration
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

export const workflowsApi = {
  // Get all workflows
  getWorkflows: async (params = {}) => {
    const response = await api.get('/api/workflows', { params });
    return response.data;
  },

  // Get workflow by ID
  getWorkflow: async (id) => {
    const response = await api.get(`/api/workflows/${id}`);
    return response.data;
  },

  // Create new workflow
  createWorkflow: async (workflowData) => {
    const response = await api.post('/api/workflows', workflowData);
    return response.data;
  },

  // Update workflow
  updateWorkflow: async (id, workflowData) => {
    const response = await api.put(`/api/workflows/${id}`, workflowData);
    return response.data;
  },

  // Delete workflow
  deleteWorkflow: async (id) => {
    const response = await api.delete(`/api/workflows/${id}`);
    return response.data;
  },

  // Execute workflow
  executeWorkflow: async (id, executionData = {}) => {
    const response = await api.post(`/api/workflows/${id}/execute`, executionData);
    return response.data;
  },

  // Get workflow executions
  getWorkflowExecutions: async (workflowId, params = {}) => {
    const response = await api.get(`/api/workflows/${workflowId}/executions`, { params });
    return response.data;
  },

  // Get workflow templates
  getWorkflowTemplates: async () => {
    const response = await api.get('/api/workflows/templates');
    return response.data;
  },

  // Get workflow statistics
  getWorkflowStats: async () => {
    const response = await api.get('/api/workflows/stats');
    return response.data;
  }
};

export default workflowsApi;
