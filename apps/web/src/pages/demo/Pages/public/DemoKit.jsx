import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BarChart3, FileCheck, Shield, AlertTriangle, Book,
  Users, Settings, FileText, TrendingUp, Database, Zap,
  Globe, Award, Calendar, LogOut, ChevronRight,
  Play, Sparkles, CheckCircle2, Building2, Layers, FileBarChart,
  GitBranch, Package, Bell, Activity, Server, Cloud, Brain
} from 'lucide-react';

const DemoKit = () => {
  const navigate = useNavigate();
  const [visitorInfo, setVisitorInfo] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if visitor has access
    const visitor = sessionStorage.getItem('demoVisitor');
    if (!visitor) {
      navigate('/demo-access');
      return;
    }
    setVisitorInfo(JSON.parse(visitor));
  }, [navigate]);

  const demoModules = [
    // ===== DASHBOARDS (6 modules) =====
    {
      id: 'dashboard',
      titleAr: 'لوحة التحكم الرئيسية',
      titleEn: 'Main Dashboard',
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      category: 'Dashboards',
      description: 'Real-time GRC metrics, compliance status, and risk heatmaps',
      scenarios: [
        'Live compliance dashboard with 85% completion',
        'Risk heat map showing 12 active risks',
        'KPI tracking with trend analysis',
        'Executive summary reports'
      ]
    },
    {
      id: 'enhanced-dashboard',
      titleAr: 'لوحة التحكم المحسنة',
      titleEn: 'Enhanced Dashboard V2',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      category: 'Dashboards',
      description: 'Advanced analytics with interactive charts and widgets',
      scenarios: ['Advanced KPIs', 'Custom widgets', 'Real-time metrics', 'Trend predictions']
    },
    {
      id: 'modern-dashboard',
      titleAr: 'لوحة التحكم المتقدمة',
      titleEn: 'Modern Advanced Dashboard',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
      category: 'Dashboards',
      description: 'Modern UI with advanced data visualization',
      scenarios: ['Interactive charts', 'Custom filters', 'Export capabilities', 'Drill-down analysis']
    },
    {
      id: 'tenant-dashboard',
      titleAr: 'لوحة المؤسسة',
      titleEn: 'Tenant Dashboard',
      icon: Building2,
      color: 'from-indigo-500 to-purple-500',
      category: 'Dashboards',
      description: 'Multi-tenant organization overview and metrics',
      scenarios: ['Org hierarchy view', 'Tenant comparison', 'Multi-entity metrics', 'Consolidated reporting']
    },
    {
      id: 'regulatory-market',
      titleAr: 'لوحة السوق التنظيمي',
      titleEn: 'Regulatory Market Dashboard',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      category: 'Dashboards',
      description: 'Market trends and regulatory landscape analysis',
      scenarios: ['Market intelligence', 'Regulatory changes', 'Industry benchmarks', 'Compliance trends']
    },
    {
      id: 'usage-dashboard',
      titleAr: 'لوحة الاستخدام',
      titleEn: 'Usage Dashboard',
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      category: 'Dashboards',
      description: 'Platform usage analytics and user activity',
      scenarios: ['User activity', 'Feature usage', 'License tracking', 'Performance metrics']
    },
    {
      id: 'assessments',
      titleAr: 'التقييمات',
      titleEn: 'Assessments',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Compliance assessments across multiple frameworks',
      scenarios: [
        'NCA ECC assessment (65% complete)',
        'PDPL compliance assessment',
        'ISO 27001 gap analysis',
        'Automated evidence collection'
      ]
    },
    {
      id: 'compliance',
      titleAr: 'إدارة الامتثال',
      titleEn: 'Compliance Tracking',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-purple-500',
      description: 'Track compliance status across regulations',
      scenarios: [
        'Multi-framework compliance view',
        'Gap analysis and remediation',
        'Control mapping and testing',
        'Compliance scoring dashboard'
      ]
    },
    {
      id: 'risks',
      titleAr: 'إدارة المخاطر',
      titleEn: 'Risk Management',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      description: 'Identify, assess, and mitigate organizational risks',
      scenarios: [
        'Risk register with 12 active risks',
        'Likelihood × Impact matrix',
        'Risk treatment plans',
        'Continuous monitoring alerts'
      ]
    },
    {
      id: 'frameworks',
      titleAr: 'مكتبة الأطر',
      titleEn: 'Framework Library',
      icon: Book,
      color: 'from-purple-500 to-pink-500',
      description: '200+ regulatory frameworks including KSA-specific',
      scenarios: [
        'NCA ECC 1:2018 controls',
        'SAMA Cybersecurity Framework',
        'SDAIA Cloud Computing Framework',
        'ISO 27001:2022 controls'
      ]
    },
    {
      id: 'controls',
      titleAr: 'الضوابط',
      titleEn: 'Controls',
      icon: Shield,
      color: 'from-teal-500 to-green-500',
      description: 'Manage security and compliance controls',
      scenarios: [
        '450+ controls library',
        'Control effectiveness testing',
        'Evidence management',
        'Automated control mapping'
      ]
    },
    {
      id: 'documents',
      titleAr: 'إدارة الوثائق',
      titleEn: 'Document Management',
      icon: FileText,
      color: 'from-yellow-500 to-orange-500',
      description: 'Centralized evidence and policy repository',
      scenarios: [
        'Policy document library',
        'Evidence collection system',
        'Version control and audit trail',
        'Automated document linking'
      ]
    },
    {
      id: 'reports',
      titleAr: 'التقارير',
      titleEn: 'Reports & Analytics',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      description: 'Executive dashboards and compliance reports',
      scenarios: [
        'Executive summary reports',
        'Compliance status reports',
        'Risk analysis reports',
        'Custom report builder'
      ]
    },
    {
      id: 'ai-scheduler',
      titleAr: 'الذكاء الاصطناعي',
      titleEn: 'AI Automation',
      icon: Zap,
      color: 'from-violet-500 to-purple-500',
      description: 'AI-powered automation and intelligent insights',
      scenarios: [
        'Auto-assessment generation',
        'Smart evidence matching',
        'Predictive risk analytics',
        'Natural language queries'
      ]
    },
    {
      id: 'regulatory',
      titleAr: 'الاستخبارات التنظيمية',
      titleEn: 'Regulatory Intelligence',
      icon: Globe,
      color: 'from-blue-500 to-indigo-500',
      description: 'Stay updated with regulatory changes',
      scenarios: [
        'Real-time regulatory updates',
        'KSA regulators monitoring',
        'Impact assessment',
        'Compliance calendar'
      ]
    },
    {
      id: 'organizations',
      titleAr: 'المؤسسات',
      titleEn: 'Organizations',
      icon: Building2,
      color: 'from-gray-500 to-slate-500',
      description: 'Multi-tenant organization management',
      scenarios: [
        'Organization hierarchy',
        'Department management',
        'Access control',
        'Multi-entity compliance'
      ]
    },
    {
      id: 'users',
      titleAr: 'إدارة المستخدمين',
      titleEn: 'User Management',
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      description: 'Role-based access and team collaboration',
      scenarios: [
        'User roles and permissions',
        'Team assignments',
        'Audit trail',
        'Access control matrix'
      ]
    },
    // ===== GRC CORE MODULES (11 modules) =====
    {
      id: 'assessments',
      titleAr: 'التقييمات التعاونية',
      titleEn: 'Assessment Collaborative',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      category: 'GRC Core',
      description: 'Collaborative compliance assessments with AI support',
      scenarios: ['NCA ECC (65% complete)', 'PDPL compliance', 'ISO 27001 gap', 'Auto evidence']
    },
    {
      id: 'compliance-enhanced',
      titleAr: 'إدارة الامتثال المحسنة',
      titleEn: 'Compliance Tracking Enhanced',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-purple-500',
      category: 'GRC Core',
      description: 'Advanced compliance tracking and gap analysis',
      scenarios: ['Multi-framework', 'Gap remediation', 'Control mapping', 'Scoring dashboard']
    },
    {
      id: 'compliance-page',
      titleAr: 'صفحة الامتثال',
      titleEn: 'Compliance Tracking Page',
      icon: Award,
      color: 'from-purple-500 to-indigo-600',
      category: 'GRC Core',
      description: 'Main compliance overview and tracking',
      scenarios: ['Compliance status', 'Framework progress', 'Control testing', 'Reporting']
    },
    {
      id: 'risk-enhanced',
      titleAr: 'إدارة المخاطر المحسنة',
      titleEn: 'Risk Management Enhanced',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      category: 'GRC Core',
      description: 'Advanced risk assessment with heat maps',
      scenarios: ['Risk register', 'L×I matrix', 'Treatment plans', 'Monitoring alerts']
    },
    {
      id: 'risk-v2',
      titleAr: 'إدارة المخاطر V2',
      titleEn: 'Risk Management V2',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-600',
      category: 'GRC Core',
      description: 'Next-gen risk management with predictive analytics',
      scenarios: ['Predictive scoring', 'Scenario analysis', 'Risk appetite', 'Real-time alerts']
    },
    {
      id: 'risk-page',
      titleAr: 'صفحة المخاطر',
      titleEn: 'Risks Page',
      icon: Shield,
      color: 'from-red-600 to-pink-600',
      category: 'GRC Core',
      description: 'Risk overview and management interface',
      scenarios: ['Risk dashboard', 'Active risks view', 'Treatment tracking', 'KRI monitoring']
    },
    {
      id: 'frameworks',
      titleAr: 'مكتبة الأطر',
      titleEn: 'Frameworks Library',
      icon: Book,
      color: 'from-purple-500 to-pink-500',
      category: 'GRC Core',
      description: '200+ regulatory frameworks including KSA-specific',
      scenarios: ['NCA ECC 1:2018', 'SAMA Cyber', 'SDAIA Cloud', 'ISO 27001:2022']
    },
    {
      id: 'controls-enhanced',
      titleAr: 'الضوابط المحسنة',
      titleEn: 'Controls Enhanced',
      icon: Shield,
      color: 'from-teal-500 to-green-500',
      category: 'GRC Core',
      description: 'Manage 450+ security and compliance controls',
      scenarios: ['Controls library', 'Effectiveness testing', 'Evidence mgmt', 'Auto mapping']
    },
    {
      id: 'evidence',
      titleAr: 'إدارة الأدلة',
      titleEn: 'Evidence Management',
      icon: FileText,
      color: 'from-amber-500 to-yellow-500',
      category: 'GRC Core',
      description: 'Centralized evidence collection and linking',
      scenarios: ['Evidence library', 'Auto-linking', 'Version control', 'Audit trail']
    },
    {
      id: 'evidence-page',
      titleAr: 'صفحة الأدلة',
      titleEn: 'Evidence Page',
      icon: FileText,
      color: 'from-yellow-500 to-orange-500',
      category: 'GRC Core',
      description: 'Evidence repository and management',
      scenarios: ['Upload evidence', 'Link to controls', 'Search & filter', 'Export reports']
    },
    {
      id: 'documents',
      titleAr: 'إدارة الوثائق',
      titleEn: 'Document Management',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      category: 'GRC Core',
      description: 'Policy and document repository',
      scenarios: ['Policy library', 'Version control', 'Approval workflow', 'Document linking']
    },
    // ===== REGULATORY (6 modules) =====
    {
      id: 'regulatory-intelligence',
      titleAr: 'الاستخبارات التنظيمية',
      titleEn: 'Regulatory Intelligence',
      icon: Globe,
      color: 'from-blue-500 to-indigo-500',
      category: 'Regulatory',
      description: 'AI-powered regulatory monitoring and updates',
      scenarios: ['Real-time updates', 'KSA regulators', 'Impact assessment', 'Compliance calendar']
    },
    {
      id: 'regulatory-enhanced',
      titleAr: 'الاستخبارات المحسنة',
      titleEn: 'Regulatory Intelligence Enhanced',
      icon: Globe,
      color: 'from-indigo-500 to-blue-600',
      category: 'Regulatory',
      description: 'Enhanced regulatory tracking with AI insights',
      scenarios: ['Regulatory radar', 'Change impact', 'Auto alerts', 'Compliance gap']
    },
    {
      id: 'regulatory-engine',
      titleAr: 'محرك التنظيمات',
      titleEn: 'Regulatory Intelligence Engine',
      icon: Brain,
      color: 'from-blue-600 to-purple-600',
      category: 'Regulatory',
      description: 'AI engine for regulatory analysis',
      scenarios: ['NLP analysis', 'Requirement extraction', 'Control mapping', 'Impact scoring']
    },
    {
      id: 'regulators',
      titleAr: 'الجهات التنظيمية',
      titleEn: 'Regulators Page',
      icon: Building2,
      color: 'from-purple-600 to-pink-600',
      category: 'Regulatory',
      description: 'KSA regulators directory and updates',
      scenarios: ['NCA updates', 'SAMA circulars', 'SDAIA guidance', 'CITC regulations']
    },
    {
      id: 'sector-intelligence',
      titleAr: 'استخبارات القطاع',
      titleEn: 'Sector Intelligence',
      icon: TrendingUp,
      color: 'from-pink-600 to-rose-600',
      category: 'Regulatory',
      description: 'Sector-specific compliance intelligence',
      scenarios: ['Financial sector', 'Healthcare', 'Government', 'Technology']
    },
    {
      id: 'ksa-grc',
      titleAr: 'الحوكمة السعودية',
      titleEn: 'KSA GRC Page',
      icon: Award,
      color: 'from-rose-600 to-red-600',
      category: 'Regulatory',
      description: 'Saudi Arabia specific GRC requirements',
      scenarios: ['Vision 2030', 'NTP compliance', 'Local regulations', 'KSA frameworks']
    },
    // ===== SYSTEM & ADMIN (13 modules) =====
    {
      id: 'settings',
      titleAr: 'الإعدادات',
      titleEn: 'Settings',
      icon: Settings,
      color: 'from-gray-600 to-gray-800',
      category: 'System',
      description: 'Platform configuration and customization',
      scenarios: ['Tenant config', 'Custom fields', 'Integrations', 'Email templates']
    },
    {
      id: 'users',
      titleAr: 'إدارة المستخدمين',
      titleEn: 'User Management',
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      category: 'System',
      description: 'Role-based access and team collaboration',
      scenarios: ['User roles', 'Team assignments', 'Permissions', 'Access control']
    },
    {
      id: 'workflows',
      titleAr: 'سير العمل',
      titleEn: 'Workflow Management',
      icon: GitBranch,
      color: 'from-pink-500 to-rose-500',
      category: 'System',
      description: 'Automated approval and task workflows',
      scenarios: ['Approval workflows', 'Task automation', 'Notifications', 'Escalations']
    },
    {
      id: 'audit-logs',
      titleAr: 'سجلات التدقيق',
      titleEn: 'Audit Logs',
      icon: Database,
      color: 'from-orange-500 to-amber-500',
      category: 'System',
      description: 'Complete audit trail and activity logs',
      scenarios: ['User activity', 'Change history', 'Security events', 'Compliance trail']
    },
    {
      id: 'api-management',
      titleAr: 'إدارة الواجهات',
      titleEn: 'API Management',
      icon: Cloud,
      color: 'from-cyan-500 to-blue-500',
      category: 'System',
      description: 'API keys, webhooks, and integrations',
      scenarios: ['API keys', 'Webhooks', 'Rate limits', 'Integration logs']
    },
    {
      id: 'database',
      titleAr: 'إدارة قاعدة البيانات',
      titleEn: 'Database Management',
      icon: Database,
      color: 'from-blue-500 to-indigo-500',
      category: 'System',
      description: 'Database health and performance monitoring',
      scenarios: ['DB health', 'Query performance', 'Backup status', 'Data integrity']
    },
    {
      id: 'performance',
      titleAr: 'مراقبة الأداء',
      titleEn: 'Performance Monitor',
      icon: Activity,
      color: 'from-green-500 to-teal-500',
      category: 'System',
      description: 'System performance and resource monitoring',
      scenarios: ['CPU/Memory', 'Response times', 'API latency', 'Resource usage']
    },
    {
      id: 'system-health',
      titleAr: 'صحة النظام',
      titleEn: 'System Health',
      icon: Activity,
      color: 'from-teal-500 to-cyan-500',
      category: 'System',
      description: 'Overall system health dashboard',
      scenarios: ['Service status', 'Health checks', 'Uptime', 'Alert summary']
    },
    {
      id: 'notifications',
      titleAr: 'إدارة الإشعارات',
      titleEn: 'Notification Management',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      category: 'System',
      description: 'Configure alerts and notifications',
      scenarios: ['Email alerts', 'In-app notifications', 'Templates', 'Delivery logs']
    },
    {
      id: 'mission-control',
      titleAr: 'مركز التحكم',
      titleEn: 'Mission Control',
      icon: Server,
      color: 'from-indigo-600 to-purple-600',
      category: 'System',
      description: 'Central command center for operations',
      scenarios: ['System overview', 'Quick actions', 'Status board', 'Command center']
    },
    {
      id: 'ai-scheduler',
      titleAr: 'جدولة الذكاء الاصطناعي',
      titleEn: 'AI Scheduler',
      icon: Zap,
      color: 'from-violet-500 to-purple-500',
      category: 'AI Services',
      description: 'Schedule AI tasks and automation jobs',
      scenarios: ['Auto-assessments', 'Scheduled scans', 'Batch processing', 'AI jobs queue']
    },
    {
      id: 'scheduler-console',
      titleAr: 'وحدة تحكم الجدولة',
      titleEn: 'Scheduler Console',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      category: 'AI Services',
      description: 'Advanced scheduler console and monitoring',
      scenarios: ['Job scheduling', 'Execution logs', 'Cron management', 'Task monitoring']
    },
    {
      id: 'rag-service',
      titleAr: 'خدمة RAG',
      titleEn: 'RAG Service',
      icon: Brain,
      color: 'from-pink-500 to-red-500',
      category: 'AI Services',
      description: 'Retrieval-Augmented Generation AI service',
      scenarios: ['Smart search', 'Context retrieval', 'AI responses', 'Knowledge base']
    },
    // ===== PLATFORM & MSP (5 modules) =====
    {
      id: 'licenses',
      titleAr: 'إدارة التراخيص',
      titleEn: 'License Management',
      icon: Award,
      color: 'from-green-600 to-emerald-600',
      category: 'Platform',
      description: 'MSP license and subscription management',
      scenarios: ['License tracking', 'Seat allocation', 'Usage limits', 'Renewals']
    },
    {
      id: 'renewals',
      titleAr: 'خط التجديدات',
      titleEn: 'Renewals Pipeline',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      category: 'Platform',
      description: 'Track renewals and contract lifecycle',
      scenarios: ['Renewal calendar', 'Contract tracking', 'Expiry alerts', 'Revenue pipeline']
    },
    {
      id: 'partners',
      titleAr: 'إدارة الشركاء',
      titleEn: 'Partner Management',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      category: 'Platform',
      description: 'Partner portal and collaboration',
      scenarios: ['Partner directory', 'Collaboration', 'Revenue share', 'Partner portal']
    },
    {
      id: 'upgrade',
      titleAr: 'الترقية',
      titleEn: 'Upgrade',
      icon: TrendingUp,
      color: 'from-cyan-600 to-blue-600',
      category: 'Platform',
      description: 'Subscription upgrade and plan management',
      scenarios: ['Plan comparison', 'Upgrade flow', 'Feature unlock', 'Billing']
    },
    {
      id: 'auto-assessment',
      titleAr: 'التقييم التلقائي',
      titleEn: 'Auto Assessment Generator',
      icon: Zap,
      color: 'from-purple-600 to-indigo-600',
      category: 'Platform',
      description: 'AI-powered assessment generation',
      scenarios: ['Auto-generate', 'Smart questions', 'Evidence matching', 'Instant reports']
    },
    // ===== ORGANIZATIONS & VENDORS (4 modules) =====
    {
      id: 'organizations',
      titleAr: 'المؤسسات',
      titleEn: 'Organizations',
      icon: Building2,
      color: 'from-gray-500 to-slate-500',
      category: 'Organizations',
      description: 'Multi-tenant organization management',
      scenarios: ['Org hierarchy', 'Department mgmt', 'Access control', 'Multi-entity']
    },
    {
      id: 'org-details',
      titleAr: 'تفاصيل المؤسسة',
      titleEn: 'Organization Details',
      icon: Building2,
      color: 'from-slate-500 to-gray-600',
      category: 'Organizations',
      description: 'Detailed organization profile and settings',
      scenarios: ['Profile info', 'Settings', 'Integrations', 'Custom fields']
    },
    {
      id: 'org-form',
      titleAr: 'نموذج المؤسسة',
      titleEn: 'Organization Form',
      icon: FileText,
      color: 'from-gray-600 to-slate-600',
      category: 'Organizations',
      description: 'Create and edit organization details',
      scenarios: ['Create org', 'Edit profile', 'Configure settings', 'Setup wizard']
    },
    {
      id: 'vendors',
      titleAr: 'إدارة الموردين',
      titleEn: 'Vendor Management',
      icon: Package,
      color: 'from-indigo-600 to-purple-700',
      category: 'Organizations',
      description: 'Third-party vendor risk management',
      scenarios: ['Vendor assessment', 'Risk scoring', 'Contract tracking', 'Performance reviews']
    },
    // ===== REPORTS (1 module) =====
    {
      id: 'reports',
      titleAr: 'التقارير والتحليلات',
      titleEn: 'Reports & Analytics',
      icon: FileBarChart,
      color: 'from-cyan-500 to-blue-500',
      category: 'Reports',
      description: 'Executive dashboards and compliance reports',
      scenarios: ['Executive reports', 'Compliance status', 'Risk analysis', 'Custom builder']
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('demoVisitor');
    navigate('/');
  };

  if (!visitorInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const activeModuleData = demoModules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Demo Kit</h2>
              <p className="text-gray-400 text-xs">Interactive Showcase</p>
            </div>
          </div>

          {/* Visitor Info */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-white text-sm font-semibold truncate">{visitorInfo.fullName}</p>
            <p className="text-gray-400 text-xs truncate">{visitorInfo.email}</p>
            <p className="text-gray-500 text-xs mt-1">{visitorInfo.company}</p>
          </div>
        </div>

        {/* Module List - Grouped by Category */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-3 px-2">
            All Modules ({demoModules.length})
          </p>
          
          {/* Group modules by category */}
          {['Dashboards', 'GRC Core', 'Regulatory', 'System', 'AI Services', 'Platform', 'Organizations', 'Reports'].map((category) => {
            const categoryModules = demoModules.filter(m => m.category === category);
            if (categoryModules.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <p className="text-gray-500 text-xs font-semibold uppercase px-2 mb-2 flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  {category} ({categoryModules.length})
                </p>
                {categoryModules.map((module) => {
                  const Icon = module.icon;
                  const isActive = activeModule === module.id;

                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r ' + module.color + ' text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium leading-tight">{module.titleEn}</p>
                      </div>
                      {isActive && <ChevronRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Demo</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-0'} transition-all`}>
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">{activeModuleData?.titleEn}</h1>
              <p className="text-gray-400 text-sm">{activeModuleData?.titleAr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Demo Mode Active</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Module Header */}
              <div className={`bg-gradient-to-r ${activeModuleData?.color} rounded-2xl p-8 mb-8 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-4 rounded-xl">
                      {React.createElement(activeModuleData?.icon, { className: 'w-8 h-8' })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{activeModuleData?.titleEn}</h2>
                      <p className="text-xl mb-4">{activeModuleData?.titleAr}</p>
                      <p className="text-white/90 max-w-2xl">{activeModuleData?.description}</p>
                    </div>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Interactive Scenarios */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Interactive Scenarios
                  </h3>
                  <ul className="space-y-3">
                    {activeModuleData?.scenarios.map((scenario, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{scenario}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-between transition-all">
                      <span>Explore Interactive Demo</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-between transition-all">
                      <span>View Sample Data</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-between transition-all">
                      <span>Watch Video Tutorial</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Content Placeholder */}
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 min-h-96">
                <div className="text-center py-12">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${activeModuleData?.color} rounded-2xl mb-6`}>
                    {React.createElement(activeModuleData?.icon, { className: 'w-10 h-10 text-white' })}
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4">
                    {activeModuleData?.titleEn} Interactive Demo
                  </h3>
                  <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    This module contains all {activeModuleData?.titleEn.toLowerCase()} features with realistic demo data.
                    Explore the interface, test features, and experience the full functionality.
                  </p>
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl inline-flex items-center gap-3 transition-all transform hover:scale-105">
                    <Play className="w-5 h-5" />
                    <span>Launch Interactive Demo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DemoKit;
