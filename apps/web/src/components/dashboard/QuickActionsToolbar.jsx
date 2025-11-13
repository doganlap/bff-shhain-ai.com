import React from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '../../hooks/useRBAC';

export const QuickActionsToolbar = ({ actions = [] }) => {
  const { hasPermission } = useRBAC();

  const filteredActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  if (filteredActions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
    >
      <div className="flex flex-wrap gap-2">
        {filteredActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              type="button"
              aria-label={action.label}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};