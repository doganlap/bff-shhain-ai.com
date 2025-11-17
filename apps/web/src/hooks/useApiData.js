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
    maxRetries: 2
  });
};

export const useFrameworks = (params = {}) => {
  return useApiData('frameworks.getAll', params, {
    maxRetries: 2
  });
};

export const useControls = (params = {}) => {
  return useApiData('controls.getAll', params, {
    maxRetries: 2
  });
};

export const useOrganizations = (params = {}) => {
  return useApiData('organizations.getAll', params, {
    maxRetries: 2
  });
};

export const useAssessments = (params = {}) => {
  return useApiData('assessments.getAll', params, {
    maxRetries: 2
  });
};

export const useDashboardStats = () => {
  return useApiData('dashboard.getStats', {}, {
    maxRetries: 1
  });
};

// Multi-Database Hooks
export const useCrossDbHealth = () => {
  return useApiData('crossDb.getHealth', {}, {
    maxRetries: 2
  });
};

export const useCrossDbStats = () => {
  return useApiData('crossDb.getStats', {}, {
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
    maxRetries: 2
  });
};

export const useComplianceTrends = (params = {}) => {
  return useApiData('analytics.getComplianceTrends', params, {
    maxRetries: 2
  });
};

export const useRiskHeatmap = (params = {}) => {
  return useApiData('analytics.getRiskHeatmap', params, {
    maxRetries: 2
  });
};

export const useUserActivityPatterns = (params = {}) => {
  return useApiData('analytics.getUserActivityPatterns', params, {
    maxRetries: 2
  });
};

export const useFinancialPerformance = (params = {}) => {
  return useApiData('analytics.getFinancialPerformance', params, {
    maxRetries: 2
  });
};

export const useSystemPerformance = (params = {}) => {
  return useApiData('analytics.getSystemPerformance', params, {
    maxRetries: 2
  });
};

export { useApiData };
export default useApiData;
