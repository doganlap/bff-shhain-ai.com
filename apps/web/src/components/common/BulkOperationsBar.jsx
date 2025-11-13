import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, XCircle, Edit, Trash2, Download, 
  UserPlus, X, AlertCircle, Loader
} from 'lucide-react';
import { AnimatedButton } from '../Animation/InteractiveAnimationToolkit';
import { Tooltip } from '../ui/Tooltip';

/**
 * Bulk Operations Bar Component
 * Shows when items are selected and provides bulk action buttons
 */
const BulkOperationsBar = ({
  selectedCount,
  availableActions,
  onAction,
  onClearSelection,
  isProcessing = false,
  processingProgress = 0,
  className = ''
}) => {
  const { t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(null);

  if (selectedCount === 0) return null;

  const getIcon = (iconName) => {
    const icons = {
      CheckCircle, XCircle, Edit, Trash2, Download, UserPlus
    };
    const IconComponent = icons[iconName] || Edit;
    return <IconComponent className="h-4 w-4" />;
  };

  const getVariantClasses = (variant) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    };
    return variants[variant] || variants.secondary;
  };

  const handleAction = (actionKey, action) => {
    // Show confirmation for destructive actions
    if (action.variant === 'danger' && !showConfirmation) {
      setShowConfirmation(actionKey);
      return;
    }

    onAction(actionKey);
    setShowConfirmation(null);
  };

  const handleConfirm = () => {
    if (showConfirmation) {
      onAction(showConfirmation);
      setShowConfirmation(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(null);
  };

  return (
    <div className={`
      fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40
      bg-white border border-gray-200 rounded-lg shadow-lg p-4
      min-w-96 max-w-4xl
      ${className}
    `}>
      {/* Processing Progress */}
      {isProcessing && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>{t('bulkOperations.processing')}</span>
            <span>{Math.round(processingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">
              {t('common.messages.confirmBulkDelete', { count: selectedCount })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {t('common.actions.delete')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 disabled:opacity-50"
            >
              {t('common.actions.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {t('bulkOperations.selectedCount', { count: selectedCount })}
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Tooltip content={t('common.actions.deselectAll')}>
              <X className="h-4 w-4" />
            </Tooltip>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {availableActions.map((action) => (
            <Tooltip
              key={action.key}
              content={action.label}
              position="top"
            >
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => handleAction(action.key, action)}
                disabled={isProcessing}
                className={`
                  ${getVariantClasses(action.variant)}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  getIcon(action.icon)
                )}
                <span className="ml-2 hidden sm:inline">
                  {action.label}
                </span>
              </AnimatedButton>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsBar;
