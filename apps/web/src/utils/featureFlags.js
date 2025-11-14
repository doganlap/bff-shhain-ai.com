/**
 * Feature Flags Utility
 * 
 * Prevents fallback to mock data in production
 * Controls feature availability and mock data usage
 */

const FEATURE_FLAGS = {
  // Prevent mock data in production
  PREVENT_MOCK_DATA: process.env.NODE_ENV === 'production',
  
  // Enable/disable specific features
  ENABLE_REAL_APIS_ONLY: process.env.REACT_APP_REAL_APIS_ONLY === 'true',
  
  // Mock data controls
  ALLOW_MOCK_DATA: process.env.NODE_ENV !== 'production' && process.env.REACT_APP_ALLOW_MOCK_DATA !== 'false',
  
  // Feature toggles
  ENABLE_OPTIMISTIC_UPDATES: true,
  ENABLE_PERMISSION_CHECKS: true,
  ENABLE_AUDIT_LOGGING: process.env.NODE_ENV === 'production',
  
  // Development helpers
  SHOW_FEATURE_FLAG_STATUS: process.env.NODE_ENV === 'development',
};

/**
 * Check if mock data is allowed
 */
export const isMockDataAllowed = () => {
  if (FEATURE_FLAGS.PREVENT_MOCK_DATA) {
    return false;
  }
  return FEATURE_FLAGS.ALLOW_MOCK_DATA;
};

/**
 * Check if real APIs are required
 */
export const requireRealAPIs = () => {
  return FEATURE_FLAGS.ENABLE_REAL_APIS_ONLY || FEATURE_FLAGS.PREVENT_MOCK_DATA;
};

/**
 * Get feature flag status
 */
export const getFeatureFlag = (flagName) => {
  return FEATURE_FLAGS[flagName] ?? false;
};

/**
 * Set feature flag (for testing/development)
 */
export const setFeatureFlag = (flagName, value) => {
  if (process.env.NODE_ENV === 'development') {
    FEATURE_FLAGS[flagName] = value;
  }
};

/**
 * Get all feature flags (for debugging)
 */
export const getAllFeatureFlags = () => {
  return { ...FEATURE_FLAGS };
};

/**
 * Mock data guard - throws error if mock data is not allowed
 */
export const guardMockData = (context = 'Unknown') => {
  if (!isMockDataAllowed()) {
    throw new Error(`Mock data is not allowed in ${context}. Please use real API calls.`);
  }
};

/**
 * Create safe mock data function
 */
export const createSafeMockData = (mockFunction, context = 'Unknown') => {
  return (...args) => {
    if (!isMockDataAllowed()) {
      console.warn(`Mock data blocked in ${context}. Returning empty data.`);
      return [];
    }
    return mockFunction(...args);
  };
};

/**
 * Feature flag decorator for components
 */
export const withFeatureFlag = (Component, flagName, fallbackComponent = null) => {
  return (props) => {
    if (!getFeatureFlag(flagName)) {
      return fallbackComponent;
    }
    return <Component {...props} />;
  };
};

export default {
  FEATURE_FLAGS,
  isMockDataAllowed,
  requireRealAPIs,
  getFeatureFlag,
  setFeatureFlag,
  getAllFeatureFlags,
  guardMockData,
  createSafeMockData,
  withFeatureFlag,
};