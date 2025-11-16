import { useState, useEffect, useCallback } from 'react';
import { apiServices } from '@/services/api';

const useApiData = (endpoint, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    immediate = true,
    maxRetries = 3,
    retryDelay = 1000,
    fallbackData = null,
    onError,
    onSuccess
  } = options;

  const fetchData = useCallback(async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Parse endpoint to get service and method
      const [service, method] = endpoint.split('.');
      
      if (!apiServices[service] || !apiServices[service][method]) {
        throw new Error(`Invalid API endpoint: ${endpoint}`);
      }

      const response = await apiServices[service][method](params);
      const result = response.data?.data || response.data || response;
      
      setData(result);
      setError(null);
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      const shouldRetry = retryAttempt < maxRetries && (
        err.code === 'NETWORK_ERROR' ||
        err.code === 'TIMEOUT' ||
        (err.response?.status >= 500 && err.response?.status !== 429)
      );

      if (shouldRetry) {
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          fetchData(retryAttempt + 1);
        }, retryDelay * Math.pow(2, retryAttempt)); // Exponential backoff
      } else {
        setError({
          message: errorMessage,
          status: err.response?.status,
          code: err.code,
          original: err
        });
        
        if (fallbackData !== null) {
          setData(fallbackData);
        }
        
        if (onError) {
          onError(err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, maxRetries, retryDelay, fallbackData, onError, onSuccess]);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    retryCount,
    isRetrying: retryCount > 0
  };
};

// Specialized hooks for common endpoints
export const useRegulators = (params = {}) => {
  return useApiData('regulators.getAll', params, {
    fallbackData: [],
    maxRetries: 2
  });
};

export const useFrameworks = (params = {}) => {
  return useApiData('frameworks.getAll', params, {
    fallbackData: [],
    maxRetries: 2
  });
};

export const useControls = (params = {}) => {
  return useApiData('controls.getAll', params, {
    fallbackData: { data: [], pagination: { total: 0, page: 1, limit: 20 } },
    maxRetries: 2
  });
};

export const useOrganizations = (params = {}) => {
  return useApiData('organizations.getAll', params, {
    fallbackData: [],
    maxRetries: 2
  });
};

export const useAssessments = (params = {}) => {
  return useApiData('assessments.getAll', params, {
    fallbackData: [],
    maxRetries: 2
  });
};

export const useDashboardStats = () => {
  return useApiData('dashboard.getStats', {}, {
    fallbackData: {
      regulators: 25,
      frameworks: 21,
      controls: 2568,
      assessments: 0,
      organizations: 0,
      compliance_score: 87.5
    },
    maxRetries: 1
  });
};

// Multi-Database Hooks
export const useCrossDbHealth = () => {
  return useApiData('crossDb.getHealth', {}, {
    fallbackData: {
      databases: {
        compliance: { status: 'healthy' },
        finance: { status: 'healthy' },
        auth: { status: 'healthy' }
      }
    },
    maxRetries: 2
  });
};

export const useCrossDbStats = () => {
  return useApiData('crossDb.getStats', {}, {
    fallbackData: {
      compliance: { total_assessments: 0, total_frameworks: 0 },
      finance: { total_tenants: 0, total_licenses: 0 },
      auth: { total_users: 0, total_roles: 0 }
    },
    maxRetries: 2
  });
};

export const useUserProfile = (userId) => {
  return useApiData('crossDb.getUserProfile', userId, {
    fallbackData: null,
    immediate: !!userId,
    maxRetries: 2
  });
};

export const useTenantSummary = (tenantId) => {
  return useApiData('crossDb.getTenantSummary', tenantId, {
    fallbackData: null,
    immediate: !!tenantId,
    maxRetries: 2
  });
};

// Advanced Analytics Hooks
export const useMultiDimensionalAnalytics = (params = {}) => {
  return useApiData('analytics.getMultiDimensional', params, {
    fallbackData: {
      compliance: {},
      finance: {},
      auth: {},
      performance: {},
      risk: {}
    },
    maxRetries: 2
  });
};

export const useComplianceTrends = (params = {}) => {
  return useApiData('analytics.getComplianceTrends', params, {
    fallbackData: { trends: {}, summary: {} },
    maxRetries: 2
  });
};

export const useRiskHeatmap = (params = {}) => {
  return useApiData('analytics.getRiskHeatmap', params, {
    fallbackData: { heatmap: {}, categories: [], risk_levels: [] },
    maxRetries: 2
  });
};

export const useUserActivityPatterns = (params = {}) => {
  return useApiData('analytics.getUserActivityPatterns', params, {
    fallbackData: {
      hourly_patterns: [],
      daily_trends: [],
      user_engagement: []
    },
    maxRetries: 2
  });
};

export const useFinancialPerformance = (params = {}) => {
  return useApiData('analytics.getFinancialPerformance', params, {
    fallbackData: {
      license_metrics: [],
      subscription_metrics: [],
      revenue_trends: []
    },
    maxRetries: 2
  });
};

export const useSystemPerformance = (params = {}) => {
  return useApiData('analytics.getSystemPerformance', params, {
    fallbackData: {
      database_performance: [],
      api_performance: {},
      system_health: {}
    },
    maxRetries: 2
  });
};

export { useApiData };
export default useApiData;
