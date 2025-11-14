/**
 * SHAHIN (شاهين) EAGLE ASSESSMENT - 12 STANDARD SECTIONS
 *
 * Every assessment in the Shahin platform MUST have these 12 sections
 * based on the Insurance Cybersecurity Self-Assessment Questionnaire (ICSQ)
 *
 * Standard structure used across all assessments for consistency
 */

export interface AssessmentSection {
  sectionNumber: number;
  sectionId: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  questionCount: number;
  questions: SectionQuestion[];
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  requiredEvidence: string[];
}

export interface SectionQuestion {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionText_ar: string;
  questionType: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'file_upload' | 'date';
  isRequired: boolean;
  options?: string[];
  answer?: any;
  evidence?: string[];
  notes?: string;
  score?: number;
}

/**
 * THE 12 MANDATORY SECTIONS FOR SHAHIN ASSESSMENTS
 * Based on ICSQ + Saudi Regulatory Requirements
 */
export const SHAHIN_12_SECTIONS: AssessmentSection[] = [
  {
    sectionNumber: 1,
    sectionId: 'organization-overview',
    title: 'Organization Overview',
    title_ar: 'نظرة عامة على المنظمة',
    description: 'Basic organization profile, structure, and business operations',
    description_ar: 'الملف الأساسي للمنظمة، الهيكل والعمليات التجارية',
    questionCount: 15,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Company Registration', 'Organization Chart', 'Business License']
  },
  {
    sectionNumber: 2,
    sectionId: 'insurance-footprint',
    title: 'Insurance-Specific Footprint',
    title_ar: 'البصمة الخاصة بالتأمين',
    description: 'Insurance products, underwriting, claims processing, policyholder data',
    description_ar: 'منتجات التأمين، الاكتتاب، معالجة المطالبات، بيانات حاملي الوثائق',
    questionCount: 20,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Product List', 'Claims Process Documentation', 'Policy Management System']
  },
  {
    sectionNumber: 3,
    sectionId: 'regulatory-compliance',
    title: 'Regulatory Compliance Framework',
    title_ar: 'إطار الامتثال التنظيمي',
    description: 'SAMA, NCA, PDPL, and other regulatory compliance status',
    description_ar: 'حالة الامتثال لـ SAMA و NCA و PDPL والأنظمة الأخرى',
    questionCount: 18,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['SAMA License', 'NCA Registration', 'PDPL Compliance Certificate']
  },
  {
    sectionNumber: 4,
    sectionId: 'privacy-data-protection',
    title: 'Privacy & Data Protection',
    title_ar: 'الخصوصية وحماية البيانات',
    description: 'RoPA, consent management, DPIA, data retention, breach response',
    description_ar: 'سجل أنشطة المعالجة، إدارة الموافقات، تقييم أثر البيانات، سياسة الاحتفاظ',
    questionCount: 25,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: [
      'RoPA Document',
      'Consent Management Forms',
      'DPIA Reports',
      'Data Retention Policy',
      'Breach Response Plan'
    ]
  },
  {
    sectionNumber: 5,
    sectionId: 'soc-monitoring',
    title: 'SOC & Monitoring',
    title_ar: 'مركز العمليات الأمنية والمراقبة',
    description: 'Security Operations Center, SIEM, log management, incident detection',
    description_ar: 'مركز العمليات الأمنية، إدارة السجلات، كشف الحوادث',
    questionCount: 22,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['SOC Documentation', 'SIEM Configuration', 'Incident Response Logs']
  },
  {
    sectionNumber: 6,
    sectionId: 'technical-network-controls',
    title: 'Technical & Network Controls',
    title_ar: 'الضوابط الفنية والشبكية',
    description: 'Firewalls, IDS/IPS, network segmentation, access controls',
    description_ar: 'جدران الحماية، أنظمة كشف التسلل، تقسيم الشبكة، ضوابط الوصول',
    questionCount: 28,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Network Diagram', 'Firewall Rules', 'Access Control Policies']
  },
  {
    sectionNumber: 7,
    sectionId: 'cloud-hosting',
    title: 'Cloud & Hosting',
    title_ar: 'السحابة والاستضافة',
    description: 'Cloud services, hosting providers, data location, cloud security',
    description_ar: 'الخدمات السحابية، مقدمو الاستضافة، موقع البيانات، أمن السحابة',
    questionCount: 16,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Cloud Contracts', 'Data Location Certificate', 'Cloud Security Assessment']
  },
  {
    sectionNumber: 8,
    sectionId: 'risk-assessment-controls',
    title: 'Risk Assessment & Control Framework',
    title_ar: 'تقييم المخاطر وإطار الضوابط',
    description: 'Risk assessment methodology, control framework, risk treatment',
    description_ar: 'منهجية تقييم المخاطر، إطار الضوابط، معالجة المخاطر',
    questionCount: 20,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Risk Assessment Report', 'Risk Register', 'Control Matrix']
  },
  {
    sectionNumber: 9,
    sectionId: 'evidence-documentation',
    title: 'Evidence & Documentation',
    title_ar: 'الأدلة والوثائق',
    description: 'Policies, procedures, standards, documentation management',
    description_ar: 'السياسات، الإجراءات، المعايير، إدارة الوثائق',
    questionCount: 15,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Policy Repository', 'Procedure Documents', 'Document Control System']
  },
  {
    sectionNumber: 10,
    sectionId: 'resilience',
    title: 'Resilience (BCP/DR)',
    title_ar: 'المرونة (استمرارية الأعمال والتعافي)',
    description: 'Business continuity, disaster recovery, backup, resilience testing',
    description_ar: 'استمرارية الأعمال، التعافي من الكوارث، النسخ الاحتياطي، اختبار المرونة',
    questionCount: 18,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['BCP Document', 'DR Plan', 'Backup Procedures', 'Test Results']
  },
  {
    sectionNumber: 11,
    sectionId: 'managed-soc-discovery',
    title: 'Managed SOC Discovery',
    title_ar: 'اكتشاف مركز العمليات الأمنية المُدار',
    description: 'Third-party SOC services, MSSP, managed security services',
    description_ar: 'خدمات مركز العمليات الأمنية من طرف ثالث، الخدمات الأمنية المُدارة',
    questionCount: 12,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['MSSP Contract', 'SLA Agreement', 'SOC Reports']
  },
  {
    sectionNumber: 12,
    sectionId: 'risk-scoring-reporting',
    title: 'Risk Assessment & Scoring',
    title_ar: 'تقييم المخاطر والتسجيل',
    description: 'Overall risk score, compliance score, gap analysis, recommendations',
    description_ar: 'درجة المخاطر الإجمالية، درجة الامتثال، تحليل الفجوات، التوصيات',
    questionCount: 10,
    questions: [],
    status: 'not_started',
    completionPercentage: 0,
    requiredEvidence: ['Risk Score Report', 'Compliance Dashboard', 'Gap Analysis', 'Action Plan']
  }
];

