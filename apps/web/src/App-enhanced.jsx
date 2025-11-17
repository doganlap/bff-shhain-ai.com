import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useI18n } from './hooks/useI18n.jsx';
import { useTheme } from './components/theme/ThemeProvider';

// Import enhanced route configuration
import { enhancedRouteConfig, getEnhancedRoutes, getEnhancedNavigation } from './config/routes-enhanced';

// Import API service for data fetching
import { apiServices } from './services/api';

// Import layout components
import AppLayout from './components/layout/AppLayout';
import AdvancedAppShell from './components/layout/AdvancedAppShell';

// Import Auth Provider
import { useAuth } from './contexts/AuthContext';

// Import UI Components
import { Toaster } from 'sonner';
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * Enhanced App Component with All 36+ Pages and BFF Data Service Integration
 * Features:
 * - Complete route registration for all dashboard variants
 * - BFF data service integration for real-time data
 * - Role-based access control (RBAC)
 * - Error boundary protection
 * - Loading states for data fetching
 */
function App() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [appData, setAppData] = useState({});
  const [loading, setLoading] = useState(true);
  const [navigation, setNavigation] = useState([]);

  // Fetch application data and user permissions
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        if (isAuthenticated && user) {
          // Generate navigation based on user role and permissions
          const userNavigation = getEnhancedNavigation(user.role, user.permissions);
          setNavigation(userNavigation);
          
          // Pre-fetch common dashboard data
          const dashboardData = await fetchDashboardData();
          setAppData(dashboardData);
        } else {
          // Public navigation
          const publicNav = getEnhancedNavigation(null, null);
          setNavigation(publicNav);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [isAuthenticated, user]);

  /**
   * Fetch dashboard data from BFF service
   */
  const fetchDashboardData = async () => {
    try {
      const [stats, kpis, activity] = await Promise.all([
        apiServices.get('/dashboard/stats'),
        apiServices.get('/dashboard/kpis'),
        apiServices.get('/dashboard/activity')
      ]);

      return {
        stats: stats.data,
        kpis: kpis.data,
        activity: activity.data
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return { stats: {}, kpis: {}, activity: [] };
    }
  };

  /**
   * Render route components with data preloading
   */
  const renderRoute = (route, isChild = false) => {
    const RouteComponent = ({ element, dataEndpoint, ...props }) => {
      const [routeData, setRouteData] = useState(null);
      const [routeLoading, setRouteLoading] = useState(true);

      useEffect(() => {
        const loadRouteData = async () => {
          if (dataEndpoint && isAuthenticated) {
            try {
              setRouteLoading(true);
              const response = await apiServices.get(dataEndpoint);
              setRouteData(response.data);
            } catch (error) {
              console.error(`Route data fetch error for ${dataEndpoint}:`, error);
              setRouteData({ error: 'Failed to load data' });
            } finally {
              setRouteLoading(false);
            }
          } else {
            setRouteLoading(false);
          }
        };

        loadRouteData();
      }, [dataEndpoint, isAuthenticated]);

      // Wrap element with data provider
      const elementWithData = React.cloneElement(element, {
        ...props,
        routeData,
        routeLoading,
        appData,
        navigation
      });

      return (
        <ErrorBoundary>
          {elementWithData}
        </ErrorBoundary>
      );
    };

    return RouteComponent;
  };

  /**
   * Build React Router routes from enhanced configuration
   */
  const buildRoutes = () => {
    const routes = [];

    // Public routes
    enhancedRouteConfig.public.forEach(route => {
      routes.push(
        <Route
          key={route.path}
          path={route.path}
          element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          }
        />
      );
    });

    // Advanced routes (dashboard variants)
    enhancedRouteConfig.advanced.forEach(route => {
      routes.push(
        <Route
          key={route.path}
          path={route.path}
          element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          }
        >
          {route.children?.map(child => {
            const RouteComponent = renderRoute(child, true);
            return (
              <Route
                key={child.path}
                path={child.path}
                element={
                  <RouteComponent
                    element={child.element}
                    dataEndpoint={child.dataEndpoint}
                  />
                }
              />
            );
          })}
        </Route>
      );
    });

    // Main app routes
    enhancedRouteConfig.app.forEach(route => {
      routes.push(
        <Route
          key={route.path}
          path={route.path}
          element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          }
        >
          {route.children?.map(child => {
            const RouteComponent = renderRoute(child, true);
            return (
              <Route
                key={child.path}
                path={child.path}
                element={
                  <RouteComponent
                    element={child.element}
                    dataEndpoint={child.dataEndpoint}
                  />
                }
              />
            );
          })}
        </Route>
      );
    });

    // Fallback routes
    enhancedRouteConfig.fallback.forEach(route => {
      routes.push(
        <Route
          key={route.path}
          path={route.path}
          element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          }
        />
      );
    });

    return routes;
  };

  // Show loading spinner during initialization
  if (loading && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
        <p className="ml-4 text-gray-600 dark:text-gray-300">{t('Loading application...')}</p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f3f4f6' : '#111827',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
      
      <Routes>
        {buildRoutes()}
      </Routes>
    </div>
  );
}

export default App;