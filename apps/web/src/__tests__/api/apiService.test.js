import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Create a mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() }
  }
};

// Mock the entire axios module
vi.mock('axios', () => ({
  default: {
    create: () => mockAxiosInstance
  }
}));

// Import after mocking
import apiService from '../../services/apiEndpoints';

// Test data generators

const generateMockTenant = () => ({
  id: 'tenant-123',
  name: 'Test Tenant',
  domain: 'test.example.com',
  settings: { language: 'en', timezone: 'UTC' }
});

const generateMockUser = () => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenant_id: 'tenant-123'
});

const generateMockAssessment = () => ({
  id: 'assessment-123',
  title: 'Test Assessment',
  framework_id: 'framework-123',
  status: 'draft',
  progress: 0,
  tenant_id: 'tenant-123'
});

const generateMockFramework = () => ({
  id: 'framework-123',
  name: 'Test Framework',
  version: '1.0',
  description: 'Test framework description',
  controls_count: 25
});

const generateMockRisk = () => ({
  id: 'risk-123',
  title: 'Test Risk',
  description: 'Test risk description',
  impact: 'high',
  probability: 'medium',
  status: 'open'
});

// API Response Helpers
const createSuccessResponse = (data) => ({
  data: { success: true, data },
  status: 200,
  statusText: 'OK'
});

const createErrorResponse = (message = 'Error', status = 400) => ({
  response: { data: { success: false, error: message }, status },
  message
});