/**
 * SAMPLE QUESTIONS FOR SECTION 4: PRIVACY & DATA PROTECTION
 * (Based on ICSQ HTML file)
 */
export const SECTION_4_PRIVACY_QUESTIONS: SectionQuestion[] = [
  {
    questionId: 'PDPL-001',
    questionNumber: 1,
    questionText: 'RoPA Exists? (Record of Processing Activities)',
    questionText_ar: 'RoPA موجود؟ (سجل أنشطة المعالجة)',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-002',
    questionNumber: 2,
    questionText: 'Consent Management Applied?',
    questionText_ar: 'إدارة الموافقات مطبّقة؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-003',
    questionNumber: 3,
    questionText: 'DSR SLA (Data Subject Request Service Level Agreement) - days',
    questionText_ar: 'أيام SLA لطلبات الأفراد',
    questionType: 'number',
    isRequired: true,
    answer: 15, // Default value
    evidence: [],
    notes: 'Maximum 15 days for PDPL compliance'
  },
  {
    questionId: 'PDPL-004',
    questionNumber: 4,
    questionText: 'DPIA for Medical Claims Data?',
    questionText_ar: 'DPIA لبيانات مطالبات طبية؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Data Protection Impact Assessment required for sensitive medical data'
  },
  {
    questionId: 'PDPL-005',
    questionNumber: 5,
    questionText: 'Data Retention Policy Exists?',
    questionText_ar: 'سياسة الاحتفاظ بالبيانات',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-006',
    questionNumber: 6,
    questionText: 'Data Breach Response Plan Exists?',
    questionText_ar: 'خطة الاستجابة لخرق البيانات',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Must notify SDAIA within 72 hours of breach discovery'
  },
  {
    questionId: 'PDPL-007',
    questionNumber: 7,
    questionText: 'Upload RoPA Document',
    questionText_ar: 'تحميل وثيقة RoPA',
    questionType: 'file_upload',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required: RoPA Document showing all processing activities'
  },
  {
    questionId: 'PDPL-008',
    questionNumber: 8,
    questionText: 'Upload Consent Management Forms',
    questionText_ar: 'تحميل نماذج إدارة الموافقات',
    questionType: 'file_upload',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required: Consent forms for policyholder data processing'
  },
  {
    questionId: 'PDPL-009',
    questionNumber: 9,
    questionText: 'Upload DPIA Reports',
    questionText_ar: 'تحميل تقارير DPIA',
    questionType: 'file_upload',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required: DPIA for high-risk processing activities'
  },
  {
    questionId: 'PDPL-010',
    questionNumber: 10,
    questionText: 'Data Protection Officer (DPO) Appointed?',
    questionText_ar: 'هل تم تعيين مسؤول حماية البيانات؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required for organizations processing sensitive data'
  },
  {
    questionId: 'PDPL-011',
    questionNumber: 11,
    questionText: 'DPO Contact Email',
    questionText_ar: 'البريد الإلكتروني لمسؤول حماية البيانات',
    questionType: 'text',
    isRequired: false,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-012',
    questionNumber: 12,
    questionText: 'Cross-border Data Transfer Mechanisms?',
    questionText_ar: 'آليات نقل البيانات عبر الحدود؟',
    questionType: 'multiple_choice',
    isRequired: true,
    options: [
      'None - All data in Saudi Arabia',
      'Adequacy Decision',
      'Standard Contractual Clauses',
      'Binding Corporate Rules',
      'Explicit Consent'
    ],
    answer: undefined,
    evidence: [],
    notes: 'PDPL requires proper safeguards for cross-border transfers'
  },
  {
    questionId: 'PDPL-013',
    questionNumber: 13,
    questionText: 'Data Encryption at Rest?',
    questionText_ar: 'تشفير البيانات أثناء التخزين؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required for sensitive personal data'
  },
  {
    questionId: 'PDPL-014',
    questionNumber: 14,
    questionText: 'Data Encryption in Transit?',
    questionText_ar: 'تشفير البيانات أثناء النقل؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'TLS 1.2+ required for all data transmission'
  },
  {
    questionId: 'PDPL-015',
    questionNumber: 15,
    questionText: 'Privacy Notice Published?',
    questionText_ar: 'إشعار الخصوصية منشور؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Must be clear, transparent, and easily accessible'
  },
  {
    questionId: 'PDPL-016',
    questionNumber: 16,
    questionText: 'Privacy Notice URL',
    questionText_ar: 'رابط إشعار الخصوصية',
    questionType: 'text',
    isRequired: false,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-017',
    questionNumber: 17,
    questionText: 'Cookie/Tracking Consent Implemented?',
    questionText_ar: 'موافقة ملفات تعريف الارتباط/التتبع مطبقة؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required for website analytics and marketing cookies'
  },
  {
    questionId: 'PDPL-018',
    questionNumber: 18,
    questionText: 'Data Minimization Principle Applied?',
    questionText_ar: 'مبدأ تقليل البيانات مطبق؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Collect only necessary data for specific purposes'
  },
  {
    questionId: 'PDPL-019',
    questionNumber: 19,
    questionText: 'Purpose Limitation Documented?',
    questionText_ar: 'الغرض من المعالجة موثق؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Data processed only for specified, explicit purposes'
  },
  {
    questionId: 'PDPL-020',
    questionNumber: 20,
    questionText: 'Regular PDPL Compliance Audits Conducted?',
    questionText_ar: 'عمليات تدقيق امتثال PDPL منتظمة؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Recommended: Annual compliance audits'
  },
  {
    questionId: 'PDPL-021',
    questionNumber: 21,
    questionText: 'Last PDPL Audit Date',
    questionText_ar: 'تاريخ آخر تدقيق PDPL',
    questionType: 'date',
    isRequired: false,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-022',
    questionNumber: 22,
    questionText: 'Staff PDPL Training Completed?',
    questionText_ar: 'تدريب الموظفين على PDPL مكتمل؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'All staff handling personal data must be trained'
  },
  {
    questionId: 'PDPL-023',
    questionNumber: 23,
    questionText: 'Data Processor Agreements in Place?',
    questionText_ar: 'اتفاقيات معالج البيانات موجودة؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Required for all third-party data processors'
  },
  {
    questionId: 'PDPL-024',
    questionNumber: 24,
    questionText: 'Number of Data Processing Agreements',
    questionText_ar: 'عدد اتفاقيات معالجة البيانات',
    questionType: 'number',
    isRequired: false,
    answer: undefined,
    evidence: [],
    notes: undefined
  },
  {
    questionId: 'PDPL-025',
    questionNumber: 25,
    questionText: 'Data Breach Notification Procedure Tested?',
    questionText_ar: 'إجراء إخطار خرق البيانات تم اختباره؟',
    questionType: 'yes_no',
    isRequired: true,
    answer: undefined,
    evidence: [],
    notes: 'Test breach notification within 72-hour requirement'
  }
];

