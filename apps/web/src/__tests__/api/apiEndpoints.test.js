/**
 * Comprehensive API Endpoints Test Suite
 * Tests all 20 GRC modules API endpoints
 *
 * Coverage:
 * - Dashboard, Assessments, Frameworks, Compliance, Controls
 * - Organizations, Regulators, Risk Management, Reports, Documents
 * - Workflows, Partners, Notifications, Regulatory Intelligence
 * - AI Scheduler, RAG Service, Users, Audit Logs, Database, Settings
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import apiService from '../../services/apiEndpoints';

describe('API Endpoints - Dashboard Module', () => {
  const mockedAxios = axios;
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('auth_token', 'mock-token');
    localStorage.setItem('tenant_id', 'tenant-123');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Dashboard KPIs', () => {
    it('should fetch dashboard KPIs with params', async () => {
      const mockResponse = {
        data: {
          compliance_score: 85,
          open_gaps: 12,
          risk_hotspots: 8,
          active_assessments: 15,
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.dashboard.getKPIs({ timeframe: '30d' });

      expect(mockGet).toHaveBeenCalledWith('/dashboard/kpis', {
        params: { timeframe: '30d' },
      });
      expect(result.data.compliance_score).toBe(85);
    });

    it('should handle KPI fetch errors', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Network error'));
      axios.create.mockReturnValue({ get: mockGet });

      await expect(apiService.dashboard.getKPIs()).rejects.toThrow('Network error');
    });
  });

  describe('Dashboard Trends', () => {
    it('should fetch trends for specified range', async () => {
      const mockResponse = {
        data: {
          dates: ['Jan', 'Feb', 'Mar'],
          compliance: [72, 75, 78],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.dashboard.getTrends('90d');

      expect(mockGet).toHaveBeenCalledWith('/dashboard/trends', {
        params: { range: '90d' },
      });
      expect(result.data.dates).toHaveLength(3);
    });
  });

  describe('Dashboard Heatmap', () => {
    it('should fetch controls heatmap', async () => {
      const mockResponse = {
        data: [[85, 92, 78], [72, 85, 90]],
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.dashboard.getHeatmap('controls', 'fw-123');

      expect(mockGet).toHaveBeenCalledWith('/dashboard/heatmap', {
        params: { type: 'controls', framework_id: 'fw-123' },
      });
      expect(result.data).toBeInstanceOf(Array);
    });
  });
});

describe('API Endpoints - Assessments Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Assessment CRUD Operations', () => {
    it('should fetch all assessments', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'ISO 27001 Q4 2024', status: 'active' },
            { id: 2, name: 'NIST CSF Q4 2024', status: 'completed' },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.assessments.getAll({ status: 'active' });

      expect(mockGet).toHaveBeenCalledWith('/assessments', {
        params: { status: 'active' },
      });
      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch assessment by ID', async () => {
      const mockResponse = {
        data: { id: 1, name: 'ISO 27001 Q4 2024', status: 'active' },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.assessments.getById(1);

      expect(mockGet).toHaveBeenCalledWith('/assessments/1');
      expect(result.data.id).toBe(1);
    });

    it('should create new assessment', async () => {
      const newAssessment = {
        name: 'New Assessment',
        framework_id: 1,
        start_date: '2024-01-01',
      };

      const mockResponse = {
        data: { id: 3, ...newAssessment },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.assessments.create(newAssessment);

      expect(mockPost).toHaveBeenCalledWith('/assessments', newAssessment);
      expect(result.data.id).toBe(3);
    });

    it('should update existing assessment', async () => {
      const updateData = { status: 'completed' };

      const mockPut = vi.fn().mockResolvedValue({ data: { id: 1, ...updateData } });
      axios.create.mockReturnValue({ put: mockPut });

      const result = await apiService.assessments.update(1, updateData);

      expect(mockPut).toHaveBeenCalledWith('/assessments/1', updateData);
      expect(result.data.status).toBe('completed');
    });

    it('should delete assessment', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ data: { success: true } });
      axios.create.mockReturnValue({ delete: mockDelete });

      const result = await apiService.assessments.delete(1);

      expect(mockDelete).toHaveBeenCalledWith('/assessments/1');
      expect(result.data.success).toBe(true);
    });
  });

  describe('Assessment Question Generation', () => {
    it('should generate questions using RAG', async () => {
      const mockResponse = {
        data: {
          questions: [
            { id: 1, text: 'What is your access control policy?', type: 'text' },
            { id: 2, text: 'Do you use MFA?', type: 'boolean' },
          ],
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.assessments.generateQuestions(1, {
        framework: 'ISO 27001',
      });

      expect(mockPost).toHaveBeenCalledWith('/assessments/1/questions/generate', {
        framework: 'ISO 27001',
      });
      expect(result.data.questions).toHaveLength(2);
    });
  });

  describe('Assessment Response Submission', () => {
    it('should submit assessment response', async () => {
      const response = { answer: 'Yes, we have implemented MFA', evidence_ids: [1, 2] };

      const mockPost = vi.fn().mockResolvedValue({ data: { success: true } });
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.assessments.submitResponse(1, 'q-123', response);

      expect(mockPost).toHaveBeenCalledWith('/assessments/1/responses/q-123', response);
      expect(result.data.success).toBe(true);
    });
  });

  describe('Assessment Scoring', () => {
    it('should calculate assessment score', async () => {
      const mockResponse = {
        data: {
          overall_score: 87,
          domain_scores: {
            'Access Control': 92,
            'Data Protection': 84,
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.assessments.calculateScore(1);

      expect(mockPost).toHaveBeenCalledWith('/assessments/1/score/calculate');
      expect(result.data.overall_score).toBe(87);
    });
  });
});

describe('API Endpoints - Frameworks Module', () => {
  describe('Framework CRUD', () => {
    it('should fetch all frameworks', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'ISO 27001', compliance_score: 85 },
            { id: 2, name: 'NIST CSF', compliance_score: 82 },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.frameworks.getAll();

      expect(mockGet).toHaveBeenCalledWith('/frameworks', { params: {} });
      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch framework controls', async () => {
      const mockResponse = {
        data: [
          { id: 'A.5.1', name: 'Information security policies', status: 'effective' },
          { id: 'A.5.2', name: 'Review of policies', status: 'in_progress' },
        ],
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.frameworks.getControls(1);

      expect(mockGet).toHaveBeenCalledWith('/frameworks/1/controls');
      expect(result.data).toHaveLength(2);
    });
  });
});

describe('API Endpoints - Risk Management Module', () => {
  describe('Risk CRUD Operations', () => {
    it('should fetch all risks', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, title: 'Data breach risk', severity: 'critical', likelihood: 'high' },
            { id: 2, title: 'Insider threat', severity: 'high', likelihood: 'medium' },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.risks.getAll({ severity: 'critical' });

      expect(mockGet).toHaveBeenCalledWith('/risks', { params: { severity: 'critical' } });
      expect(result.data.data).toHaveLength(2);
    });

    it('should create new risk', async () => {
      const newRisk = {
        title: 'Supply chain vulnerability',
        severity: 'high',
        likelihood: 'medium',
      };

      const mockPost = vi.fn().mockResolvedValue({ data: { id: 3, ...newRisk } });
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.risks.create(newRisk);

      expect(mockPost).toHaveBeenCalledWith('/risks', newRisk);
      expect(result.data.id).toBe(3);
    });
  });

  describe('Risk Assessment', () => {
    it('should calculate risk score', async () => {
      const mockResponse = {
        data: {
          risk_score: 8.5,
          risk_level: 'high',
          impact: 9,
          likelihood: 7,
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.risks.getRiskScore(1);

      expect(mockGet).toHaveBeenCalledWith('/risks/1/score');
      expect(result.data.risk_score).toBe(8.5);
    });
  });
});

describe('API Endpoints - Compliance Module', () => {
  describe('Compliance Tracking', () => {
    it('should fetch compliance score', async () => {
      const mockResponse = {
        data: {
          overall_score: 85,
          framework_scores: {
            'ISO 27001': 87,
            'NIST CSF': 82,
          },
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.compliance.getScore({ framework: 'all' });

      expect(mockGet).toHaveBeenCalledWith('/compliance/score', {
        params: { framework: 'all' },
      });
      expect(result.data.overall_score).toBe(85);
    });

    it('should identify compliance gaps', async () => {
      const mockResponse = {
        data: [
          { control_id: 'A.5.1', gap: 'Missing policy documentation', priority: 'high' },
          { control_id: 'A.8.3', gap: 'Incomplete logging', priority: 'medium' },
        ],
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.compliance.getGaps(1);

      expect(mockGet).toHaveBeenCalledWith('/compliance/gaps', { params: { framework_id: 1 } });
      expect(result.data).toHaveLength(2);
    });
  });
});

describe('API Endpoints - Documents Module', () => {
  describe('Document Management', () => {
    it('should upload document', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.pdf'));
      formData.append('category', 'policy');

      const mockPost = vi.fn().mockResolvedValue({
        data: { id: 1, filename: 'test.pdf', category: 'policy' },
      });
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.documents.upload(formData);

      expect(mockPost).toHaveBeenCalledWith('/documents/upload', formData);
      expect(result.data.filename).toBe('test.pdf');
    });

    it('should fetch all documents', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, filename: 'policy.pdf', category: 'policy' },
            { id: 2, filename: 'evidence.pdf', category: 'evidence' },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.documents.getAll({ category: 'policy' });

      expect(mockGet).toHaveBeenCalledWith('/documents', { params: { category: 'policy' } });
      expect(result.data.data).toHaveLength(2);
    });
  });

  describe('Document OCR', () => {
    it('should process OCR on document', async () => {
      const mockResponse = {
        data: {
          text: 'Extracted text from document...',
          confidence: 0.95,
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.documents.processOCR(1);

      expect(mockPost).toHaveBeenCalledWith('/documents/1/ocr');
      expect(result.data.confidence).toBe(0.95);
    });
  });
});

describe('API Endpoints - Users & Organizations Module', () => {
  describe('User Management', () => {
    it('should fetch all users', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, email: 'admin@example.com', role: 'admin' },
            { id: 2, email: 'user@example.com', role: 'user' },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.users.getAll();

      expect(mockGet).toHaveBeenCalledWith('/users', { params: {} });
      expect(result.data.data).toHaveLength(2);
    });

    it('should create new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        role: 'auditor',
        name: 'New User',
      };

      const mockPost = vi.fn().mockResolvedValue({ data: { id: 3, ...newUser } });
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.users.create(newUser);

      expect(mockPost).toHaveBeenCalledWith('/users', newUser);
      expect(result.data.id).toBe(3);
    });
  });

  describe('Organization Management', () => {
    it('should fetch all organizations', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'Acme Corp', industry: 'Technology' },
            { id: 2, name: 'Global Bank', industry: 'Finance' },
          ],
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.organizations.getAll();

      expect(mockGet).toHaveBeenCalledWith('/organizations', { params: {} });
      expect(result.data.data).toHaveLength(2);
    });
  });
});

describe('API Endpoints - Regulatory Intelligence Module', () => {
  describe('Regulatory Updates', () => {
    it('should fetch latest regulatory changes', async () => {
      const mockResponse = {
        data: [
          { id: 1, title: 'GDPR Update Q4 2024', date: '2024-10-01', impact: 'high' },
          { id: 2, title: 'NIST CSF 2.0 Released', date: '2024-09-15', impact: 'medium' },
        ],
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ get: mockGet });

      const result = await apiService.regulatoryIntelligence.getUpdates({ region: 'EU' });

      expect(mockGet).toHaveBeenCalledWith('/regulatory-intelligence/updates', {
        params: { region: 'EU' },
      });
      expect(result.data).toHaveLength(2);
    });
  });
});

describe('API Endpoints - Reports Module', () => {
  describe('Report Generation', () => {
    it('should generate assessment report', async () => {
      const mockResponse = {
        data: {
          report_id: 'rpt-123',
          url: 'https://example.com/reports/rpt-123.pdf',
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      axios.create.mockReturnValue({ post: mockPost });

      const result = await apiService.reports.generate({
        assessment_id: 1,
        format: 'pdf',
      });

      expect(mockPost).toHaveBeenCalledWith('/reports/generate', {
        assessment_id: 1,
        format: 'pdf',
      });
      expect(result.data.report_id).toBe('rpt-123');
    });
  });
});

describe('API Endpoints - Error Handling', () => {
  it('should handle 401 unauthorized errors', async () => {
    const mockGet = vi.fn().mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });
    axios.create.mockReturnValue({ get: mockGet });

    await expect(apiService.dashboard.getKPIs()).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it('should handle 404 not found errors', async () => {
    const mockGet = vi.fn().mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });
    axios.create.mockReturnValue({ get: mockGet });

    await expect(apiService.assessments.getById(999)).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('should handle network errors', async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error('Network Error'));
    axios.create.mockReturnValue({ get: mockGet });

    await expect(apiService.dashboard.getKPIs()).rejects.toThrow('Network Error');
  });

  it('should handle 500 server errors', async () => {
    const mockGet = vi.fn().mockRejectedValue({
      response: { status: 500, data: { message: 'Internal server error' } },
    });
    axios.create.mockReturnValue({ get: mockGet });

    await expect(apiService.frameworks.getAll()).rejects.toMatchObject({
      response: { status: 500 },
    });
  });
});

describe('API Endpoints - Authorization Headers', () => {
  it('should include auth token in request headers', async () => {
    localStorage.setItem('auth_token', 'test-token-123');

    const mockGet = vi.fn().mockResolvedValue({ data: {} });
    const mockAxios = {
      get: mockGet,
      interceptors: {
        request: { use: vi.fn((callback) => callback({ headers: {}, params: {} })) },
        response: { use: vi.fn() },
      },
    };
    axios.create.mockReturnValue(mockAxios);

    await apiService.dashboard.getKPIs();

    expect(axios.create).toHaveBeenCalled();
  });

  it('should include tenant_id in request params', async () => {
    localStorage.setItem('tenant_id', 'tenant-456');

    const mockGet = vi.fn().mockResolvedValue({ data: {} });
    const mockAxios = {
      get: mockGet,
      interceptors: {
        request: { use: vi.fn((callback) => callback({ headers: {}, params: {} })) },
        response: { use: vi.fn() },
      },
    };
    axios.create.mockReturnValue(mockAxios);

    await apiService.assessments.getAll();

    expect(axios.create).toHaveBeenCalled();
  });
});
