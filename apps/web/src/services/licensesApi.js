/**
 * Licenses API Service
 * Frontend API calls for license management
 */

import apiService from './apiService';

const BASE_URL = '/api/licenses';

export const licensesApi = {
  // License Catalog
  async getAllLicenses(params = {}) {
    const response = await apiService.get(BASE_URL, { params });
    return response.data;
  },

  async getLicenseById(id) {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createLicense(data) {
    const response = await apiService.post(BASE_URL, data);
    return response.data;
  },

  async updateLicense(id, data) {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Tenant Licenses
  async getTenantLicenses(tenantId) {
    const response = await apiService.get(`${BASE_URL}/tenant/${tenantId}`);
    return response.data;
  },

  async assignLicense(data) {
    const response = await apiService.post(`${BASE_URL}/assign`, data);
    return response.data;
  },

  async suspendLicense(id, reason) {
    const response = await apiService.put(`${BASE_URL}/tenant/${id}/suspend`, { reason });
    return response.data;
  },

  async renewLicense(id, data) {
    const response = await apiService.put(`${BASE_URL}/tenant/${id}/renew`, data);
    return response.data;
  },

  // License Features
  async getAllFeatures(params = {}) {
    const response = await apiService.get(`${BASE_URL}/features/all`, { params });
    return response.data;
  },

  async addFeatureToLicense(licenseId, data) {
    const response = await apiService.post(`${BASE_URL}/${licenseId}/features`, data);
    return response.data;
  }
};

export default licensesApi;
