/**
 * Comprehensive Risk Management Module
 * Features:
 * - Risk assessment with L×I matrix
 * - Heat map visualization
 * - Treatment planning
 * - Residual risk tracking
 * - ROI analysis
 * - Integration with risk scoring algorithms
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';
import { 
  assessRisk, 
  calculateRiskMetrics, 
  generateRiskHeatMap,
  calculateRiskPriority,
  HEAT_BANDS,
  LIKELIHOOD_SCALE,
  IMPACT_SCALE
} from '../../utils/riskScoring';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Shield, Target, 
  BarChart3, Eye, Edit, Trash2, Plus, Filter, Download,
  Clock, CheckCircle, XCircle, Activity, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const RiskManagementModuleEnhanced = () => {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  
  // State
  const [risks, setRisks] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [heatMap, setHeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    heat_band: 'all',
    status: 'all',
    category: 'all',
    search: '',
  });
  
  // Fetch risks data
  useEffect(() => {
    fetchRisks();
  }, [filters]);
  
  const fetchRisks = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      const response = await apiService.risks.getAll(params);
      const risksData = response.data?.data || [];
      
      // Calculate metrics and heatmap
      const metrics = calculateRiskMetrics(risksData);
      const heatmap = generateRiskHeatMap(risksData);
      
      // Enrich risks with assessments
      const enrichedRisks = risksData.map(risk => ({
        ...risk,
        assessment: assessRisk(risk),
        priority: calculateRiskPriority(risk),
      }));
      
      setRisks(enrichedRisks);
      setRiskMetrics(metrics);
      setHeatMap(heatmap);
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast.error('Failed to load risks');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new risk
  const handleCreateRisk = async (data) => {
    try {
      await apiService.risks.create(data);
      toast.success('Risk created successfully');
      setShowCreateModal(false);
      fetchRisks();
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error('Failed to create risk');
    }
  };
  
  // Update risk
  const handleUpdateRisk = async (id, data) => {
    try {
      await apiService.risks.update(id, data);
      toast.success('Risk updated successfully');
      fetchRisks();
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Failed to update risk');
    }
  };
  
  // Assess risk
  const handleAssessRisk = async (id, assessmentData) => {
    try {
      await apiService.risks.assess(id, assessmentData);
      toast.success('Risk assessed successfully');
      fetchRisks();
    } catch (error) {
      console.error('Error assessing risk:', error);
      toast.error('Failed to assess risk');
    }
  };
  
  // Add treatment
  const handleAddTreatment = async (id, treatmentData) => {
    try {
      await apiService.risks.addTreatment(id, treatmentData);
      toast.success('Treatment added successfully');
      fetchRisks();
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error('Failed to add treatment');
    }
  };
  
  // Heat Band Badge
  const HeatBandBadge = ({ heatBand }) => {
    const band = HEAT_BANDS[heatBand] || HEAT_BANDS.low;
    const colorClasses = {
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
      darkred: 'bg-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${colorClasses[band.color]}`}>
        {band.label}
        {band.sla && ` (SLA: ${band.sla}d)`}
      </span>
    );
  };
  
  // Heat Map Cell Component
  const HeatMapCell = ({ cell, likelihood, impact }) => {
    const score = (likelihood + 1) * (impact + 1);
    const heatBand = Object.entries(HEAT_BANDS).find(
      ([_, band]) => score >= band.min && score <= band.max
    )?.[1] || HEAT_BANDS.low;
    
    const colorClasses = {
      green: 'bg-green-500 hover:bg-green-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      red: 'bg-red-500 hover:bg-red-600',
      darkred: 'bg-red-800 hover:bg-red-900',
    };
    
    return (
      <div
        className={`relative aspect-square ${colorClasses[heatBand.color]} cursor-pointer rounded transition-all flex items-center justify-center text-white font-bold text-sm`}
        title={`L${likelihood + 1} × I${impact + 1} = ${score}\n${cell.count} risks`}
      >
        {cell.count > 0 && cell.count}
      </div>
    );
  };
  
  // Risk Row Component
  const RiskRow = ({ risk }) => {
    const inherent = risk.assessment?.inherent_risk;
    const residual = risk.assessment?.residual_risk;
    
    return (
      <tr className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}>
        <td className="px-6 py-4">
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {risk.title}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {risk.category || 'Uncategorized'}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              L: {inherent?.likelihood} / I: {inherent?.impact}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Score: {inherent?.score}
          </div>
        </td>
        <td className="px-6 py-4">
          <HeatBandBadge heatBand={inherent?.heat_band_key} />
        </td>
        <td className="px-6 py-4">
          {residual ? (
            <div className="space-y-1">
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Score: {residual.score}
              </div>
              <div className="text-xs text-green-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                -{risk.assessment.reduction?.percentage_reduction}%
              </div>
            </div>
          ) : (
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Not treated
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {risk.owner_name || 'Unassigned'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRisk(risk);
                setShowDetailsModal(true);
              }}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssessRisk(risk.id, {});
              }}
              className="p-1 text-purple-600 hover:text-purple-800"
              title="Assess"
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddTreatment(risk.id, {});
              }}
              className="p-1 text-green-600 hover:text-green-800"
              title="Add Treatment"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Risk Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Identify, assess, and mitigate organizational risks
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Risk
        </button>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Risks
            </span>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {riskMetrics?.total || 0}
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              High Priority
            </span>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {riskMetrics?.high_priority_count || 0}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Requires immediate action
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Avg. Risk Score
            </span>
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {riskMetrics?.average_score?.toFixed(1) || '0.0'}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Out of 25
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Untreated
            </span>
            <XCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {riskMetrics?.untreated_count || 0}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Need treatment plans
          </div>
        </div>
      </div>
      
      {/* Risk Heat Map */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Risk Heat Map (Likelihood × Impact)
        </h2>
        
        <div className="grid grid-cols-6 gap-2">
          {/* Column headers (Impact) */}
          <div></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={`impact-${i}`} className="text-center text-sm font-medium text-gray-600">
              I{i}
            </div>
          ))}
          
          {/* Rows (Likelihood - reversed for visual representation) */}
          {[4, 3, 2, 1, 0].map(l => (
            <React.Fragment key={`row-${l}`}>
              <div className="flex items-center justify-center text-sm font-medium text-gray-600">
                L{l + 1}
              </div>
              {[0, 1, 2, 3, 4].map(i => (
                <HeatMapCell
                  key={`cell-${l}-${i}`}
                  cell={heatMap[4 - l]?.[i] || { count: 0 }}
                  likelihood={l}
                  impact={i}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          {Object.entries(HEAT_BANDS).map(([key, band]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${
                band.color === 'green' ? 'bg-green-500' :
                band.color === 'yellow' ? 'bg-yellow-500' :
                band.color === 'orange' ? 'bg-orange-500' :
                band.color === 'red' ? 'bg-red-500' :
                'bg-red-800'
              }`}></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {band.label} ({band.min}-{band.max})
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Heat Band Distribution */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Risk Distribution by Heat Band
        </h2>
        
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(riskMetrics?.by_heat_band || {}).map(([band, count]) => {
            const bandConfig = HEAT_BANDS[band];
            return (
              <div key={band} className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {count}
                </div>
                <HeatBandBadge heatBand={band} />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Filters */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.heat_band}
            onChange={(e) => setFilters({ ...filters, heat_band: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Heat Bands</option>
            {Object.keys(HEAT_BANDS).map(band => (
              <option key={band} value={band}>{HEAT_BANDS[band].label}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_treatment">In Treatment</option>
            <option value="mitigated">Mitigated</option>
            <option value="accepted">Accepted</option>
          </select>
          
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>
      
      {/* Risks Table */}
      <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="w-full">
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inherent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heat Band</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Residual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {risks.map(risk => (
              <RiskRow key={risk.id} risk={risk} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskManagementModuleEnhanced;
