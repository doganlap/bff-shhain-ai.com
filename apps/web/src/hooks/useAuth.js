import { useContext, useCallback } from 'react';
import AppContext from '../context/AppContext';

/**
 * Authentication hook that provides access to user authentication state and methods
 * This hook wraps the AppContext authentication functionality
 */
export const useAuth = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }

  const { 
    user, 
    isAuthenticated, 
    loading, 
    error,
    login: contextLogin,
    logout: contextLogout 
  } = context;

  // Wrap login method to provide consistent error handling
  const login = useCallback(async (credentials) => {
    try {
      return await contextLogin(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [contextLogin]);

  // Wrap logout method
  const logout = useCallback(() => {
    try {
      contextLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [contextLogout]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };
};

export default useAuth;