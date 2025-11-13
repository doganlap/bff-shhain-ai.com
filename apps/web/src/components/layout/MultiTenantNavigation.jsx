/**
 * Multi-Tenant Navigation Structure
 * Supports Platform Admin, Tenant Admin, and Team Member roles
 */

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { 
  Building2, Shield, Users, DollarSign, Settings, 
  Crown, BarChart3, Home, Target, FileText, AlertTriangle,
  CheckCircle, Activity, Bell, Bot, TrendingUp, Globe,
  Briefcase, Database, Code, ChevronDown, ChevronRight, Zap,
  Workflow, Calendar, Brain, Search, FolderOpen, Handshake,
  Scale, BarChart2, Building
} from 'lucide-react';

/**
 * Multi-Tenant Navigation Configuration
 * Based on user role: platform_admin, tenant_admin, team_member
 */
export const getNavigationForRole = (userRole, tenantContext, stats = {}) => {
  const baseNavigation = {
    // ============================================================================
    // PLATFORM ADMIN - Manages all tenants (MSP level)
    // ============================================================================
    platform_admin: [
      {
        id: 'platform-dashboard',
        name: 'Platform Dashboard',
        icon: Crown,
        path: '/platform',
        description: 'MSP-wide overview',
        items: []
      },
      {
        id: 'tenant-management',
        name: 'Tenant Management',
        icon: Building2,
        collapsed: false,
        items: [
          {
            id: 'all-tenants',
            name: 'All Tenants',
            path: '/platform/tenants',
            icon: Building2,
            description: 'Manage all client organizations',
            badge: stats.tenants || 0
          },
          {
            id: 'tenant-onboarding',
            name: 'Onboarding',
            path: '/platform/tenants/onboarding',
            icon: Users,
            description: 'New tenant setup'
          },
          {
            id: 'tenant-billing',
            name: 'Billing & Subscriptions',
            path: '/platform/billing',
            icon: DollarSign,
            description: 'Financial management',
            badge: stats.invoices || 0
          },
          {
            id: 'tenant-licenses',
            name: 'License Management',
            path: '/platform/licenses',
            icon: Shield,
            description: 'Track tenant licenses'
          }
        ]
      },
      {
        id: 'platform-analytics',
        name: 'Platform Analytics',
        icon: BarChart3,
        collapsed: true,
        items: [
          {
            id: 'revenue-analytics',
            name: 'Revenue & Growth',
            path: '/platform/analytics/revenue',
            icon: TrendingUp,
            description: 'Financial metrics'
          },
          {
            id: 'usage-analytics',
            name: 'Usage Analytics',
            path: '/platform/analytics/usage',
            icon: Activity,
            description: 'Platform utilization'
          },
          {
            id: 'compliance-overview',
            name: 'Compliance Overview',
            path: '/platform/analytics/compliance',
            icon: CheckCircle,
            description: 'All tenants compliance'
          }
        ]
      },
      {
        id: 'platform-automation',
        name: 'Platform Automation',
        icon: Bot,
        collapsed: true,
        items: [
          {
            id: 'regulatory-engine',
            name: 'Regulatory Engine',
            path: '/platform/regulatory-engine',
            icon: Globe,
            description: 'Multi-tenant monitoring'
          },
          {
            id: 'platform-workflows',
            name: 'Global Workflows',
            path: '/platform/workflows',
            icon: Workflow,
            description: 'Platform-wide automation'
          },
          {
            id: 'ai-scheduler',
            name: 'AI Scheduler',
            path: '/platform/ai-scheduler',
            icon: Calendar,
            description: 'Automated task scheduling'
          }
        ]
      },
      {
        id: 'platform-ai-services',
        name: 'AI & Intelligence',
        icon: Brain,
        collapsed: true,
        items: [
          {
            id: 'rag-service',
            name: 'RAG Service',
            path: '/platform/rag-service',
            icon: Brain,
            description: 'AI knowledge retrieval'
          },
          {
            id: 'regulatory-intelligence',
            name: 'Regulatory Intelligence',
            path: '/platform/regulatory-intelligence',
            icon: Search,
            description: 'AI-powered compliance insights'
          },
          {
            id: 'sector-intelligence',
            name: 'Sector Intelligence',
            path: '/platform/sector-intelligence',
            icon: BarChart2,
            description: 'Industry analysis & insights'
          }
        ]
      },
      {
        id: 'platform-licenses',
        name: 'License Management',
        icon: Shield,
        collapsed: true,
        items: [
          {
            id: 'licenses-catalog',
            name: 'License Catalog',
            path: '/platform/licenses',
            icon: Shield,
            description: 'Manage license plans'
          },
          {
            id: 'renewals-pipeline',
            name: 'Renewals Pipeline',
            path: '/platform/renewals',
            icon: TrendingUp,
            description: '120-day renewal forecast'
          },
          {
            id: 'usage-analytics',
            name: 'Usage Analytics',
            path: '/platform/usage',
            icon: Activity,
            description: 'Platform-wide usage'
          },
          {
            id: 'auto-assessment',
            name: 'Auto Assessment Generator',
            path: '/platform/auto-assessment',
            icon: Zap,
            description: 'Generate assessments automatically'
          },
          {
            id: 'advanced-dashboard',
            name: 'Advanced Analytics Dashboard',
            path: '/platform/advanced-dashboard',
            icon: BarChart3,
            description: '15+ holistic charts with drill-down analytics'
          },
          {
            id: 'tenant-dashboard',
            name: 'Tenant Dashboard',
            path: '/app/dashboard/tenant',
            icon: Building2,
            description: 'Tenant-specific compliance and performance data'
          },
          {
            id: 'regulatory-market-intelligence',
            name: 'Regulatory Market Intelligence',
            path: '/app/dashboard/regulatory-market',
            icon: Globe,
            description: 'Market-wide regulatory data and compliance trends'
          }
        ]
      },
      {
        id: 'platform-partners',
        name: 'Partners & Regulators',
        icon: Handshake,
        collapsed: true,
        items: [
          {
            id: 'partner-management',
            name: 'Partner Management',
            path: '/platform/partners',
            icon: Handshake,
            description: 'Manage business partners'
          },
          {
            id: 'regulators',
            name: 'Regulators',
            path: '/platform/regulators',
            icon: Scale,
            description: 'Regulatory body management'
          },
          {
            id: 'ksa-grc',
            name: 'KSA GRC',
            path: '/platform/ksa-grc',
            icon: Building,
            description: 'Saudi Arabia specific GRC'
          }
        ]
      },
      {
        id: 'platform-admin',
        name: 'Platform Administration',
        icon: Settings,
        collapsed: true,
        items: [
          {
            id: 'platform-settings',
            name: 'Platform Settings',
            path: '/platform/settings',
            icon: Settings,
            description: 'Global configuration'
          },
          {
            id: 'platform-users',
            name: 'Platform Users',
            path: '/platform/users',
            icon: Users,
            description: 'MSP team management'
          },
          {
            id: 'audit-logs',
            name: 'Audit Logs',
            path: '/platform/audit-logs',
            icon: FileText,
            description: 'System audit trail'
          },
          {
            id: 'system-health',
            name: 'System Health',
            path: '/platform/health',
            icon: Activity,
            description: 'Platform monitoring'
          },
          {
            id: 'database-admin',
            name: 'Database',
            path: '/platform/database',
            icon: Database,
            description: 'Multi-tenant data'
          },
          {
            id: 'api-management',
            name: 'API Management',
            path: '/platform/api',
            icon: Code,
            description: 'Platform APIs'
          }
        ]
      }
    ],

    // ============================================================================
    // TENANT ADMIN - Manages their organization (Client level)
    // ============================================================================
    tenant_admin: [
      {
        id: 'tenant-dashboard',
        name: 'Dashboard',
        icon: Home,
        path: `/tenant/${tenantContext?.id}`,
        description: 'Organization overview',
        items: []
      },
      {
        id: 'governance',
        name: 'Governance Setup',
        icon: Shield,
        collapsed: false, // Open by default
        items: [
          {
            id: 'frameworks',
            name: 'Frameworks',
            path: `/tenant/${tenantContext?.id}/frameworks`,
            icon: Target,
            description: 'Standards & regulations',
            badge: stats.frameworks || 0
          },
          {
            id: 'organization-structure',
            name: 'Organization',
            path: `/tenant/${tenantContext?.id}/organization`,
            icon: Building2,
            description: 'Departments & units'
          },
          {
            id: 'users-access',
            name: 'Users & Access',
            path: `/tenant/${tenantContext?.id}/users`,
            icon: Users,
            description: 'Team management',
            badge: stats.users || 0
          }
        ]
      },
      {
        id: 'risk-management',
        name: 'Risk Management',
        icon: AlertTriangle,
        collapsed: true,
        items: [
          {
            id: 'risk-register',
            name: 'Risk Register',
            path: `/tenant/${tenantContext?.id}/risks`,
            icon: AlertTriangle,
            description: 'Identify & track risks',
            badge: stats.risks || 0
          },
          {
            id: 'risk-assessment',
            name: 'Risk Assessment',
            path: `/tenant/${tenantContext?.id}/risk-management`,
            icon: TrendingUp,
            description: 'Assess & treat'
          },
          {
            id: 'controls',
            name: 'Controls',
            path: `/tenant/${tenantContext?.id}/controls`,
            icon: Shield,
            description: 'Mitigating controls',
            badge: stats.controls || 0
          }
        ]
      },
      {
        id: 'compliance',
        name: 'Compliance Operations',
        icon: CheckCircle,
        collapsed: true,
        items: [
          {
            id: 'assessments',
            name: 'Assessments',
            path: `/tenant/${tenantContext?.id}/assessments`,
            icon: FileText,
            description: 'Compliance assessments',
            badge: stats.assessments || 0
          },
          {
            id: 'compliance-tracking',
            name: 'Compliance Tracking',
            path: `/tenant/${tenantContext?.id}/compliance`,
            icon: CheckCircle,
            description: 'Monitor status'
          },
          {
            id: 'evidence',
            name: 'Evidence',
            path: `/tenant/${tenantContext?.id}/evidence`,
            icon: FileText,
            description: 'Document proof'
          },
          {
            id: 'audit-trail',
            name: 'Audit Trail',
            path: `/tenant/${tenantContext?.id}/audit-logs`,
            icon: Activity,
            description: 'Track changes'
          }
        ]
      },
      {
        id: 'reporting',
        name: 'Reports & Intelligence',
        icon: BarChart3,
        collapsed: true,
        items: [
          {
            id: 'reports',
            name: 'Reports',
            path: `/tenant/${tenantContext?.id}/reports`,
            icon: BarChart3,
            description: 'Generate reports'
          },
          {
            id: 'regulatory-updates',
            name: 'Regulatory Updates',
            path: `/tenant/${tenantContext?.id}/regulatory-intelligence`,
            icon: Globe,
            description: 'Stay informed'
          }
        ]
      },
      {
        id: 'tenant-automation',
        name: 'Automation',
        icon: Bot,
        collapsed: true,
        items: [
          {
            id: 'workflows',
            name: 'Workflows',
            path: `/tenant/${tenantContext?.id}/workflows`,
            icon: Workflow,
            description: 'Process automation'
          },
          {
            id: 'ai-assistant',
            name: 'AI Assistant',
            path: `/tenant/${tenantContext?.id}/rag`,
            icon: Bot,
            description: 'Get AI help'
          },
          {
            id: 'documents',
            name: 'Document Management',
            path: `/tenant/${tenantContext?.id}/documents`,
            icon: FolderOpen,
            description: 'Manage documents'
          }
        ]
      },
      {
        id: 'tenant-admin',
        name: 'Administration',
        icon: Settings,
        collapsed: true,
        items: [
          {
            id: 'usage-dashboard',
            name: 'Usage Dashboard',
            path: `/tenant/${tenantContext?.id}/usage`,
            icon: Activity,
            description: 'Monitor usage & limits'
          },
          {
            id: 'tenant-settings',
            name: 'Settings',
            path: `/tenant/${tenantContext?.id}/settings`,
            icon: Settings,
            description: 'Tenant configuration'
          },
          {
            id: 'billing-info',
            name: 'Billing & Subscription',
            path: `/tenant/${tenantContext?.id}/billing`,
            icon: DollarSign,
            description: 'View billing'
          },
          {
            id: 'upgrade-plan',
            name: 'Upgrade Plan',
            path: `/tenant/${tenantContext?.id}/upgrade`,
            icon: TrendingUp,
            description: 'Upgrade your license'
          },
          {
            id: 'notifications',
            name: 'Notifications',
            path: `/tenant/${tenantContext?.id}/notifications`,
            icon: Bell,
            description: 'Manage alerts'
          }
        ]
      }
    ],

    // ============================================================================
    // TEAM MEMBER - Limited access within tenant (Employee level)
    // ============================================================================
    team_member: [
      {
        id: 'my-dashboard',
        name: 'My Dashboard',
        icon: Home,
        path: `/tenant/${tenantContext?.id}/my-dashboard`,
        description: 'Personal workspace',
        items: []
      },
      {
        id: 'my-tasks',
        name: 'My Work',
        icon: CheckCircle,
        collapsed: false,
        items: [
          {
            id: 'my-assessments',
            name: 'My Assessments',
            path: `/tenant/${tenantContext?.id}/my-assessments`,
            icon: FileText,
            description: 'Assigned assessments',
            badge: stats.myAssessments || 0
          },
          {
            id: 'my-risks',
            name: 'My Risks',
            path: `/tenant/${tenantContext?.id}/my-risks`,
            icon: AlertTriangle,
            description: 'Assigned risks',
            badge: stats.myRisks || 0
          },
          {
            id: 'my-controls',
            name: 'My Controls',
            path: `/tenant/${tenantContext?.id}/my-controls`,
            icon: Shield,
            description: 'Assigned controls',
            badge: stats.myControls || 0
          }
        ]
      },
      {
        id: 'view-only',
        name: 'View & Reports',
        icon: BarChart3,
        collapsed: true,
        items: [
          {
            id: 'compliance-status',
            name: 'Compliance Status',
            path: `/tenant/${tenantContext?.id}/compliance-view`,
            icon: CheckCircle,
            description: 'View compliance'
          },
          {
            id: 'reports-view',
            name: 'Reports',
            path: `/tenant/${tenantContext?.id}/reports-view`,
            icon: BarChart3,
            description: 'View reports'
          }
        ]
      },
      {
        id: 'help',
        name: 'Help & Resources',
        icon: Bot,
        collapsed: true,
        items: [
          {
            id: 'ai-assistant',
            name: 'AI Assistant',
            path: `/tenant/${tenantContext?.id}/rag`,
            icon: Bot,
            description: 'Get help'
          }
        ]
      }
    ]
  };

  return baseNavigation[userRole] || baseNavigation.team_member;
};

