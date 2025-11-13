/**
 * Regulatory Feed Widget
 * Displays recent regulatory changes with urgency indicators
 */

import React from 'react';
import { AlertCircle, ExternalLink, Calendar, Plus, Eye } from 'lucide-react';

const RegulatoryFeedWidget = ({ changes, loading, onViewImpact, urgencyColors }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'تاريخ غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getUrgencyLabel = (level) => {
    const labels = {
      critical: { ar: 'حرج', en: 'Critical', icon: '🔴' },
      high: { ar: 'عالي', en: 'High', icon: '🟠' },
      medium: { ar: 'متوسط', en: 'Medium', icon: '🟡' },
      low: { ar: 'منخفض', en: 'Low', icon: '🟢' }
    };
    return labels[level] || labels.medium;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-indigo-600" />
          التغييرات التنظيمية الأخيرة
        </h2>
        <p className="text-sm text-gray-600 mt-1">Recent Regulatory Changes</p>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-gray-200 max-h-[800px] overflow-y-auto">
        {changes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد تغييرات تنظيمية جديدة</p>
            <p className="text-sm text-gray-500">No new regulatory changes</p>
          </div>
        ) : (
          changes.map((change) => {
            const urgency = getUrgencyLabel(change.urgency_level);
            const colorClass = urgencyColors[change.urgency_level] || urgencyColors.medium;

            return (
              <div key={change.id} className="p-6 hover:bg-gray-50 transition">
                {/* Urgency Badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                    {urgency.icon} {urgency.ar} - {urgency.en}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(change.created_at)}
                  </span>
                </div>

                {/* Regulator */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                    {change.regulator_name}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {change.title}
                </h3>

                {/* Description */}
                {change.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {change.description}
                  </p>
                )}

                {/* Affected Sectors */}
                {change.affected_sectors && change.affected_sectors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {change.affected_sectors.map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                )}

                {/* Deadline */}
                {change.deadline_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      الموعد النهائي: {formatDate(change.deadline_date)}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewImpact(change)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    عرض التأثير
                  </button>

                  <button
                    onClick={() => {
                      // Add to calendar functionality
                      console.log('Add to calendar:', change.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة للتقويم
                  </button>

                  {change.regulation_url && (
                    <a
                      href={change.regulation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      الرابط
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RegulatoryFeedWidget;

