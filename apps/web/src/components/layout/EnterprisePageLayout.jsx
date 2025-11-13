import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Settings, Bell } from 'lucide-react';

/**
 * Enterprise Page Layout Component
 *
 * Provides consistent layout structure for all pages to avoid double titles
 * and provide enterprise-grade UI consistency
 *
 * Usage:
 * <EnterprisePageLayout
 *   title="Assessments"
 *   subtitle="Manage compliance assessments"
 *   actions={<Button>Create New</Button>}
 *   backButton={true}
 * >
 *   {children}
 * </EnterprisePageLayout>
 */
const EnterprisePageLayout = ({
  // Header props
  title,
  subtitle,
  breadcrumb, // NEW: Breadcrumb text (e.g., "Home / Dashboard")
  actions,
  backButton = false,
  backUrl,

  // Layout props
  children,
  maxWidth = 'full', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding = true,
  className = '',
  compact = false, // NEW: Compact mode for smaller header

  // Feature flags
  showHelp = true,
  showSettings = false,
  showNotifications = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Page Header - Compact Mode */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className={`mx-auto ${padding ? 'px-4 sm:px-6 lg:px-8' : ''} ${compact ? 'py-2' : 'py-3'} ${maxWidthClasses[maxWidth]}`}>
          <div className="flex items-center justify-between">
            {/* Left side: Back button + Breadcrumb/Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {backButton && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Go back"
                  type="button"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}

              <div className="flex-1 min-w-0">
                {/* Breadcrumb on same line as title */}
                <div className="flex items-center space-x-2">
                  {breadcrumb && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {breadcrumb} /
                    </span>
                  )}
                  <h1 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white truncate`}>
                    {title}
                  </h1>
                </div>
                {/* Subtitle - optional in compact mode */}
                {subtitle && !compact && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Actions + Utility buttons */}
            <div className="flex items-center space-x-3 ml-4">
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}

              {/* Utility buttons */}
              <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                {showNotifications && (
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                    title="Notifications"
                    type="button"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                  </button>
                )}

                {showHelp && (
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Help"
                    type="button"
                    aria-label="Help"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                )}

                {showSettings && (
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Settings"
                    type="button"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`mx-auto ${padding ? `px-4 sm:px-6 lg:px-8 ${compact ? 'py-4' : 'py-6'}` : ''} ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  );
};

export default EnterprisePageLayout;
