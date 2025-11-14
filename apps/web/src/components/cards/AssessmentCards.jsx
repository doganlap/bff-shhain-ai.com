import React from 'react';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Clock, Users, FileText, Target, Zap, Award, ChevronRight
} from 'lucide-react';

/**
 * ASSESSMENT CARD COMPONENTS
 * ==========================
 * Reusable card components for displaying GRC assessment data
 * with scoring, maturity levels, and compliance status.
 *
 * Components:
 * - StatsCard: KPI metrics (total controls, score, completion)
 * - FrameworkCard: Framework info with control count and deadlines
 * - ControlCard: Individual control with maturity and evidence
 * - GapCard: Gap analysis with severity and remediation
 * - ScoreCard: Circular progress with maturity visualization
 * - MaturityBadge: Color-coded maturity level indicator
 */

// ============================================
// MATURITY LEVEL BADGE
// ============================================
export const MaturityBadge = ({ level, size = 'md' }) => {
  const configs = {
    0: { label: 'Not Implemented', labelAr: 'غير منفذ', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800', score: '0%' },
    1: { label: 'Ad-hoc', labelAr: 'عشوائي', color: 'red', bg: 'bg-red-100', text: 'text-red-800', score: '20%' },
    2: { label: 'Developing', labelAr: 'قيد التطوير', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', score: '40%' },
    3: { label: 'Defined', labelAr: 'محدد', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', score: '60%' },
    4: { label: 'Managed', labelAr: 'مُدار', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', score: '80%' },
    5: { label: 'Optimized', labelAr: 'مُحسّن', color: 'green', bg: 'bg-green-100', text: 'text-green-800', score: '100%' }
  };

  const config = configs[level] || configs[0];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} rounded-full font-medium ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
      {config.label} ({config.score})
    </span>
  );
};

// ============================================
// STATS CARD
// ============================================
export const StatsCard = ({ title, titleAr, value, subtitle, icon: Icon, trend, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {titleAr && <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{titleAr}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// FRAMEWORK CARD
// ============================================
export const FrameworkCard = ({ framework, onClick }) => {
  const isMandatory = framework.mandatory;
  const isOverdue = framework.dueDate && new Date(framework.dueDate) < new Date();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
            {isMandatory && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Mandatory
              </span>
            )}
          </div>
          {framework.nameAr && (
            <p className="text-sm text-gray-600 mb-2" dir="rtl">{framework.nameAr}</p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">{framework.description}</p>
        </div>

        <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Controls</p>
          <p className="text-lg font-semibold text-gray-900">{framework.totalControls || 0}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-lg font-semibold text-green-600">{framework.completedControls || 0}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Progress</p>
          <p className="text-lg font-semibold text-blue-600">
            {framework.totalControls > 0
              ? Math.round((framework.completedControls / framework.totalControls) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{
            width: `${framework.totalControls > 0
              ? (framework.completedControls / framework.totalControls) * 100
              : 0}%`
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        {framework.dueDate && (
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4" />
            Due: {new Date(framework.dueDate).toLocaleDateString()}
          </div>
        )}

        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// CONTROL CARD
// ============================================
export const ControlCard = ({ control, onClick }) => {
  const evidenceDelivered = control.evidenceCount > 0;
  const passingScore = control.score >= 60;
  const hasNoEvidence = control.evidenceCount === 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all cursor-pointer border-l-4 ${
        hasNoEvidence
          ? 'border-gray-400'
          : passingScore
            ? 'border-green-500'
            : 'border-red-500'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {control.controlId}
            </span>
            {control.isMandatory && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Mandatory
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{control.title}</h4>
          {control.titleAr && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1" dir="rtl">{control.titleAr}</p>
          )}
        </div>

        {hasNoEvidence ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <XCircle className="w-5 h-5 text-gray-400" />
          </div>
        ) : passingScore ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <MaturityBadge level={control.maturityLevel} size="sm" />

        <div className="flex items-center gap-1.5 text-sm">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className={hasNoEvidence ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {control.evidenceCount} evidence
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Score</p>
          <p className={`text-2xl font-bold ${
            hasNoEvidence
              ? 'text-gray-400'
              : passingScore
                ? 'text-green-600'
                : 'text-red-600'
          }`}>
            {control.score?.toFixed(0)}%
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Status</p>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            hasNoEvidence
              ? 'bg-gray-100 text-gray-800'
              : passingScore
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {hasNoEvidence ? 'No Evidence' : passingScore ? 'Pass' : 'Fail'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GAP CARD
// ============================================
export const GapCard = ({ gap, onClick }) => {
  const severityConfig = {
    critical: { color: 'red', icon: XCircle, label: 'Critical' },
    high: { color: 'orange', icon: AlertTriangle, label: 'High' },
    medium: { color: 'yellow', icon: AlertTriangle, label: 'Medium' },
    low: { color: 'blue', icon: AlertTriangle, label: 'Low' }
  };

  const config = severityConfig[gap.severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all cursor-pointer border-l-4 border-${config.color}-500`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-${config.color}-100 flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${config.color}-600`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 bg-${config.color}-100 text-${config.color}-800 text-xs font-medium rounded uppercase`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500">
              {gap.controlsAffected} controls affected
            </span>
          </div>

          <h4 className="text-base font-semibold text-gray-900 mb-2">{gap.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{gap.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Gap Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {gap.gapType?.replace('_', ' ')}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Est. Cost</p>
              <p className="text-sm font-medium text-gray-900">
                {gap.estimatedCost ? `${gap.estimatedCost.toLocaleString()} SAR` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {gap.estimatedEffort}
            </div>

            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View Remediation
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SCORE CARD (Circular Progress)
// ============================================
export const ScoreCard = ({ title, score, maturityLevel, evidenceCount, targetScore = 60 }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const hasEvidence = evidenceCount > 0;
  const isPassing = score >= targetScore;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width="160" height="160" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
            />

            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={hasEvidence ? (isPassing ? '#10B981' : '#EF4444') : '#9CA3AF'}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-4xl font-bold ${
              hasEvidence ? (isPassing ? 'text-green-600' : 'text-red-600') : 'text-gray-400'
            }`}>
              {score.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Score</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Maturity Level</span>
          <MaturityBadge level={maturityLevel} size="sm" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Evidence Submitted</span>
          <span className={`text-sm font-medium ${hasEvidence ? 'text-green-600' : 'text-red-600'}`}>
            {evidenceCount} pieces
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            hasEvidence
              ? isPassing
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {hasEvidence ? (isPassing ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />) : null}
            {hasEvidence ? (isPassing ? 'Pass' : 'Fail') : 'No Evidence'}
          </span>
        </div>

        {!isPassing && hasEvidence && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 mb-1">Gap to Pass</p>
            <p className="text-sm font-medium text-red-600">
              {(targetScore - score).toFixed(0)}% more needed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ASSESSMENT SUMMARY CARD
// ============================================
export const AssessmentSummaryCard = ({ assessment }) => {
  const totalControls = assessment.totalControls || 0;
  const implementedControls = assessment.implementedControls || 0;
  const notImplementedControls = totalControls - implementedControls;
  const overallScore = assessment.overallScore || 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{assessment.title}</h2>
          {assessment.titleAr && (
            <p className="text-blue-100" dir="rtl">{assessment.titleAr}</p>
          )}
        </div>
        <Award className="w-12 h-12 text-blue-200" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-blue-200 text-sm mb-1">Total Controls</p>
          <p className="text-3xl font-bold">{totalControls}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-green-200 text-sm mb-1">Implemented</p>
          <p className="text-3xl font-bold text-green-300">{implementedControls}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-red-200 text-sm mb-1">Not Implemented</p>
          <p className="text-3xl font-bold text-red-300">{notImplementedControls}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-blue-200 text-sm mb-1">Overall Score</p>
          <p className="text-3xl font-bold">{overallScore.toFixed(0)}%</p>
        </div>
      </div>

      <div className="w-full bg-white/20 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all"
          style={{ width: `${(implementedControls / totalControls) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-200">
          Progress: {totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0}%
        </span>
        <span className="text-blue-200">
          Updated: {new Date(assessment.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default {
  StatsCard,
  FrameworkCard,
  ControlCard,
  GapCard,
  ScoreCard,
  MaturityBadge,
  AssessmentSummaryCard
};
