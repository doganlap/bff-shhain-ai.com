/**
 * Feature Flag Development Panel
 * 
 * Development tool for monitoring and controlling feature flags
 * Only visible in development environment
 */

import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

const FeatureFlagPanel = () => {
  const { flags, getFlagStatus, setFeatureFlag, isProduction } = useFeatureFlags();
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    setStatus(getFlagStatus());
  }, [flags, getFlagStatus]);

  // Only show in development
  if (isProduction) {
    return null;
  }

  const handleFlagToggle = (flagName, currentValue) => {
    setFeatureFlag(flagName, !currentValue);
  };

  const refreshStatus = () => {
    setStatus(getFlagStatus());
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          🚩 Feature Flags
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Feature Flags</h3>
        <div className="flex gap-2">
          <button
            onClick={refreshStatus}
            className="text-gray-300 hover:text-white text-sm"
            title="Refresh Status"
          >
            🔄
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Environment Status</div>
          <div className="flex justify-between text-sm">
            <span>Production Mode:</span>
            <span className={`font-medium ${status.isProduction ? 'text-red-600' : 'text-green-600'}`}>
              {status.isProduction ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Mock Data Allowed:</span>
            <span className={`font-medium ${status.mockDataAllowed ? 'text-green-600' : 'text-red-600'}`}>
              {status.mockDataAllowed ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Real APIs Required:</span>
            <span className={`font-medium ${status.realAPIsRequired ? 'text-green-600' : 'text-gray-600'}`}>
              {status.realAPIsRequired ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Toggle Flags</h4>
          {Object.entries(flags).map(([flagName, flagValue]) => (
            <div key={flagName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{flagName}</div>
                <div className="text-xs text-gray-500">{typeof flagValue}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  flagValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {flagValue ? 'ON' : 'OFF'}
                </span>
                <button
                  onClick={() => handleFlagToggle(flagName, flagValue)}
                  className={`px-3 py-1 text-xs rounded ${
                    flagValue 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {flagValue ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800">
            <strong>Note:</strong> Changes are temporary and only affect this browser session.
            Refresh the page to reset to default values.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagPanel;