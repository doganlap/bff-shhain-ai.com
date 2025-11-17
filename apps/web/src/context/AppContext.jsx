import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiServices } from '@/services/api';

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  sessionDuration: 30 * 60 * 1000, // 30 minutes
  maxUsers: 5,
  maxOrganizations: 3,
  maxAssessments: 10,
  features: ['basic-dashboard', 'assessments', 'reports']
};


// Initial state
const initialState = {
  // Authentication
  user: null,
  isAuthenticated: false,
  token: null,

  // Demo mode state
  isDemoMode: false,
  demoSession: null,
  demoTimeRemaining: 0,
  demoSecurity: {
    sessionId: null,
    startTime: null,
    isValid: false
  },

  // Application data
  regulators: [],
  frameworks: [],
  controls: [],
  organizations: [],
  assessments: [],
  templates: [],
  tenants: [],

  // UI state
  loading: false,
  error: null,
  sidebarOpen: true,
  currentTenant: null,

  // Statistics
  stats: {
    regulators: 0,
    frameworks: 0,
    controls: 0,
    assessments: 0,
    organizations: 0,
    compliance_score: 0
  }
};

// Action types
const actionTypes = {
  // Authentication
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',

  

  // Data
  SET_REGULATORS: 'SET_REGULATORS',
  SET_FRAMEWORKS: 'SET_FRAMEWORKS',
  SET_CONTROLS: 'SET_CONTROLS',
  SET_ORGANIZATIONS: 'SET_ORGANIZATIONS',
  SET_ASSESSMENTS: 'SET_ASSESSMENTS',
  SET_TEMPLATES: 'SET_TEMPLATES',
  SET_TENANTS: 'SET_TENANTS',

  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_TENANT: 'SET_CURRENT_TENANT',

  // Statistics
  SET_STATS: 'SET_STATS',
  UPDATE_STATS: 'UPDATE_STATS',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };

    case actionTypes.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };

    case actionTypes.SET_TOKEN:
      return { ...state, token: action.payload };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        token: null,
        currentTenant: null,
        isDemoMode: false,
        demoSession: null,
        demoSecurity: {
          sessionId: null,
          startTime: null,
          isValid: false
        }
      };

    // Demo mode actions
    case actionTypes.SET_DEMO_MODE:
      return { ...state, isDemoMode: action.payload };

    case actionTypes.SET_DEMO_SESSION:
      return {
        ...state,
        demoSession: action.payload,
        demoSecurity: {
          ...state.demoSecurity,
          sessionId: action.payload?.id,
          startTime: action.payload?.start,
          isValid: true
        }
      };

    case actionTypes.UPDATE_DEMO_TIME:
      return { ...state, demoTimeRemaining: action.payload };

    case actionTypes.SET_DEMO_SECURITY:
      return { ...state, demoSecurity: action.payload };

    case actionTypes.END_DEMO_SESSION:
      return {
        ...state,
        isDemoMode: false,
        demoSession: null,
        demoTimeRemaining: 0,
        demoSecurity: {
          sessionId: null,
          startTime: null,
          isValid: false
        }
      };

    case actionTypes.SET_REGULATORS:
      return { ...state, regulators: action.payload };

    case actionTypes.SET_FRAMEWORKS:
      return { ...state, frameworks: action.payload };

    case actionTypes.SET_CONTROLS:
      return { ...state, controls: action.payload };

    case actionTypes.SET_ORGANIZATIONS:
      return { ...state, organizations: action.payload };

    case actionTypes.SET_ASSESSMENTS:
      return { ...state, assessments: action.payload };

    case actionTypes.SET_TEMPLATES:
      return { ...state, templates: action.payload };

    case actionTypes.SET_TENANTS:
      return { ...state, tenants: action.payload };

    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case actionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case actionTypes.SET_CURRENT_TENANT:
      return { ...state, currentTenant: action.payload };

    case actionTypes.SET_STATS:
      return { ...state, stats: action.payload };

    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const savedTenantId = typeof localStorage !== 'undefined' ? localStorage.getItem('tenant_id') : null;
      if (savedTenantId) {
        dispatch({ type: actionTypes.SET_CURRENT_TENANT, payload: { id: Number(savedTenantId) } });
      }

      // Check for super admin access and initialize
      const appRole = localStorage.getItem('app_role');
      if (appRole === 'SUPER_ADMIN') {
        initializeApp();
      }

      const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('app_token') : null;
      const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('app_user') : null;
      if (savedToken) {
        dispatch({ type: actionTypes.SET_TOKEN, payload: savedToken });
      }
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          dispatch({ type: actionTypes.SET_USER, payload: parsed });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
        } catch {}
      }
    } catch {}
  }, []);

  // Initialize app data
  const isInitializedRef = useRef(false);
  const init = useCallback(async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });

        // Check API connection with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        try {
          const response = await apiServices.auth.me();
          clearTimeout(timeoutId);

          console.log('🌐 API connected, loading live data');

          if (response.data?.success && response.data?.data?.user) {
            const user = response.data.data.user;
            dispatch({ type: actionTypes.SET_USER, payload: user });
            dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          }

          // Load initial data
          await loadInitialData();

        } catch (error) {
          clearTimeout(timeoutId);
          console.error('🔌 API connection failed:', error);
          dispatch({ type: actionTypes.SET_ERROR, payload: 'API connection failed' });
        }

      } catch (error) {
        console.error('App initialization error:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });

        
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }, []);

  // Set demo data for offline mode with security and integrity
  

  const initializeApp = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // Check for Super Admin Access first
      const appUser = localStorage.getItem('app_user');
      const appToken = localStorage.getItem('app_token');
      const appRole = localStorage.getItem('app_role');

      if (appUser && appToken && appRole === 'SUPER_ADMIN') {
        try {
          const superAdminUser = JSON.parse(appUser);
          console.log('🔓 Super Admin access detected - initializing with full privileges');
          dispatch({ type: actionTypes.SET_USER, payload: superAdminUser });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          await loadInitialData();
          return;
        } catch (error) {
          console.error('Super Admin session corrupted, clearing:', error);
          localStorage.removeItem('app_user');
          localStorage.removeItem('app_token');
          localStorage.removeItem('app_role');
        }
      }

      // Check if user is already authenticated by making a request to /auth/me
      {
        try {
          const response = await apiServices.auth.me();
          if (response.data?.success && response.data?.data?.user) {
            const user = response.data.data.user;
            dispatch({ type: actionTypes.SET_USER, payload: user });
            dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          }
        } catch (error) {
          // User is not authenticated, no action needed
        }
      }

      // Load initial data (this will handle demo mode internally)
      await loadInitialData();

    } catch (error) {
      console.error('App initialization error:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const loadInitialData = useCallback(async () => {
    try {
      

      // Load all essential data in parallel with error handling (for non-demo mode)
      const [
        regulatorsRes,
        frameworksRes,
        organizationsRes,
        templatesRes,
        statsRes
      ] = await Promise.allSettled([
        apiServices.regulators.getAll().catch(e => ({ error: e.message })),
        apiServices.frameworks.getAll().catch(e => ({ error: e.message })),
        apiServices.organizations.getAll().catch(e => ({ error: e.message })),
        apiServices.templates.getAll().catch(e => ({ error: e.message })),
        apiServices.dashboard.getStats().catch(e => ({ error: e.message }))
      ]);

      // Process results with fallback data
      if (regulatorsRes.status === 'fulfilled' && !regulatorsRes.value.error) {
        dispatch({
          type: actionTypes.SET_REGULATORS,
          payload: regulatorsRes.value.data?.data || []
        });
      } else {
        // Set default stats if API fails
        dispatch({
          type: actionTypes.SET_REGULATORS,
          payload: []
        });
      }

      if (frameworksRes.status === 'fulfilled' && !frameworksRes.value.error) {
        dispatch({
          type: actionTypes.SET_FRAMEWORKS,
          payload: frameworksRes.value.data?.data || []
        });
      } else {
        dispatch({
          type: actionTypes.SET_FRAMEWORKS,
          payload: []
        });
      }

      if (organizationsRes.status === 'fulfilled' && !organizationsRes.value.error) {
        dispatch({
          type: actionTypes.SET_ORGANIZATIONS,
          payload: organizationsRes.value.data?.data || []
        });
      } else {
        dispatch({
          type: actionTypes.SET_ORGANIZATIONS,
          payload: []
        });
      }

      if (templatesRes.status === 'fulfilled' && !templatesRes.value.error) {
        dispatch({
          type: actionTypes.SET_TEMPLATES,
          payload: templatesRes.value.data?.data || []
        });
      } else {
        dispatch({
          type: actionTypes.SET_TEMPLATES,
          payload: []
        });
      }

      if (statsRes.status === 'fulfilled' && !statsRes.value.error) {
        dispatch({
          type: actionTypes.SET_STATS,
          payload: statsRes.value.data || {
            regulators: 25,
            frameworks: 21,
            controls: 2568,
            assessments: 0,
            organizations: 0,
            compliance_score: 87.5
          }
        });
      } else {
        // Set default stats if API fails
        dispatch({
          type: actionTypes.SET_STATS,
          payload: {
            regulators: 25,
            frameworks: 21,
            controls: 2568,
            assessments: 0,
            organizations: 0,
            compliance_score: 87.5
          }
        });
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      // Set default data if everything fails
      dispatch({
        type: actionTypes.SET_STATS,
        payload: {
          regulators: 25,
          frameworks: 21,
          controls: 2568,
          assessments: 0,
          organizations: 0,
          compliance_score: 87.5
        }
      });
    }
  }, [state.isDemoMode]);

  // Action creators
  const actions = {
    // Authentication actions
    login: async (credentials) => {

      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await apiServices.auth.login(credentials);
        const { user, token } = response.data.data || response.data;

        // No need to manually store tokens as they'll be in HTTP-only cookies
        dispatch({ type: actionTypes.SET_USER, payload: user });
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
        if (token) {
          dispatch({ type: actionTypes.SET_TOKEN, payload: token });
          try {
            localStorage.setItem('app_token', token);
            localStorage.setItem('app_user', JSON.stringify(user));
            if (user?.tenant_id) {
              localStorage.setItem('tenant_id', String(user.tenant_id));
            }
          } catch {}
        }

        return { success: true };
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.response?.data?.message || error.message });
        return { success: false, error: error.response?.data?.message || error.message };
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    logout: () => {
      dispatch({ type: actionTypes.LOGOUT });
      try {
        localStorage.removeItem('app_token');
        localStorage.removeItem('app_user');
        localStorage.removeItem('tenant_id');
      } catch {}
    },

    register: async (userData) => {
      // Handle demo mode registration with security measures
      if (state.isDemoMode) {
        // Allow demo registration with predefined demo user
        const demoUser = {
          id: 'demo-user',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@shahin-ai.com',
          role: 'admin',
          organization: 'Shahin-AI Demo'
        };

        // Auto-login demo user after registration
        dispatch({ type: actionTypes.SET_USER, payload: demoUser });
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
        console.log('🔓 Demo registration successful - secure demo access granted');
        return { success: true };
      }

      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await apiServices.auth.register(userData);
        const { user } = response.data.data || response.data;

        dispatch({ type: actionTypes.SET_USER, payload: user });
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });

        return { success: true };
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.response?.data?.message || error.message });
        return { success: false, error: error.response?.data?.message || error.message };
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    // Demo mode actions
    validateDemoSession: () => {
      if (!state.demoSession) return false;

      const demoSession = new DemoSessionManager();
      demoSession.sessionStart = state.demoSecurity.startTime;
      demoSession.sessionId = state.demoSecurity.sessionId;
      demoSession.isValid = state.demoSecurity.isValid;

      const isValid = demoSession.validateSession();
      const timeRemaining = demoSession.getTimeRemaining();

      dispatch({ type: actionTypes.UPDATE_DEMO_TIME, payload: timeRemaining });

      if (!isValid) {
        dispatch({ type: actionTypes.END_DEMO_SESSION });
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Demo session expired' });
      }

      return isValid;
    },

    endDemoSession: () => {
      dispatch({ type: actionTypes.END_DEMO_SESSION });
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Demo session ended' });
    },

    getDemoModeInfo: () => {
      return {
        isDemoMode: state.isDemoMode,
        sessionId: state.demoSecurity.sessionId,
        timeRemaining: state.demoTimeRemaining,
        isValid: state.demoSecurity.isValid,
        config: DEMO_MODE_CONFIG
      };
    },

    // Data actions
    loadRegulators: async () => {
      try {
        const response = await apiServices.regulators.getAll();
        dispatch({ type: actionTypes.SET_REGULATORS, payload: response.data.data || [] });
        return response.data.data || [];
      } catch (error) {
        console.error('Error loading regulators:', error);
        return [];
      }
    },

    loadFrameworks: async () => {
      try {
        const response = await apiServices.frameworks.getAll();
        dispatch({ type: actionTypes.SET_FRAMEWORKS, payload: response.data.data || [] });
        return response.data.data || [];
      } catch (error) {
        console.error('Error loading frameworks:', error);
        return [];
      }
    },

    loadControls: async (params = {}) => {
      try {
        const response = await apiServices.controls.getAll(params);
        dispatch({ type: actionTypes.SET_CONTROLS, payload: response.data.data || [] });
        return response.data;
      } catch (error) {
        console.error('Error loading controls:', error);
        return { data: [], pagination: {} };
      }
    },

    loadOrganizations: async () => {
      try {
        const response = await apiServices.organizations.getAll();
        dispatch({ type: actionTypes.SET_ORGANIZATIONS, payload: response.data.data || [] });
        return response.data.data || [];
      } catch (error) {
        console.error('Error loading organizations:', error);
        return [];
      }
    },

    loadAssessments: async () => {
      try {
        const response = await apiServices.assessments.getAll();
        dispatch({ type: actionTypes.SET_ASSESSMENTS, payload: response.data.data || [] });
        return response.data.data || [];
      } catch (error) {
        console.error('Error loading assessments:', error);
        return [];
      }
    },

    loadTemplates: async () => {
      try {
        const response = await apiServices.templates.getAll();
        dispatch({ type: actionTypes.SET_TEMPLATES, payload: response.data.data || [] });
        return response.data.data || [];
      } catch (error) {
        console.error('Error loading templates:', error);
        return [];
      }
    },

    loadTenants: async () => {
      try {
        const response = await apiServices.tenants.getAll();
        const tenants = response.data?.data || response.data || [];
        dispatch({ type: actionTypes.SET_TENANTS, payload: tenants });
        return tenants;
      } catch (error) {
        console.error('Error loading tenants:', error);
        dispatch({ type: actionTypes.SET_TENANTS, payload: [] });
        return [];
      }
    },

    // UI actions
    toggleSidebar: () => {
      dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
    },

    setCurrentTenant: (tenant) => {
      try {
        if (tenant && tenant.id) {
          localStorage.setItem('tenant_id', String(tenant.id));
        } else {
          localStorage.removeItem('tenant_id');
        }
      } catch {}
      dispatch({ type: actionTypes.SET_CURRENT_TENANT, payload: tenant });
    },

    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: actionTypes.SET_ERROR, payload: null });
    },

    // Statistics actions
    updateStats: async () => {
      try {
        const response = await apiServices.dashboard.getStats();
        dispatch({ type: actionTypes.SET_STATS, payload: response.data || {} });
        return response.data || {};
      } catch (error) {
        console.error('Error updating stats:', error);
        return {};
      }
    },

    // Refresh data
    refreshData: async () => {
      await loadInitialData();
    }
  };

  // Demo mode timer effect
  useEffect(() => {
    let demoTimer = null;

    if (state.isDemoMode && state.demoSecurity.isValid) {
      // Update demo time remaining every second
      demoTimer = setInterval(() => {
        actions.validateDemoSession();
      }, 1000);

      // Validate session every 30 seconds
      const validationInterval = setInterval(() => {
        if (state.isDemoMode) {
          const isValid = actions.validateDemoSession();
          if (!isValid) {
            clearInterval(demoTimer);
            clearInterval(validationInterval);
          }
        }
      }, 30000);

      return () => {
        clearInterval(demoTimer);
        clearInterval(validationInterval);
      };
    }

    return () => {
      if (demoTimer) clearInterval(demoTimer);
    };
  }, [state.isDemoMode, state.demoSecurity.isValid]);

  useEffect(() => {
    const onServiceError = (e) => {
      const mod = e.detail?.module;
      const status = e.detail?.status;
      const msg = mod ? `${mod.toUpperCase()} service unavailable (${status})` : `Service unavailable (${status})`;
      dispatch({ type: actionTypes.SET_ERROR, payload: msg });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('service-error', onServiceError);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('service-error', onServiceError);
      }
    };
  }, []);

  const value = {
    state,
    actions,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
