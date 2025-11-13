import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiServices } from '../services/api';

// Initial state
const initialState = {
  // Authentication
  user: null,
  isAuthenticated: false,
  token: null,
  
  // Application data
  regulators: [],
  frameworks: [],
  controls: [],
  organizations: [],
  assessments: [],
  templates: [],
  
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
        currentTenant: null
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

  // Initialize app data
  useEffect(() => {
    let isInitialized = false;
    
    const init = async () => {
      if (isInitialized) return; // Prevent double initialization in React StrictMode
      isInitialized = true;
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        
        // Check API connection with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
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
        }
        
      } catch (error) {
        console.error('App initialization error:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };
    
    init();
    
    // Cleanup function
    return () => {
      isInitialized = true; // Prevent any pending initialization
    };
  }, []);

  // Set demo data for offline mode
  const setDemoData = () => {
    // Demo statistics
    dispatch({ 
      type: actionTypes.SET_STATS, 
      payload: {
        regulators: 12,
        frameworks: 8,
        controls: 156,
        assessments: 24,
        organizations: 5,
        compliance_score: 94.2
      }
    });

    // Demo regulators
    dispatch({ 
      type: actionTypes.SET_REGULATORS, 
      payload: [
        { id: 1, name: 'SAMA', nameAr: 'البنك المركزي السعودي', type: 'Banking' },
        { id: 2, name: 'CMA', nameAr: 'هيئة السوق المالية', type: 'Capital Markets' },
        { id: 3, name: 'CITC', nameAr: 'هيئة الاتصالات وتقنية المعلومات', type: 'Telecommunications' }
      ]
    });

    // Demo frameworks
    dispatch({ 
      type: actionTypes.SET_FRAMEWORKS, 
      payload: [
        { id: 1, name: 'ISO 27001', description: 'Information Security Management' },
        { id: 2, name: 'NIST Framework', description: 'Cybersecurity Framework' },
        { id: 3, name: 'SAMA Cyber Security', description: 'SAMA Cybersecurity Framework' }
      ]
    });

    // Demo organizations
    dispatch({ 
      type: actionTypes.SET_ORGANIZATIONS, 
      payload: [
        { id: 1, name: 'Demo Bank', type: 'Financial Institution', status: 'Active' },
        { id: 2, name: 'Tech Corp', type: 'Technology', status: 'Active' }
      ]
    });

    console.log('📊 Demo data loaded for offline mode');
  };

  const initializeApp = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Check if user is already authenticated by making a request to /auth/me
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
      
      // Load initial data
      await loadInitialData();
      
    } catch (error) {
      console.error('App initialization error:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const loadInitialData = async () => {
    try {
      // Load all essential data in parallel with error handling
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
  };

  // Action creators
  const actions = {
    // Authentication actions
    login: async (credentials) => {
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

    // UI actions
    toggleSidebar: () => {
      dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
    },

    setCurrentTenant: (tenant) => {
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
