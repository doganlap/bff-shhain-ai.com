/**
 * Renewals API Service
 * Frontend API calls for renewal opportunities
 */

import apiService from './apiService';

const BASE_URL = '/api/renewals';

export const renewalsApi = {
  // Renewal Opportunities
  async getRenewalsPipeline(params = {}) {
    const response = await apiService.get(BASE_URL, { params });
    return response.data;
  },

  async getRenewalById(id) {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createRenewal(data) {
    const response = await apiService.post(BASE_URL, data);
    return response.data;
  },

  async updateRenewalStatus(id, status, data = {}) {
    const response = await apiService.put(`${BASE_URL}/${id}/status`, { status, ...data });
    return response.data;
  },

  async assignRenewal(id, assignedTo) {
    const response = await apiService.put(`${BASE_URL}/${id}/assign`, { assigned_to: assignedTo });
    return response.data;
  },

  async updateChurnRisk(id, churnRisk, healthScore) {
    const response = await apiService.put(`${BASE_URL}/${id}/risk`, { 
      churn_risk: churnRisk,
      health_score: healthScore 
    });
    return response.data;
  },

  // Dunning Logs
  async getDunningLogs(params = {}) {
    const response = await apiService.get(`${BASE_URL}/dunning/logs`, { params });
    return response.data;
  },

  // Analytics
  async getRenewalsSummary() {
    const response = await apiService.get(`${BASE_URL}/analytics/summary`);
    return response.data;
  },

  async getRenewalsByMonth() {
    const response = await apiService.get(`${BASE_URL}/analytics/by-month`);
    return response.data;
  }
};

export default renewalsApi;
