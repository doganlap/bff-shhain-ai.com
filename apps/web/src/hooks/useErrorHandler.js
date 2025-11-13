/**
 * useErrorHandler Hook
 * Provides easy error handling for API calls and async operations
 */

import { useCallback } from 'react';
import { useError } from '../components/common/ErrorHandler';

export const useErrorHandler = () => {
  const { addError } = useError();

  // Wrapper for API calls with automatic error handling
  const handleApiCall = useCallback(async (apiCall, options = {}) => {
    const {
      showError = true,
      errorMessage = null,
      onError = null,
      onSuccess = null
    } = options;

    try {
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error('API Call Error:', error);
      
      if (showError) {
        const displayMessage = errorMessage || error.message || 'An error occurred';
        addError({
          message: displayMessage,
          type: error.type || 'GENERIC_ERROR',
          originalError: error,
          validationErrors: error.validationErrors
        });
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error; // Re-throw for component handling if needed
    }
  }, [addError]);

  // Manual error reporting
  const reportError = useCallback((error, customMessage = null) => {
    addError({
      message: customMessage || error.message || 'An error occurred',
      type: error.type || 'GENERIC_ERROR',
      originalError: error,
      validationErrors: error.validationErrors
    });
  }, [addError]);

  // Wrapper for async operations with loading state
  const withErrorHandling = useCallback((asyncFn, options = {}) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        if (options.showError !== false) {
          reportError(error, options.errorMessage);
        }
        
        if (options.onError) {
          options.onError(error);
        }
        
        if (options.rethrow !== false) {
          throw error;
        }
      }
    };
  }, [reportError]);

  return {
    handleApiCall,
    reportError,
    withErrorHandling
  };
};

export default useErrorHandler;
