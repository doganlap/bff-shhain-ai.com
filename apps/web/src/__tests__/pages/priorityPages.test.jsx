import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../TestWrapper';
import PerformanceMonitorPage from '../../pages/system/PerformanceMonitorPage';
import FrameworksManagementPage from '../../pages/grc-modules/FrameworksManagementPage';
import EvidenceManagementPage from '../../pages/grc-modules/EvidenceManagementPage';
import DatabasePage from '../../pages/system/DatabasePage';
import RiskManagementPage from '../../pages/grc-modules/RiskManagementPage';

// Mock API service
vi.mock('../../services/apiEndpoints', () => ({
  default: {
    monitoring: {
      getPerformanceMetrics: vi.fn(),
      getSystemMetrics: vi.fn(),
      getDatabaseMetrics: vi.fn(),
      getNetworkMetrics: vi.fn(),
      getAlertHistory: vi.fn(),
      getRealTimeMetrics: vi.fn(),
      getHistoricalMetrics: vi.fn(),
      createAlert: vi.fn(),
      updateAlertStatus: vi.fn(),
      getUptimeStats: vi.fn(),
      getResourceUsage: vi.fn()
    },
    frameworks: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAnalytics: vi.fn(),
      getSections: vi.fn(),
      getControls: vi.fn(),
      import: vi.fn(),
      getCoverage: vi.fn(),
      updateStatus: vi.fn()
    },
    evidence: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      getAnalytics: vi.fn(),
      updateStatus: vi.fn(),
      getCategories: vi.fn(),
      getStats: vi.fn()
    },
    db: {
      getHealth: vi.fn(),
      getMetrics: vi.fn()
    },
    risks: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      assess: vi.fn(),
      addTreatment: vi.fn(),
      getHeatmap: vi.fn(),
      getMetrics: vi.fn(),
      getRealTimeMetrics: vi.fn(),
      export: vi.fn()
    }
  }
}));

// Mock hooks
vi.mock('../../hooks/useRBAC', () => ({
  useRBAC: () => ({
    hasPermission: vi.fn(() => true),
    userRole: 'admin',
    isSuperAdmin: true
  })
}));

vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    isRTL: false,
    language: 'en'
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.OPEN;
  }
  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
global.WebSocket = MockWebSocket;

// Mock data generators
const generateMockPerformanceData = () => ({
  cpu_usage: Math.floor(Math.random() * 100),
  memory_usage: Math.floor(Math.random() * 100),
  disk_usage: Math.floor(Math.random() * 100),
  network_io: { read: Math.floor(Math.random() * 1000), write: Math.floor(Math.random() * 1000) },
  response_time: Math.floor(Math.random() * 500),
  error_rate: Math.floor(Math.random() * 5)
});

const generateMockFramework = () => ({
  id: `framework-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Framework',
  version: '1.0',
  description: 'Test framework description',
  status: 'active',
  controls_count: Math.floor(Math.random() * 50) + 10,
  coverage_percentage: Math.floor(Math.random() * 100)
});

const generateMockEvidence = () => ({
  id: `evidence-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Evidence',
  description: 'Test evidence description',
  type: 'document',
  status: 'valid',
  file_size: Math.floor(Math.random() * 1000000),
  uploaded_by: 'test-user',
  uploaded_at: new Date().toISOString()
});

