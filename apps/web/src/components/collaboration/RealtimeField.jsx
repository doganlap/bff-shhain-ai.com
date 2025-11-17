import React, { useEffect } from 'react';
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import { useRealtimeField } from '@/hooks/useWebSocket';
import { useWebSocket } from '@/context/WebSocketContext.jsx';

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

  const { connected, joinAssessment } = useWebSocket();

  useEffect(() => {
    if (resourceType === 'assessment' && resourceId) {
      joinAssessment(resourceId);
    }
  }, [resourceType, resourceId, joinAssessment]);

  const handleChange = (e) => {
    updateValue(e.target.value);
  };

  const updatingClass = isUpdating ? 'border-yellow-300 bg-yellow-50' : '';
  const offlineClass = !connected ? 'opacity-70 cursor-not-allowed' : '';
  const baseClassName = `${className} ${updatingClass} ${offlineClass}`.trim();

  const renderField = () => {

      switch (type) {
        case 'textarea':
          return (
            <textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={baseClassName}
              disabled={!connected}
              {...props}
            />
          );
        case 'select':
          return (
            <select
              value={value}
              onChange={handleChange}
              className={baseClassName}
              disabled={!connected}
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
              disabled={!connected}
              {...props}
            />
          );
      }
    };

  return (
    <div className="relative">
      {renderField()}

      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
        {!connected ? (
          <WifiOff className="h-4 w-4 text-red-500" title="Offline" />
        ) : isUpdating ? (
          <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" title="Syncing..." />
        ) : (
          <RefreshCw className="h-4 w-4 text-green-500" title="Synced" />
        )}
      </div>
    </div>
  );
};

export default RealtimeField;
