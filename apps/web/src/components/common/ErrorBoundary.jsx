import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const now = Date.now();
    const timeSinceLastError = this.state.lastErrorTime 
      ? now - this.state.lastErrorTime 
      : Infinity;

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: timeSinceLastError < 5000 ? this.state.errorCount + 1 : 1,
      lastErrorTime: now
    });
    
    // Log error to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Send error to monitoring service in production
    if (import.meta.env.MODE === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // Send error to error tracking service
    try {
      const errorReport = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      // Send to your API endpoint for error logging
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(e => console.error('Failed to send error report:', e));
      
      console.error('Error report:', errorReport);
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  };

  handleRetry = () => {
    // If too many errors in quick succession, suggest page reload instead
    if (this.state.errorCount >= 3) {
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const showDetails = import.meta.env.MODE === 'development';
      const tooManyErrors = this.state.errorCount >= 3;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6 animate-pulse">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {tooManyErrors ? 'Multiple Errors Detected' : 'Something Went Wrong'}
            </h1>
            
            <p className="text-base text-gray-600 mb-6">
              {tooManyErrors 
                ? "We've detected multiple errors. Please refresh the page or contact support if the problem persists."
                : "We're sorry, but something unexpected happened. Your data is safe and we're working to fix this."}
            </p>
            
            {/* Development Error Details */}
            {showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Development Error Details
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Error Message:</p>
                    <pre className="text-xs text-red-600 overflow-auto bg-white p-2 rounded border border-red-200">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Stack Trace:</p>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-40 bg-white p-2 rounded border border-gray-200">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Count Badge */}
            {this.state.errorCount > 1 && (
              <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Error occurred {this.state.errorCount} times
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {tooManyErrors ? 'Reload Page' : 'Try Again'}
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-6 text-sm text-gray-500">
              Need help? <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
