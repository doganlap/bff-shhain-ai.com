/**
 * Licenses Management Page (Platform Admin)
 * Manage license catalog and tenant license assignments
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit2, Users, DollarSign, Calendar, 
  AlertCircle, CheckCircle, XCircle, Search, Filter 
} from 'lucide-react';
import { toast } from 'sonner';
import licensesApi from '../../services/licensesApi';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';

export default function LicensesManagementPage() {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  const [licenses, setLicenses] = useState([]);
  const [tenantLicenses, setTenantLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const data = await licensesApi.getAllLicenses({ 
        category: selectedCategory === 'all' ? undefined : selectedCategory 
      });
      setLicenses(data.data || []);
    } catch (error) {
      console.error('Error loading licenses:', error);
      toast.error('Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };

  const filteredLicenses = licenses.filter(license =>
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'starter': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'professional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'enterprise': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 mb-4 border`}>
        <p className={isDark ? 'text-blue-200 text-sm' : 'text-blue-800 text-sm'}>
          Tips: Use filters to find licenses, Edit to update details, Assign to link a tenant, and Delete to remove.
        </p>
      </div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              License Management
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage license catalog and tenant assignments
            </p>
          </div>
          <button
            onClick={() => toast.info('Create license modal - TBD')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create License
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            License Catalog
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tenant Assignments
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'features'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Features & Entitlements
          </button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <>
          {/* Filters */}
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search licenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* License Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className={`rounded-lg p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <Shield className="w-10 h-10 mx-auto text-blue-600 mb-3" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No licenses found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Try adjusting filters or create a new license.</p>
              <button
                onClick={() => toast.info('Create license modal - TBD')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create License
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLicenses.map((license) => (
                <div
                  key={license.id}
                  className={`rounded-lg shadow-md p-6 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {license.name}
                        </h3>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(license.category)}`}>
                        {license.category}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await licensesApi.updateLicense(license.id, { name: license.name });
                          toast.success('License updated');
                        } catch {
                          toast.error('Failed to update license');
                        }
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                  {/* Description */}
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {license.description}
                  </p>

                  {/* SKU */}
                  <div className="mb-4">
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      SKU: {license.sku}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Monthly</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${license.price_monthly}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Annual</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${license.price_annual}
                      </p>
                    </div>
                  </div>

                  {/* Features Summary */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Trial Period
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {license.trial_days} days
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => toast.info('Assign license - TBD')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Assign to Tenant
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await licensesApi.deleteLicense(license.id);
                          toast.success('License deleted');
                          setLicenses(prev => prev.filter(l => l.id !== license.id));
                        } catch {
                          toast.error('Failed to delete license');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'assignments' && (
        <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Tenant license assignments will be displayed here
          </p>
        </div>
      )}

      {activeTab === 'features' && (
        <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            License features and entitlements will be displayed here
          </p>
        </div>
      )}
    </div>
  );
}