/**
 * VALIDATION: Ensure all sections have required evidence
 */
export function validateSectionEvidence(section: AssessmentSection): {
  isValid: boolean;
  missingEvidence: string[];
  uploadedCount: number;
  requiredCount: number;
} {
  const uploadedEvidence = section.questions
    .filter(q => q.questionType === 'file_upload' && q.evidence && q.evidence.length > 0)
    .length;

  const requiredUploads = section.questions
    .filter(q => q.questionType === 'file_upload' && q.isRequired)
    .length;

  const missingEvidence = section.requiredEvidence.filter(req => {
    const question = section.questions.find(q =>
      q.questionText.includes(req) || q.questionText_ar.includes(req)
    );
    return !question || !question.evidence || question.evidence.length === 0;
  });

  return {
    isValid: missingEvidence.length === 0,
    missingEvidence,
    uploadedCount: uploadedEvidence,
    requiredCount: requiredUploads
  };
}

/**
 * CALCULATE SECTION COMPLETION
 */
export function calculateSectionCompletion(section: AssessmentSection): number {
  const answeredQuestions = section.questions.filter(q =>
    q.answer !== undefined && q.answer !== null && q.answer !== ''
  ).length;

  const totalQuestions = section.questions.length;

  return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
}

/**
 * GET SECTION BY ID
 */
export function getSectionById(sectionId: string): AssessmentSection | undefined {
  return SHAHIN_12_SECTIONS.find(s => s.sectionId === sectionId);
}

/**
 * GET SECTION BY NUMBER
 */
export function getSectionByNumber(sectionNumber: number): AssessmentSection | undefined {
  return SHAHIN_12_SECTIONS.find(s => s.sectionNumber === sectionNumber);
}

/**
 * EXPORT ALL
 */
export default {
  SHAHIN_12_SECTIONS,
  SECTION_4_PRIVACY_QUESTIONS,
  validateSectionEvidence,
  calculateSectionCompletion,
  getSectionById,
  getSectionByNumber
};