/**
 * Tenant Selector Component for Platform Admin
 */
export const TenantSelector = ({ currentTenant, tenants, onTenantSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-lg ${
          isDark() ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
        } border ${isDark() ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <div className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {currentTenant?.name || 'All Tenants'}
            </div>
            <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentTenant ? 'Client Organization' : 'Platform View'}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-50 ${
          isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onTenantSwitch(null);
                setIsOpen(false);
              }}
              className={`w-full p-3 text-left hover:bg-gray-700 border-b ${
                isDark() ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className={isDark() ? 'text-white' : 'text-gray-900'}>
                  Platform View
                </span>
              </div>
            </button>
            {tenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => {
                  onTenantSwitch(tenant);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left hover:bg-gray-700 ${
                  currentTenant?.id === tenant.id ? 'bg-blue-600 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{tenant.name}</div>
                    <div className="text-xs opacity-75">{tenant.compliance}% Compliant</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Role Badge Component
 */
export const RoleBadge = ({ role }) => {
  const roleConfig = {
    platform_admin: { label: 'Platform Admin', icon: Crown, color: 'bg-purple-600' },
    tenant_admin: { label: 'Tenant Admin', icon: Building2, color: 'bg-blue-600' },
    team_member: { label: 'Team Member', icon: Users, color: 'bg-green-600' }
  };

  const config = roleConfig[role] || roleConfig.team_member;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

export default { getNavigationForRole, TenantSelector, RoleBadge };
