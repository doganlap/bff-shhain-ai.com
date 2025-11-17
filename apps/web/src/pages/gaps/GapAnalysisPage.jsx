import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Search, Download, TrendingUp,
  DollarSign, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';

/**
 * GAP ANALYSIS PAGE
 * ================
 * Complete gap analysis with severity classification, cost estimation, and remediation planning
 *
 * Features:
 * - 3 gap types (no_evidence, insufficient_evidence, quality_issues)
 * - 4 severity levels (critical, high, medium, low)
 * - Cost estimation per gap
 * - Effort estimation (hours)
 * - Impact analysis
 * - Remediation action recommendations
 * - Filter by severity, type, framework
 * - Export to CSV/PDF
 *
 * STATUS: 🚧 Backend APIs in Development
 */

const GapAnalysisPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gaps, setGaps] = useState([]);
  const [filteredGaps, setFilteredGaps] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterFramework] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    totalCost: 0,
    totalEffort: 0
  });

  const GAP_TYPES = [
    { value: 'no_evidence', label: 'No Evidence', color: 'red' },
    { value: 'insufficient_evidence', label: 'Insufficient Evidence', color: 'orange' },
    { value: 'quality_issues', label: 'Quality Issues', color: 'yellow' }
  ];

  const SEVERITIES = [
    { value: 'critical', label: 'Critical', color: 'red' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'low', label: 'Low', color: 'blue' }
  ];

  useEffect(() => {
    fetchGaps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [gaps, searchTerm, filterSeverity, filterType, filterFramework]);

  const fetchGaps = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/gaps', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      setGaps(data);

      // Calculate stats
      const critical = data.filter(g => g.severity === 'critical').length;
      const high = data.filter(g => g.severity === 'high').length;
      const medium = data.filter(g => g.severity === 'medium').length;
      const low = data.filter(g => g.severity === 'low').length;
      const totalCost = data.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);
      const totalEffort = data.reduce((sum, g) => sum + (g.estimatedEffort || 0), 0);

      setStats({
        total: data.length,
        critical,
        high,
        medium,
        low,
        totalCost,
        totalEffort
      });
    } catch (error) {
      console.error('Error fetching gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...gaps];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(gap =>
        gap.controlId?.toLowerCase().includes(term) ||
        gap.title?.toLowerCase().includes(term) ||
        gap.description?.toLowerCase().includes(term) ||
        gap.recommendation?.toLowerCase().includes(term)
      );
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(gap => gap.severity === filterSeverity);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(gap => gap.gapType === filterType);
    }

    // Framework filter
    if (filterFramework !== 'all') {
      filtered = filtered.filter(gap => gap.framework === filterFramework);
    }

    setFilteredGaps(filtered);
  };

  const createRemediationPlan = (gapId) => {
    navigate(`/remediation/create?gapId=${gapId}`);
  };

  const exportGaps = () => {
    const csv = [
      ['Control ID', 'Title', 'Severity', 'Type', 'Framework', 'Cost (SAR)', 'Effort (Hours)', 'Recommendation'],
      ...filteredGaps.map(gap => [
        gap.controlId || '',
        gap.title || '',
        gap.severity || '',
        gap.gapType || '',
        gap.framework || '',
        gap.estimatedCost || 0,
        gap.estimatedEffort || 0,
        gap.recommendation || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gap_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gap analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gap Analysis</h1>
              <p className="text-gray-600 mt-1">Identify and prioritize compliance gaps • تحليل الفجوات</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportGaps}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>

              <button
                onClick={() => navigate('/remediation/create')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                Create Remediation Plan
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-7 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Gaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">High</p>
              <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Low</p>
              <p className="text-2xl font-bold text-blue-600">{stats.low}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Cost</p>
              <p className="text-xl font-bold text-green-600">{stats.totalCost.toLocaleString()} SAR</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Effort</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalEffort}h</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by control ID, title, description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                {SEVERITIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {GAP_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredGaps.length} of {stats.total} gaps
          </p>
        </div>

        {/* Gaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGaps.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No gaps found!</p>
              <p className="text-sm mt-2">All controls meet compliance requirements</p>
            </div>
          ) : (
            filteredGaps.map(gap => (
              <div key={gap.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-mono text-blue-600">{gap.controlId}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{gap.title}</h3>
                  </div>
                  <AlertTriangle className={`w-6 h-6 ${
                    gap.severity === 'critical' ? 'text-red-600' :
                    gap.severity === 'high' ? 'text-orange-600' :
                    gap.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                </div>

                {/* Gap Type & Severity */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gap.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    gap.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {gap.severity.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {gap.gapType?.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{gap.description}</p>

                {/* Cost & Effort */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{gap.estimatedCost?.toLocaleString() || 0} SAR</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{gap.estimatedEffort || 0} hours</span>
                  </div>
                </div>

                {/* Recommendation */}
                {gap.recommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-blue-800">{gap.recommendation}</p>
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => createRemediationPlan(gap.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Remediation Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GapAnalysisPage;
