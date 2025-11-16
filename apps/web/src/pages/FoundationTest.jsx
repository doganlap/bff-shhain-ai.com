import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Database, Globe, Cpu } from 'lucide-react';

// Simple UI components for the foundation test
const CardComponent = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeaderComponent = ({ children }) => (
  <div className="p-6 pb-4">{children}</div>
);

const CardTitleComponent = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
);

const CardDescriptionComponent = ({ children }) => (
  <p className="text-sm text-gray-500 mt-1">{children}</p>
);

const CardContentComponent = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const BadgeComponent = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ButtonComponent = ({ children, onClick, disabled, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const AlertComponent = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]}`}>
      {children}
    </div>
  );
};

const FoundationTest = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [aiHealthStatus, setAiHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BFF_URL || import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check basic BFF health
      const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const healthData = await healthResponse.json();
      setHealthStatus(healthData);
      
      // Check AI health
      try {
        const aiHealthResponse = await fetch(`${API_BASE_URL}/ai/health`);
        const aiHealthData = await aiHealthResponse.json();
        setAiHealthStatus(aiHealthData);
      } catch (aiError) {
        // AI health check is optional, don't fail the whole test
        setAiHealthStatus({
          ok: false,
          error: 'AI health endpoint not available',
          providers: {}
        });
      }
      
    } catch (err) {
      setError(err.message);
      setHealthStatus({ status: 'error', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'healthy' || status === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'degraded' || status === 'warning') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'healthy' || status === true) {
      return <BadgeComponent variant="success">Healthy</BadgeComponent>;
    } else if (status === 'degraded' || status === 'warning') {
      return <BadgeComponent variant="warning">Degraded</BadgeComponent>;
    } else {
      return <BadgeComponent variant="error">Error</BadgeComponent>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shahin GRC Platform - Foundation Test</h1>
          <p className="text-gray-600">
            This page tests the basic connectivity between the frontend and the BFF (Backend-for-Frontend).
          </p>
        </div>

        {error && (
          <AlertComponent variant="error" className="mb-6">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <AlertDescriptionComponent>
              <strong>Connection Error:</strong> {error}
              <br />
              <small>Make sure the BFF is running on http://localhost:3005</small>
            </AlertDescriptionComponent>
          </AlertComponent>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* BFF Health Status */}
          <CardComponent>
            <CardHeaderComponent>
              <div className="flex items-center justify-between">
                <CardTitleComponent>BFF Health Status</CardTitleComponent>
                <Server className="w-5 h-5 text-gray-400" />
              </div>
              <CardDescriptionComponent>
                Basic health check for the Backend-for-Frontend
              </CardDescriptionComponent>
            </CardHeaderComponent>
            <CardContentComponent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Checking health...</span>
                </div>
              ) : healthStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Service Status</span>
                    {getStatusBadge(healthStatus.status || healthStatus.ok)}
                  </div>
                  
                  {healthStatus.service && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service</span>
                      <BadgeComponent variant="default">{healthStatus.service}</BadgeComponent>
                    </div>
                  )}
                  
                  {healthStatus.environment && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Environment</span>
                      <BadgeComponent variant="default">{healthStatus.environment}</BadgeComponent>
                    </div>
                  )}
                  
                  {healthStatus.timestamp && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check</span>
                      <span className="text-sm text-gray-500">
                        {new Date(healthStatus.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {healthStatus.uptime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(healthStatus.uptime)}s
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No health data available
                </div>
              )}
            </CardContentComponent>
          </CardComponent>

          {/* AI Health Status */}
          <CardComponent>
            <CardHeaderComponent>
              <div className="flex items-center justify-between">
                <CardTitleComponent>AI Services Health</CardTitleComponent>
                <Cpu className="w-5 h-5 text-gray-400" />
              </div>
              <CardDescriptionComponent>
                Status of AI service providers
              </CardDescriptionComponent>
            </CardHeaderComponent>
            <CardContentComponent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Checking AI services...</span>
                </div>
              ) : aiHealthStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Status</span>
                    {getStatusBadge(aiHealthStatus.ok)}
                  </div>
                  
                  {aiHealthStatus.providers && Object.keys(aiHealthStatus.providers).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Providers</h4>
                      <div className="space-y-2">
                        {Object.entries(aiHealthStatus.providers).map(([provider, status]) => (
                          <div key={provider} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{provider}</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(status.configured)}
                              <span className="text-xs text-gray-500">
                                {status.configured ? 'Configured' : 'Not configured'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {aiHealthStatus.error && (
                    <AlertComponent variant="warning">
                      <AlertDescriptionComponent>
                        {aiHealthStatus.error}
                      </AlertDescriptionComponent>
                    </AlertComponent>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  AI health check not available
                </div>
              )}
            </CardContentComponent>
          </CardComponent>
        </div>

        {/* Connection Details */}
        <CardComponent className="mt-6">
          <CardHeaderComponent>
            <CardTitleComponent>Connection Details</CardTitleComponent>
            <CardDescriptionComponent>
              Current API endpoint configuration
            </CardDescriptionComponent>
          </CardHeaderComponent>
          <CardContentComponent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">BFF URL</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {API_BASE_URL}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <BadgeComponent variant="default">
                  {import.meta.env.VITE_NODE_ENV || 'development'}
                </BadgeComponent>
              </div>
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <ButtonComponent onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Refresh Status'}
          </ButtonComponent>
        </div>

        {/* Instructions */}
        <AlertComponent variant="default" className="mt-6">
          <Globe className="w-4 h-4 mr-2" />
          <AlertDescriptionComponent>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Start the BFF: <code className="bg-gray-100 px-1 rounded">cd apps/bff && npm run dev</code></li>
              <li>Start the Frontend: <code className="bg-gray-100 px-1 rounded">cd apps/web && npm run dev</code></li>
              <li>Copy <code className="bg-gray-100 px-1 rounded">.env.stage.example</code> to <code className="bg-gray-100 px-1 rounded">.env.stage</code> and configure as needed</li>
              <li>This page should show green status for both BFF and AI services</li>
            </ol>
          </AlertDescriptionComponent>
        </AlertComponent>
      </div>
    </div>
  );
};

export default FoundationTest;