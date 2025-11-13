import React from 'react';

export const StatCard = ({ 
  label, 
  value, 
  delta, 
  trend = 'up',
  icon,
  className = ''
}) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? '↗' : '↘';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {delta && (
            <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
              <span className="mr-1">{trendIcon}</span>
              <span>{delta}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
