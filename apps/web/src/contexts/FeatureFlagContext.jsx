/**
 * Feature Flag Context
 * 
 * Global feature flag management for the application
 * Prevents mock data usage in production and controls feature availability
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAllFeatureFlags,
  setFeatureFlag as setFlag,
  isMockDataAllowed,
  requireRealAPIs
} from '../utils/featureFlags';

const FeatureFlagContext = createContext();

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState(() => getAllFeatureFlags());
  const [isProduction, setIsProduction] = useState(process.env.NODE_ENV === 'production');

  // Update flags when environment changes
  useEffect(() => {
    const updateFlags = () => {
      setFlags(getAllFeatureFlags());
      setIsProduction(process.env.NODE_ENV === 'production');
    };

    updateFlags();
    
    // Listen for environment changes (useful for development)
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('feature-flag-changed', updateFlags);
      return () => window.removeEventListener('feature-flag-changed', updateFlags);
    }
  }, []);

  const getFlag = useCallback((flagName) => {
    return flags[flagName] ?? false;
  }, [flags]);

  const setFeatureFlag = useCallback((flagName, value) => {
    if (process.env.NODE_ENV === 'development') {
      setFlag(flagName, value);
      setFlags(getAllFeatureFlags());
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('feature-flag-changed'));
    }
  }, []);

  const isMockDataEnabled = useCallback(() => {
    return isMockDataAllowed();
  }, []);

  const requireRealData = useCallback(() => {
    return requireRealAPIs();
  }, []);

  const getFlagStatus = useCallback(() => {
    return {
      ...flags,
      isProduction,
      mockDataAllowed: isMockDataEnabled(),
      realAPIsRequired: requireRealData()
    };
  }, [flags, isProduction, isMockDataEnabled, requireRealData]);

  const value = {
    flags,
    getFlag,
    setFeatureFlag,
    isMockDataEnabled,
    requireRealData,
    getFlagStatus,
    isProduction
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;