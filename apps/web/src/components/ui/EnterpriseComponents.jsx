/**
 * 🏛️ SAUDI GOVERNMENT ENTERPRISE UI COMPONENT LIBRARY
 * Standardized components following government design system guidelines
 * Compliant with WCAG 2.1 AA accessibility standards
 */

import React, { useState } from 'react';
import { 
  Search, Download, Plus, TrendingUp, TrendingDown, 
  Shield, AlertTriangle, CheckCircle, Activity, FileText
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { THEME_COLORS, COMPONENT_SIZES } from '../../config/theme.config.js';

// ============================================
// 🔍 ENTERPRISE TOOLBAR
// ============================================

export function EnterpriseToolbar({ 
  onSearch, 
  onExport, 
  onNew,
  placeholder,
  showNew = true,
  showExport = true,
  children 
}) {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between 
                    border-b border-gray-200 pb-6 mb-6 ${isDark ? 'border-gray-700' : ''}`}>
      <div className="flex items-center gap-4 flex-1">
        {/* Government Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${isRTL() ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 
                            h-5 w-5 text-gray-500`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder={placeholder || t('common.search')}
            className={`h-12 w-full rounded-lg border-2 border-gray-200 
                       ${isRTL() ? 'pr-12 pl-4' : 'pl-12 pr-4'} 
                       text-gray-900 placeholder-gray-500 outline-none
                       focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                       transition-all duration-200 bg-white
                       ${isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                       focus-visible:ring-2 focus-visible:ring-primary-500`}
            dir={isRTL() ? 'rtl' : 'ltr'}
          />
        </div>
        
        {/* Filter chips / custom controls */}
        {children}
      </div>
      
      {/* Government Action Buttons */}
      <div className="flex items-center gap-3">
        {showExport && (
          <button
            onClick={onExport}
            className="gov-button-secondary flex items-center gap-2 h-12 px-6
                     focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={t('common.export')}
          >
            <Download className="h-5 w-5" />
            <span className="font-medium">{t('common.export')}</span>
          </button>
        )}
        
        {showNew && (
          <button
            onClick={onNew}
            className="gov-button-primary flex items-center gap-2 h-12 px-6
                     focus-visible:ring-2 focus-visible:ring-white"
            aria-label={t('common.add_new')}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">{t('common.add_new')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// 📊 GOVERNMENT KPI CARD
// ============================================

export function KpiCard({ 
  label, 
  value, 
  delta, 
  trend = 'neutral',
  icon: Icon,
  loading = false,
  status = 'normal',
  onClick,
  className = ''
}) {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();

  if (loading) {
    return <KpiCardSkeleton />;
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'danger': return 'bg-red-50 text-red-800 border-red-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className={`${COMPONENT_SIZES.ICON_MEDIUM} ${THEME_COLORS.SUCCESS.icon}`} />;
      case 'warning': return <AlertTriangle className={`${COMPONENT_SIZES.ICON_MEDIUM} ${THEME_COLORS.WARNING.icon}`} />;
      case 'danger': return <AlertTriangle className={`${COMPONENT_SIZES.ICON_MEDIUM} ${THEME_COLORS.DANGER.icon}`} />;
      case 'info': return <Activity className={`${COMPONENT_SIZES.ICON_MEDIUM} ${THEME_COLORS.INFO.icon}`} />;
      default: return Icon ? <Icon className={`${COMPONENT_SIZES.ICON_MEDIUM} text-primary-600`} /> : null;
    }
  };

  return (
    <div 
      className={`gov-card p-6 ${getStatusColor()} ${className}
                 ${isDark ? 'bg-gray-800 border-gray-700' : ''}
                 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}
                 focus-visible:ring-2 focus-visible:ring-primary-500`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className={`flex items-start justify-between mb-4 ${isRTL() ? 'flex-row-reverse' : ''}`}>
        <div className={`text-gray-600 text-sm font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : ''}`}>
          {label}
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getTrendIcon()}
        </div>
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold text-gray-900 mb-2 ${isDark ? 'text-white' : ''}
                      ${isRTL() ? 'text-right' : 'text-left'}`}>
        {value}
      </div>

      {/* Delta */}
      {delta && (
        <div className={`flex items-center gap-2 text-sm ${isRTL() ? 'flex-row-reverse' : ''}`}>
          <span className={`font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {delta}
          </span>
          <span className={`text-gray-500 ${isDark ? 'text-gray-400' : ''}`}>
            {t('dashboard.vs_previous')}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// 🏗️ KPI CARD SKELETON LOADER
// ============================================

function KpiCardSkeleton() {
  const { isDark } = useTheme();
  
  return (
    <div className={`gov-card p-6 animate-pulse ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-5 w-5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
      <div className={`h-8 w-20 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      <div className={`h-4 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
    </div>
  );
}

// ============================================
// 📄 PAGE HEADER
// ============================================

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions,
  className = ''
}) {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();

  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className={`flex items-center gap-2 text-sm text-gray-600 mb-4
                        ${isDark ? 'text-gray-400' : ''}
                        ${isRTL() ? 'flex-row-reverse' : ''}`}
             aria-label={t('nav.breadcrumb')}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <a 
                  href={crumb.href} 
                  className="hover:text-primary-600 transition-colors focus-visible:ring-2 
                           focus-visible:ring-primary-500 rounded px-1"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={`text-gray-900 font-medium ${isDark ? 'text-white' : ''}`}>
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-400">{isRTL() ? '←' : '→'}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className={`flex items-start justify-between ${isRTL() ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 arabic-text-engine
                         ${isDark ? 'text-white' : ''}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg text-gray-600 ${isDark ? 'text-gray-400' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className={`flex items-center gap-3 ${isRTL() ? 'flex-row-reverse' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 🚫 EMPTY STATE
// ============================================

export function EmptyState({ 
  icon: Icon = FileText,
  title, 
  description, 
  action,
  className = ''
}) {
  const { t } = useI18n();
  const { isDark } = useTheme();

  return (
    <div className={`gov-card p-12 text-center ${className}
                    ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full 
                      bg-gray-100 mb-6 ${isDark ? 'bg-gray-700' : ''}`}>
        <Icon className={`h-8 w-8 text-gray-400 ${isDark ? 'text-gray-500' : ''}`} />
      </div>
      
      <h3 className={`text-xl font-semibold text-gray-900 mb-3 arabic-text-engine
                     ${isDark ? 'text-white' : ''}`}>
        {title || t('common.no_data')}
      </h3>
      
      {description && (
        <p className={`text-gray-600 mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : ''}`}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================
// 📊 CHART CONTAINER
// ============================================

export function ChartContainer({ 
  title, 
  subtitle,
  children, 
  loading = false,
  error = null,
  className = ''
}) {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`gov-card p-6 ${className} ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse">
          <div className={`h-6 w-48 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-64 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`gov-card p-6 ${className} ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <EmptyState
          icon={AlertTriangle}
          title={t('common.error')}
          description={error}
        />
      </div>
    );
  }

  return (
    <div className={`gov-card p-6 ${className} ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {(title || subtitle) && (
        <div className={`mb-6 ${isRTL() ? 'text-right' : 'text-left'}`}>
          {title && (
            <h3 className={`text-lg font-semibold text-gray-900 mb-1 arabic-text-engine
                           ${isDark ? 'text-white' : ''}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm text-gray-600 ${isDark ? 'text-gray-400' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

// ============================================
// 🏛️ GOVERNMENT STATUS BADGE
// ============================================

export function StatusBadge({ 
  status, 
  label,
  size = 'md',
  className = ''
}) {
  const { isDark } = useTheme();
  
  const getStatusClasses = () => {
    const baseClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
    
    switch (status) {
      case 'active':
      case 'approved':
      case 'compliant':
        return `${baseClasses} ${THEME_COLORS.SUCCESS.badge} border border-green-200`;
      case 'pending':
      case 'review':
        return `${baseClasses} ${THEME_COLORS.WARNING.badge} border border-amber-200`;
      case 'rejected':
      case 'non-compliant':
      case 'critical':
        return `${baseClasses} ${THEME_COLORS.DANGER.badge} border border-red-200`;
      case 'draft':
      case 'inactive':
        return `${baseClasses} ${THEME_COLORS.NEUTRAL.badge} border border-gray-200`;
      default:
        return `${baseClasses} ${THEME_COLORS.INFO.badge} border border-blue-200`;
    }
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full
                     ${getStatusClasses()} ${className}
                     ${isDark ? 'bg-opacity-20 border-opacity-30' : ''}`}>
      {label || status}
    </span>
  );
}
