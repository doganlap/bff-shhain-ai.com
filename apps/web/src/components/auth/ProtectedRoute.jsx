import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CulturalLoadingSpinner } from '../Animation/InteractiveAnimationToolkit';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // EMERGENCY BYPASS FOR TESTING ALL 147+ FEATURES
      // This completely bypasses authentication so you can test everything
      console.log('🚀 EMERGENCY SUPER ADMIN TESTING MODE - ALL AUTHENTICATION BYPASSED');
      setIsAuthenticated(true);
      setLoading(false);

      // Store mock super admin user data for testing
      localStorage.setItem('token', 'super-admin-emergency-testing-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'super-admin',
        name: 'Super Administrator',
        email: 'superadmin@grc.com',
        role: 'super_admin',
        permissions: ['*', 'all', 'read', 'write', 'delete', 'admin', 'manager', 'analyst', 'viewer']
      }));

      return;

      // ORIGINAL CODE (commented out for testing)
      /*
      // Check for token in localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // In a real app, you would validate the token with your backend
      // For demo purposes, we'll just check if token exists
      // You could also check token expiration, user permissions, etc.

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
      */
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
