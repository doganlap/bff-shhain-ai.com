import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CulturalLoadingSpinner } from '../Animation/InteractiveAnimationToolkit';
import { useApp } from '../../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state } = useApp();

  useEffect(() => {
    checkAuthentication();
  }, [state.isAuthenticated, state.isDemoMode]);

  const checkAuthentication = async () => {
    try {
      // Check for Super Admin Access
      const appUser = localStorage.getItem('app_user');
      const appToken = localStorage.getItem('app_token');
      const appRole = localStorage.getItem('app_role');

      if (appUser && appToken && appRole === 'SUPER_ADMIN') {
        console.log('🔓 Super Admin access verified');
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check if we're in demo mode and user is already authenticated
      if (state.isDemoMode && state.isAuthenticated && state.user) {
        console.log('🔓 Demo mode authentication verified');
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check for token in localStorage for non-demo mode
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Simulate API call to validate token
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock validation - in real app, make API call to verify token
      const user = localStorage.getItem('user');
      if (token && user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CulturalLoadingSpinner culturalStyle="modern" />
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
