import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '../../hooks/useRBAC';
import { PermissionBasedCard } from '../common/PermissionBasedCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const RoleDashboardCards = ({ roleCards = [], title = "Role Permissions", collapsible = true }) => {
  const { user } = useRBAC();
  const [isExpanded, setIsExpanded] = useState(false);

  if (roleCards.length === 0) return null;

  const visibleCards = isExpanded ? roleCards : roleCards.slice(0, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50"
            type="button"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <><ChevronUp className="w-3 h-3" /> Less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> More</>
            )}
          </button>
        )}
      </div>
      
      <div className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleCards.map((roleCard, index) => (
            <PermissionBasedCard
              key={index}
              requiredPermissions={roleCard.permissions}
              title={roleCard.title}
              description={roleCard.description}
              icon={roleCard.icon}
              variant="minimal"
              className="!p-3 !shadow-none !border-0 bg-gray-50 rounded-lg"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};