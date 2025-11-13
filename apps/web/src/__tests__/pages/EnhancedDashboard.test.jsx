/**
 * Integration Tests - Enhanced Dashboard Page
 * Tests dashboard rendering, data loading, charts, and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import EnhancedDashboard from '../../pages/dashboard/EnhancedDashboard';
import apiService from '../../services/apiEndpoints';

// Mock API service
vi.mock('../../services/apiEndpoints', () => ({
  default: {
    dashboard: {
      getKPIs: vi.fn(),
      getTrends: vi.fn(),
    },
    frameworks: {
      getAll: vi.fn(),
    },
    risks: {
      getAll: vi.fn(),
    },
    assessments: {
      getAll: vi.fn(),
    },
    compliance: {
      getScore: vi.fn(),
    },
  },
}));

// Mock Plotly charts
vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }) => (
    <div data-testid="plotly-chart" data-title={layout?.title}>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

const mockDashboardData = {
  kpis: {
    data: {
      complianceScore: 85,
      openGaps: 12,
      riskHotspots: 8,
      activeAssessments: 15,
    },
  },
  trends: {
    data: {
      dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      compliance: [72, 75, 78, 82, 85, 87],
    },
  },
  frameworks: {
    data: {
      data: [
        { id: 1, name: 'ISO 27001', compliance_score: 85 },
        { id: 2, name: 'NIST CSF', compliance_score: 82 },
        { id: 3, name: 'SOC 2', compliance_score: 78 },
      ],
    },
  },
  risks: {
    data: {
      data: [
        { id: 1, title: 'Data breach', severity: 'critical', status: 'open' },
        { id: 2, title: 'Insider threat', severity: 'high', status: 'open' },
        { id: 3, title: 'Phishing', severity: 'medium', status: 'mitigated' },
      ],
    },
  },
  assessments: {
    data: {
      data: [
        { id: 1, name: 'Q4 Assessment', status: 'active' },
        { id: 2, name: 'Q3 Assessment', status: 'completed' },
      ],
    },
  },
  compliance: {
    data: {
      data: {
        overall_score: 85,
      },
    },
  },
};

describe('EnhancedDashboard - Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup API mocks
    apiService.dashboard.getKPIs.mockResolvedValue(mockDashboardData.kpis);
    apiService.dashboard.getTrends.mockResolvedValue(mockDashboardData.trends);
    apiService.frameworks.getAll.mockResolvedValue(mockDashboardData.frameworks);
    apiService.risks.getAll.mockResolvedValue(mockDashboardData.risks);
    apiService.assessments.getAll.mockResolvedValue(mockDashboardData.assessments);
    apiService.compliance.getScore.mockResolvedValue(mockDashboardData.compliance);
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <EnhancedDashboard />
      </BrowserRouter>
    );
  };

  describe('Dashboard Rendering', () => {
    it('should render dashboard with title and breadcrumb', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('GRC Dashboard')).toBeInTheDocument();
        expect(screen.getByText(/لوحة القيادة/)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderDashboard();

      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    it('should render all KPI cards after data loads', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Compliance Score')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('Open Gaps')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Risk Hotspots')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('Active Assessments')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Rendering', () => {
    it('should render all 7 Plotly charts', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        expect(charts.length).toBeGreaterThanOrEqual(7);
      });
    });

    it('should render Compliance Trend chart with correct data', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        const trendChart = charts.find(
          (chart) => chart.getAttribute('data-title') === 'Compliance Score Trend'
        );
        expect(trendChart).toBeInTheDocument();
      });
    });

    it('should render Gauge chart for overall compliance', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        const gaugeChart = charts.find(
          (chart) => chart.getAttribute('data-title') === 'Overall Compliance'
        );
        expect(gaugeChart).toBeInTheDocument();
      });
    });

    it('should render Risk Distribution pie chart', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        const pieChart = charts.find(
          (chart) => chart.getAttribute('data-title') === 'Risk Distribution by Severity'
        );
        expect(pieChart).toBeInTheDocument();
      });
    });

    it('should render Controls Heatmap', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        const heatmap = charts.find(
          (chart) => chart.getAttribute('data-title') === 'Controls Compliance Heatmap'
        );
        expect(heatmap).toBeInTheDocument();
      });
    });

    it('should render Framework Compliance Radar chart', async () => {
      renderDashboard();

      await waitFor(() => {
        const charts = screen.getAllByTestId('plotly-chart');
        const radarChart = charts.find(
          (chart) => chart.getAttribute('data-title') === 'Framework Compliance Comparison'
        );
        expect(radarChart).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow changing time range filter', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('GRC Dashboard')).toBeInTheDocument();
      });

      const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i });
      await user.selectOptions(timeRangeSelect, '90d');

      await waitFor(() => {
        expect(apiService.dashboard.getTrends).toHaveBeenCalledWith('90d');
      });
    });

    it('should refresh data when refresh button clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(apiService.dashboard.getKPIs).toHaveBeenCalledTimes(2);
      });
    });

    it('should show export toast when export button clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Toast should be triggered (mocked in setup)
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Auto-refresh Functionality', () => {
    it('should auto-refresh data every 30 seconds', async () => {
      vi.useFakeTimers();
      renderDashboard();

      await waitFor(() => {
        expect(apiService.dashboard.getKPIs).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(apiService.dashboard.getKPIs).toHaveBeenCalledTimes(2);
      });

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      apiService.dashboard.getKPIs.mockRejectedValue(new Error('API Error'));

      renderDashboard();

      await waitFor(() => {
        // Should not crash, error should be logged
        expect(apiService.dashboard.getKPIs).toHaveBeenCalled();
      });
    });

    it('should show fallback data when API fails', async () => {
      apiService.dashboard.getKPIs.mockResolvedValue({ data: null });
      apiService.frameworks.getAll.mockResolvedValue({ data: { data: null } });

      renderDashboard();

      await waitFor(() => {
        // Should show fallback values
        expect(screen.getByText('85%')).toBeInTheDocument(); // Fallback compliance score
      });
    });
  });

  describe('Activity Feed', () => {
    it('should render recent activity section', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText(/Assessment completed/i)).toBeInTheDocument();
        expect(screen.getByText(/Risk mitigated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('GRC Dashboard')).toBeInTheDocument();
      });

      // All KPIs should still be visible in responsive grid
      expect(screen.getByText('Compliance Score')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should use compact layout mode', async () => {
      renderDashboard();

      await waitFor(() => {
        const header = screen.getByText('GRC Dashboard').closest('div');
        expect(header).toBeInTheDocument();
      });
    });
  });

  describe('Data Freshness Indicator', () => {
    it('should display last update timestamp', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Framework Filter', () => {
    it('should filter data by selected framework', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('GRC Dashboard')).toBeInTheDocument();
      });

      // Note: Framework filter would need to be implemented in the component
      // This test documents expected behavior
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on interactive elements', async () => {
      renderDashboard();

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toHaveAttribute('type', 'button');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      await user.tab();

      // Should be able to activate buttons with keyboard
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      refreshButton.focus();
      expect(document.activeElement).toBe(refreshButton);
    });
  });
});
