/**
 * Usage API Service
 * Frontend API calls for usage tracking & enforcement
 */

import apiService from './apiService';

const BASE_URL = '/usage';

export const usageApi = {
  // Entitlement Checks
  async checkEntitlement(tenantId, featureCode) {
    const response = await apiService.get(`${BASE_URL}/check-entitlement`, {
      params: { tenant_id: tenantId, feature_code: featureCode }
    });
    return response.data;
  },

  async checkUsageLimit(tenantId, usageType) {
    const response = await apiService.get(`${BASE_URL}/check-limit`, {
      params: { tenant_id: tenantId, usage_type: usageType }
    });
    return response.data;
  },

  // Usage Tracking
  async trackUsage(data) {
    const response = await apiService.post(`${BASE_URL}/track`, data);
    return response.data;
  },

  async getTenantUsage(tenantId) {
    const response = await apiService.get(`${BASE_URL}/tenant/${tenantId}`);
    return response.data;
  },

  async getTenantUsageHistory(tenantId, params = {}) {
    const response = await apiService.get(`${BASE_URL}/tenant/${tenantId}/history`, { params });
    return response.data;
  },

  // Warnings
  async getUsageWarnings(threshold = 80) {
    const response = await apiService.get(`${BASE_URL}/warnings`, {
      params: { threshold }
    });
    return response.data;
  },

  // License Events
  async getLicenseEvents(tenantLicenseId, limit = 50) {
    const response = await apiService.get(`${BASE_URL}/events/${tenantLicenseId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Platform Analytics
  async getPlatformAnalytics() {
    const response = await apiService.get(`${BASE_URL}/analytics/platform`);
    return response.data;
  },

  async getRevenueAnalytics() {
    const response = await apiService.get(`${BASE_URL}/analytics/revenue`);
    return response.data;
  }
};

export default usageApi;
