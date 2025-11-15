export const processGuides = {
  dashboard: {
    title: 'How to use the Dashboard',
    titleAr: 'كيفية استخدام لوحة المعلومات',
    steps: [
      { title: 'Review KPIs', titleAr: 'مراجعة المؤشرات', desc: 'Check compliance, risk, and assessment KPIs.' },
      { title: 'Filter Data', titleAr: 'تصفية البيانات', desc: 'Use filters to focus on a tenant or timeframe.' },
      { title: 'Drill Down', titleAr: 'تفاصيل أعمق', desc: 'Open cards to access detailed pages.' },
      { title: 'Export Reports', titleAr: 'تصدير التقارير', desc: 'Export charts to share insights.' }
    ],
    actions: [
      { label: 'View Reports', labelAr: 'عرض التقارير', path: '/app/reports' },
      { label: 'Advanced Dashboard', labelAr: 'لوحة متقدمة', path: '/app/dashboard', altPath: '/advanced' }
    ]
  },
  assessments: {
    title: 'Assessment Process',
    titleAr: 'عملية التقييم',
    steps: [
      { title: 'Create Assessment', titleAr: 'إنشاء تقييم', desc: 'Start a new assessment from templates.' },
      { title: 'Assign Owners', titleAr: 'تعيين المسؤولين', desc: 'Assign tasks to team members.' },
      { title: 'Collect Evidence', titleAr: 'جمع الأدلة', desc: 'Upload documents and link controls.' },
      { title: 'Review & Approve', titleAr: 'المراجعة والموافقة', desc: 'Use workflows for approvals.' }
    ],
    actions: [
      { label: 'Create Assessment', labelAr: 'إنشاء تقييم', path: '/app/assessments/new', altPath: '/advanced/assessments' },
      { label: 'Assign Assessment', labelAr: 'تعيين تقييم', path: '/app/assessments/assign', altPath: '/advanced/assessments' },
      { label: 'Upload Evidence', labelAr: 'رفع الأدلة', path: '/app/documents/upload' }
    ]
  },
  frameworks: {
    title: 'Frameworks Usage',
    titleAr: 'استخدام الأطر',
    steps: [
      { title: 'Select Frameworks', titleAr: 'اختيار الأطر', desc: 'Pick applicable frameworks.' },
      { title: 'Map Controls', titleAr: 'ربط الضوابط', desc: 'Map controls to framework requirements.' },
      { title: 'Assign Assessments', titleAr: 'تعيين التقييمات', desc: 'Seed assessments from frameworks.' }
    ],
    actions: [
      { label: 'Browse Frameworks', labelAr: 'استعراض الأطر', path: '/app/frameworks', altPath: '/advanced/frameworks' },
      { label: 'Map Controls', labelAr: 'ربط الضوابط', path: '/app/controls' }
    ]
  },
  controls: {
    title: 'Controls Management',
    titleAr: 'إدارة الضوابط',
    steps: [
      { title: 'Define Controls', titleAr: 'تعريف الضوابط', desc: 'Create and categorize controls.' },
      { title: 'Link Evidence', titleAr: 'ربط الأدلة', desc: 'Attach evidence and policies.' },
      { title: 'Track Effectiveness', titleAr: 'متابعة الفعالية', desc: 'Monitor test results.' }
    ],
    actions: [
      { label: 'Create Control', labelAr: 'إنشاء ضبط', path: '/app/controls/new' },
      { label: 'Evidence Library', labelAr: 'مكتبة الأدلة', path: '/app/documents' }
    ]
  },
  evidence: {
    title: 'Evidence Workflow',
    titleAr: 'سير عمل الأدلة',
    steps: [
      { title: 'Upload Files', titleAr: 'رفع الملفات', desc: 'Add documents and metadata.' },
      { title: 'Tag & Classify', titleAr: 'وسم وتصنيف', desc: 'Organize evidence for quick retrieval.' },
      { title: 'Link to Controls', titleAr: 'ربط بالضوابط', desc: 'Associate evidence with controls.' }
    ],
    actions: [
      { label: 'Upload Evidence', labelAr: 'رفع الأدلة', path: '/app/documents/upload' },
      { label: 'Manage Documents', labelAr: 'إدارة المستندات', path: '/app/documents' }
    ]
  },
  compliance: {
    title: 'Compliance Tracking',
    titleAr: 'متابعة الامتثال',
    steps: [
      { title: 'Monitor Status', titleAr: 'مراقبة الحالة', desc: 'View control and requirement status.' },
      { title: 'Identify Gaps', titleAr: 'تحديد الفجوات', desc: 'Use gap analysis to plan remediation.' },
      { title: 'Generate Reports', titleAr: 'إنشاء التقارير', desc: 'Share compliance summaries.' }
    ],
    actions: [
      { label: 'Open Compliance', labelAr: 'فتح الامتثال', path: '/app/compliance' },
      { label: 'Run Gap Analysis', labelAr: 'تحليل الفجوات', path: '/app/gaps' }
    ]
  },
  reports: {
    title: 'Reports & Analytics',
    titleAr: 'التقارير والتحليلات',
    steps: [
      { title: 'Choose Report', titleAr: 'اختيار التقرير', desc: 'Pick templates or build custom views.' },
      { title: 'Apply Filters', titleAr: 'تطبيق المرشحات', desc: 'Limit scope by tenant, date, module.' },
      { title: 'Export & Share', titleAr: 'تصدير ومشاركة', desc: 'Export to PDF/CSV and share.' }
    ],
    actions: [
      { label: 'Open Reports', labelAr: 'فتح التقارير', path: '/app/reports' }
    ]
  },
  users: {
    title: 'User Management',
    titleAr: 'إدارة المستخدمين',
    steps: [
      { title: 'Invite Users', titleAr: 'دعوة المستخدمين', desc: 'Add users with appropriate roles.' },
      { title: 'Assign Roles', titleAr: 'تعيين الأدوار', desc: 'Use RBAC roles for least privilege.' },
      { title: 'Monitor Activity', titleAr: 'متابعة النشاط', desc: 'Audit logs and access controls.' }
    ],
    actions: [
      { label: 'Invite User', labelAr: 'دعوة مستخدم', path: '/app/users/invite' },
      { label: 'Manage Roles', labelAr: 'إدارة الأدوار', path: '/app/settings/security' }
    ]
  },
  organizations: {
    title: 'Organization Setup',
    titleAr: 'إعداد المؤسسة',
    steps: [
      { title: 'Complete Profile', titleAr: 'إكمال الملف', desc: 'Fill onboarding attributes.' },
      { title: 'Configure Licenses', titleAr: 'تهيئة التراخيص', desc: 'Assign subscriptions and limits.' },
      { title: 'Seed Workflows', titleAr: 'تهيئة سير العمل', desc: 'Initialize approval workflows.' }
    ],
    actions: [
      { label: 'Onboarding Wizard', labelAr: 'معالج الإعداد', path: '/app/onboarding' },
      { label: 'License Management', labelAr: 'إدارة التراخيص', path: '/app/licenses' }
    ]
  },
  workflows: {
    title: 'Workflow Management',
    titleAr: 'إدارة سير العمل',
    steps: [
      { title: 'Define Steps', titleAr: 'تعريف الخطوات', desc: 'Create approval steps per tenant.' },
      { title: 'Assign Approvers', titleAr: 'تعيين المعتمدين', desc: 'Set role-based approvals.' },
      { title: 'Track Progress', titleAr: 'تتبع التقدم', desc: 'Monitor pending approvals.' }
    ],
    actions: [
      { label: 'Create Workflow', labelAr: 'إنشاء سير عمل', path: '/app/workflows/new' },
      { label: 'My Approvals', labelAr: 'موافقاتي', path: '/app/workflows/approvals' }
    ]
  },
  documents: {
    title: 'Documents Library',
    titleAr: 'مكتبة المستندات',
    steps: [
      { title: 'Create Folders', titleAr: 'إنشاء مجلدات', desc: 'Organize documents by module.' },
      { title: 'Upload & Tag', titleAr: 'رفع ووسم', desc: 'Add tags for quick filtering.' },
      { title: 'Share Securely', titleAr: 'مشاركة آمنة', desc: 'Control access per tenant.' }
    ],
    actions: [
      { label: 'Upload Document', labelAr: 'رفع مستند', path: '/app/documents/upload' },
      { label: 'Open Library', labelAr: 'فتح المكتبة', path: '/app/documents' }
    ]
  }
};

export const resolveGuideKey = (pathname) => {
  if (!pathname) return null;
  const p = pathname.toLowerCase();
  if (p.includes('/assessments')) return 'assessments';
  if (p.includes('/frameworks')) return 'frameworks';
  if (p.includes('/controls')) return 'controls';
  if (p.includes('/evidence')) return 'evidence';
  if (p.includes('/compliance')) return 'compliance';
  if (p.includes('/reports')) return 'reports';
  if (p.includes('/users')) return 'users';
  if (p.includes('/organizations')) return 'organizations';
  if (p.includes('/workflows')) return 'workflows';
  if (p.includes('/documents')) return 'documents';
  if (p.includes('/dashboard')) return 'dashboard';
  return null;
};