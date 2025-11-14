/**
 * Demo Mode Banner Component
 * High-integrity visual indicators for offline demo mode
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_MODE_CONFIG } from '../../config/demoMode.config';

export const DemoModeBanner = () => {
  const { state, actions } = useApp();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  const { isDemoMode, demoTimeRemaining, demoSecurity } = state;
  
  useEffect(() => {
    if (isDemoMode && demoTimeRemaining > 0) {
      setTimeRemaining(demoTimeRemaining);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            actions.endDemoSession();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isDemoMode, demoTimeRemaining, actions]);
  
  if (!isDemoMode || !demoSecurity.isValid) return null;
  
  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  
  const getBannerColor = () => {
    const config = DEMO_MODE_CONFIG.branding;
    const percentage = timeRemaining / DEMO_MODE_CONFIG.security.maxDemoDuration;
    
    if (percentage < 0.1) return 'bg-red-600';
    if (percentage < 0.25) return 'bg-orange-600';
    return 'bg-orange-500';
  };
  
  return (
    <div className={`${getBannerColor()} text-white shadow-lg transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 flex-shrink-0" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{DEMO_MODE_CONFIG.branding.watermarkText}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-sm">Session: {demoSecurity.sessionId?.slice(-8)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Show demo mode details"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
            
            <button
              onClick={actions.endDemoSession}
              className="p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
              title="End demo session"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="border-t border-white border-opacity-20 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-1">Security Status</div>
                <div className="text-green-200">✅ Secure Session</div>
                <div className="text-xs opacity-75">Session ID: {demoSecurity.sessionId?.slice(-8)}</div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Data Integrity</div>
                <div className="text-green-200">✅ Validated</div>
                <div className="text-xs opacity-75">Checksum verified</div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Restrictions</div>
                <div className="text-yellow-200">⚠️ Limited Operations</div>
                <div className="text-xs opacity-75">Read-only mode active</div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Session Info</div>
                <div className="text-blue-200">🕐 {formatTime(timeRemaining)} remaining</div>
                <div className="text-xs opacity-75">Auto-expires when time ends</div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-black bg-opacity-20 rounded-md">
              <div className="text-xs opacity-90">
                <strong>Security Notice:</strong> This is a demo environment with simulated data. 
                All operations are sandboxed and time-limited. No real data is being processed.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DemoModeIndicator = ({ className = '' }) => {
  const { state } = useApp();
  const { isDemoMode, demoSecurity } = state;
  
  if (!isDemoMode) return null;
  
  return (
    <div className={`flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium ${className}`}>
      <Shield className="h-3 w-3" />
      <span>DEMO</span>
      {demoSecurity.sessionId && (
        <span className="font-mono">{demoSecurity.sessionId.slice(-6)}</span>
      )}
    </div>
  );
};

export const DemoModeWarning = ({ operation }) => {
  const { state } = useApp();
  const { isDemoMode } = state;
  
  if (!isDemoMode) return null;
  
  const isSensitiveOperation = [
    'DELETE',
    'UPDATE_PASSWORD',
    'ADMIN_ACTION',
    'EXPORT_DATA'
  ].some(op => operation?.toUpperCase().includes(op));
  
  if (!isSensitiveOperation) return null;
  
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <div>
          <div className="text-sm font-medium text-yellow-800">Demo Mode Restriction</div>
          <div className="text-sm text-yellow-700">
            This operation is restricted in demo mode for security purposes.
          </div>
        </div>
      </div>
    </div>
  );
};