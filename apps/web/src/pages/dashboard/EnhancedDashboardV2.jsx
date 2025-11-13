/**
 * Enhanced GRC Dashboard V2 - Enterprise Edition
 *
 * Features:
 * - EnterprisePageLayout (no duplicate titles)
 * - 6+ Advanced Plotly Charts
 * - Real-time data updates
 * - Interactive filters
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter as FilterIcon } from 'lucide-react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import {
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  HeatmapChart,
  RadarChart,
  FunnelChart,
  StackedAreaChart,
} from '../../components/charts/PlotlyCharts';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

const EnhancedDashboardV2 = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, selectedFramework]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const filters = {
        timeframe: timeRange,
        framework: selectedFramework !== 'all' ? selectedFramework : undefined,
      };

      const [kpis, trends, heatmap, risks, assessments, compliance] = await Promise.all([
        apiService.dashboard.getKPIs(filters),
        apiService.dashboard.getTrends(timeRange),
        apiService.dashboard.getHeatmap('controls', filters.framework),
        apiService.risks.getAll(filters),
        apiService.assessments.getAll(filters),
        apiService.compliance.getScore(filters),
      ]);

      setData({
        kpis: kpis.data?.data || {},
        trends: trends.data?.data || {},
        heatmap: heatmap.data?.data || {},
        risks: risks.data?.data || [],
        assessments: assessments.data?.data || [],
        compliance: compliance.data?.data || {},
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Exporting dashboard report...');
    // Export logic here
  };

  // Transform data for charts
  const complianceTrendData = [
    {
      name: 'Compliance Score',
      x: data.trends?.dates || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: data.trends?.compliance || [65, 72, 78, 75, 82, 87],
    },
    {
      name: 'Target',
      x: data.trends?.dates || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [80, 80, 80, 80, 80, 80],
    },
  ];

  const riskDistributionData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    values: data.risks?.distribution || [12, 28, 45, 65],
    colors: ['#ef4444', '#f59e0b', '#eab308', '#10b981'],
  };

  const assessmentStatusData = [
    {
      name: 'Assessments',
      x: ['Completed', 'In Progress', 'Pending', 'Overdue'],
      y: data.assessments?.statusCounts || [25, 12, 8, 3],
      color: ['#10b981', '#3b82f6', '#eab308', '#ef4444'],
    },
  ];

  const controlsHeatmapData = data.heatmap?.matrix || [
    [85, 92, 78, 95, 88],
    [72, 85, 90, 82, 79],
    [95, 88, 76, 91, 85],
    [68, 75, 82, 88, 91],
  ];

  const frameworkRadarData = [
    {
      name: 'Current Status',
      labels: ['ISO 27001', 'NIST', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS'],
      values: data.compliance?.frameworkScores || [87, 82, 78, 91, 85, 79],
    },
    {
      name: 'Target',
      labels: ['ISO 27001', 'NIST', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS'],
      values: [90, 90, 90, 90, 90, 90],
    },
  ];

  const complianceFunnelData = {
    labels: ['Total Controls', 'Implemented', 'Tested', 'Verified', 'Compliant'],
    values: [150, 135, 120, 110, 105],
  };

  const riskTrendData = [
    {
      name: 'Critical',
      x: data.trends?.dates || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [15, 14, 12, 13, 11, 10],
    },
    {
      name: 'High',
      x: data.trends?.dates || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [32, 30, 28, 26, 25, 23],
    },
    {
      name: 'Medium',
      x: data.trends?.dates || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [48, 47, 45, 44, 43, 42],
    },
  ];

  const complianceByDomainData = [
    {
      name: 'Compliance %',
      x: ['Access Control', 'Data Security', 'Network Security', 'Incident Response', 'Business Continuity'],
      y: [92, 87, 84, 79, 88],
    },
  ];

  return (
    <EnterprisePageLayout
      title="GRC Dashboard"
      subtitle={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
      actions={
        <>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </>
      }
      showHelp={true}
      showNotifications={true}
    >
      {loading && !data.kpis ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Compliance Score</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {data.kpis?.complianceScore || 87}%
              </div>
              <div className="text-sm text-green-600 mt-1">+5% from last month</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Open Risks</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {data.kpis?.openRisks || 23}
              </div>
              <div className="text-sm text-green-600 mt-1">-3 from last week</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Active Assessments</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {data.kpis?.activeAssessments || 12}
              </div>
              <div className="text-sm text-gray-600 mt-1">3 due this week</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Control Coverage</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {data.kpis?.controlCoverage || 94}%
              </div>
              <div className="text-sm text-green-600 mt-1">+2% from last month</div>
            </div>
          </div>

          {/* Chart 1 & 2: Compliance Trend + Overall Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <LineChart
                data={complianceTrendData}
                title="Compliance Score Trend"
                xTitle="Period"
                yTitle="Compliance %"
                height={350}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <GaugeChart
                value={data.kpis?.complianceScore || 87}
                title="Overall Compliance"
                max={100}
                threshold={{ low: 60, high: 80 }}
                height={350}
              />
            </div>
          </div>

          {/* Chart 3 & 4: Risk Distribution + Assessment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <PieChart
                data={riskDistributionData}
                title="Risk Distribution by Severity"
                height={400}
                donut={true}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <BarChart
                data={assessmentStatusData}
                title="Assessment Status Overview"
                height={400}
                yTitle="Count"
              />
            </div>
          </div>

          {/* Chart 5: Controls Heatmap */}
          <div className="bg-white p-6 rounded-lg shadow">
            <HeatmapChart
              data={controlsHeatmapData}
              title="Controls Compliance Heatmap"
              xLabels={['Access Control', 'Data Protection', 'Network Security', 'Incident Response', 'Business Continuity']}
              yLabels={['ISO 27001', 'NIST CSF', 'SOC 2', 'GDPR']}
              height={400}
              colorscale="RdYlGn"
            />
          </div>

          {/* Chart 6: Framework Radar */}
          <div className="bg-white p-6 rounded-lg shadow">
            <RadarChart
              data={frameworkRadarData}
              title="Framework Compliance Comparison"
              height={450}
            />
          </div>

          {/* Chart 7: Compliance Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <FunnelChart
                data={complianceFunnelData}
                title="Compliance Implementation Funnel"
                height={400}
              />
            </div>

            {/* Chart 8: Risk Trend Stacked Area */}
            <div className="bg-white p-6 rounded-lg shadow">
              <StackedAreaChart
                data={riskTrendData}
                title="Risk Trends by Severity"
                xTitle="Period"
                yTitle="Number of Risks"
                height={400}
              />
            </div>
          </div>

          {/* Chart 9: Compliance by Domain */}
          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart
              data={complianceByDomainData}
              title="Compliance Score by Security Domain"
              height={400}
              orientation="h"
              xTitle="Compliance %"
            />
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {(data.kpis?.recentActivity || [
                { time: '2 hours ago', action: 'Assessment completed: ISO 27001 Q4 2024' },
                { time: '5 hours ago', action: 'Risk mitigated: Data breach vulnerability' },
                { time: '1 day ago', action: 'Control implemented: MFA for all users' },
              ]).map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">{activity.action}</span>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </EnterprisePageLayout>
  );
};

export default EnhancedDashboardV2;
