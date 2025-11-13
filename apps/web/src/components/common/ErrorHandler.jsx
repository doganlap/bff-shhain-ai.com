/**
 * Global Error Handler Component
 * Provides comprehensive error handling and user feedback
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Error Context
const ErrorContext = createContext();

// Error Types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  GENERIC_ERROR: 'GENERIC_ERROR'
};

// Error Provider Component
export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Add error to the queue
  const addError = useCallback((error) => {
    const errorId = Date.now() + Math.random();
    const errorObject = {
      id: errorId,
      message: error.message || 'An unexpected error occurred',
      type: error.type || ERROR_TYPES.GENERIC_ERROR,
      timestamp: new Date().toISOString(),
      originalError: error.originalError || error,
      validationErrors: error.validationErrors || null
    };

    setErrors(prev => [...prev, errorObject]);

    // Auto-remove error after 10 seconds (except network errors)
    if (errorObject.type !== ERROR_TYPES.NETWORK_ERROR) {
      setTimeout(() => {
        removeError(errorId);
      }, 10000);
    }

    return errorId;
  }, []);

  // Remove specific error
  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Handle network status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Clear network errors when back online
      setErrors(prev => prev.filter(error => error.type !== ERROR_TYPES.NETWORK_ERROR));
    };

    const handleOffline = () => {
      setIsOnline(false);
      addError({
        message: 'You are currently offline. Please check your internet connection.',
        type: ERROR_TYPES.NETWORK_ERROR
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addError]);

  const value = {
    errors,
    isOnline,
    addError,
    removeError,
    clearErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorDisplay />
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Error Display Component
const ErrorDisplay = () => {
  const { errors, removeError, isOnline } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">No Internet Connection</span>
        </div>
      )}

      {/* Error Messages */}
      {errors.map((error) => (
        <ErrorMessage key={error.id} error={error} onRemove={removeError} />
      ))}
    </div>
  );
};

// Individual Error Message Component
const ErrorMessage = ({ error, onRemove }) => {
  const getErrorIcon = (type) => {
    switch (type) {
      case ERROR_TYPES.NETWORK_ERROR:
        return <WifiOff className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorColor = (type) => {
    switch (type) {
      case ERROR_TYPES.NETWORK_ERROR:
        return 'bg-red-500';
      case ERROR_TYPES.PERMISSION_ERROR:
        return 'bg-orange-500';
      case ERROR_TYPES.NOT_FOUND_ERROR:
        return 'bg-yellow-500';
      case ERROR_TYPES.SERVER_ERROR:
        return 'bg-red-600';
      case ERROR_TYPES.VALIDATION_ERROR:
        return 'bg-blue-500';
      default:
        return 'bg-gray-600';
    }
  };

  const handleRetry = () => {
    // Reload the page for network errors
    if (error.type === ERROR_TYPES.NETWORK_ERROR) {
      window.location.reload();
    } else {
      onRemove(error.id);
    }
  };

  return (
    <div className={`${getErrorColor(error.type)} text-white px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getErrorIcon(error.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{error.message}</p>
          
          {/* Validation Errors */}
          {error.validationErrors && (
            <ul className="mt-2 text-xs space-y-1">
              {Object.entries(error.validationErrors).map(([field, messages]) => (
                <li key={field}>
                  <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                </li>
              ))}
            </ul>
          )}
          
          {/* Timestamp */}
          <p className="text-xs opacity-75 mt-1">
            {new Date(error.timestamp).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex-shrink-0 flex space-x-1">
          {/* Retry Button for Network Errors */}
          {error.type === ERROR_TYPES.NETWORK_ERROR && (
            <button
              onClick={handleRetry}
              className="text-white hover:text-gray-200 transition-colors"
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={() => onRemove(error.id)}
            className="text-white hover:text-gray-200 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Report error to monitoring service if available
    if (window.errorReporting) {
      window.errorReporting.captureException(error, {
        extra: errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
