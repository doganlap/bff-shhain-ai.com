/**
 * Impact Assessment Modal
 * Shows detailed AI-powered impact analysis of regulatory change
 */

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { regulatoryAPI } from '../../services/api';

const ImpactAssessmentModal = ({ change, onClose }) => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactAnalysis();
  }, [change.id]);

  const loadImpactAnalysis = async () => {
    setLoading(true);
    try {
      const response = await regulatoryAPI.getChangeDetails(change.id);
      setImpactData(response.data?.impact || null);
    } catch (error) {
      console.error('Error loading impact analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactScoreColor = (score) => {
    if (score >= 8) return 'text-red-600 bg-red-100';
    if (score >= 6) return 'text-orange-600 bg-orange-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getCostColor = (cost) => {
    const costs = {
      'Low': 'text-green-600 bg-green-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'High': 'text-red-600 bg-red-100'
    };
    return costs[cost] || costs.Medium;
  };

  const idRef = React.useRef(`impact-modal-${Math.random().toString(36).slice(2, 9)}`);
  const titleId = `${idRef.current}-title`;
  const descriptionId = `${idRef.current}-description`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={change?.regulator_name ? descriptionId : undefined}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 id={titleId} className="text-2xl font-bold text-gray-900 mb-2">
              تقييم التأثير - Impact Assessment
            </h2>
            {change?.regulator_name && (
              <p id={descriptionId} className="text-sm text-gray-600">{change.regulator_name}</p>
            )}
            <h3 className="text-lg font-semibold text-gray-800 mt-2">
              {change.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : impactData ? (
            <div className="space-y-6">
              {/* Impact Score */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">درجة التأثير الإجمالية</p>
                    <p className="text-sm text-gray-500">Overall Impact Score</p>
                  </div>
                  <div className={`text-5xl font-bold px-6 py-3 rounded-lg ${getImpactScoreColor(impactData.impactScore)}`}>
                    {impactData.impactScore}/10
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estimated Cost */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-600">التكلفة المقدرة</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCostColor(impactData.estimatedCost)}`}>
                    {impactData.estimatedCost}
                  </span>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-600">الجدول الزمني</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{impactData.timeline}</p>
                </div>

                {/* Responsible Department */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-600">القسم المسؤول</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{impactData.responsibleDepartment}</p>
                </div>
              </div>

              {/* Key Changes */}
              {impactData.keyChanges && impactData.keyChanges.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    التغييرات الرئيسية - Key Changes
                  </h3>
                  <ul className="space-y-3">
                    {impactData.keyChanges.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700">{change}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Actions */}
              {impactData.requiredActions && impactData.requiredActions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    الإجراءات المطلوبة - Required Actions
                  </h3>
                  <ul className="space-y-3">
                    {impactData.requiredActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{action}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected Organizations */}
              {impactData.affectedOrganizations && impactData.affectedOrganizations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    المنظمات المتأثرة - Affected Organizations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {impactData.affectedOrganizations.map((org, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  🤖 <strong>ملاحظة:</strong> هذا التحليل تم توليده بواسطة الذكاء الاصطناعي (GPT-4) ويجب مراجعته من قبل فريق الامتثال.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This analysis was generated by AI (GPT-4) and should be reviewed by your compliance team.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">تعذر تحميل تحليل التأثير</p>
              <p className="text-sm text-gray-500">Failed to load impact analysis</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            إغلاق - Close
          </button>
          <button
            onClick={async () => {
              try {
                const organizationId = localStorage.getItem('organizationId') || 1;
                await regulatoryAPI.addToCalendar(change.id, organizationId);
                alert('تم الإضافة إلى التقويم بنجاح!');
                onClose();
              } catch (error) {
                alert('حدث خطأ عند الإضافة إلى التقويم');
              }
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            إضافة إلى التقويم - Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessmentModal;

