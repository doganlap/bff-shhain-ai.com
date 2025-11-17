import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Header from './Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import { Toaster } from 'sonner';

const AppLayout = () => {
  const { state, actions } = useApp();
  const { loading } = state;
  const { isRTL } = useI18n();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div 
        className="enterprise-body flex min-h-[100dvh] w-full auto-container"
        dir={isRTL() ? 'rtl' : 'ltr'}
      >
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area - Flexible and Auto-sizing */}
        <div className="flex-1 flex flex-col min-h-0 transition-all duration-300 w-full">
          <Header />
          {state.error && (
            <div className="w-full bg-red-50 border-b border-red-200 text-red-700 px-3 py-2 text-sm flex items-center justify-between">
              <span>{state.error}</span>
              <div className="flex items-center gap-3">
                <button onClick={actions?.refreshData} className="text-red-700 underline">Retry</button>
                <button onClick={actions?.clearError} className="text-red-700 underline">Dismiss</button>
              </div>
            </div>
          )}
          <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isRTL() ? 'text-right' : 'text-left'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} px-3 py-2 text-sm flex items-center gap-3`}>
            <span className={`${state.apiConnectionStatus === 'connected' ? 'text-green-600' : state.isOffline ? 'text-orange-600' : 'text-gray-600'}`}>
              {state.apiConnectionStatus === 'connected' ? 'API Connected' : state.isOffline ? 'Offline Mode' : 'Checking Connection'}
            </span>
            <button onClick={actions?.refreshData} className={`${isDark ? 'text-blue-300' : 'text-blue-600'} hover:underline`} disabled={false}>Refresh</button>
          </div>
          {/* Main Content - Fully Flexible and Responsive */}
          <main className="enterprise-content-area flex-1 min-h-0 overflow-auto">
            <div className="h-full w-full flex flex-col">
              <div className="flex-1 container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-full min-h-0">
                <ErrorBoundary>
                  <div className="h-full w-full flex flex-col">
                    <Outlet />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position={isRTL() ? 'top-left' : 'top-right'}
          richColors
          closeButton
        />
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;
