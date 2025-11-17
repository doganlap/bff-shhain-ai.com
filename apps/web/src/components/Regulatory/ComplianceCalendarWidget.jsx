/**
 * Compliance Calendar Widget
 * Displays upcoming compliance deadlines
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { regulatoryAPI } from '@/services/api';

const ComplianceCalendarWidget = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);

  const loadDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      // Get user's organization ID from context/auth
      const organizationId = localStorage.getItem('organizationId') || 1;
      
      const response = await regulatoryAPI.getCalendar(organizationId, daysFilter);
      setDeadlines(response.data || []);
    } catch (error) {
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, [daysFilter]);

  useEffect(() => {
    loadDeadlines();
  }, [daysFilter, loadDeadlines]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getDaysUntil = (dateString) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil <= 7) return 'text-red-600 bg-red-50';
    if (daysUntil <= 14) return 'text-orange-600 bg-orange-50';
    if (daysUntil <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          تقويم الامتثال
        </h2>
        <p className="text-sm text-gray-600 mt-1">Compliance Calendar</p>

        {/* Days Filter */}
        <div className="mt-4 flex gap-2">
          {[30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => setDaysFilter(days)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                daysFilter === days
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} يوم
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {deadlines.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">لا توجد مواعيد نهائية قادمة</p>
            <p className="text-sm text-gray-500">No upcoming deadlines</p>
          </div>
        ) : (
          deadlines.map((deadline) => {
            const daysUntil = getDaysUntil(deadline.deadline_date_gregorian);
            const colorClass = getUrgencyColor(daysUntil);

            return (
              <div key={deadline.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {deadline.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {deadline.regulator_name}
                    </p>
                  </div>
                  
                  {daysUntil <= 14 && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>

                {/* Date and Days Until */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(deadline.deadline_date_gregorian)}</span>
                    {deadline.deadline_date_hijri && (
                      <span className="text-gray-500">
                        ({deadline.deadline_date_hijri})
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                    {daysUntil > 0 ? `${daysUntil} يوم` : 'اليوم'}
                  </span>
                </div>

                {/* Action Button */}
                {!deadline.completed && (
                  <button
                    onClick={async () => {
                      try {
                        await regulatoryAPI.markDeadlineComplete(deadline.id);
                        loadDeadlines();
                      } catch (error) {
                      }
                    }}
                    className="mt-3 w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                  >
                    ✓ تحديد كمكتمل
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComplianceCalendarWidget;

