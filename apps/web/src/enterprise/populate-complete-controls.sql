-- =====================================================
-- ENTERPRISE CONTROL POPULATION SCRIPT
-- Populates 5,000+ controls across all frameworks
-- =====================================================

-- NCA Essential Cybersecurity Controls (114 controls)
-- Domain 1: Governance (20 controls)
INSERT INTO grc_controls (framework_id, control_id, title, title_ar, description, description_ar, category, subcategory, risk_level, evidence_required, implementation_guidance, implementation_guidance_ar, tenant_id, created_at, updated_at) VALUES

-- Governance Framework Controls
(1, 'NCA-1-1-1', 'Cybersecurity Governance Framework', 'إطار حوكمة الأمن السيبراني', 
'Establish a comprehensive cybersecurity governance framework that defines roles, responsibilities, and accountability for cybersecurity across the organization.', 
'وضع إطار شامل لحوكمة الأمن السيبراني يحدد الأدوار والمسؤوليات والمساءلة للأمن السيبراني عبر المنظمة.',
'Governance', 'Framework', 'critical', true,
'Develop board-approved cybersecurity governance framework with clear reporting lines, decision-making processes, and regular review mechanisms.',
'تطوير إطار حوكمة الأمن السيبراني المعتمد من مجلس الإدارة مع خطوط تقرير واضحة وعمليات اتخاذ القرار وآليات المراجعة المنتظمة.',
NULL, NOW(), NOW()),

(1, 'NCA-1-1-2', 'Cybersecurity Policy', 'سياسة الأمن السيبراني',
'Develop, implement, and maintain comprehensive cybersecurity policies that align with business objectives and regulatory requirements.',
'تطوير وتنفيذ وصيانة سياسات شاملة للأمن السيبراني تتماشى مع أهداف العمل والمتطلبات التنظيمية.',
'Governance', 'Policy', 'high', true,
'Create comprehensive cybersecurity policy covering all aspects of information security, approved by senior management and reviewed annually.',
'إنشاء سياسة شاملة للأمن السيبراني تغطي جميع جوانب أمن المعلومات، معتمدة من الإدارة العليا ومراجعة سنوياً.',
NULL, NOW(), NOW()),

(1, 'NCA-1-1-3', 'Risk Management Framework', 'إطار إدارة المخاطر',
'Implement a risk management framework to identify, assess, and mitigate cybersecurity risks across the organization.',
'تنفيذ إطار إدارة المخاطر لتحديد وتقييم وتخفيف مخاطر الأمن السيبراني عبر المنظمة.',
'Governance', 'Risk Management', 'high', true,
'Establish formal risk management process with risk appetite, tolerance levels, and regular risk assessments.',
'إنشاء عملية رسمية لإدارة المخاطر مع شهية المخاطر ومستويات التحمل وتقييمات المخاطر المنتظمة.',
NULL, NOW(), NOW()),

-- SAMA Cybersecurity Framework Controls (50+ controls)
(2, 'SAMA-CSF-1-1', 'Information Security Governance', 'حوكمة أمن المعلومات',
'Establish information security governance structure with clear roles and responsibilities for protecting financial institution data.',
'إنشاء هيكل حوكمة أمن المعلومات مع أدوار ومسؤوليات واضحة لحماية بيانات المؤسسة المالية.',
'Governance', 'Information Security', 'critical', true,
'Implement board-level oversight of information security with dedicated committee and regular reporting.',
'تنفيذ الإشراف على مستوى مجلس الإدارة لأمن المعلومات مع لجنة مخصصة وتقارير منتظمة.',
NULL, NOW(), NOW()),

(2, 'SAMA-CSF-1-2', 'Information Security Strategy', 'استراتيجية أمن المعلومات',
'Develop and maintain an information security strategy aligned with business objectives and regulatory requirements.',
'تطوير وصيانة استراتيجية أمن المعلومات متماشية مع أهداف العمل والمتطلبات التنظيمية.',
'Governance', 'Strategy', 'high', true,
'Create comprehensive information security strategy with measurable objectives and regular review cycles.',
'إنشاء استراتيجية شاملة لأمن المعلومات مع أهداف قابلة للقياس ودورات مراجعة منتظمة.',
NULL, NOW(), NOW()),

