/**
 * Regulatory Dashboard Widget
 * Compact version for main dashboard showing recent critical/high urgency changes
 */

import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { regulatoryAPI } from '@/services/api';

const RegulatoryDashboardWidget = () => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentChanges();
  }, []);

  const loadRecentChanges = async () => {
    try {
      const response = await regulatoryAPI.getChanges(null, 5);
      // Filter for critical and high urgency only
      const urgentChanges = (response.data || []).filter(
        change => change.urgency_level === 'critical' || change.urgency_level === 'high'
      );
      setChanges(urgentChanges.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error loading regulatory changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyIcon = (level) => {
    return level === 'critical' ? '🔴' : '🟠';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">تنبيهات تنظيمية</h3>
        </div>
        <Link
          to="/regulatory"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          عرض الكل
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : changes.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">لا توجد تنبيهات عاجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {changes.map(change => (
              <div
                key={change.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => window.location.href = '/regulatory'}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-lg">{getUrgencyIcon(change.urgency_level)}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(change.created_at)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {change.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {change.regulator_name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <Link
          to="/regulatory"
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4" />
          مركز الذكاء التنظيمي
        </Link>
      </div>
    </div>
  );
};

export default RegulatoryDashboardWidget;

