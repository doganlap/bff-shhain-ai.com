import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const RealTimeMonitor = ({ metrics = [] }) => {
  if (metrics.length === 0) return null;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-xl border-2 ${getStatusColor(metric.status)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{metric.label}</span>
            {getTrendIcon(metric.trend)}
          </div>
          <div className="text-2xl font-bold">{metric.value}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};