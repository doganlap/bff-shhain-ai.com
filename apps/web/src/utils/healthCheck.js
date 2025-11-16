/**
 * Health Check Utilities for Web Frontend
 * Provides health status monitoring for the frontend application
 */

import { useState } from 'react';

/**
 * Check if the BFF API is accessible
 */
export const checkBFFHealth = async () => {
  try {
    const bffUrl = import.meta.env.VITE_BFF_URL || import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${bffUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        service: 'BFF',
        data: data,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'degraded',
        service: 'BFF',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'BFF',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check browser capabilities and environment
 */
export const checkBrowserHealth = () => {
  const checks = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    webSocket: typeof WebSocket !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window
  };

  const failedChecks = Object.entries(checks)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    status: failedChecks.length === 0 ? 'healthy' : 'degraded',
    service: 'Browser',
    capabilities: checks,
    failedChecks: failedChecks,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check environment configuration
 */
export const checkEnvironmentHealth = () => {
  const requiredEnvVars = [
    'VITE_BFF_URL',
    'VITE_API_BASE_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];

  const missingVars = requiredEnvVars.filter(varName => 
    !import.meta.env[varName]
  );

  const envVars = {};
  requiredEnvVars.forEach(varName => {
    envVars[varName] = import.meta.env[varName] || 'NOT_SET';
  });

  return {
    status: missingVars.length === 0 ? 'healthy' : 'degraded',
    service: 'Environment',
    environment: import.meta.env.MODE,
    requiredVars: envVars,
    missingVars: missingVars,
    timestamp: new Date().toISOString()
  };
};

/**
 * Comprehensive health check for the frontend
 */
export const performHealthCheck = async () => {
  const startTime = performance.now();
  
  const [bffHealth, browserHealth, envHealth] = await Promise.allSettled([
    checkBFFHealth(),
    Promise.resolve(checkBrowserHealth()),
    Promise.resolve(checkEnvironmentHealth())
  ]);

  const results = {
    bff: bffHealth.status === 'fulfilled' ? bffHealth.value : { status: 'error', error: bffHealth.reason },
    browser: browserHealth.status === 'fulfilled' ? browserHealth.value : { status: 'error', error: browserHealth.reason },
    environment: envHealth.status === 'fulfilled' ? envHealth.value : { status: 'error', error: envHealth.reason }
  };

  // Calculate overall status
  const statuses = Object.values(results).map(r => r.status);
  const overallStatus = statuses.every(s => s === 'healthy') ? 'healthy' :
                       statuses.some(s => s === 'healthy') ? 'degraded' : 'unhealthy';

  const endTime = performance.now();

  return {
    status: overallStatus,
    service: 'Frontend',
    timestamp: new Date().toISOString(),
    responseTime: `${(endTime - startTime).toFixed(2)}ms`,
    checks: results,
    summary: {
      healthy: statuses.filter(s => s === 'healthy').length,
      degraded: statuses.filter(s => s === 'degraded').length,
      unhealthy: statuses.filter(s => s === 'unhealthy').length,
      total: statuses.length
    }
  };
};

/**
 * Health check hook for React components
 */
export const useHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const result = await performHealthCheck();
      setHealthStatus(result);
    } catch (error) {
      setHealthStatus({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { healthStatus, isLoading, checkHealth };
};
