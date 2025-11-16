import React from 'react';
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import { useRealtimeField } from '../../hooks/useWebSocket';

const RealtimeField = ({
  resourceType,
  resourceId,
  field,
  initialValue = '',
  type = 'text',
  placeholder = '',
  className = '',
  delay = 500,
  ...props
}) => {
  const [value, updateValue, isUpdating] = useRealtimeField(
    resourceType,
    resourceId,
    field,
    initialValue,
    delay
  );

  const handleChange = (e) => {
    updateValue(e.target.value);
  };

  const renderField = () => {
    const baseClassName = `${className} ${
      isUpdating ? 'border-yellow-300 bg-yellow-50' : ''
    }`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={baseClassName}
            {...props}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={handleChange}
            className={baseClassName}
            {...props}
          >
            {props.children}
          </select>
        );
      default:
        return (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={baseClassName}
            {...props}
          />
        );
    }
  };

  return (
    <div className="relative">
      {renderField()}

      {/* Sync Status Indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
        {isUpdating ? (
          <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" title="Syncing..." />
        ) : (
          <RefreshCw className="h-4 w-4 text-green-500" title="Synced" />
        )}
      </div>
    </div>
  );
};

export default RealtimeField;
