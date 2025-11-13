// pages/system/VercelStatusDashboard.jsx

import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, GitBranch, Database, Cloud } from 'lucide-react';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const SystemHealthDashboard = () => {
  const { t } = useI18n();
  const [statuses, setStatuses] = useState({ vercel: null, git: null, db: null, apis: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vercelRes, gitRes, dbRes, apiRes] = await Promise.allSettled([
        apiService.vercel.getStatus(),
        apiService.health.getGitStatus(),
        apiService.health.getDbStatus(),
        apiService.health.getApiStatus(),
      ]);

      setStatuses({
        vercel: vercelRes.status === 'fulfilled' ? vercelRes.value.data : { error: 'Failed to fetch' },
        git: gitRes.status === 'fulfilled' ? gitRes.value.data : { error: 'Failed to fetch' },
        db: dbRes.status === 'fulfilled' ? dbRes.value.data : { error: 'Failed to fetch' },
        apis: apiRes.status === 'fulfilled' ? apiRes.value.data : { error: 'Failed to fetch' },
      });

    } catch (err) {
      setError('An unexpected error occurred while fetching system health.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllStatuses();
    const interval = setInterval(fetchAllStatuses, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const StatusCard = ({ title, data, icon, statusKey }) => {
    const isHealthy = data && data.status === 'healthy';
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
          {icon} {title}
        </h2>
        {data ? (
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-lg text-gray-800 dark:text-gray-100">
              {data.error ? data.error : (data.message || data.status)}
            </p>
          </div>
        ) : <p>Loading...</p>}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">360° System Health</h1>
          <button onClick={fetchAllStatuses} disabled={loading} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <RefreshCw className={`w-6 h-6 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard title="Vercel Cloud Status" data={statuses.vercel} icon={<Cloud className="w-6 h-6 mr-3 text-blue-500" />} />
          <StatusCard title="Database Connection" data={statuses.db} icon={<Database className="w-6 h-6 mr-3 text-green-500" />} />
          <StatusCard title="Local Code Status" data={statuses.git} icon={<GitBranch className="w-6 h-6 mr-3 text-purple-500" />} />
          <StatusCard title="Microservice APIs" data={statuses.apis} icon={<Server className="w-6 h-6 mr-3 text-yellow-500" />} />
        </div>

        {/* Detailed API Status */}
        {statuses.apis && statuses.apis.services && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">API Service Details</h2>
            <ul>
              {Object.entries(statuses.apis.services).map(([name, service]) => (
                <li key={name} className="border-t border-gray-200 dark:border-gray-700 py-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{name}</span>
                  <span className={`px-3 py-1 text-sm rounded-full ${service.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {service.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthDashboard;

