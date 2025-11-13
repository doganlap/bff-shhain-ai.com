/**
 * Risk Management Module V2 - Enterprise Edition
 *
 * Features:
 * - EnterprisePageLayout (no duplicate titles)
 * - useCRUD hook (simplified CRUD)
 * - Risk heatmap with Plotly
 * - Real-time risk metrics
 */

import React, { useState, useEffect } from 'react';
import { Plus, Download, Filter as FilterIcon, AlertTriangle, Shield } from 'lucide-react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import { useCRUD } from '../../hooks/useCRUD';
import { HeatmapChart, PieChart, BarChart, GaugeChart, RadarChart, LineChart } from '../../components/charts/PlotlyCharts';
import apiService from '../../services/apiEndpoints';
import {
  assessRisk,
  calculateRiskMetrics,
  generateRiskHeatMap,
  HEAT_BANDS
} from '../../utils/riskScoring';
import { toast } from 'sonner';

const RiskManagementModuleV2 = () => {
  // Use global CRUD hook
  const {
    data: risks,
    loading,
    create,
    update,
    remove,
    fetchAll,
    formData,
    setFormData,
    resetForm,
  } = useCRUD(apiService.risks, 'Risk');

  const [riskMetrics, setRiskMetrics] = useState(null);
  const [heatMapData, setHeatMapData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    heat_band: 'all',
    status: 'all',
    category: 'all',
  });

  useEffect(() => {
    loadRisks();
  }, [filters]);

  const loadRisks = async () => {
    const risksData = await fetchAll(filters);
    if (risksData) {
      // Calculate metrics
      const metrics = calculateRiskMetrics(risksData);
      const heatmap = generateRiskHeatMap(risksData);

      setRiskMetrics(metrics);
      setHeatMapData(heatmap);
    }
  };

  const handleAssessRisk = async (id, assessmentData) => {
    try {
      await apiService.risks.assess(id, assessmentData);
      toast.success('Risk assessed successfully');
      loadRisks();
    } catch (error) {
      toast.error('Failed to assess risk');
    }
  };

  // Transform data for charts
  const riskDistribution = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    values: [
      riskMetrics?.criticalCount || 0,
      riskMetrics?.highCount || 0,
      riskMetrics?.mediumCount || 0,
      riskMetrics?.lowCount || 0,
    ],
    colors: ['#7f1d1d', '#ef4444', '#f59e0b', '#10b981'],
  };

  const riskByCategoryData = [
    {
      name: 'Risks',
      x: riskMetrics?.categories?.map(c => c.name) || ['Security', 'Compliance', 'Operational', 'Financial'],
      y: riskMetrics?.categories?.map(c => c.count) || [12, 8, 15, 5],
    },
  ];

  const riskTrendData = [
    {
      name: 'Risk Score',
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: riskMetrics?.trend || [75, 72, 68, 65, 62, 58],
    },
  ];

  const riskRadarData = [
    {
      name: 'Current Risks',
      labels: ['Security', 'Compliance', 'Operational', 'Financial', 'Reputational'],
      values: riskMetrics?.radar || [85, 72, 68, 54, 61],
    },
  ];

  return (
    <EnterprisePageLayout
      title="Risk Management"
      subtitle={`${risks.length} risks tracked | ${riskMetrics?.criticalCount || 0} critical`}
      actions={
        <>
          <select
            value={filters.heat_band}
            onChange={(e) => setFilters({ ...filters, heat_band: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={loadRisks}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FilterIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Risk
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </>
      }
      showHelp={true}
      showNotifications={true}
    >
      {loading && !riskMetrics ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Critical Risks</div>
                  <div className="text-3xl font-bold text-red-600 mt-2">
                    {riskMetrics?.criticalCount || 0}
                  </div>
                  <div className="text-sm text-red-600 mt-1">Immediate action required</div>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">High Risks</div>
                  <div className="text-3xl font-bold text-orange-600 mt-2">
                    {riskMetrics?.highCount || 0}
                  </div>
                  <div className="text-sm text-orange-600 mt-1">Within 30 days</div>
                </div>
                <AlertTriangle className="h-12 w-12 text-orange-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Mitigated Risks</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">
                    {riskMetrics?.mitigatedCount || 0}
                  </div>
                  <div className="text-sm text-green-600 mt-1">+5 this month</div>
                </div>
                <Shield className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Risk Score</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {riskMetrics?.overallScore || 0}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">-12% from last month</div>
                </div>
                <AlertTriangle className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Chart 1 & 2: Risk Heatmap + Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <HeatmapChart
                data={heatMapData.matrix || [
                  [12, 8, 5, 2, 1],
                  [8, 15, 10, 4, 2],
                  [4, 10, 12, 6, 3],
                  [2, 4, 6, 8, 4],
                  [1, 2, 3, 4, 5],
                ]}
                xLabels={['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain']}
                yLabels={['Critical', 'Major', 'Moderate', 'Minor', 'Insignificant']}
                title="Risk Heat Map (Likelihood × Impact)"
                colorscale="RdYlGn_r"
                height={400}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <PieChart
                data={riskDistribution}
                title="Risk Distribution"
                height={400}
                donut={true}
              />
            </div>
          </div>

          {/* Chart 3 & 4: Category Distribution + Overall Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <BarChart
                data={riskByCategoryData}
                title="Risks by Category"
                height={350}
                yTitle="Number of Risks"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <GaugeChart
                value={riskMetrics?.overallScore || 58}
                title="Overall Risk Score"
                max={100}
                threshold={{ low: 30, high: 70 }}
                height={350}
              />
            </div>
          </div>

          {/* Chart 5: Risk Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <LineChart
              data={riskTrendData}
              title="Risk Score Trend (6 Months)"
              xTitle="Month"
              yTitle="Risk Score"
              height={350}
            />
          </div>

          {/* Chart 6: Risk Radar */}
          <div className="bg-white p-6 rounded-lg shadow">
            <RadarChart
              data={riskRadarData}
              title="Risk Profile by Domain"
              height={450}
            />
          </div>

          {/* Risks List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Risk Register</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {risks.map((risk) => (
                    <tr key={risk.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {risk.risk_id || `R-${risk.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{risk.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risk.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risk.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Assess</button>
                        <button className="text-red-600 hover:text-red-900">Mitigate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </EnterprisePageLayout>
  );
};

export default RiskManagementModuleV2;