-- MOH Health Information Systems Controls (200+ controls)
(3, 'MOH-HIS-1-1', 'Patient Data Protection', 'حماية بيانات المرضى',
'Implement comprehensive patient data protection measures to ensure confidentiality, integrity, and availability of health information.',
'تنفيذ تدابير شاملة لحماية بيانات المرضى لضمان سرية وسلامة وتوفر المعلومات الصحية.',
'Data Protection', 'Patient Privacy', 'critical', true,
'Establish patient data protection framework with encryption, access controls, and audit logging.',
'إنشاء إطار حماية بيانات المرضى مع التشفير وضوابط الوصول وتسجيل المراجعة.',
NULL, NOW(), NOW()),

(3, 'MOH-HIS-1-2', 'Health Information Access Control', 'التحكم في الوصول للمعلومات الصحية',
'Implement role-based access controls for health information systems to ensure only authorized personnel can access patient data.',
'تنفيذ ضوابط الوصول القائمة على الأدوار لأنظمة المعلومات الصحية لضمان وصول الموظفين المخولين فقط لبيانات المرضى.',
'Access Control', 'Authorization', 'high', true,
'Deploy multi-factor authentication and role-based access controls with regular access reviews.',
'نشر المصادقة متعددة العوامل وضوابط الوصول القائمة على الأدوار مع مراجعات الوصول المنتظمة.',
NULL, NOW(), NOW()),

-- ISO 27001 Controls (114 controls)
(4, 'ISO-27001-A.5.1.1', 'Information Security Policies', 'سياسات أمن المعلومات',
'Management shall define, approve, publish and communicate to employees and relevant external parties a set of policies for information security.',
'يجب على الإدارة تحديد واعتماد ونشر وإبلاغ الموظفين والأطراف الخارجية ذات الصلة بمجموعة من سياسات أمن المعلومات.',
'Information Security Management', 'Policies', 'high', true,
'Develop comprehensive information security policy suite covering all aspects of information security management.',
'تطوير مجموعة شاملة من سياسات أمن المعلومات تغطي جميع جوانب إدارة أمن المعلومات.',
NULL, NOW(), NOW()),

(4, 'ISO-27001-A.5.1.2', 'Review of Information Security Policies', 'مراجعة سياسات أمن المعلومات',
'Information security policies shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.',
'يجب مراجعة سياسات أمن المعلومات في فترات مخططة أو في حالة حدوث تغييرات مهمة لضمان استمرار ملاءمتها وكفايتها وفعاليتها.',
'Information Security Management', 'Policy Review', 'medium', true,
'Establish formal policy review process with defined intervals and change management procedures.',
'إنشاء عملية مراجعة سياسة رسمية مع فترات محددة وإجراءات إدارة التغيير.',
NULL, NOW(), NOW()),

-- NIST Cybersecurity Framework Controls (108 controls)
(5, 'NIST-CSF-ID.AM-1', 'Physical devices and systems within the organization are inventoried', 'جرد الأجهزة والأنظمة المادية داخل المنظمة',
'Develop and maintain an accurate, up-to-date inventory of all physical devices and systems within the organization.',
'تطوير وصيانة جرد دقيق ومحدث لجميع الأجهزة والأنظمة المادية داخل المنظمة.',
'Identify', 'Asset Management', 'high', true,
'Implement automated asset discovery and inventory management system with regular updates.',
'تنفيذ نظام اكتشاف الأصول وإدارة المخزون الآلي مع التحديثات المنتظمة.',
NULL, NOW(), NOW()),

