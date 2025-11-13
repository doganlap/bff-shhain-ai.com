/**
 * Custom i18n Hook for GRC Master Application
 * Provides internationalization support for Arabic and English
 */

import { useState, useEffect, createContext, useContext } from 'react';

// Translation keys and values
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assessments': 'Assessments',
    'nav.frameworks': 'Frameworks',
    'nav.controls': 'Controls',
    'nav.organizations': 'Organizations',
    'nav.regulators': 'Regulators',
    'nav.reports': 'Reports',
    'nav.database': 'Database',
    'nav.settings': 'Settings',
    'nav.users': 'Users',
    'nav.partners': 'Partners',
    'nav.risks': 'Risks',
    'nav.compliance': 'Compliance',
    'nav.audit': 'Audit Logs',
    'nav.intelligence': 'Intelligence',
    'nav.ai': 'AI Services',
    'nav.documents': 'Documents',
    'nav.workflows': 'Workflows',
    'nav.notifications': 'Notifications',
    'nav.performance': 'Performance',

    // Common Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.create': 'Create',
    'action.update': 'Update',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.export': 'Export',
    'action.import': 'Import',
    'action.refresh': 'Refresh',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.previous': 'Previous',
    'action.submit': 'Submit',
    'action.close': 'Close',
    'action.open': 'Open',
    'action.view': 'View',
    'action.download': 'Download',
    'action.upload': 'Upload',

    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.draft': 'Draft',
    'status.published': 'Published',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.in_progress': 'In Progress',
    'status.on_hold': 'On Hold',

    // Messages
    'message.success': 'Operation completed successfully',
    'message.error': 'An error occurred',
    'message.loading': 'Loading...',
    'message.no_data': 'No data available',
    'message.confirm_delete': 'Are you sure you want to delete this item?',
    'message.unsaved_changes': 'You have unsaved changes',
    'message.network_error': 'Network connection error',
    'message.unauthorized': 'Unauthorized access',
    'message.forbidden': 'Access forbidden',
    'message.not_found': 'Resource not found',

    // Forms
    'form.required': 'This field is required',
    'form.invalid_email': 'Please enter a valid email address',
    'form.password_mismatch': 'Passwords do not match',
    'form.min_length': 'Minimum length is {min} characters',
    'form.max_length': 'Maximum length is {max} characters',
    'form.invalid_format': 'Invalid format',
    'form.select_option': 'Please select an option',

    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.organization': 'Organization',
    'auth.phone': 'Phone Number',
    'auth.welcome': 'Welcome',
    'auth.forgot_password': 'Forgot Password?',
    'auth.remember_me': 'Remember Me',

    // Dashboard
    'dashboard.title': 'GRC Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.statistics': 'Statistics',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.compliance_score': 'Compliance Score',
    'dashboard.risk_level': 'Risk Level',
    'dashboard.assessments_due': 'Assessments Due',
    'dashboard.controls_status': 'Controls Status',

    // Time & Dates
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.this_week': 'This Week',
    'time.this_month': 'This Month',
    'time.last_month': 'Last Month',
    'time.this_year': 'This Year',
    'time.created_at': 'Created At',
    'time.updated_at': 'Updated At',
    'time.due_date': 'Due Date',

    // Company Info
    'company.name': 'Shahin-AI KSA',
    'company.tagline': 'Smart Governance Platform',
    'company.description': 'Advanced GRC solutions for modern enterprises',

    // Common UI Elements
    'common.loading': 'Loading',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.clear': 'Clear',
    'common.select_all': 'Select All',
    'common.deselect_all': 'Deselect All',

    // Actions (Extended)
    'action.retry': 'Retry',
    'action.reload': 'Reload',
    'action.duplicate': 'Duplicate',
    'action.archive': 'Archive',
    'action.restore': 'Restore',
    'action.activate': 'Activate',
    'action.deactivate': 'Deactivate',
    'action.enable': 'Enable',
    'action.disable': 'Disable',
    'action.configure': 'Configure',
    'action.manage': 'Manage',
    'action.monitor': 'Monitor',
    'action.analyze': 'Analyze',
    'action.generate': 'Generate',
    'action.validate': 'Validate',
    'action.approve': 'Approve',
    'action.reject': 'Reject',
    'action.review': 'Review',
    'action.assign': 'Assign',
    'action.unassign': 'Unassign',

    // Dashboard (Extended)
    'dashboard.controls_heatmap': 'Controls Heatmap',
    'dashboard.risks_heatmap': 'Risk Heatmap',
    'dashboard.compliance_trend': 'Compliance Trend',
    'dashboard.open_gaps': 'Open Gaps',
    'dashboard.risk_hotspots': 'Risk Hotspots',
    'dashboard.active_assessments': 'Active Assessments',
    'dashboard.kpi_overview': 'KPI Overview',
    'dashboard.performance_metrics': 'Performance Metrics',
    'dashboard.regulatory_updates': 'Regulatory Updates',
    'dashboard.system_health': 'System Health',
    'dashboard.user_activity': 'User Activity',
    'dashboard.data_quality': 'Data Quality',
    'dashboard.integration_status': 'Integration Status',

    // Filters & Search
    'filter.all': 'All',
    'filter.active': 'Active',
    'filter.inactive': 'Inactive',
    'filter.date_range': 'Date Range',
    'filter.framework': 'Framework',
    'filter.organization': 'Organization',
    'filter.owner': 'Owner',
    'filter.status': 'Status',
    'filter.priority': 'Priority',
    'filter.category': 'Category',
    'filter.type': 'Type',
    'search.placeholder': 'Search...',
    'search.no_results': 'No results found',
    'search.results_count': '{count} results found',

    // Compliance & Risk
    'compliance.percentage': 'Compliance Percentage',
    'compliance.gap_analysis': 'Gap Analysis',
    'compliance.control_effectiveness': 'Control Effectiveness',
    'compliance.regulatory_alignment': 'Regulatory Alignment',
    'risk.assessment': 'Risk Assessment',
    'risk.likelihood': 'Likelihood',
    'risk.impact': 'Impact',
    'risk.severity': 'Severity',
    'risk.mitigation': 'Mitigation',
    'risk.treatment': 'Treatment',
    'risk.monitoring': 'Monitoring',

    // System & Technical
    'system.operational': 'Operational',
    'system.maintenance': 'Maintenance',
    'system.offline': 'Offline',
    'system.healthy': 'Healthy',
    'system.degraded': 'Degraded',
    'system.critical': 'Critical',
    'technical.database': 'Database',
    'technical.api': 'API',
    'technical.frontend': 'Frontend',
    'technical.backend': 'Backend',
    'technical.security': 'Security',
    'technical.performance': 'Performance',

    // Additional Navigation
    'nav.governance': 'Governance',
    'nav.analytics': 'Analytics',
    'nav.profile': 'Profile',
    'common.search': 'Search...',
    'common.tenant': 'Tenant',
    'status.compliant': 'Compliant',
    'role.user': 'User',
    'action.switch_to_light': 'Switch to Light Mode',
    'action.switch_to_dark': 'Switch to Dark Mode',
    'action.logout': 'Logout',

    // Descriptions
    'frameworks.description': 'Standards & regulations',
    'organizations.description': 'Entity structure',
    'users.description': 'User management',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة القيادة',
    'nav.assessments': 'التقييمات',
    'nav.frameworks': 'الأطر التنظيمية',
    'nav.controls': 'الضوابط',
    'nav.organizations': 'المؤسسات',
    'nav.regulators': 'الجهات التنظيمية',
    'nav.reports': 'التقارير',
    'nav.database': 'قاعدة البيانات',
    'nav.settings': 'الإعدادات',
    'nav.users': 'المستخدمون',
    'nav.partners': 'الشركاء',
    'nav.risks': 'المخاطر',
    'nav.compliance': 'الامتثال',
    'nav.audit': 'سجلات المراجعة',
    'nav.intelligence': 'الذكاء التنظيمي',
    'nav.ai': 'خدمات الذكاء الاصطناعي',
    'nav.documents': 'الوثائق',
    'nav.workflows': 'سير العمل',
    'nav.notifications': 'الإشعارات',
    'nav.performance': 'الأداء',

    // Common Actions
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.delete': 'حذف',
    'action.edit': 'تعديل',
    'action.create': 'إنشاء',
    'action.update': 'تحديث',
    'action.search': 'بحث',
    'action.filter': 'تصفية',
    'action.export': 'تصدير',
    'action.import': 'استيراد',
    'action.refresh': 'تحديث',
    'action.back': 'رجوع',
    'action.next': 'التالي',
    'action.previous': 'السابق',
    'action.submit': 'إرسال',
    'action.close': 'إغلاق',
    'action.open': 'فتح',
    'action.view': 'عرض',
    'action.download': 'تحميل',
    'action.upload': 'رفع',

    // Status
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'status.pending': 'قيد الانتظار',
    'status.completed': 'مكتمل',
    'status.draft': 'مسودة',
    'status.published': 'منشور',
    'status.approved': 'موافق عليه',
    'status.rejected': 'مرفوض',
    'status.in_progress': 'قيد التنفيذ',
    'status.on_hold': 'معلق',

    // Messages
    'message.success': 'تمت العملية بنجاح',
    'message.error': 'حدث خطأ',
    'message.loading': 'جاري التحميل...',
    'message.no_data': 'لا توجد بيانات متاحة',
    'message.confirm_delete': 'هل أنت متأكد من حذف هذا العنصر؟',
    'message.unsaved_changes': 'لديك تغييرات غير محفوظة',
    'message.network_error': 'خطأ في الاتصال بالشبكة',
    'message.unauthorized': 'وصول غير مصرح به',
    'message.forbidden': 'الوصول محظور',
    'message.not_found': 'المورد غير موجود',

    // Forms
    'form.required': 'هذا الحقل مطلوب',
    'form.invalid_email': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
    'form.password_mismatch': 'كلمات المرور غير متطابقة',
    'form.min_length': 'الحد الأدنى للطول هو {min} أحرف',
    'form.max_length': 'الحد الأقصى للطول هو {max} أحرف',
    'form.invalid_format': 'تنسيق غير صحيح',
    'form.select_option': 'يرجى اختيار خيار',

    // Authentication
    'auth.login': 'تسجيل الدخول',
    'auth.logout': 'تسجيل الخروج',
    'auth.register': 'تسجيل جديد',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirm_password': 'تأكيد كلمة المرور',
    'auth.first_name': 'الاسم الأول',
    'auth.last_name': 'اسم العائلة',
    'auth.organization': 'المؤسسة',
    'auth.phone': 'رقم الهاتف',
    'auth.welcome': 'مرحباً',
    'auth.forgot_password': 'نسيت كلمة المرور؟',
    'auth.remember_me': 'تذكرني',

    // Dashboard
    'dashboard.title': 'لوحة قيادة الحوكمة',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.statistics': 'الإحصائيات',
    'dashboard.recent_activity': 'النشاط الأخير',
    'dashboard.compliance_score': 'نقاط الامتثال',
    'dashboard.risk_level': 'مستوى المخاطر',
    'dashboard.assessments_due': 'التقييمات المستحقة',
    'dashboard.controls_status': 'حالة الضوابط',

    // Time & Dates
    'time.today': 'اليوم',
    'time.yesterday': 'أمس',
    'time.this_week': 'هذا الأسبوع',
    'time.this_month': 'هذا الشهر',
    'time.last_month': 'الشهر الماضي',
    'time.this_year': 'هذا العام',
    'time.created_at': 'تاريخ الإنشاء',
    'time.updated_at': 'تاريخ التحديث',
    'time.due_date': 'تاريخ الاستحقاق',

    // Company Info
    'company.name': 'شاهين الذكي السعودية',
    'company.tagline': 'منصة الحوكمة الذكية',
    'company.description': 'حلول حوكمة متقدمة للمؤسسات الحديثة',

    // Common UI Elements
    'common.loading': 'جاري التحميل',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.warning': 'تحذير',
    'common.info': 'معلومات',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    'common.apply': 'تطبيق',
    'common.reset': 'إعادة تعيين',
    'common.clear': 'مسح',
    'common.select_all': 'تحديد الكل',
    'common.deselect_all': 'إلغاء تحديد الكل',

    // Actions (Extended)
    'action.retry': 'إعادة المحاولة',
    'action.reload': 'إعادة التحميل',
    'action.duplicate': 'نسخ',
    'action.archive': 'أرشفة',
    'action.restore': 'استعادة',
    'action.activate': 'تفعيل',
    'action.deactivate': 'إلغاء التفعيل',
    'action.enable': 'تمكين',
    'action.disable': 'تعطيل',
    'action.configure': 'تكوين',
    'action.manage': 'إدارة',
    'action.monitor': 'مراقبة',
    'action.analyze': 'تحليل',
    'action.generate': 'توليد',
    'action.validate': 'التحقق من الصحة',
    'action.approve': 'موافقة',
    'action.reject': 'رفض',
    'action.review': 'مراجعة',
    'action.assign': 'تعيين',
    'action.unassign': 'إلغاء التعيين',

    // Dashboard (Extended)
    'dashboard.controls_heatmap': 'خريطة حرارية للضوابط',
    'dashboard.risks_heatmap': 'خريطة حرارية للمخاطر',
    'dashboard.compliance_trend': 'اتجاه الامتثال',
    'dashboard.open_gaps': 'الفجوات المفتوحة',
    'dashboard.risk_hotspots': 'نقاط المخاطر الساخنة',
    'dashboard.active_assessments': 'التقييمات النشطة',
    'dashboard.kpi_overview': 'نظرة عامة على مؤشرات الأداء',
    'dashboard.performance_metrics': 'مقاييس الأداء',
    'dashboard.regulatory_updates': 'التحديثات التنظيمية',
    'dashboard.system_health': 'صحة النظام',
    'dashboard.user_activity': 'نشاط المستخدم',
    'dashboard.data_quality': 'جودة البيانات',
    'dashboard.integration_status': 'حالة التكامل',

    // Filters & Search
    'filter.all': 'الكل',
    'filter.active': 'نشط',
    'filter.inactive': 'غير نشط',
    'filter.date_range': 'نطاق التاريخ',
    'filter.framework': 'الإطار التنظيمي',
    'filter.organization': 'المؤسسة',
    'filter.owner': 'المالك',
    'filter.status': 'الحالة',
    'filter.priority': 'الأولوية',
    'filter.category': 'الفئة',
    'filter.type': 'النوع',
    'search.placeholder': 'بحث...',
    'search.no_results': 'لا توجد نتائج',
    'search.results_count': 'تم العثور على {count} نتيجة',

    // Compliance & Risk
    'compliance.percentage': 'نسبة الامتثال',
    'compliance.gap_analysis': 'تحليل الفجوات',
    'compliance.control_effectiveness': 'فعالية الضوابط',
    'compliance.regulatory_alignment': 'التوافق التنظيمي',
    'risk.assessment': 'تقييم المخاطر',
    'risk.likelihood': 'الاحتمالية',
    'risk.impact': 'التأثير',
    'risk.severity': 'الخطورة',
    'risk.mitigation': 'التخفيف',
    'risk.treatment': 'المعالجة',
    'risk.monitoring': 'المراقبة',

    // System & Technical
    'system.operational': 'تشغيلي',
    'system.maintenance': 'صيانة',
    'system.offline': 'غير متصل',
    'system.healthy': 'سليم',
    'system.degraded': 'متدهور',
    'system.critical': 'حرج',
    'technical.database': 'قاعدة البيانات',
    'technical.api': 'واجهة برمجة التطبيقات',
    'technical.frontend': 'الواجهة الأمامية',
    'technical.backend': 'الواجهة الخلفية',
    'technical.security': 'الأمان',
    'technical.performance': 'الأداء',

    // Additional Navigation
    'nav.governance': 'الحوكمة',
    'nav.analytics': 'التحليلات',
    'nav.profile': 'الملف الشخصي',
    'common.search': 'بحث...',
    'common.tenant': 'المؤسسة',
    'status.compliant': 'متوافق',
    'role.user': 'مستخدم',
    'action.switch_to_light': 'التبديل للوضع المضيء',
    'action.switch_to_dark': 'التبديل للوضع المظلم',
    'action.logout': 'تسجيل الخروج',

    // Descriptions
    'frameworks.description': 'المعايير واللوائح',
    'organizations.description': 'هيكل المؤسسات',
    'users.description': 'إدارة المستخدمين',
  }
};

// I18n Context
const I18nContext = createContext();

// I18n Provider Component
export const I18nProvider = ({ children, defaultLanguage = 'ar' }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first, then default
    return localStorage.getItem('grc-language') || defaultLanguage;
  });

  const [direction, setDirection] = useState(() => {
    return language === 'ar' ? 'rtl' : 'ltr';
  });

  // Update document direction and language when language changes
  useEffect(() => {
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // Update document attributes
    document.documentElement.dir = newDirection;
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem('grc-language', language);
  }, [language]);

  // Translation function with interpolation support
  const t = (key, params = {}) => {
    const translation = translations[language]?.[key] || translations.en[key] || key;
    
    // Simple interpolation for parameters like {min}, {max}
    return Object.keys(params).reduce((str, param) => {
      return str.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    }, translation);
  };

  // Change language function
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return Object.keys(translations);
  };

  // Check if current language is RTL
  const isRTL = () => {
    return direction === 'rtl';
  };

  const value = {
    language,
    direction,
    t,
    changeLanguage,
    getAvailableLanguages,
    isRTL,
    translations: translations[language] || translations.en
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Export default hook for convenience
export default useI18n;