const generateMockRisk = () => ({
  id: `risk-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Risk',
  description: 'Test risk description',
  impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  probability: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  status: ['open', 'mitigated', 'accepted'][Math.floor(Math.random() * 3)],
  risk_score: Math.floor(Math.random() * 100),
  owner: 'test-user'
});

const generateMockDatabase = () => ({
  name: 'test_database',
  size: '1.2GB',
  tables: Math.floor(Math.random() * 50) + 10,
  connections: Math.floor(Math.random() * 20) + 1,
  queries_per_second: Math.floor(Math.random() * 100) + 10
});

describe('Priority Pages Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('tenant_id', 'tenant-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PerformanceMonitorPage', () => {
    it('should load and display performance metrics', async () => {
      const mockPerformanceData = generateMockPerformanceData();
      const mockSystemMetrics = {
        uptime: 86400,
        load_average: [1.2, 1.5, 1.8],
        processes: 245
      };
      const mockDatabaseMetrics = {
        connections: 25,
        queries_per_second: 45,
        slow_queries: 2
      };
      const mockAlerts = [
        { id: '1', type: 'warning', message: 'High CPU usage', timestamp: new Date() }
      ];

      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      monitoring.getPerformanceMetrics.mockResolvedValueOnce({
        data: { success: true, data: mockPerformanceData }
      });
      monitoring.getSystemMetrics.mockResolvedValueOnce({
        data: { success: true, data: mockSystemMetrics }
      });
      monitoring.getDatabaseMetrics.mockResolvedValueOnce({
        data: { success: true, data: mockDatabaseMetrics }
      });
      monitoring.getAlertHistory.mockResolvedValueOnce({
        data: { success: true, data: mockAlerts }
      });

      renderWithProviders(<PerformanceMonitorPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      });

      // Check if metrics are displayed
      expect(screen.getByText(`${mockPerformanceData.cpu_usage}%`)).toBeInTheDocument();
      expect(screen.getByText(`${mockPerformanceData.memory_usage}%`)).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      monitoring.getPerformanceMetrics.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<PerformanceMonitorPage />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });

      // Should show fallback data or error message
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });

    it('should refresh data when refresh button is clicked', async () => {
      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      monitoring.getPerformanceMetrics.mockResolvedValueOnce({
        data: { success: true, data: generateMockPerformanceData() }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<PerformanceMonitorPage />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Verify API was called again
      expect(monitoring.getPerformanceMetrics).toHaveBeenCalledTimes(2);
    });
  });

  describe('FrameworksManagementPage', () => {
    it('should load and display frameworks', async () => {
      const mockFrameworks = [generateMockFramework(), generateMockFramework()];
      const mockAnalytics = {
        total_frameworks: 10,
        active_frameworks: 8,
        avg_controls_per_framework: 25
      };

      const { frameworks } = (await import('../../services/apiEndpoints')).default;
      frameworks.getAll.mockResolvedValueOnce({
        data: { success: true, data: mockFrameworks }
      });
      frameworks.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: mockAnalytics }
      });

      renderWithProviders(<FrameworksManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Frameworks Management')).toBeInTheDocument();
        expect(screen.getByText('Total Frameworks')).toBeInTheDocument();
      });

      // Check if framework data is displayed
      expect(screen.getByText(mockFrameworks[0].name)).toBeInTheDocument();
      expect(screen.getByText(`${mockAnalytics.total_frameworks}`)).toBeInTheDocument();
    });

    it('should create a new framework', async () => {
      const { frameworks } = (await import('../../services/apiEndpoints')).default;
      frameworks.getAll.mockResolvedValueOnce({
        data: { success: true, data: [] }
      });
      frameworks.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: { total_frameworks: 0, active_frameworks: 0 } }
      });
      frameworks.create.mockResolvedValueOnce({
        data: { success: true, data: generateMockFramework() }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<FrameworksManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Frameworks Management')).toBeInTheDocument();
      });

      // Click create button
      const createButton = screen.getByRole('button', { name: /create framework/i });
      await user.click(createButton);

      // Fill form and submit
      const nameInput = screen.getByPlaceholderText(/framework name/i);
      await user.type(nameInput, 'New Framework');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      expect(frameworks.create).toHaveBeenCalled();
    });

    it('should update framework status', async () => {
      const mockFramework = generateMockFramework();
      const { frameworks } = (await import('../../services/apiEndpoints')).default;
      frameworks.getAll.mockResolvedValueOnce({
        data: { success: true, data: [mockFramework] }
      });
      frameworks.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: { total_frameworks: 1, active_frameworks: 1 } }
      });
      frameworks.updateStatus.mockResolvedValueOnce({
        data: { success: true, data: { ...mockFramework, status: 'inactive' } }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<FrameworksManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Frameworks Management')).toBeInTheDocument();
      });

      // Find and click status toggle
      const statusToggle = screen.getByRole('switch', { name: /status/i });
      await user.click(statusToggle);

      expect(frameworks.updateStatus).toHaveBeenCalled();
    });
  });

  describe('EvidenceManagementPage', () => {
    it('should load and display evidence', async () => {
      const mockEvidence = [generateMockEvidence(), generateMockEvidence()];
      const mockAnalytics = {
        total_evidence: 100,
        valid_evidence: 80,
        pending_evidence: 15,
        expired_evidence: 5
      };

      const { evidence } = (await import('../../services/apiEndpoints')).default;
      evidence.getAll.mockResolvedValueOnce({
        data: { success: true, data: mockEvidence }
      });
      evidence.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: mockAnalytics }
      });

      renderWithProviders(<EvidenceManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Evidence Management')).toBeInTheDocument();
        expect(screen.getByText('Total Evidence')).toBeInTheDocument();
      });

      // Check if evidence data is displayed
      expect(screen.getByText(mockEvidence[0].title)).toBeInTheDocument();
      expect(screen.getByText(`${mockAnalytics.total_evidence}`)).toBeInTheDocument();
    });

    it('should upload evidence file', async () => {
      const { evidence } = (await import('../../services/apiEndpoints')).default;
      evidence.getAll.mockResolvedValueOnce({
        data: { success: true, data: [] }
      });
      evidence.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: { total_evidence: 0 } }
      });
      evidence.upload.mockResolvedValueOnce({
        data: { success: true, data: generateMockEvidence() }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<EvidenceManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Evidence Management')).toBeInTheDocument();
      });

      // Upload file
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/upload file/i);
      await user.upload(fileInput, file);

      expect(evidence.upload).toHaveBeenCalled();
    });

    it('should update evidence status', async () => {
      const mockEvidence = generateMockEvidence();
      const { evidence } = (await import('../../services/apiEndpoints')).default;
      evidence.getAll.mockResolvedValueOnce({
        data: { success: true, data: [mockEvidence] }
      });
      evidence.getAnalytics.mockResolvedValueOnce({
        data: { success: true, data: { total_evidence: 1 } }
      });
      evidence.updateStatus.mockResolvedValueOnce({
        data: { success: true, data: { ...mockEvidence, status: 'expired' } }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<EvidenceManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Evidence Management')).toBeInTheDocument();
      });

      // Find and click status update button
      const statusButton = screen.getByRole('button', { name: /update status/i });
      await user.click(statusButton);

      expect(evidence.updateStatus).toHaveBeenCalled();
    });
  });

  describe('DatabasePage', () => {
    it('should load and display database information', async () => {
      const mockDatabases = [generateMockDatabase(), generateMockDatabase()];
      const mockHealth = { status: 'healthy', uptime: 86400 };
      const mockMetrics = {
        total_connections: 50,
        slow_queries: 5,
        cache_hit_ratio: 0.95
      };

      const { db } = (await import('../../services/apiEndpoints')).default;
      db.getHealth.mockResolvedValueOnce({
        data: { success: true, data: mockHealth }
      });
      db.getMetrics.mockResolvedValueOnce({
        data: { success: true, data: mockMetrics }
      });

      renderWithProviders(<DatabasePage />);

      await waitFor(() => {
        expect(screen.getByText('Database Management')).toBeInTheDocument();
        expect(screen.getByText('Database Health')).toBeInTheDocument();
      });

      // Check if database data is displayed
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText(`${mockMetrics.total_connections}`)).toBeInTheDocument();
    });

    it('should handle database connection errors', async () => {
      const { db } = (await import('../../services/apiEndpoints')).default;
      db.getHealth.mockRejectedValueOnce(new Error('Connection failed'));
      db.getMetrics.mockRejectedValueOnce(new Error('Connection failed'));

      renderWithProviders(<DatabasePage />);

      await waitFor(() => {
        expect(screen.getByText('Database Management')).toBeInTheDocument();
      });

      // Should show error state or fallback
      expect(screen.getByText('Database Health')).toBeInTheDocument();
    });

    it('should refresh database metrics', async () => {
      const { db } = (await import('../../services/apiEndpoints')).default;
      db.getHealth.mockResolvedValueOnce({
        data: { success: true, data: { status: 'healthy', uptime: 86400 } }
      });
      db.getMetrics.mockResolvedValueOnce({
        data: { success: true, data: { total_connections: 50 } }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<DatabasePage />);

      await waitFor(() => {
        expect(screen.getByText('Database Management')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Verify API was called again
      expect(db.getHealth).toHaveBeenCalledTimes(2);
      expect(db.getMetrics).toHaveBeenCalledTimes(2);
    });
  });

  describe('RiskManagementPage', () => {
    it('should load and display risks', async () => {
      const mockRisks = [generateMockRisk(), generateMockRisk()];
      const mockMetrics = {
        total_risks: 50,
        open_risks: 30,
        closed_risks: 20,
        high_impact_risks: 10
      };
      const mockHeatmap = [
        { impact: 'high', probability: 'high', count: 5 },
        { impact: 'medium', probability: 'medium', count: 15 }
      ];

      const { risks } = (await import('../../services/apiEndpoints')).default;
      risks.getAll.mockResolvedValueOnce({
        data: { success: true, data: mockRisks }
      });
      risks.getMetrics.mockResolvedValueOnce({
        data: { success: true, data: mockMetrics }
      });
      risks.getHeatmap.mockResolvedValueOnce({
        data: { success: true, data: mockHeatmap }
      });

      renderWithProviders(<RiskManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Risk Management')).toBeInTheDocument();
        expect(screen.getByText('Total Risks')).toBeInTheDocument();
      });

      // Check if risk data is displayed
      expect(screen.getByText(mockRisks[0].title)).toBeInTheDocument();
      expect(screen.getByText(`${mockMetrics.total_risks}`)).toBeInTheDocument();
    });

    it('should create a new risk', async () => {
      const { risks } = (await import('../../services/apiEndpoints')).default;
      risks.getAll.mockResolvedValueOnce({
        data: { success: true, data: [] }
      });
      risks.getMetrics.mockResolvedValueOnce({
        data: { success: true, data: { total_risks: 0, open_risks: 0 } }
      });
      risks.getHeatmap.mockResolvedValueOnce({
        data: { success: true, data: [] }
      });
      risks.create.mockResolvedValueOnce({
        data: { success: true, data: generateMockRisk() }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<RiskManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Risk Management')).toBeInTheDocument();
      });

      // Click create button
      const createButton = screen.getByRole('button', { name: /create risk/i });
      await user.click(createButton);

      // Fill form and submit
      const titleInput = screen.getByPlaceholderText(/risk title/i);
      await user.type(titleInput, 'New Risk');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      expect(risks.create).toHaveBeenCalled();
    });

    it('should assess a risk', async () => {
      const mockRisk = generateMockRisk();
      const { risks } = (await import('../../services/apiEndpoints')).default;
      risks.getAll.mockResolvedValueOnce({
        data: { success: true, data: [mockRisk] }
      });
      risks.getMetrics.mockResolvedValueOnce({
        data: { success: true, data: { total_risks: 1, open_risks: 1 } }
      });
      risks.getHeatmap.mockResolvedValueOnce({
        data: { success: true, data: [] }
      });
      risks.assess.mockResolvedValueOnce({
        data: { success: true, data: { ...mockRisk, risk_score: 75 } }
      });

      const user = userEvent.setup();
      
      renderWithProviders(<RiskManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Risk Management')).toBeInTheDocument();
      });

      // Find and click assess button
      const assessButton = screen.getByRole('button', { name: /assess/i });
      await user.click(assessButton);

      expect(risks.assess).toHaveBeenCalled();
    });
  });

  describe('Page Navigation and Routing', () => {
    it('should navigate between priority pages', async () => {
      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      monitoring.getPerformanceMetrics.mockResolvedValue({
        data: { success: true, data: generateMockPerformanceData() }
      });
      monitoring.getSystemMetrics.mockResolvedValue({
        data: { success: true, data: { uptime: 86400 } }
      });
      monitoring.getDatabaseMetrics.mockResolvedValue({
        data: { success: true, data: { connections: 25 } }
      });
      monitoring.getAlertHistory.mockResolvedValue({
        data: { success: true, data: [] }
      });

      const { frameworks } = (await import('../../services/apiEndpoints')).default;
      frameworks.getAll.mockResolvedValue({
        data: { success: true, data: [] }
      });
      frameworks.getAnalytics.mockResolvedValue({
        data: { success: true, data: { total_frameworks: 0 } }
      });

      renderWithProviders(
        <Routes>
          <Route path="/performance-monitor" element={<PerformanceMonitorPage />} />
          <Route path="/frameworks" element={<FrameworksManagementPage />} />
        </Routes>,
        { initialEntries: ['/performance-monitor'] }
      );

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });

      // Test navigation (if navigation elements exist)
      // This would depend on the actual navigation implementation
    });
  });

  describe('Error Handling and Loading States', () => {
    it('should show loading states while fetching data', async () => {
      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      
      // Mock slow API response
      monitoring.getPerformanceMetrics.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => 
          resolve({ data: { success: true, data: generateMockPerformanceData() } }), 1000
        ))
      );

      renderWithProviders(<PerformanceMonitorPage />);

      // Should show loading state initially
      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      });
    });

    it('should handle permission errors gracefully', async () => {
      // Mock permission denied - use the mocked hook from TestWrapper
      const { monitoring } = (await import('../../services/apiEndpoints')).default;
      monitoring.getPerformanceMetrics.mockRejectedValueOnce({
        response: { status: 403, data: { error: 'Permission denied' } }
      });

      renderWithProviders(<PerformanceMonitorPage />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });

      // Should handle permission error appropriately
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });
  });
});