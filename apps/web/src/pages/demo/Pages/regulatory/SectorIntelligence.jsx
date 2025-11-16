import React, { useState, useMemo } from 'react';
import { 
  Search, Download,
  Building2, Shield, FileText, TrendingUp,
  AlertCircle, RefreshCw
} from 'lucide-react';
import apiService from '../../services/apiEndpoints';
import { useApiData } from '../../hooks/useApiData';
 
import ErrorFallback from '../../components/common/ErrorFallback';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Chart } from "react-google-charts";
import { useTheme } from '../../components/theme/ThemeProvider.jsx';

// Simple StatCard component
const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    {trend && <p className="text-xs text-gray-500 dark:text-gray-400">{trend}</p>}
  </div>
);

import DataGrid from '../../components/ui/DataGrid.jsx';

const SectorIntelligence = () => {
  const [selectedSector, setSelectedSector] = useState('all');
  const { getColor } = useTheme();
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedRegulator, setSelectedRegulator] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sector controls data
  const { 
    data: sectorControlsData, 
    loading: controlsLoading, 
    error: controlsError,
    refetch: refetchControls
  } = useApiData('sectorControls.getAll', {
    sector: selectedSector !== 'all' ? selectedSector : undefined,
    framework: selectedFramework !== 'all' ? selectedFramework : undefined,
    regulator: selectedRegulator !== 'all' ? selectedRegulator : undefined,
    search: searchQuery || undefined
  }, {
    fallbackData: { data: [], pagination: { total: 0 } }
  });

  // Fetch frameworks for filtering
  const { data: frameworksData } = useApiData('frameworks.getAll', {}, {
    fallbackData: { data: [] }
  });

  // Fetch regulators for filtering
  const { data: regulatorsData } = useApiData('regulators.getAll', {}, {
    fallbackData: { data: [] }
  });

  // Available sectors (hardcoded for now, could come from API)
  const sectors = [
    { value: 'all', label: 'All Sectors' },
    { value: 'banking', label: 'Banking & Finance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'technology', label: 'Technology' }
  ];

  // Calculate statistics
  const statistics = useMemo(() => {
    const controls = sectorControlsData?.data || [];
    const frameworks = frameworksData?.data || [];
    const regulators = regulatorsData?.data || [];

    // Group controls by sector
    const controlsBySector = controls.reduce((acc, control) => {
      const sector = control.sector || 'other';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    // Group controls by framework
    const controlsByFramework = controls.reduce((acc, control) => {
      const framework = control.framework_name || 'other';
      acc[framework] = (acc[framework] || 0) + 1;
      return acc;
    }, {});

    // Calculate compliance rate (placeholder calculation)
    const totalControls = controls.length;
    const implementedControls = controls.filter(c => c.status === 'implemented').length;
    const complianceRate = totalControls > 0 ? (implementedControls / totalControls) * 100 : 0;

    return {
      totalControls,
      totalFrameworks: frameworks.length,
      totalRegulators: regulators.length,
      complianceRate: Math.round(complianceRate * 10) / 10,
      controlsBySector,
      controlsByFramework
    };
  }, [sectorControlsData, frameworksData, regulatorsData]);

  // Prepare chart data for framework breakdown
  const frameworkChartData = useMemo(() => {
    const data = [['Framework', 'Controls']];
    Object.entries(statistics.controlsByFramework).forEach(([framework, count]) => {
      data.push([framework, count]);
    });
    return data;
  }, [statistics.controlsByFramework]);

  

  const handleExport = async (format = 'csv') => {
    try {
      const params = {
        sector: selectedSector !== 'all' ? selectedSector : undefined,
        framework: selectedFramework !== 'all' ? selectedFramework : undefined,
        regulator: selectedRegulator !== 'all' ? selectedRegulator : undefined,
        search: searchQuery || undefined,
        format
      };

      // This would need to be implemented in the backend
      await apiService.sectorControls.getAll(params);
      
      // For now, create a simple CSV export
      if (format === 'csv') {
        const csvContent = convertToCSV(sectorControlsData?.data || []);
        downloadFile(csvContent, `sector-intelligence-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (controlsError) {
    return <ErrorFallback error={controlsError} resetError={refetchControls} context="sector intelligence" />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sector Intelligence</h1>
          <p className="text-gray-600">
            Sector-based compliance intelligence and control analysis
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetchControls()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Controls"
          value={statistics.totalControls}
          icon={Shield}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Frameworks"
          value={statistics.totalFrameworks}
          icon={FileText}
          trend={{ value: 3, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Regulators"
          value={statistics.totalRegulators}
          icon={Building2}
          trend={{ value: 1, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Compliance Rate"
          value={`${statistics.complianceRate}%`}
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: true }}
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sectors.map(sector => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Frameworks</option>
              {frameworksData?.data?.map(framework => (
                <option key={framework.id} value={framework.code}>
                  {framework.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regulator</label>
            <select
              value={selectedRegulator}
              onChange={(e) => setSelectedRegulator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Regulators</option>
              {regulatorsData?.data?.map(regulator => (
                <option key={regulator.id} value={regulator.code}>
                  {regulator.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Framework Breakdown Chart */}
      {frameworkChartData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Breakdown</h3>
          <div className="h-64">
            <Chart
              chartType="PieChart"
              data={frameworkChartData}
              options={{
                title: 'Controls by Framework',
                pieHole: 0.4,
                colors: [
                  getColor('primary.600'),
                  getColor('success.500'),
                  getColor('warning.500'),
                  getColor('error.500'),
                  getColor('primary.700'),
                  getColor('info.500'),
                ],
                legend: { position: 'bottom' },
                chartArea: { width: '90%', height: '80%' }
              }}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}

      {/* Controls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sector Controls</h3>
          <p className="text-sm text-gray-600 mt-1">
            {sectorControlsData?.pagination?.total || 0} controls found
          </p>
        </div>
        
        {controlsLoading ? (
          <div className="p-12 text-center">
            <LoadingSpinner message="Loading sector controls..." />
          </div>
        ) : sectorControlsData?.data && sectorControlsData.data.length > 0 ? (
          <DataGrid
            data={sectorControlsData.data.map((row, idx) => ({ id: row.control_id || idx, ...row }))}
            columns={[
              { key: 'control_id', label: 'Control ID', sortable: true },
              { key: 'title', label: 'Control Title', sortable: true },
              { key: 'sector', label: 'Sector', sortable: true },
              { key: 'framework_name', label: 'Framework', sortable: true },
              { key: 'regulator_name', label: 'Regulator', sortable: true },
              { key: 'risk_level', label: 'Risk Level', sortable: true, render: (value) => (
                <span className={`badge ${
                  value === 'high' ? 'badge-error' :
                  value === 'medium' ? 'badge-warning' :
                  'badge-success'
                }`}>{(value || 'low').toUpperCase()}</span>
              )},
              { key: 'status', label: 'Status', sortable: true, render: (value) => (
                <span className={`badge ${
                  value === 'implemented' ? 'badge-success' :
                  value === 'in_progress' ? 'badge-info' :
                  'badge-gray'
                }`}>{(value || 'not_started').replace('_', ' ').toUpperCase()}</span>
              )},
            ]}
            pageSize={10}
            onExport={() => handleExport('csv')}
          />
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No sector controls found matching your criteria</p>
            <button
              onClick={() => {
                setSelectedSector('all');
                setSelectedFramework('all');
                setSelectedRegulator('all');
                setSearchQuery('');
              }}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectorIntelligence;