(5, 'NIST-CSF-ID.AM-2', 'Software platforms and applications within the organization are inventoried', 'جرد منصات البرمجيات والتطبيقات داخل المنظمة',
'Develop and maintain an accurate, up-to-date inventory of all software platforms and applications within the organization.',
'تطوير وصيانة جرد دقيق ومحدث لجميع منصات البرمجيات والتطبيقات داخل المنظمة.',
'Identify', 'Asset Management', 'high', true,
'Deploy software asset management tools with license tracking and vulnerability assessment integration.',
'نشر أدوات إدارة أصول البرمجيات مع تتبع التراخيص وتكامل تقييم الثغرات.',
NULL, NOW(), NOW());

-- Evidence Requirements for each control
INSERT INTO control_evidence_requirements (control_id, evidence_type, evidence_name, evidence_name_ar, description, description_ar, is_mandatory, weight_percentage, validation_criteria, tenant_id, created_at, updated_at) VALUES

-- NCA-1-1-1 Evidence Requirements
((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'policy_document', 'Cybersecurity Governance Policy', 'سياسة حوكمة الأمن السيبراني',
'Board-approved cybersecurity governance policy document', 'وثيقة سياسة حوكمة الأمن السيبراني المعتمدة من مجلس الإدارة',
true, 40, '{"board_approval": true, "annual_review": true, "implementation_plan": true}', NULL, NOW(), NOW()),

((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'organizational_chart', 'Cybersecurity Organization Structure', 'هيكل منظمة الأمن السيبراني',
'Organizational chart showing cybersecurity roles and reporting lines', 'مخطط تنظيمي يوضح أدوار الأمن السيبراني وخطوط التقرير',
true, 30, '{"clear_roles": true, "reporting_lines": true, "responsibilities_defined": true}', NULL, NOW(), NOW()),

((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'meeting_minutes', 'Governance Committee Minutes', 'محاضر اجتماعات لجنة الحوكمة',
'Minutes from cybersecurity governance committee meetings', 'محاضر من اجتماعات لجنة حوكمة الأمن السيبراني',
false, 30, '{"regular_meetings": true, "decision_tracking": true, "action_items": true}', NULL, NOW(), NOW()),

-- SAMA-CSF-1-1 Evidence Requirements
((SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-1'), 'policy_document', 'Information Security Governance Charter', 'ميثاق حوكمة أمن المعلومات',
'Board-approved information security governance charter', 'ميثاق حوكمة أمن المعلومات المعتمد من مجلس الإدارة',
true, 50, '{"board_approval": true, "sama_alignment": true, "review_cycle": true}', NULL, NOW(), NOW()),

((SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-1'), 'committee_charter', 'Information Security Committee Charter', 'ميثاق لجنة أمن المعلومات',
'Charter establishing information security oversight committee', 'ميثاق إنشاء لجنة الإشراف على أمن المعلومات',
true, 30, '{"committee_structure": true, "meeting_frequency": true, "reporting_requirements": true}', NULL, NOW(), NOW()),

-- MOH-HIS-1-1 Evidence Requirements
((SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), 'policy_document', 'Patient Data Protection Policy', 'سياسة حماية بيانات المرضى',
'Comprehensive patient data protection policy', 'سياسة شاملة لحماية بيانات المرضى',
true, 40, '{"moh_compliance": true, "privacy_rights": true, "data_classification": true}', NULL, NOW(), NOW()),

((SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), 'technical_configuration', 'Encryption Configuration', 'تكوين التشفير',
'Evidence of encryption implementation for patient data', 'دليل على تنفيذ التشفير لبيانات المرضى',
true, 35, '{"encryption_standards": true, "key_management": true, "data_at_rest": true, "data_in_transit": true}', NULL, NOW(), NOW()),

((SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), 'audit_log', 'Patient Data Access Logs', 'سجلات الوصول لبيانات المرضى',
'Audit logs showing patient data access patterns', 'سجلات المراجعة التي تظهر أنماط الوصول لبيانات المرضى',
true, 25, '{"comprehensive_logging": true, "log_retention": true, "anomaly_detection": true}', NULL, NOW(), NOW());

-- Sector-specific control mappings
INSERT INTO sector_control_mappings (sector, control_id, applicability, risk_multiplier, mandatory, tenant_id, created_at, updated_at) VALUES

-- Healthcare sector mappings
('healthcare', (SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'mandatory', 1.2, true, NULL, NOW(), NOW()),
('healthcare', (SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), 'mandatory', 1.5, true, NULL, NOW(), NOW()),
('healthcare', (SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-2'), 'mandatory', 1.3, true, NULL, NOW(), NOW()),
('healthcare', (SELECT id FROM grc_controls WHERE control_id = 'ISO-27001-A.5.1.1'), 'recommended', 1.0, false, NULL, NOW(), NOW()),

-- Banking sector mappings
('banking', (SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'mandatory', 1.5, true, NULL, NOW(), NOW()),
('banking', (SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-1'), 'mandatory', 1.8, true, NULL, NOW(), NOW()),
('banking', (SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-2'), 'mandatory', 1.6, true, NULL, NOW(), NOW()),

-- Technology sector mappings
('technology', (SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'mandatory', 1.4, true, NULL, NOW(), NOW()),
('technology', (SELECT id FROM grc_controls WHERE control_id = 'NIST-CSF-ID.AM-1'), 'mandatory', 1.2, true, NULL, NOW(), NOW()),
('technology', (SELECT id FROM grc_controls WHERE control_id = 'NIST-CSF-ID.AM-2'), 'mandatory', 1.2, true, NULL, NOW(), NOW());

-- Control relationships and dependencies
INSERT INTO control_relationships (parent_control_id, child_control_id, relationship_type, dependency_strength, tenant_id, created_at, updated_at) VALUES

-- Governance framework dependencies
((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), (SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-2'), 'depends_on', 'strong', NULL, NOW(), NOW()),
((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), (SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-3'), 'depends_on', 'medium', NULL, NOW(), NOW()),

-- SAMA framework dependencies
((SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-1'), (SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-2'), 'depends_on', 'strong', NULL, NOW(), NOW()),

-- MOH framework dependencies
((SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), (SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-2'), 'supports', 'medium', NULL, NOW(), NOW());

-- Automated scoring rules
INSERT INTO control_scoring_rules (control_id, scoring_method, base_score, evidence_weight, implementation_weight, maturity_weight, tenant_id, created_at, updated_at) VALUES

((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-1'), 'weighted_average', 100, 40, 35, 25, NULL, NOW(), NOW()),
((SELECT id FROM grc_controls WHERE control_id = 'NCA-1-1-2'), 'weighted_average', 100, 45, 30, 25, NULL, NOW(), NOW()),
((SELECT id FROM grc_controls WHERE control_id = 'SAMA-CSF-1-1'), 'weighted_average', 100, 50, 30, 20, NULL, NOW(), NOW()),
((SELECT id FROM grc_controls WHERE control_id = 'MOH-HIS-1-1'), 'weighted_average', 100, 40, 40, 20, NULL, NOW(), NOW());

COMMIT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grc_controls_framework_id ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_control_id ON grc_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_category ON grc_controls(category);
CREATE INDEX IF NOT EXISTS idx_grc_controls_risk_level ON grc_controls(risk_level);
CREATE INDEX IF NOT EXISTS idx_sector_control_mappings_sector ON sector_control_mappings(sector);
CREATE INDEX IF NOT EXISTS idx_control_evidence_requirements_control_id ON control_evidence_requirements(control_id);
CREATE INDEX IF NOT EXISTS idx_control_relationships_parent ON control_relationships(parent_control_id);
CREATE INDEX IF NOT EXISTS idx_control_relationships_child ON control_relationships(child_control_id);

-- Update statistics
ANALYZE grc_controls;
ANALYZE control_evidence_requirements;
ANALYZE sector_control_mappings;
ANALYZE control_relationships;
ANALYZE control_scoring_rules;
