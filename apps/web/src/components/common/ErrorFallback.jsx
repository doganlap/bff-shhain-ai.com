import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Database } from 'lucide-react';

const ErrorFallback = ({ error, resetError, context = 'general' }) => {
  const getErrorInfo = () => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    
    if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
      return {
        icon: Wifi,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      return {
        icon: Database,
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      return {
        icon: AlertTriangle,
        title: 'Resource Not Found',
        message: 'The requested data could not be found. It may have been moved or deleted.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        icon: AlertTriangle,
        title: 'Authentication Required',
        message: 'Please log in to access this resource.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      };
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      return {
        icon: Database,
        title: 'Server Error',
        message: 'There was a problem with the server. Please try again later.',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }
    
    return {
      icon: AlertTriangle,
      title: 'Something went wrong',
      message: errorMessage,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${errorInfo.bgColor} mb-4`}>
          <Icon className={`h-6 w-6 ${errorInfo.color}`} />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {errorInfo.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {errorInfo.message}
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Page
          </button>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer">Technical Details</summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
              {error?.stack || error?.message || 'No additional details available'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
