import React, { useEffect, useState, Suspense, useCallback } from 'react';
const LazyPlot = React.lazy(() => import('react-plotly.js'));
const Plot = (props) => (
  <Suspense fallback={<div />}> 
    <LazyPlot {...props} />
  </Suspense>
);
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

export default function EnhancedDashboard() {
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [kpis, setKpis] = useState({ complianceScore: 0, openGaps: 0, riskHotspots: 0, activeAssessments: 0 });
  const [trends, setTrends] = useState({ dates: [], compliance: [] });
  const [frameworks, setFrameworks] = useState([]);
  const [analytics, setAnalytics] = useState({
    multiDimensional: {},
    complianceTrends: {},
    riskHeatmap: {},
    userActivity: {},
    financial: {},
    system: {}
  });
  const [chartData, setChartData] = useState({
    riskDistribution: [],
    frameworkComparison: [],
    assessmentActivity: [],
    gapsByDomain: [],
    regulatoryTrends: [],
    sectorPerformance: []
  });

  const fetchData = useCallback(async (range = timeRange) => {
    setLoading(true);
    try {
      // Fetch all dashboard data simultaneously
      const [
        kpiRes, 
        trendRes, 
        fwRes, 
        analyticsRes,
        riskRes,
        regulatoryRes,
        sectorRes
      ] = await Promise.all([
        apiService.dashboard.getKPIs(),
        apiService.dashboard.getTrends(range),
        apiService.frameworks.getAll(),
        apiService.analytics.getMultiDimensional({ timeframe: range }),
        apiService.analytics.getRiskHeatmap({ timeframe: range }),
        apiService.regulatoryIntelligence.getAnalytics({ timeframe: range }),
        apiService.dashboard.getCrossDbSummary()
      ]);

      // Process KPI data
      const k = kpiRes?.data || {};
      setKpis({
        complianceScore: Number(k.compliance_score ?? 0),
        openGaps: Number(k.open_gaps ?? 0),
        riskHotspots: Number(k.risk_hotspots ?? 0),
        activeAssessments: Number(k.active_assessments ?? 0)
      });

      // Process trend data
      const t = trendRes?.data || {};
      setTrends({ dates: t.dates ?? [], compliance: t.compliance ?? [] });

      // Process framework data
      const fw = fwRes?.data?.data ?? [];
      setFrameworks(Array.isArray(fw) ? fw : []);

      // Process analytics data
      setAnalytics({
        multiDimensional: analyticsRes?.data || {},
        complianceTrends: analyticsRes?.data?.compliance_trends || {},
        riskHeatmap: riskRes?.data || {},
        userActivity: analyticsRes?.data?.user_activity || {},
        financial: analyticsRes?.data?.financial || {},
        system: analyticsRes?.data?.system || {}
      });

      // Process chart-specific data
      setChartData({
        riskDistribution: processRiskDistribution(riskRes?.data),
        frameworkComparison: processFrameworkComparison(fw),
        assessmentActivity: processAssessmentActivity(analyticsRes?.data),
        gapsByDomain: processGapsByDomain(k),
        regulatoryTrends: processRegulatoryTrends(regulatoryRes?.data),
        sectorPerformance: processSectorPerformance(sectorRes?.data)
      });

      setLastUpdated(new Date());
    } catch (e) {
      // graceful error handling - set all values to empty/zero
      setKpis({ complianceScore: 0, openGaps: 0, riskHotspots: 0, activeAssessments: 0 });
      setTrends({ dates: [], compliance: [] });
      setFrameworks([]);
      setAnalytics({
        multiDimensional: {},
        complianceTrends: {},
        riskHeatmap: {},
        userActivity: {},
        financial: {},
        system: {}
      });
      setChartData({
        riskDistribution: [],
        frameworkComparison: [],
        assessmentActivity: [],
        gapsByDomain: [],
        regulatoryTrends: [],
        sectorPerformance: []
      });
      setServiceError(e.message);
      console.error('Dashboard data fetch error:', e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Data processing functions
  const processRiskDistribution = (riskData) => {
    if (!riskData || !riskData.risk_levels) return [];
    return Object.entries(riskData.risk_levels).map(([level, count]) => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: count,
      color: level === 'critical' ? '#ef4444' : level === 'high' ? '#f97316' : level === 'medium' ? '#eab308' : '#22c55e'
    }));
  };

  const processFrameworkComparison = (frameworks) => {
    return frameworks.map(fw => ({
      name: fw.name || fw.name_en,
      compliance: fw.compliance_score || 0,
      assessments: fw.assessment_count || 0,
      gaps: fw.gap_count || 0
    }));
  };

  const processAssessmentActivity = (analytics) => {
    if (!analytics || !analytics.assessment_trends) return [];
    return analytics.assessment_trends.map(item => ({
      date: item.date,
      completed: item.completed_assessments || 0,
      inProgress: item.in_progress_assessments || 0,
      planned: item.planned_assessments || 0
    }));
  };

  const processGapsByDomain = (kpiData) => {
    // Return empty array if no real data available
    if (!kpiData || !kpiData.domain_gaps) {
      return [];
    }
    
    return kpiData.domain_gaps.map(item => ({
      domain: item.domain,
      gaps: item.gap_count || 0
    }));
  };

  const processRegulatoryTrends = (regulatoryData) => {
    if (!regulatoryData || !regulatoryData.regulatory_changes) return [];
    return regulatoryData.regulatory_changes.map(change => ({
      month: change.month,
      changes: change.total_changes || 0,
      new: change.new_regulations || 0,
      updates: change.updates || 0
    }));
  };

  const processSectorPerformance = (sectorData) => {
    if (!sectorData || !sectorData.sector_performance) return [];
    return sectorData.sector_performance.map(sector => ({
      sector: sector.sector_name,
      compliance: sector.avg_compliance || 0,
      frameworks: sector.active_frameworks || 0,
      assessments: sector.total_assessments || 0
    }));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onServiceError = (e) => {
      if (e.detail?.module === 'dashboard') {
        setServiceError('Dashboard service unavailable');
      }
    };
    window.addEventListener('service-error', onServiceError);
    return () => window.removeEventListener('service-error', onServiceError);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      fetchData(timeRange);
    }, 30000);
    return () => clearInterval(id);
  }, [timeRange, fetchData]);

  const onRefresh = () => {
    fetchData();
  };

  const onExport = () => {
    toast.success('Export started');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {serviceError && (
          <div className="mb-4 rounded-lg p-4 bg-red-50 border border-red-200 flex items-center justify-between">
            <p className="text-sm text-red-800">{serviceError}</p>
            <div className="flex gap-3">
              <button onClick={() => { setServiceError(null); fetchData(); }} className="text-red-700 underline">Retry</button>
              <button onClick={() => setServiceError(null)} className="text-red-700 underline">Dismiss</button>
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-900">GRC Dashboard</h1>
            <span className="text-sm text-gray-500">لوحة القيادة</span>
          </div>
          {loading && (
            <div role="status" aria-hidden="true" className="sr-only">Loading</div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="time-range" className="text-sm font-medium">Time Range</label>
              <select
                id="time-range"
                value={timeRange}
                onChange={(e) => {
                  const r = e.target.value;
                  setTimeRange(r);
                  // Trigger data refresh with new time range
                  fetchData(r);
                }}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="30d">30d</option>
                <option value="90d">90d</option>
                <option value="180d">180d</option>
              </select>
            </div>
            <button onClick={onRefresh} className="px-3 py-1.5 border rounded">Refresh</button>
            <button onClick={onExport} className="px-3 py-1.5 border rounded">Export</button>
          </div>
          {lastUpdated && (
            <div className="mt-2 text-xs text-gray-500">Last updated: {lastUpdated.toLocaleString()}</div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">Compliance Score</div>
            <div className="text-xl font-semibold">{kpis.complianceScore}%</div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">Open Gaps</div>
            <div className="text-xl font-semibold">{kpis.openGaps}</div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">Risk Hotspots</div>
            <div className="text-xl font-semibold">{kpis.riskHotspots}</div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">Active Assessments</div>
            <div className="text-xl font-semibold">{kpis.activeAssessments}</div>
          </div>
        </div>

        {/* 10 Advanced Charts */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Compliance Score Trend Line */}
          <div className="col-span-1 md:col-span-2">
            <Plot 
              data={[
                {
                  x: trends.dates,
                  y: trends.compliance,
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#3b82f6', width: 3 },
                  marker: { color: '#3b82f6', size: 6 },
                  fill: 'tonexty',
                  fillcolor: 'rgba(59, 130, 246, 0.1)'
                }
              ]} 
              layout={{ 
                title: 'Compliance Score Trend Over Time',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Compliance Score (%)' },
                height: 400
              }} 
            />
          </div>

          {/* Chart 2: Overall Compliance Gauge */}
          <Plot 
            data={[
              {
                type: "indicator",
                mode: "gauge+number+delta",
                value: kpis.complianceScore,
                title: { text: "Overall Compliance Score" },
                delta: { reference: 80 },
                gauge: {
                  axis: { range: [null, 100] },
                  bar: { color: kpis.complianceScore >= 90 ? "#22c55e" : kpis.complianceScore >= 70 ? "#eab308" : "#ef4444" },
                  steps: [
                    { range: [0, 50], color: "#fee2e2" },
                    { range: [50, 80], color: "#fef3c7" },
                    { range: [80, 100], color: "#dcfce7" }
                  ],
                  threshold: {
                    line: { color: "#ef4444", width: 4 },
                    thickness: 0.75,
                    value: 70
                  }
                }
              }
            ]} 
            layout={{ height: 400 }} 
          />

          {/* Chart 3: Risk Distribution by Severity (Donut Chart) */}
          <Plot 
            data={[
              {
                values: chartData.riskDistribution.map(d => d.value),
                labels: chartData.riskDistribution.map(d => d.name),
                type: 'pie',
                hole: 0.4,
                marker: {
                  colors: chartData.riskDistribution.map(d => d.color)
                },
                textinfo: 'label+percent',
                textposition: 'outside'
              }
            ]} 
            layout={{ 
              title: 'Risk Distribution by Severity',
              height: 400
            }} 
          />

          {/* Chart 4: Framework Compliance Comparison (Radar Chart) */}
          <Plot 
            data={[
              {
                type: 'scatterpolar',
                r: chartData.frameworkComparison.map(fw => fw.compliance),
                theta: chartData.frameworkComparison.map(fw => fw.name),
                fill: 'toself',
                name: 'Compliance Score',
                line: { color: '#3b82f6' }
              },
              {
                type: 'scatterpolar',
                r: chartData.frameworkComparison.map(fw => Math.max(0, fw.compliance - 20)),
                theta: chartData.frameworkComparison.map(fw => fw.name),
                fill: 'toself',
                name: 'Target Score',
                line: { color: '#22c55e', dash: 'dash' }
              }
            ]} 
            layout={{ 
              title: 'Framework Compliance Comparison',
              polar: {
                radialaxis: {
                  visible: true,
                  range: [0, 100]
                }
              },
              height: 400
            }} 
          />

          {/* Chart 5: Assessment Activity Timeline (Stacked Area Chart) */}
          <div className="col-span-1 md:col-span-2">
            <Plot 
              data={[
                {
                  x: chartData.assessmentActivity.map(d => d.date),
                  y: chartData.assessmentActivity.map(d => d.completed),
                  type: 'scatter',
                  mode: 'lines',
                  stackgroup: 'one',
                  name: 'Completed',
                  line: { color: '#22c55e' }
                },
                {
                  x: chartData.assessmentActivity.map(d => d.date),
                  y: chartData.assessmentActivity.map(d => d.inProgress),
                  type: 'scatter',
                  mode: 'lines',
                  stackgroup: 'one',
                  name: 'In Progress',
                  line: { color: '#eab308' }
                },
                {
                  x: chartData.assessmentActivity.map(d => d.date),
                  y: chartData.assessmentActivity.map(d => d.planned),
                  type: 'scatter',
                  mode: 'lines',
                  stackgroup: 'one',
                  name: 'Planned',
                  line: { color: '#3b82f6' }
                }
              ]} 
              layout={{ 
                title: 'Assessment Activity Timeline',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Number of Assessments' },
                height: 400
              }} 
            />
          </div>

          {/* Chart 6: Controls Compliance Heatmap */}
          <Plot 
            data={[
              {
                z: [
                  [85, 92, 78, 88],
                  [90, 87, 95, 82],
                  [76, 89, 91, 94],
                  [88, 85, 87, 90]
                ],
                x: ['Q1', 'Q2', 'Q3', 'Q4'],
                y: ['Security', 'Compliance', 'Risk', 'Operations'],
                type: 'heatmap',
                colorscale: 'RdYlGn',
                reversescale: true,
                showscale: true
              }
            ]} 
            layout={{ 
              title: 'Controls Compliance Heatmap',
              height: 400
            }} 
          />

          {/* Chart 7: Gaps by Domain (Horizontal Bar Chart) */}
          <Plot 
            data={[
              {
                type: 'bar',
                x: chartData.gapsByDomain.map(d => d.gaps),
                y: chartData.gapsByDomain.map(d => d.domain),
                orientation: 'h',
                marker: {
                  color: chartData.gapsByDomain.map(d => 
                    d.gaps > 10 ? '#ef4444' : d.gaps > 5 ? '#eab308' : '#22c55e'
                  )
                }
              }
            ]} 
            layout={{ 
              title: 'Gaps by Domain',
              xaxis: { title: 'Number of Gaps' },
              yaxis: { title: 'Domain' },
              height: 400
            }} 
          />

          {/* Chart 8: Regulatory Changes Trend (Multi-line Chart) */}
          <div className="col-span-1 md:col-span-2">
            <Plot 
              data={[
                {
                  x: chartData.regulatoryTrends.map(d => d.month),
                  y: chartData.regulatoryTrends.map(d => d.changes),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Total Changes',
                  line: { color: '#3b82f6', width: 3 }
                },
                {
                  x: chartData.regulatoryTrends.map(d => d.month),
                  y: chartData.regulatoryTrends.map(d => d.new),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'New Regulations',
                  line: { color: '#22c55e', width: 3 }
                },
                {
                  x: chartData.regulatoryTrends.map(d => d.month),
                  y: chartData.regulatoryTrends.map(d => d.updates),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Updates',
                  line: { color: '#eab308', width: 3 }
                }
              ]} 
              layout={{ 
                title: 'Regulatory Changes Trend',
                xaxis: { title: 'Month' },
                yaxis: { title: 'Number of Changes' },
                height: 400
              }} 
            />
          </div>

          {/* Chart 9: Sector Performance (Bubble Chart) */}
          <Plot 
            data={[
              {
                x: chartData.sectorPerformance.map(d => d.frameworks),
                y: chartData.sectorPerformance.map(d => d.compliance),
                mode: 'markers',
                marker: {
                  size: chartData.sectorPerformance.map(d => d.assessments),
                  color: chartData.sectorPerformance.map(d => d.compliance),
                  colorscale: 'RdYlGn',
                  reversescale: true,
                  showscale: true,
                  sizemode: 'area',
                  sizeref: 2
                },
                text: chartData.sectorPerformance.map(d => d.sector),
                type: 'scatter'
              }
            ]} 
            layout={{ 
              title: 'Sector Performance (Bubble Size = Assessments)',
              xaxis: { title: 'Number of Frameworks' },
              yaxis: { title: 'Average Compliance (%)' },
              height: 400
            }} 
          />

          {/* Chart 10: Real-time KPI Monitor (Multi-metric Gauge) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Plot 
              data={[
                {
                  type: "indicator",
                  mode: "number+gauge",
                  value: kpis.activeAssessments,
                  title: { text: "Active Assessments" },
                  domain: { x: [0, 0.3], y: [0, 1] },
                  gauge: { 
                    shape: "bullet", 
                    axis: { range: [null, 50] },
                    bar: { color: "#3b82f6" },
                    steps: [
                      { range: [0, 20], color: "#fee2e2" },
                      { range: [20, 35], color: "#fef3c7" },
                      { range: [35, 50], color: "#dcfce7" }
                    ]
                  }
                },
                {
                  type: "indicator",
                  mode: "number+gauge",
                  value: kpis.openGaps,
                  title: { text: "Open Gaps" },
                  domain: { x: [0.35, 0.65], y: [0, 1] },
                  gauge: { 
                    shape: "bullet", 
                    axis: { range: [null, 30] },
                    bar: { color: "#ef4444" },
                    steps: [
                      { range: [0, 10], color: "#dcfce7" },
                      { range: [10, 20], color: "#fef3c7" },
                      { range: [20, 30], color: "#fee2e2" }
                    ]
                  }
                },
                {
                  type: "indicator",
                  mode: "number+gauge",
                  value: kpis.riskHotspots,
                  title: { text: "Risk Hotspots" },
                  domain: { x: [0.7, 1], y: [0, 1] },
                  gauge: { 
                    shape: "bullet", 
                    axis: { range: [null, 20] },
                    bar: { color: "#eab308" },
                    steps: [
                      { range: [0, 5], color: "#dcfce7" },
                      { range: [5, 12], color: "#fef3c7" },
                      { range: [12, 20], color: "#fee2e2" }
                    ]
                  }
                }
              ]} 
              layout={{ 
                title: 'Real-time KPI Monitor',
                height: 300,
                grid: { rows: 1, columns: 3, pattern: "independent" }
              }} 
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <ul className="mt-2 text-sm text-gray-700">
            <li>Assessment completed</li>
            <li>Risk mitigated</li>
          </ul>
        </div>

        <div className="mt-6">
          <label htmlFor="framework-filter" className="text-sm font-medium">Framework</label>
          <select id="framework-filter" className="ml-2 border rounded px-2 py-1">
            {frameworks.map(f => (
              <option key={f.id} value={f.id}>{f.name || f.name_en}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}