/**
 * Renewals Pipeline Page (120-Day View)
 * Renewal opportunities, dunning schedule, and churn prevention
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, DollarSign, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import renewalsApi from '../../services/renewalsApi';
 
import { useTheme } from '../../components/theme/ThemeProvider';

export default function RenewalsPipelinePage() {
  const { isDark } = useTheme();
  const [renewals, setRenewals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('days_until_expiry');

  const loadRenewals = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.churn_risk = filter;
      }
      const data = await renewalsApi.getRenewalsPipeline(params);
      setRenewals(data.data || []);
    } catch (error) {
      console.error('Error loading renewals:', error);
      toast.error('Failed to load renewals pipeline');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRenewals();
    loadSummary();
  }, [filter, loadRenewals]);

  

  const loadSummary = async () => {
    try {
      const data = await renewalsApi.getRenewalsSummary();
      setSummary(data.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const getChurnRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getDaysUntilExpiryColor = (days) => {
    if (days <= 7) return 'text-red-600 dark:text-red-400';
    if (days <= 30) return 'text-orange-600 dark:text-orange-400';
    if (days <= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  

  const sortedRenewals = [...renewals].sort((a, b) => {
    if (sortBy === 'days_until_expiry') {
      return a.days_until_expiry - b.days_until_expiry;
    }
    if (sortBy === 'arr') {
      return b.current_arr - a.current_arr;
    }
    return 0;
  });

  return (
    <div className={`min-h-screen ${isDark() ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Renewal Pipeline
            </h1>
            <p className={`mt-1 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              120-day renewal forecast and risk management
            </p>
          </div>
          <button
            onClick={loadRenewals}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className={`rounded-lg shadow-md p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>Total Renewals</p>
                <p className={`text-2xl font-bold mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {summary.total_renewals}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>Expiring 30d</p>
                <p className={`text-2xl font-bold mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {summary.expiring_30d}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>ARR at Risk</p>
                <p className={`text-2xl font-bold mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(summary.total_arr_at_risk)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>Critical Risk</p>
                <p className={`text-2xl font-bold mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {summary.critical_risk_count}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className={`mb-6 p-4 rounded-lg ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'high'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              High Risk
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark()
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="days_until_expiry">Sort by Days</option>
            <option value="arr">Sort by ARR</option>
          </select>
        </div>
      </div>

      {/* Renewals Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className={`rounded-lg shadow-md overflow-hidden ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark() ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current ARR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Churn Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedRenewals.map((renewal) => (
                  <tr key={renewal.tenant_license_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {renewal.tenant_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-900'}`}>
                        {renewal.license_name}
                      </div>
                      <div className={`text-xs ${isDark() ? 'text-gray-500' : 'text-gray-500'}`}>
                        {renewal.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-2xl font-bold ${getDaysUntilExpiryColor(renewal.days_until_expiry)}`}>
                        {renewal.days_until_expiry}
                      </span>
                      <span className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}> days</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(renewal.current_arr)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getChurnRiskColor(renewal.churn_risk)}`}>
                        {renewal.churn_risk || 'low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        renewal.renewal_status === 'won'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {renewal.renewal_status || 'open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toast.info('View renewal details - TBD')}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
