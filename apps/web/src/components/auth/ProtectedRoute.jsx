import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { CulturalLoadingSpinner } from '../Animation/InteractiveAnimationToolkit';
import { useApp } from '../../context/AppContext';
import { apiServices } from '@/services/api';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useApp();

  const hasRequiredPermission = useCallback((user) => {
    if (!requiredPermission) return true;
    const appRole = typeof localStorage !== 'undefined' ? localStorage.getItem('app_role') : null;
    if (appRole === 'SUPER_ADMIN') return true;
    const permissions = (user && (user.permissions || user.roles || user.scopes)) || [];
    if (Array.isArray(permissions)) {
      return permissions.includes(requiredPermission) || permissions.includes('admin') || permissions.includes('*');
    }
    return true;
  }, [requiredPermission]);

  const validateAccess = useCallback(async () => {
    try {
      const devBypass = (import.meta?.env?.DEV) || (import.meta?.env?.VITE_BYPASS_AUTH === 'true');
      if (devBypass) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      const appUser = localStorage.getItem('app_user');
      const appToken = localStorage.getItem('app_token');
      const appRole = localStorage.getItem('app_role');

      if (appUser && appToken && appRole === 'SUPER_ADMIN') {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      if (state.isAuthenticated && state.user) {
        setIsAuthenticated(hasRequiredPermission(state.user));
        setLoading(false);
        return;
      }

      try {
        const me = await apiServices.auth.me();
        const user = me.data?.data?.user || me.data?.user || null;
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          setIsAuthenticated(hasRequiredPermission(user));
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, [state.isAuthenticated, state.user, dispatch]);

  useEffect(() => {
    validateAccess();
  }, [validateAccess]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CulturalLoadingSpinner culturalStyle="modern" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;