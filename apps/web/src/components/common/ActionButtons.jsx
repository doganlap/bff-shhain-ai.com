import React from 'react';
import { 
  Eye, Edit, Trash2, CheckCircle, XCircle, UserPlus, 
  RefreshCw, Download, Upload, Share, Lock, Unlock,
  Play, Pause, Square, MoreHorizontal
} from 'lucide-react';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { AnimatedButton } from '../Animation/InteractiveAnimationToolkit';

/**
 * Role-Based Action Buttons Component
 * Renders CRUD and workflow action buttons based on user permissions
 */

const ActionButtons = ({ 
  resource, 
  resourceId, 
  resourceOwnerId, 
  workflowType, 
  workflowStatus,
  onAction,
  language = 'en',
  size = 'sm',
  variant = 'ghost',
  showLabels = false,
  maxActions = 3,
  className = ''
}) => {
  const {
    getAvailableActions,
    getWorkflowActions,
    canCreate,
    canUpdate,
    canDelete,
    loading
  } = useRolePermissions();

  if (loading) {
    return (
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const getIcon = (iconName) => {
    const icons = {
      Eye, Edit, Trash2, CheckCircle, XCircle, UserPlus,
      RefreshCw, Download, Upload, Share, Lock, Unlock,
      Play, Pause, Square, MoreHorizontal
    };
    const IconComponent = icons[iconName] || MoreHorizontal;
    return <IconComponent className="h-4 w-4" />;
  };

  const getButtonVariant = (actionVariant) => {
    switch (actionVariant) {
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      default: return variant;
    }
  };

  // Get CRUD actions
  const crudActions = resource ? getAvailableActions(resource, resourceOwnerId) : [];
  
  // Get workflow actions
  const workflowActions = workflowType ? getWorkflowActions(workflowType, workflowStatus) : [];
  
  // Combine all actions
  const allActions = [...crudActions, ...workflowActions];
  
  // Limit actions if specified
  const visibleActions = maxActions ? allActions.slice(0, maxActions) : allActions;
  const hiddenActions = maxActions && allActions.length > maxActions ? 
    allActions.slice(maxActions) : [];

  const handleAction = (actionName, actionData) => {
    if (onAction) {
      onAction(actionName, {
        resourceId,
        resource,
        workflowType,
        workflowStatus,
        ...actionData
      });
    }
  };

  if (allActions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Visible Actions */}
      {visibleActions.map((action, index) => (
        <AnimatedButton
          key={action.name}
          variant={getButtonVariant(action.variant)}
          size={size}
          onClick={() => handleAction(action.name, action)}
          title={language === 'ar' ? action.labelAr : action.label}
          className={`${action.variant === 'danger' ? 'hover:bg-red-50 hover:text-red-700' : ''}`}
        >
          {getIcon(action.icon)}
          {showLabels && (
            <span className="ml-2 text-xs">
              {language === 'ar' ? action.labelAr : action.label}
            </span>
          )}
        </AnimatedButton>
      ))}

      {/* More Actions Dropdown */}
      {hiddenActions.length > 0 && (
        <div className="relative group">
          <AnimatedButton
            variant={variant}
            size={size}
            className="relative"
          >
            <MoreHorizontal className="h-4 w-4" />
          </AnimatedButton>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            {hiddenActions.map((action) => (
              <button
                key={action.name}
                onClick={() => handleAction(action.name, action)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                  action.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                }`}
              >
                {getIcon(action.icon)}
                <span className="ml-3">
                  {language === 'ar' ? action.labelAr : action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Specialized Action Button Components
 */

// CRUD Action Buttons
export const CRUDActions = ({ 
  resource, 
  resourceId, 
  resourceOwnerId, 
  onAction, 
  language = 'en',
  showLabels = false 
}) => (
  <ActionButtons
    resource={resource}
    resourceId={resourceId}
    resourceOwnerId={resourceOwnerId}
    onAction={onAction}
    language={language}
    showLabels={showLabels}
    maxActions={3}
  />
);

// Workflow Action Buttons
export const WorkflowActions = ({ 
  workflowType, 
  workflowStatus, 
  workflowId, 
  onAction, 
  language = 'en',
  showLabels = true 
}) => (
  <ActionButtons
    workflowType={workflowType}
    workflowStatus={workflowStatus}
    resourceId={workflowId}
    onAction={onAction}
    language={language}
    showLabels={showLabels}
    size="sm"
    variant="outline"
  />
);

// Quick Action Buttons (Create, Edit, Delete only)
export const QuickActions = ({ 
  resource, 
  resourceId, 
  resourceOwnerId, 
  onAction, 
  language = 'en' 
}) => {
  const { canCreate, canUpdate, canDelete } = useRolePermissions();

  return (
    <div className="flex items-center space-x-2">
      {canCreate(resource) && (
        <AnimatedButton
          variant="primary"
          size="sm"
          onClick={() => onAction('create', { resource })}
        >
          <UserPlus className="h-4 w-4" />
          {language === 'ar' ? 'إنشاء' : 'Create'}
        </AnimatedButton>
      )}
      
      {canUpdate(resource, resourceOwnerId) && (
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={() => onAction('edit', { resourceId, resource })}
        >
          <Edit className="h-4 w-4" />
          {language === 'ar' ? 'تعديل' : 'Edit'}
        </AnimatedButton>
      )}
      
      {canDelete(resource, resourceOwnerId) && (
        <AnimatedButton
          variant="danger"
          size="sm"
          onClick={() => onAction('delete', { resourceId, resource })}
        >
          <Trash2 className="h-4 w-4" />
          {language === 'ar' ? 'حذف' : 'Delete'}
        </AnimatedButton>
      )}
    </div>
  );
};

// Approval Action Buttons
export const ApprovalActions = ({ 
  workflowId, 
  workflowType, 
  onAction, 
  language = 'en',
  disabled = false 
}) => {
  const { canApprove, canReject } = useRolePermissions();

  if (!canApprove(workflowType) && !canReject(workflowType)) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {canApprove(workflowType) && (
        <AnimatedButton
          variant="success"
          size="sm"
          disabled={disabled}
          onClick={() => onAction('approve', { workflowId, workflowType })}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'موافقة' : 'Approve'}
        </AnimatedButton>
      )}
      
      {canReject(workflowType) && (
        <AnimatedButton
          variant="danger"
          size="sm"
          disabled={disabled}
          onClick={() => onAction('reject', { workflowId, workflowType })}
        >
          <XCircle className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'رفض' : 'Reject'}
        </AnimatedButton>
      )}
    </div>
  );
};

// Bulk Action Buttons
export const BulkActions = ({ 
  selectedItems, 
  resource, 
  onAction, 
  language = 'en' 
}) => {
  const { canUpdate, canDelete } = useRolePermissions();

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm text-blue-700">
        {selectedItems.length} {language === 'ar' ? 'عنصر محدد' : 'items selected'}
      </span>
      
      <div className="flex space-x-2 ml-4">
        {canUpdate(resource) && (
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={() => onAction('bulk-edit', { items: selectedItems, resource })}
          >
            <Edit className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تعديل متعدد' : 'Bulk Edit'}
          </AnimatedButton>
        )}
        
        {canDelete(resource) && (
          <AnimatedButton
            variant="danger"
            size="sm"
            onClick={() => onAction('bulk-delete', { items: selectedItems, resource })}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'حذف متعدد' : 'Bulk Delete'}
          </AnimatedButton>
        )}
        
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={() => onAction('export', { items: selectedItems, resource })}
        >
          <Download className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'تصدير' : 'Export'}
        </AnimatedButton>
      </div>
    </div>
  );
};

export default ActionButtons;
