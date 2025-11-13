import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, BarChart3, Zap, Loader2 } from 'lucide-react';

const QuickActionsToolbar = ({ actions = [], onAction, loading = false }) => {
  const getIcon = (iconName) => {
    const icons = {
      download: Download,
      refresh: RefreshCw,
      chart: BarChart3,
      pulse: Zap
    };
    
    const IconComponent = icons[iconName] || BarChart3;
    return <IconComponent className="w-4 h-4" />;
  };

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction(action.id)}
          disabled={loading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${getVariantStyles(action.variant)}
          `}
        >
          {loading && action.id === 'refresh' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            getIcon(action.icon)
          )}
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActionsToolbar;