describe('API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Set up auth token
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('tenant_id', 'tenant-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication API', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = createSuccessResponse({ token: 'new-token', user: generateMockUser() });
      
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.auth.login(credentials);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.data.success).toBe(true);
      expect(result.data.data.token).toBe('new-token');
    });

    it('should handle login failure', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const mockError = createErrorResponse('Invalid credentials', 401);
      
      mockAxiosInstance.post.mockRejectedValueOnce(mockError);
      
      await expect(apiService.auth.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Dashboard API', () => {
    it('should fetch KPIs successfully', async () => {
      const mockKPIs = {
        total_assessments: 150,
        completed_assessments: 120,
        pending_risks: 25,
        compliance_score: 85
      };
      const mockResponse = createSuccessResponse(mockKPIs);
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.dashboard.getKPIs({ range: '30d' });
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/kpis', { 
        params: { range: '30d' } 
      });
      expect(result.data.success).toBe(true);
      expect(result.data.data.total_assessments).toBe(150);
    });
  });

  describe('Assessments API', () => {
    it('should fetch all assessments', async () => {
      const mockAssessments = [generateMockAssessment(), generateMockAssessment()];
      const mockResponse = createSuccessResponse(mockAssessments);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.assessments.getAll({ status: 'active' });
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/assessments', { 
        params: { status: 'active' } 
      });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });

    it('should create a new assessment', async () => {
      const newAssessment = {
        title: 'New Assessment',
        framework_id: 'framework-123',
        description: 'Test assessment'
      };
      const mockResponse = createSuccessResponse(generateMockAssessment());
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.assessments.create(newAssessment);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/assessments', newAssessment);
      expect(result.data.success).toBe(true);
    });

    it('should update an assessment', async () => {
      const updateData = { title: 'Updated Assessment' };
      const mockResponse = createSuccessResponse(generateMockAssessment());
      
      mockedAxios.put.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.assessments.update('assessment-123', updateData);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/assessments/assessment-123', updateData);
      expect(result.data.success).toBe(true);
    });

    it('should delete an assessment', async () => {
      const mockResponse = createSuccessResponse({ deleted: true });
      
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.assessments.delete('assessment-123');
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/assessments/assessment-123');
      expect(result.data.success).toBe(true);
    });
  });

  describe('Frameworks API', () => {
    it('should fetch all frameworks', async () => {
      const mockFrameworks = [generateMockFramework(), generateMockFramework()];
      const mockResponse = createSuccessResponse(mockFrameworks);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.frameworks.getAll();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/frameworks', { params: {} });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch framework analytics', async () => {
      const mockAnalytics = {
        total_frameworks: 10,
        active_frameworks: 8,
        controls_coverage: 75
      };
      const mockResponse = createSuccessResponse(mockAnalytics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.frameworks.getAnalytics();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/frameworks/analytics');
      expect(result.data.success).toBe(true);
      expect(result.data.data.total_frameworks).toBe(10);
    });
  });

  describe('Risks API', () => {
    it('should fetch all risks', async () => {
      const mockRisks = [generateMockRisk(), generateMockRisk()];
      const mockResponse = createSuccessResponse(mockRisks);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.risks.getAll({ status: 'open' });
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/risks', { 
        params: { status: 'open' } 
      });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });

    it('should create a new risk', async () => {
      const newRisk = {
        title: 'New Risk',
        description: 'Test risk',
        impact: 'high',
        probability: 'medium'
      };
      const mockResponse = createSuccessResponse(generateMockRisk());
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.risks.create(newRisk);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/risks', newRisk);
      expect(result.data.success).toBe(true);
    });

    it('should fetch risk metrics', async () => {
      const mockMetrics = {
        total_risks: 50,
        open_risks: 30,
        closed_risks: 20,
        high_impact_risks: 10
      };
      const mockResponse = createSuccessResponse(mockMetrics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.risks.getMetrics();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/risks/metrics');
      expect(result.data.success).toBe(true);
      expect(result.data.data.total_risks).toBe(50);
    });
  });

  describe('Organizations API', () => {
    it('should fetch all organizations', async () => {
      const mockOrganizations = [
        { id: 'org-123', name: 'Test Org', type: 'company' },
        { id: 'org-456', name: 'Another Org', type: 'partnership' }
      ];
      const mockResponse = createSuccessResponse(mockOrganizations);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.organizations.getAll();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/organizations', { params: {} });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });
  });

  describe('Documents API', () => {
    it('should fetch all documents', async () => {
      const mockDocuments = [
        { id: 'doc-123', name: 'Test Document', type: 'pdf', size: 1024 },
        { id: 'doc-456', name: 'Another Document', type: 'docx', size: 2048 }
      ];
      const mockResponse = createSuccessResponse(mockDocuments);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.documents.getAll();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/documents', { params: {} });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });

    it('should upload a document', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test content'], 'test.pdf'));
      
      const mockResponse = createSuccessResponse({ 
        id: 'doc-123', 
        name: 'test.pdf',
        uploaded: true 
      });
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.documents.upload(formData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result.data.success).toBe(true);
    });
  });

  describe('Evidence API', () => {
    it('should fetch all evidence', async () => {
      const mockEvidence = [
        { id: 'evidence-123', title: 'Test Evidence', type: 'document', status: 'valid' },
        { id: 'evidence-456', title: 'Another Evidence', type: 'image', status: 'pending' }
      ];
      const mockResponse = createSuccessResponse(mockEvidence);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.evidence.getAll();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/evidence', { params: {} });
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch evidence analytics', async () => {
      const mockAnalytics = {
        total_evidence: 100,
        valid_evidence: 80,
        pending_evidence: 15,
        expired_evidence: 5
      };
      const mockResponse = createSuccessResponse(mockAnalytics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.evidence.getAnalytics();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/evidence/analytics');
      expect(result.data.success).toBe(true);
      expect(result.data.data.total_evidence).toBe(100);
    });
  });

  describe('Monitoring API', () => {
    it('should fetch performance metrics', async () => {
      const mockMetrics = {
        cpu_usage: 45,
        memory_usage: 62,
        disk_usage: 78,
        network_io: { read: 1024, write: 512 }
      };
      const mockResponse = createSuccessResponse(mockMetrics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.monitoring.getPerformanceMetrics();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/monitoring/performance');
      expect(result.data.success).toBe(true);
      expect(result.data.data.cpu_usage).toBe(45);
    });

    it('should fetch system metrics', async () => {
      const mockMetrics = {
        uptime: 86400,
        load_average: [1.2, 1.5, 1.8],
        processes: 245
      };
      const mockResponse = createSuccessResponse(mockMetrics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.monitoring.getSystemMetrics();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/monitoring/system');
      expect(result.data.success).toBe(true);
      expect(result.data.data.uptime).toBe(86400);
    });

    it('should fetch database metrics', async () => {
      const mockMetrics = {
        connections: 25,
        queries_per_second: 45,
        slow_queries: 2,
        database_size: '1.2GB'
      };
      const mockResponse = createSuccessResponse(mockMetrics);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.monitoring.getDatabaseMetrics();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/monitoring/database');
      expect(result.data.success).toBe(true);
      expect(result.data.data.connections).toBe(25);
    });

    it('should fetch alert history', async () => {
      const mockAlerts = [
        { id: 'alert-123', type: 'warning', message: 'High CPU usage', timestamp: new Date() },
        { id: 'alert-456', type: 'error', message: 'Database connection failed', timestamp: new Date() }
      ];
      const mockResponse = createSuccessResponse(mockAlerts);
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.monitoring.getAlertHistory(10);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/monitoring/alerts?limit=10');
      expect(result.data.success).toBe(true);
      expect(result.data.data).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const mockError = createErrorResponse('Unauthorized', 401);
      
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      
      await expect(apiService.dashboard.getKPIs()).rejects.toThrow('Unauthorized');
      
      // Verify that auth token was removed and redirect happened
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);
      
      await expect(apiService.dashboard.getKPIs()).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const serverError = createErrorResponse('Internal Server Error', 500);
      
      mockAxiosInstance.get.mockRejectedValueOnce(serverError);
      
      await expect(apiService.dashboard.getKPIs()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('Request Interceptors', () => {
    it('should add auth token to requests', async () => {
      const mockResponse = createSuccessResponse({ data: 'test' });
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      await apiService.dashboard.getKPIs();
      
      // Verify the request config includes auth token
      const requestCall = mockAxiosInstance.get.mock.calls[0];
      expect(requestCall[1].headers.Authorization).toBe('Bearer test-token');
    });

    it('should add tenant_id to request params', async () => {
      const mockResponse = createSuccessResponse({ data: 'test' });
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      await apiService.dashboard.getKPIs();
      
      // Verify the request config includes tenant_id
      const requestCall = mockedAxios.get.mock.calls[0];
      expect(requestCall[1].params.tenant_id).toBe('tenant-123');
    });
  });
});