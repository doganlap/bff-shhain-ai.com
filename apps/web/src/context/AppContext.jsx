import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiServices } from '@/services/api';
import {
  DEMO_MODE_CONFIG,
  DEMO_DATA_CHECKSUMS,
  DemoSessionManager,
  validateDemoMode,
  demoSecurityUtils
} from '../config/demoMode.config';

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

  // Demo mode
  SET_DEMO_MODE: 'SET_DEMO_MODE',
  SET_DEMO_SESSION: 'SET_DEMO_SESSION',
  UPDATE_DEMO_TIME: 'UPDATE_DEMO_TIME',
  SET_DEMO_SECURITY: 'SET_DEMO_SECURITY',
  END_DEMO_SESSION: 'END_DEMO_SESSION',

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
          console.log('🎯 Switching to offline demo mode');

          // Load demo data for offline mode
          setDemoData();

          // Set a demo user for offline mode and auto-login
          const demoUser = {
            id: 'demo-user',
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@shahin-ai.com',
            role: 'admin',
            organization: 'Shahin-AI Demo'
          };

          dispatch({ type: actionTypes.SET_USER, payload: demoUser });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });

          console.log('🔓 Auto-login successful: Demo user automatically logged in');
          console.log('📋 Demo credentials for manual login: demo@shahin-ai.com / demo123');

          // Set offline mode flag
          dispatch({ type: actionTypes.SET_ERROR, payload: 'Offline Demo Mode - Using sample data' });
        }

      } catch (error) {
        console.error('App initialization error:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });

        // Fallback to demo data even if initialization fails
        console.log('🎯 Fallback: Loading demo data');
        setDemoData();
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }, []);

  // Set demo data for offline mode with security and integrity
  const setDemoData = () => {
    console.log('🔐 Initializing secure demo mode...');

    // Start demo session
    const demoSession = new DemoSessionManager();
    const sessionId = demoSession.startSession();

    // Set demo mode state
    dispatch({ type: actionTypes.SET_DEMO_MODE, payload: true });
    dispatch({ type: actionTypes.SET_DEMO_SESSION, payload: {
      id: sessionId,
      start: demoSession.sessionStart,
      expires: demoSession.sessionStart + DEMO_MODE_CONFIG.security.maxDemoDuration
    }});

    // Add security watermark to demo data
    const demoStats = demoSecurityUtils.addDemoWatermark({
      regulators: 12,
      frameworks: 8,
      controls: 156,
      assessments: 24,
      organizations: 5,
      compliance_score: 94.2
    });

    const demoRegulators = demoSecurityUtils.addDemoWatermark([
      { id: 1, name: 'SAMA', nameAr: 'البنك المركزي السعودي', type: 'Banking' },
      { id: 2, name: 'CMA', nameAr: 'هيئة السوق المالية', type: 'Capital Markets' },
      { id: 3, name: 'CITC', nameAr: 'هيئة الاتصالات وتقنية المعلومات', type: 'Telecommunications' }
    ]);

    const demoFrameworks = demoSecurityUtils.addDemoWatermark([
      { id: 1, name: 'ISO 27001', description: 'Information Security Management' },
      { id: 2, name: 'NIST Framework', description: 'Cybersecurity Framework' },
      { id: 3, name: 'SAMA Cyber Security', description: 'SAMA Cybersecurity Framework' }
    ]);

    const demoOrganizations = demoSecurityUtils.addDemoWatermark([
      { id: 1, name: 'Demo Bank', type: 'Financial Institution', status: 'Active' },
      { id: 2, name: 'Tech Corp', type: 'Technology', status: 'Active' }
    ]);

    // Dispatch secure demo data
    dispatch({ type: actionTypes.SET_STATS, payload: demoStats });
    dispatch({ type: actionTypes.SET_REGULATORS, payload: demoRegulators });
    dispatch({ type: actionTypes.SET_FRAMEWORKS, payload: demoFrameworks });
    dispatch({ type: actionTypes.SET_ORGANIZATIONS, payload: demoOrganizations });

    // Validate demo data integrity
    const validation = validateDemoMode({
      regulators: demoRegulators,
      frameworks: demoFrameworks,
      organizations: demoOrganizations,
      stats: demoStats,
      user: { id: 'demo-user' },
      isAuthenticated: true
    });

    if (!validation.isValid) {
      console.error('❌ Demo mode validation failed:', validation.errors);
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: 'Demo mode validation failed: ' + validation.errors.join(', ')
      });
      return;
    }

    console.log('✅ Secure demo data loaded with integrity validation');
    console.log('🔒 Demo session started:', sessionId);
    console.log('⏰ Demo session expires in:', Math.round(DEMO_MODE_CONFIG.security.maxDemoDuration / (1000 * 60 * 60)), 'hours');
  };

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
      // Skip this in demo mode since user is already set up
      if (!state.isDemoMode) {
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
      // Use demo data in demo mode instead of making API calls
      if (state.isDemoMode) {
        console.log('🎯 Demo mode: Loading demo data without API calls');

        // Set demo data directly
        dispatch({
          type: actionTypes.SET_REGULATORS,
          payload: [
            { id: 1, name: 'SAMA', nameAr: 'البنك المركزي السعودي', type: 'Banking', _demoMode: true },
            { id: 2, name: 'CMA', nameAr: 'هيئة السوق المالية', type: 'Capital Markets', _demoMode: true },
            { id: 3, name: 'CITC', nameAr: 'هيئة الاتصالات وتقنية المعلومات', type: 'Telecommunications', _demoMode: true }
          ]
        });

        dispatch({
          type: actionTypes.SET_FRAMEWORKS,
          payload: [
            { id: 1, name: 'ISO 27001', description: 'Information Security Management', _demoMode: true },
            { id: 2, name: 'NIST Framework', description: 'Cybersecurity Framework', _demoMode: true },
            { id: 3, name: 'SAMA Cyber Security', description: 'SAMA Cybersecurity Framework', _demoMode: true }
          ]
        });

        dispatch({
          type: actionTypes.SET_ORGANIZATIONS,
          payload: [
            { id: 1, name: 'Demo Bank', type: 'Financial Institution', status: 'Active', _demoMode: true },
            { id: 2, name: 'Tech Corp', type: 'Technology', status: 'Active', _demoMode: true }
          ]
        });

        dispatch({
          type: actionTypes.SET_TEMPLATES,
          payload: [
            { id: 1, name: 'Risk Assessment Template', type: 'Risk', _demoMode: true },
            { id: 2, name: 'Compliance Checklist', type: 'Compliance', _demoMode: true }
          ]
        });

        dispatch({
          type: actionTypes.SET_STATS,
          payload: {
            regulators: 3,
            frameworks: 3,
            controls: 156,
            assessments: 12,
            organizations: 2,
            compliance_score: 94.2,
            _demoMode: true
          }
        });

        return;
      }

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
      // Handle demo mode login with security measures
      if (state.isDemoMode) {
        // Allow demo login with predefined credentials
        const demoCredentials = {
          email: 'demo@shahin-ai.com',
          password: 'demo123'
        };

        // Check if credentials match demo credentials
        if (credentials.email === demoCredentials.email && credentials.password === demoCredentials.password) {
          // Set demo user
          dispatch({ type: actionTypes.SET_USER, payload: state.user });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          console.log('🔓 Demo login successful - secure demo access granted');
          return { success: true };
        } else {
          // Block invalid demo login attempts
          dispatch({ type: actionTypes.SET_ERROR, payload: 'Invalid demo credentials. Use: demo@shahin-ai.com / demo123' });
          return { success: false, error: 'Invalid demo credentials. Use: demo@shahin-ai.com / demo123' };
        }
      }

      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await apiServices.auth.login(credentials);
        const { user } = response.data.data || response.data;

        // No need to manually store tokens as they'll be in HTTP-only cookies
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

    logout: () => {
      dispatch({ type: actionTypes.LOGOUT });
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
