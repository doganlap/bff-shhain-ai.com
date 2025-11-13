import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { 
  Home, Shield, Target, FileText, Building2, Users, 
  BarChart3, Database, Settings, Menu, X,
  ChevronDown, ChevronRight, Archive, AlertTriangle, 
  CheckCircle, Activity, Bell, Bot, ShieldCheck,
  FolderOpen, Workflow, TrendingUp, Cpu, Globe,
  UserCheck, GitBranch, Monitor, Code, Briefcase, BookOpen, Award,
  Plus, Edit, Trash2, RefreshCw, Filter, Search, Download, Upload,
  Play, Pause, Stop, Eye, EyeOff, Star, Heart, Share2, Copy
} from 'lucide-react';

const Sidebar = () => {
  const { state, actions } = useApp();
  const { sidebarOpen, stats, user, isAuthenticated } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  
  // Enhanced state for interactive components
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for collapsible groups (GRC business logic flow)
  const [collapsedGroups, setCollapsedGroups] = useState({
    'dashboard': false,        // Always visible - starting point
    'governance': false,        // Setup phase - open by default
    'risk-management': true,    // Risk phase
    'compliance': true,         // Compliance phase
    'reporting': true,          // Reporting phase
    'automation': true,         // AI & Automation
    'administration': true      // System admin
  });

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Enhanced action handlers
  const handleNavigation = (path, itemId) => {
    // Add to recent items
    setRecentItems(prev => {
      const filtered = prev.filter(item => item.id !== itemId);
      return [{ id: itemId, path, timestamp: Date.now() }, ...filtered].slice(0, 10);
    });
    
    navigate(path);
  };

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await actions.refreshData();
      await actions.updateStats();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickAction = (action, item) => {
    switch (action) {
      case 'new':
        navigate(`${item.path}/new`);
        break;
      case 'edit':
        navigate(`${item.path}/edit`);
        break;
      case 'duplicate':
        console.log('Duplicate action for:', item.name);
        break;
      case 'export':
        console.log('Export action for:', item.name);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Filter navigation based on search
  const filterNavigation = (items) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Touch and keyboard navigation support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;
    
    // Horizontal swipe for sidebar toggle
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - close sidebar
        if (sidebarOpen) {
          actions.toggleSidebar();
        }
      } else {
        // Swipe right - open sidebar
        if (!sidebarOpen) {
          actions.toggleSidebar();
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            actions.toggleSidebar();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder="Search navigation..."]')?.focus();
            break;
          case 'r':
            e.preventDefault();
            handleRefresh();
            break;
        }
      }
      
      // Arrow key navigation
      if (sidebarOpen) {
        const allItems = navigationGroups.flatMap(group => group.items);
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev < allItems.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev > 0 ? prev - 1 : allItems.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && allItems[selectedIndex]) {
              handleNavigation(allItems[selectedIndex].path, allItems[selectedIndex].id);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setSelectedIndex(-1);
            setSearchTerm('');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, selectedIndex, searchTerm]);

  // Save user preferences
  useEffect(() => {
    localStorage.setItem('sidebar-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sidebar-recent', JSON.stringify(recentItems));
  }, [recentItems]);

  // GRC Business Logic Flow - Organized by workflow stages
  const navigationGroups = [
    // ============================================================================
    // 1. DASHBOARD - Overview & Starting Point
    // ============================================================================
    {
      id: 'dashboard',
      name: t('nav.dashboard'),
      icon: Home,
      items: [
        { 
          id: 'dashboard', 
          name: t('nav.dashboard'), 
          path: '/app/dashboard/legacy', 
          icon: Home, 
          description: t('dashboard.overview'),
          badge: null
        },
        { 
          id: 'dashboard-detailed', 
          name: t('nav.analytics'), 
          path: '/app/dashboard', 
          icon: BarChart3, 
          description: t('dashboard.statistics'),
          badge: null
        },
        {
          id: 'advanced-dashboard',
          name: 'Advanced Dashboard',
          path: '/app/dashboard/advanced',
          icon: TrendingUp,
          description: 'Advanced GRC metrics',
          badge: null
        },
        {
          id: 'tenant-dashboard',
          name: 'Tenant Dashboard',
          path: '/app/dashboard/tenant',
          icon: Users,
          description: 'Tenant-specific metrics',
          badge: null
        },
        {
          id: 'regulatory-market-dashboard',
          name: 'Regulatory Market',
          path: '/app/dashboard/regulatory-market',
          icon: Globe,
          description: 'Market intelligence',
          badge: null
        },
        {
          id: 'usage-dashboard',
          name: 'Usage Dashboard',
          path: '/platform/usage',
          icon: Activity,
          description: 'Platform usage metrics',
          badge: null
        },
        {
          id: 'modern-advanced-dashboard',
          name: 'Modern Dashboard',
          path: '/platform/advanced-dashboard',
          icon: Cpu,
          description: 'Modern advanced metrics',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 2. GOVERNANCE SETUP - Define what to comply with & who is involved
    // ============================================================================
    {
      id: 'governance',
      name: t('nav.governance'),
      icon: Shield,
      items: [
        { 
          id: 'frameworks', 
          name: t('nav.frameworks'), 
          path: '/app/frameworks', 
          icon: Target, 
          description: t('frameworks.description'),
          badge: stats.frameworks || 0
        },
        { 
          id: 'organizations', 
          name: t('nav.organizations'), 
          path: '/app/organizations', 
          icon: Building2, 
          description: t('organizations.description'),
          badge: stats.organizations || 0
        },
        { 
          id: 'users', 
          name: t('nav.users'), 
          path: '/app/users', 
          icon: UserCheck, 
          description: t('users.description'),
          badge: null
        },
        { 
          id: 'regulators', 
          name: 'Regulators', 
          path: '/app/regulators', 
          icon: Award, 
          description: 'Regulatory bodies',
          badge: stats.regulators || 0
        }
      ]
    },
    
    // ============================================================================
    // 3. RISK MANAGEMENT - Identify, assess & mitigate risks
    // ============================================================================
    {
      id: 'risk-management',
      name: 'Risk Management',
      icon: AlertTriangle,
      items: [
        { 
          id: 'risks', 
          name: 'Risk Register', 
          path: '/app/risks', 
          icon: AlertTriangle, 
          description: 'Identify & track risks',
          badge: null
        },
        { 
          id: 'risk-management', 
          name: 'Risk Assessment', 
          path: '/app/risk-management', 
          icon: TrendingUp, 
          description: 'Assess & treat risks',
          badge: null
        },
        { 
          id: 'controls', 
          name: 'Controls', 
          path: '/app/controls', 
          icon: ShieldCheck, 
          description: 'Mitigating controls',
          badge: stats.controls || 0
        }
      ]
    },
    
    // ============================================================================
    // 4. COMPLIANCE OPERATIONS - Assess, track & prove compliance
    // ============================================================================
    {
      id: 'compliance',
      name: 'Compliance Operations',
      icon: CheckCircle,
      items: [
        { 
          id: 'assessments', 
          name: 'Assessments', 
          path: '/app/assessments', 
          icon: FileText, 
          description: 'Compliance assessments',
          badge: stats.assessments || 0
        },
        { 
          id: 'compliance', 
          name: 'Compliance Tracking', 
          path: '/app/compliance', 
          icon: CheckCircle, 
          description: 'Monitor compliance status',
          badge: null
        },
        { 
          id: 'evidence', 
          name: 'Evidence', 
          path: '/app/evidence', 
          icon: Archive, 
          description: 'Collect & manage proof',
          badge: null
        },
        { 
          id: 'audit-logs', 
          name: 'Audit Trail', 
          path: '/app/audit-logs', 
          icon: Activity, 
          description: 'System audit logs',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 5. REPORTING & INTELLIGENCE - Insights & regulatory updates
    // ============================================================================
    {
      id: 'reporting',
      name: 'Reporting & Intelligence',
      icon: BarChart3,
      items: [
        { 
          id: 'reports', 
          name: 'Reports & Analytics', 
          path: '/app/reports', 
          icon: BarChart3, 
          description: 'Generate reports',
          badge: null
        },
        { 
          id: 'regulatory-intelligence', 
          name: 'Regulatory Intelligence', 
          path: '/app/regulatory-intelligence', 
          icon: ShieldCheck, 
          description: 'Regulatory updates',
          badge: null
        },
        { 
          id: 'sector-intelligence', 
          name: 'Sector Intelligence', 
          path: '/app/sector-intelligence', 
          icon: Globe, 
          description: 'Industry insights',
          badge: null
        },
        {
          id: 'renewals-pipeline',
          name: 'Renewals Pipeline',
          path: '/platform/renewals',
          icon: GitBranch,
          description: 'Subscription renewal analytics',
          badge: null
        },
        {
          id: 'risk-analytics',
          name: 'Risk Analytics',
          path: '/app/risks/enhanced',
          icon: AlertTriangle,
          description: 'Risk analysis and heatmaps',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 6. AUTOMATION & AI - Intelligent automation & assistance
    // ============================================================================
    {
      id: 'automation',
      name: 'Automation & AI',
      icon: Bot,
      items: [
        { 
          id: 'workflows', 
          name: 'Workflows', 
          path: '/app/workflows', 
          icon: GitBranch, 
          description: 'Process automation',
          badge: null
        },
        { 
          id: 'ai-scheduler', 
          name: 'AI Scheduler', 
          path: '/app/ai-scheduler', 
          icon: Bot, 
          description: 'Intelligent scheduling',
          badge: null
        },
        { 
          id: 'rag-service', 
          name: 'RAG AI Assistant', 
          path: '/app/rag', 
          icon: Cpu, 
          description: 'AI knowledge base',
          badge: null
        },
        { 
          id: 'regulatory-engine', 
          name: 'Regulatory Engine', 
          path: '/app/regulatory-engine', 
          icon: Settings, 
          description: 'Intelligence engine',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 7. ADMINISTRATION - System management & configuration
    // ============================================================================
    {
      id: 'administration',
      name: 'Administration',
      icon: Settings,
      items: [
        { 
          id: 'documents', 
          name: 'Documents', 
          path: '/app/documents', 
          icon: FolderOpen, 
          description: 'Document repository',
          badge: null
        },
        { 
          id: 'partners', 
          name: 'Partners', 
          path: '/app/partners', 
          icon: Briefcase, 
          description: 'Partner management',
          badge: null
        },
        { 
          id: 'notifications', 
          name: 'Notifications', 
          path: '/app/notifications', 
          icon: Bell, 
          description: 'Alert management',
          badge: null
        },
        { 
          id: 'performance', 
          name: 'Performance', 
          path: '/app/performance', 
          icon: Monitor, 
          description: 'System monitoring',
          badge: null
        },
        { 
          id: 'database', 
          name: 'Database', 
          path: '/app/database', 
          icon: Database, 
          description: 'Data management',
          badge: null
        },
        { 
          id: 'api-management', 
          name: 'API Management', 
          path: '/app/api-management', 
          icon: Code, 
          description: 'API configuration',
          badge: null
        },
        { 
          id: 'settings', 
          name: 'Settings', 
          path: '/app/settings', 
          icon: Settings, 
          description: 'System configuration',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 8. PLATFORM & MSP - Multi-tenant platform management
    // ============================================================================
    {
      id: 'platform',
      name: 'Platform & MSP',
      icon: Briefcase,
      items: [
        { 
          id: 'licenses', 
          name: 'License Management', 
          path: '/platform/licenses', 
          icon: Award, 
          description: 'License catalog & management',
          badge: null
        },
        { 
          id: 'renewals', 
          name: 'Renewals Pipeline', 
          path: '/platform/renewals', 
          icon: GitBranch, 
          description: 'Renewal opportunities',
          badge: null
        },
        { 
          id: 'usage-dashboard', 
          name: 'Usage Dashboard', 
          path: '/platform/usage', 
          icon: Activity, 
          description: 'Platform usage metrics',
          badge: null
        },
        { 
          id: 'auto-assessment', 
          name: 'Auto Assessment Generator', 
          path: '/platform/auto-assessment', 
          icon: Bot, 
          description: 'Automated assessment creation',
          badge: null
        },
        { 
          id: 'upgrade', 
          name: 'Upgrade Management', 
          path: '/platform/upgrade', 
          icon: TrendingUp, 
          description: 'Tenant upgrade management',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 9. SPECIALIZED & REGIONAL - KSA-specific and specialized features
    // ============================================================================
    {
      id: 'specialized',
      name: 'Specialized & Regional',
      icon: Globe,
      items: [
        { 
          id: 'ksa-grc', 
          name: 'KSA GRC', 
          path: '/app/ksa-grc', 
          icon: Award, 
          description: 'Saudi Arabia GRC',
          badge: null
        },
        { 
          id: 'components-demo', 
          name: 'Components Demo', 
          path: '/app/components-demo', 
          icon: BookOpen, 
          description: 'UI components',
          badge: null
        },
        { 
          id: 'modern-components-demo', 
          name: 'Modern Components Demo', 
          path: '/demo/modern-components', 
          icon: Cpu, 
          description: 'Modern UI showcase',
          badge: null
        },
        { 
          id: 'landing-page', 
          name: 'Landing Page', 
          path: '/landing', 
          icon: Home, 
          description: 'Public landing page',
          badge: null
        },
        { 
          id: 'demo-page', 
          name: 'Demo Page', 
          path: '/demo', 
          icon: Activity, 
          description: 'Demo environment',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 10. ADVANCED & MODERN UI - Enhanced user interfaces
    // ============================================================================
    {
      id: 'advanced-ui',
      name: 'Advanced & Modern UI',
      icon: Monitor,
      items: [
        { 
          id: 'advanced-dashboard', 
          name: 'Advanced Dashboard', 
          path: '/advanced', 
          icon: TrendingUp, 
          description: 'Advanced GRC dashboard',
          badge: null
        },
        { 
          id: 'advanced-assessments', 
          name: 'Advanced Assessments', 
          path: '/advanced/assessments', 
          icon: FileText, 
          description: 'Advanced assessment manager',
          badge: null
        },
        { 
          id: 'advanced-frameworks', 
          name: 'Advanced Frameworks', 
          path: '/advanced/frameworks', 
          icon: Target, 
          description: 'Advanced framework manager',
          badge: null
        },
        { 
          id: 'enhanced-dashboard', 
          name: 'Enhanced Dashboard', 
          path: '/app/dashboard', 
          icon: BarChart3, 
          description: 'Enhanced dashboard with KPIs',
          badge: null
        },
        { 
          id: 'modern-advanced-dashboard', 
          name: 'Modern Advanced Dashboard', 
          path: '/platform/advanced-dashboard', 
          icon: Cpu, 
          description: 'Latest modern dashboard',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 11. TENANT & MULTI-TENANT - Tenant-specific features
    // ============================================================================
    {
      id: 'tenant-management',
      name: 'Tenant Management',
      icon: Building2,
      items: [
        { 
          id: 'tenant-dashboard', 
          name: 'Tenant Dashboard', 
          path: '/app/dashboard/tenant', 
          icon: Building2, 
          description: 'Tenant-specific metrics',
          badge: null
        },
        { 
          id: 'organization-details', 
          name: 'Organization Details', 
          path: '/app/organizations/:id', 
          icon: Building2, 
          description: 'Detailed organization view',
          badge: null
        },
        { 
          id: 'organization-form', 
          name: 'Organization Form', 
          path: '/app/organizations/new', 
          icon: Building2, 
          description: 'Create/edit organizations',
          badge: null
        },
        { 
          id: 'organizations-list', 
          name: 'Organizations List', 
          path: '/app/organizations/list', 
          icon: Building2, 
          description: 'List all organizations',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 12. LEGACY & COMPATIBILITY - Legacy versions for compatibility
    // ============================================================================
    {
      id: 'legacy-versions',
      name: 'Legacy & Compatibility',
      icon: Archive,
      items: [
        { 
          id: 'legacy-dashboard', 
          name: 'Legacy Dashboard', 
          path: '/app/dashboard/legacy', 
          icon: Home, 
          description: 'Original dashboard version',
          badge: null
        },
        { 
          id: 'legacy-compliance', 
          name: 'Legacy Compliance', 
          path: '/app/compliance/legacy', 
          icon: CheckCircle, 
          description: 'Original compliance tracking',
          badge: null
        },
        { 
          id: 'legacy-risk', 
          name: 'Legacy Risk Management', 
          path: '/app/risks/legacy', 
          icon: AlertTriangle, 
          description: 'Original risk management',
          badge: null
        },
        { 
          id: 'risks-list', 
          name: 'Risks List', 
          path: '/app/risks/list', 
          icon: AlertTriangle, 
          description: 'Simple risks listing',
          badge: null
        }
      ]
    },
    
    // ============================================================================
    // 13. ASSESSMENT & COLLABORATION - Assessment-specific features
    // ============================================================================
    {
      id: 'assessment-collaboration',
      name: 'Assessment & Collaboration',
      icon: Users,
      items: [
        { 
          id: 'assessment-collaborative', 
          name: 'Collaborative Assessment', 
          path: '/app/assessments/:id/collaborative', 
          icon: Users, 
          description: 'Real-time collaborative assessments',
          badge: null
        },
        { 
          id: 'assessment-details', 
          name: 'Assessment Details', 
          path: '/app/assessments/:id', 
          icon: FileText, 
          description: 'Detailed assessment view',
          badge: null
        }
      ]
    }
    
  ];

  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item, index) => {
    const active = isActive(item.path);
    const isFavorite = favorites.includes(item.id);
    const isRecent = recentItems.some(recent => recent.id === item.id);
    const isSelected = selectedIndex === index;
    
    return (
      <div key={item.id} className="group relative">
        <NavLink
          to={item.path}
          onClick={() => handleNavigation(item.path, item.id)}
          className={`flex items-center px-3 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${
            active
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
              : isSelected
              ? 'bg-gray-700 text-blue-400 border border-gray-600'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={!sidebarOpen ? item.name : ''}
        >
          <item.icon className={`flex-shrink-0 h-6 w-6 ${sidebarOpen ? 'mr-3' : 'mx-auto'} drop-shadow-lg ${
            active ? 'text-white drop-shadow-md' : 'text-gray-400 group-hover:text-white drop-shadow-sm'
          }`} />
          
          {sidebarOpen && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="block truncate font-semibold">{item.name}</span>
                  {isFavorite && (
                    <Star className="h-3 w-3 text-yellow-500 ml-1 fill-current" />
                  )}
                  {isRecent && (
                    <div className="h-2 w-2 bg-green-500 rounded-full ml-1 animate-pulse" />
                  )}
                </div>
                {item.description && (
                  <span className="text-sm opacity-80 block truncate font-medium">{item.description}</span>
                )}
              </div>
              {item.badge && item.badge > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-700 text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </NavLink>
        
        {/* Action buttons (visible on hover) */}
        {sidebarOpen && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(item.id);
              }}
              className={`p-1 rounded hover:bg-white hover:bg-opacity-20 ${
                active ? 'text-white hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-3 w-3 ${isFavorite ? 'fill-current text-yellow-400' : ''}`} />
            </button>
            
            <div className="relative group/action">
              <button
                className={`p-1 rounded hover:bg-white hover:bg-opacity-20 ${
                  active ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Quick actions"
              >
                <div className="h-3 w-3 bg-current rounded-full" />
              </button>
              
              {/* Quick actions dropdown */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-1 z-50 hidden group-hover/action:block">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickAction('new', item);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center text-gray-300 hover:text-white"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  New
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickAction('edit', item);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center text-gray-300 hover:text-white"
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickAction('duplicate', item);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center text-gray-300 hover:text-white"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickAction('export', item);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center text-gray-300 hover:text-white"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNavigationGroup = (group) => {
    const isCollapsed = collapsedGroups[group.id];
    const hasActiveItem = group.items.some(item => isActive(item.path));
    
    return (
      <div key={group.id} className="mb-2">
        {/* Group Header - Dark Theme */}
        <button
          onClick={() => toggleGroup(group.id)}
          className={`w-full flex items-center px-3 py-3 text-base font-bold rounded-lg transition-all duration-200 ${
            hasActiveItem
              ? 'bg-gray-700 text-blue-400 border border-gray-600'
              : 'text-gray-300 hover:bg-gray-700'
          } ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
          title={!sidebarOpen ? group.name : ''}
        >
          <div className="flex items-center">
            <group.icon className={`h-6 w-6 ${sidebarOpen ? 'mr-3' : ''} drop-shadow-lg ${
              hasActiveItem ? 'text-blue-400 drop-shadow-md' : 'text-gray-500 drop-shadow-sm'
            }`} />
            {sidebarOpen && (
              <span className="font-bold text-lg">{group.name}</span>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">
                {group.items.length}
              </span>
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              )}
            </div>
          )}
        </button>
        
        {/* Group Items */}
        {sidebarOpen && !isCollapsed && (
          <div className="mt-1 ml-4 space-y-1 border-l border-gray-600 pl-4">
            {group.items.map((item, index) => renderNavigationItem(item, index))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`glass-sidebar transition-all duration-300 bg-gray-900 ${
        sidebarOpen ? 'w-72' : 'w-16'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col h-full">
        {/* Enhanced Enterprise Header - Dark Theme */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white drop-shadow-sm">Shahin-AI KSA</h1>
                <p className="text-sm text-gray-300 font-semibold" dir="rtl">شاهين الذكي السعودية</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Toggle sidebar */}
            <button
              onClick={actions.toggleSidebar}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Enhanced Search & Filter Section - Dark Theme */}
        {sidebarOpen && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search navigation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setSearchTerm('dashboard')}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Dashboard
              </button>
              <button
                onClick={() => setSearchTerm('risk')}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded-full hover:bg-orange-700"
              >
                Risk
              </button>
              <button
                onClick={() => setSearchTerm('compliance')}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                Compliance
              </button>
              <button
                onClick={() => setSearchTerm('ai')}
                className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700"
              >
                AI
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats (when expanded) - Dark Theme */}
        {sidebarOpen && (
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 rounded-lg p-3 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1 bg-green-900 rounded">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-300">Compliance</p>
                    <p className="text-sm font-semibold text-white">94.2%</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1 bg-blue-900 rounded">
                    <Activity className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-300">Active</p>
                    <p className="text-sm font-semibold text-white">{stats.assessments || 12}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section - Dark Theme */}
        {sidebarOpen && favorites.length > 0 && (
          <div className="p-4 bg-gray-800 border-b border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-yellow-400 flex items-center">
                <Star className="h-4 w-4 mr-2 fill-current" />
                Favorites
              </h3>
              <span className="text-xs text-yellow-300 bg-yellow-900 bg-opacity-30 px-2 py-1 rounded-full">
                {favorites.length}
              </span>
            </div>
            <div className="space-y-1">
              {navigationGroups
                .flatMap(group => group.items)
                .filter(item => favorites.includes(item.id))
                .slice(0, 5)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path, item.id)}
                    className="w-full flex items-center px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-300 rounded transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {/* Recent Items - Dark Theme */}
        {sidebarOpen && recentItems.length > 0 && (
          <div className="p-4 bg-gray-800 border-b border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Recent
              </h3>
              <button
                onClick={() => setRecentItems([])}
                className="text-xs text-blue-400 hover:text-blue-300"
                title="Clear recent items"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {recentItems.slice(0, 5).map(recent => {
                const item = navigationGroups
                  .flatMap(group => group.items)
                  .find(i => i.id === recent.id);
                
                if (!item) return null;
                
                return (
                  <button
                    key={recent.id}
                    onClick={() => handleNavigation(item.path, item.id)}
                    className="w-full flex items-center px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-300 rounded transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-xs text-blue-400">
                      {new Date(recent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationGroups
            .map(group => ({
              ...group,
              items: filterNavigation(group.items)
            }))
            .filter(group => group.items.length > 0)
            .map(renderNavigationGroup)
          }
        </nav>

        {/* Enhanced Enterprise Footer - Dark Theme */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          {sidebarOpen ? (
            <div className="space-y-3">
              {/* User Info */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg shadow-sm">
                  <div className="p-2 bg-blue-900 rounded-full">
                    <UserCheck className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || user.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user.role || 'User'}
                    </p>
                  </div>
                  <button
                    onClick={actions.logout}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <div className="h-3 w-3 bg-current rounded-full" />
                  </button>
                </div>
              )}
              
              {/* Connection Status */}
              <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg shadow-sm">
                <div className={`p-1 rounded-full ${
                  state.apiConnectionStatus === 'connected' 
                    ? 'bg-green-900' 
                    : state.isOffline 
                    ? 'bg-orange-900' 
                    : 'bg-gray-600'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    state.apiConnectionStatus === 'connected' 
                      ? 'bg-green-400' 
                      : state.isOffline 
                      ? 'bg-orange-400' 
                      : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {state.apiConnectionStatus === 'connected' 
                      ? 'API Connected' 
                      : state.isOffline 
                      ? 'Offline Mode' 
                      : 'Connecting...'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {state.apiConnectionStatus === 'connected' 
                      ? 'Live data available' 
                      : state.isOffline 
                      ? 'Demo data loaded' 
                      : 'Checking connection'}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Refresh connection"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Touch Controls for Mobile */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center p-2 bg-gray-700 rounded-lg shadow-sm text-xs text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setSearchTerm('')}
                  className="flex items-center justify-center p-2 bg-gray-700 rounded-lg shadow-sm text-xs text-gray-300 hover:bg-gray-600"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </button>
              </div>
              
              {/* Version Info */}
              <div className="text-center">
                <p className="text-xs text-gray-400">Shahin-AI KSA</p>
                <p className="text-xs text-gray-500" dir="rtl">v2.1.0 منصة الحوكمة الذكية</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Compact connection status */}
              <div className="flex justify-center">
                <div className={`p-1 rounded-full ${
                  state.apiConnectionStatus === 'connected' 
                    ? 'bg-green-900' 
                    : state.isOffline 
                    ? 'bg-orange-900' 
                    : 'bg-gray-600'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    state.apiConnectionStatus === 'connected' 
                      ? 'bg-green-400' 
                      : state.isOffline 
                      ? 'bg-orange-400' 
                      : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
              
              {/* Compact refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full flex justify-center p-1 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
