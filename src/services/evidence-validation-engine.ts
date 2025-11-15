/**
 * EVIDENCE VALIDATION ENGINE
 *
 * Intelligent system for validating compliance evidence with:
 * - Multiple evidence types per control (minimum 3)
 * - Trusted source verification
 * - Automated + Manual validation
 * - Scoring based on evidence quality
 * - MANDATORY controls enforcement
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// EVIDENCE TYPE CLASSIFICATION
// ============================================

export enum EvidenceType {
  // Document-based Evidence
  POLICY = 'policy',                    // Policy documents
  PROCEDURE = 'procedure',              // Procedures & processes
  STANDARD = 'standard',                // Standards & guidelines
  CONTRACT = 'contract',                // Contracts & agreements
  CERTIFICATE = 'certificate',          // Certificates & attestations

  // Technical Evidence
  SCREENSHOT = 'screenshot',            // System screenshots
  CONFIGURATION = 'configuration',       // Config files/settings
  LOG = 'log',                          // System/audit logs
  SCAN_RESULT = 'scan_result',          // Vulnerability scans
  REPORT = 'report',                    // Technical reports

  // External Validation
  EXTERNAL_AUDIT = 'external_audit',    // Third-party audit reports
  PENETRATION_TEST = 'penetration_test',// Pen test results
  CERTIFICATION_AUDIT = 'certification_audit', // ISO/SOC audits
  REGULATORY_REPORT = 'regulatory_report', // Regulator submissions

  // Internal Validation
  INTERNAL_AUDIT = 'internal_audit',    // Internal audit findings
  INTERVIEW = 'interview',              // Staff interviews
  OBSERVATION = 'observation',          // Direct observations
  WALKTHROUGH = 'walkthrough',          // Process walkthroughs
  TESTING = 'testing',                  // Control testing results

  // Training & Awareness
  TRAINING_RECORD = 'training_record',  // Training completion
  ATTENDANCE = 'attendance',            // Attendance sheets
  QUIZ_RESULT = 'quiz_result',          // Assessment results

  // Other
  PHOTO = 'photo',                      // Physical evidence photos
  VIDEO = 'video',                      // Video evidence
  EMAIL = 'email',                      // Email communications
  MEETING_MINUTES = 'meeting_minutes'   // Meeting records
}

// ============================================
// TRUSTED GOVERNANCE SOURCES
// ============================================

export const TRUSTED_SOURCES = {
  // Saudi Arabia Regulators
  'NCA': {
    name: 'National Cybersecurity Authority',
    name_ar: 'الهيئة الوطنية للأمن السيبراني',
    website: 'https://nca.gov.sa',
    trusted: true,
    authority_level: 'government'
  },
  'SAMA': {
    name: 'Saudi Central Bank',
    name_ar: 'البنك المركزي السعودي',
    website: 'https://sama.gov.sa',
    trusted: true,
    authority_level: 'government'
  },
  'SDAIA': {
    name: 'Saudi Data & AI Authority',
    name_ar: 'الهيئة السعودية للبيانات والذكاء الاصطناعي',
    website: 'https://sdaia.gov.sa',
    trusted: true,
    authority_level: 'government'
  },
  'MOH': {
    name: 'Ministry of Health',
    name_ar: 'وزارة الصحة',
    website: 'https://moh.gov.sa',
    trusted: true,
    authority_level: 'government'
  },
  'CITC': {
    name: 'Communications & IT Commission',
    name_ar: 'هيئة الاتصالات وتقنية المعلومات',
    website: 'https://citc.gov.sa',
    trusted: true,
    authority_level: 'government'
  },
  'CMA': {
    name: 'Capital Market Authority',
    name_ar: 'هيئة السوق المالية',
    website: 'https://cma.org.sa',
    trusted: true,
    authority_level: 'government'
  },

  // International Standards Bodies
  'ISO': {
    name: 'International Organization for Standardization',
    website: 'https://iso.org',
    trusted: true,
    authority_level: 'international'
  },
  'NIST': {
    name: 'National Institute of Standards and Technology',
    website: 'https://nist.gov',
    trusted: true,
    authority_level: 'international'
  },
  'PCI-SSC': {
    name: 'PCI Security Standards Council',
    website: 'https://pcisecuritystandards.org',
    trusted: true,
    authority_level: 'industry'
  },

  // Certification Bodies
  'BSI': {
    name: 'British Standards Institution',
    website: 'https://bsigroup.com',
    trusted: true,
    authority_level: 'certification'
  },
  'TUV': {
    name: 'TÜV Austria',
    website: 'https://tuv.at',
    trusted: true,
    authority_level: 'certification'
  },
  'KPMG': {
    name: 'KPMG',
    trusted: true,
    authority_level: 'audit_firm'
  },
  'EY': {
    name: 'Ernst & Young',
    trusted: true,
    authority_level: 'audit_firm'
  },
  'PWC': {
    name: 'PricewaterhouseCoopers',
    trusted: true,
    authority_level: 'audit_firm'
  },
  'DELOITTE': {
    name: 'Deloitte',
    trusted: true,
    authority_level: 'audit_firm'
  }
};

// ============================================
// EVIDENCE REQUIREMENTS PER CONTROL
// ============================================

export interface EvidenceRequirement {
  controlId: string;
  minEvidenceCount: number; // Minimum 3
  requiredTypes: EvidenceType[]; // Must have these types
  mandatoryEvidence: string[]; // Specific evidence names
  trustedSourceRequired: boolean; // Must be from trusted source
  externalValidationRequired: boolean; // Needs external audit

  // Validation Criteria
  validationCriteria: ValidationCriterion[];
}

export interface ValidationCriterion {
  name: string;
  description: string;
  checkType: 'automated' | 'manual' | 'both';
  requiredValue?: any;
  weight: number; // 0-1 (importance weight)
}

// ============================================
// CONTROL CATEGORIZATION
// ============================================

export enum ControlCategory {
  MANDATORY = 'mandatory',           // Must be implemented (legal requirement)
  ESSENTIAL = 'essential',           // Critical for security
  RECOMMENDED = 'recommended',       // Best practice
  OPTIONAL = 'optional',             // Nice to have
  NOT_APPLICABLE = 'not_applicable'  // Doesn't apply
}

export enum ControlPriority {
  CRITICAL = 'critical',    // Must fix immediately
  HIGH = 'high',            // Fix within 30 days
  MEDIUM = 'medium',        // Fix within 90 days
  LOW = 'low'               // Fix within 180 days
}

// ============================================
// EVIDENCE VALIDATION ENGINE
// ============================================

export class EvidenceValidationEngine {

  /**
   * Validate evidence for a control
   */
  async validateEvidence(
    assessmentId: string,
    controlId: string,
    evidenceIds: string[]
  ): Promise<ValidationResult> {

    // Get control requirements
    const requirements = await this.getEvidenceRequirements(controlId);

    // Get all evidence
    const evidence = await prisma.assessment_evidence.findMany({
      where: {
        assessment_id: assessmentId,
        control_id: controlId,
        id: { in: evidenceIds }
      }
    });

    const validationResult: ValidationResult = {
      controlId,
      isValid: false,
      score: 0,
      issues: [],
      recommendations: [],
      evidenceCoverage: {
        required: requirements.minEvidenceCount,
        provided: evidence.length,
        percentage: (evidence.length / requirements.minEvidenceCount) * 100
      }
    };

    // Check 1: Minimum evidence count (3+)
    if (evidence.length < requirements.minEvidenceCount) {
      validationResult.issues.push({
        severity: 'critical',
        message: `Insufficient evidence: ${evidence.length}/${requirements.minEvidenceCount} provided`,
        recommendation: `Upload at least ${requirements.minEvidenceCount - evidence.length} more pieces of evidence`
      });
      return validationResult;
    }

    // Check 2: Evidence type diversity
    const evidenceTypes = new Set(evidence.map(e => e.evidence_type));
    if (evidenceTypes.size < 3) {
      validationResult.issues.push({
        severity: 'high',
        message: `Evidence lacks diversity: Only ${evidenceTypes.size} different types provided`,
        recommendation: 'Provide evidence from at least 3 different types (e.g., policy, screenshot, audit report)'
      });
    }

    // Check 3: Required types present
    for (const requiredType of requirements.requiredTypes) {
      if (!evidenceTypes.has(requiredType)) {
        validationResult.issues.push({
          severity: 'high',
          message: `Missing required evidence type: ${requiredType}`,
          recommendation: `Upload ${requiredType} evidence`
        });
      }
    }

    // Check 4: Trusted source verification
    if (requirements.trustedSourceRequired) {
      const trustedEvidence = evidence.filter(e =>
        this.isFromTrustedSource(e)
      );

      if (trustedEvidence.length === 0) {
        validationResult.issues.push({
          severity: 'critical',
          message: 'No evidence from trusted governance sources',
          recommendation: 'Upload certificates, audit reports, or regulatory documents from recognized authorities'
        });
      }
    }

    // Check 5: External validation requirement
    if (requirements.externalValidationRequired) {
      const externalEvidence = evidence.filter(e =>
        e.evidence_type === EvidenceType.EXTERNAL_AUDIT ||
        e.evidence_type === EvidenceType.PENETRATION_TEST ||
        e.evidence_type === EvidenceType.CERTIFICATION_AUDIT
      );

      if (externalEvidence.length === 0) {
        validationResult.issues.push({
          severity: 'high',
          message: 'External validation required but not provided',
          recommendation: 'Upload third-party audit report or penetration test results'
        });
      }
    }

    // Check 6: Evidence validity/expiry
    for (const ev of evidence) {
      if (ev.valid_until && new Date(ev.valid_until) < new Date()) {
        validationResult.issues.push({
          severity: 'medium',
          message: `Evidence expired: ${ev.evidence_name}`,
          recommendation: 'Upload updated/current version'
        });
      }
    }

    // Check 7: File integrity
    for (const ev of evidence) {
      if (!ev.file_url && !ev.file_path) {
        validationResult.issues.push({
          severity: 'medium',
          message: `Missing file for evidence: ${ev.evidence_name}`,
          recommendation: 'Upload the actual file'
        });
      }
    }

    // Check 8: Run validation criteria
    for (const criterion of requirements.validationCriteria) {
      const criterionResult = await this.validateCriterion(
        evidence,
        criterion
      );

      if (!criterionResult.passed) {
        validationResult.issues.push({
          severity: criterionResult.severity,
          message: `Validation failed: ${criterion.name}`,
          recommendation: criterionResult.recommendation
        });
      }
    }

    // Calculate overall score
    const maxScore = 100;
    let score = maxScore;

    // Deduct points for issues
    for (const issue of validationResult.issues) {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'high') score -= 15;
      else if (issue.severity === 'medium') score -= 5;
      else if (issue.severity === 'low') score -= 2;
    }

    score = Math.max(0, score);
    validationResult.score = score;
    validationResult.isValid = score >= 60 && validationResult.issues.filter(i => i.severity === 'critical').length === 0;

    // Save validation results
    await this.saveValidationResults(assessmentId, controlId, validationResult);

    return validationResult;
  }

  /**
   * Get evidence requirements for a control
   */
  private async getEvidenceRequirements(controlId: string): Promise<EvidenceRequirement> {
    // Get from database
    const dbRequirements = await prisma.control_evidence_requirements.findMany({
      where: { control_id: controlId }
    });

    // Get control details
    const control = await prisma.grc_controls.findUnique({
      where: { id: controlId }
    });

    // Determine if mandatory
    const isMandatory = control?.implementation_status === 'mandatory';

    // Build requirements
    const requirements: EvidenceRequirement = {
      controlId,
      minEvidenceCount: isMandatory ? 3 : 2, // Mandatory needs 3+
      requiredTypes: this.determineRequiredTypes(control, dbRequirements),
      mandatoryEvidence: dbRequirements.filter(r => r.is_mandatory).map(r => r.evidence_name),
      trustedSourceRequired: isMandatory,
      externalValidationRequired: control?.risk_level === 'critical',
      validationCriteria: this.buildValidationCriteria(control, dbRequirements)
    };

    return requirements;
  }

  /**
   * Determine required evidence types based on control
   */
  private determineRequiredTypes(control: any, requirements: any[]): EvidenceType[] {
    const types: EvidenceType[] = [];

    // Always need policy/procedure
    types.push(EvidenceType.POLICY, EvidenceType.PROCEDURE);

    // Technical controls need technical evidence
    if (control?.control_type === 'technical') {
      types.push(EvidenceType.SCREENSHOT, EvidenceType.CONFIGURATION, EvidenceType.LOG);
    }

    // High/Critical risk needs external validation
    if (control?.risk_level === 'high' || control?.risk_level === 'critical') {
      types.push(EvidenceType.EXTERNAL_AUDIT, EvidenceType.INTERNAL_AUDIT);
    }

    // Training controls need training evidence
    if (control?.category?.toLowerCase().includes('training') ||
        control?.category?.toLowerCase().includes('awareness')) {
      types.push(EvidenceType.TRAINING_RECORD, EvidenceType.ATTENDANCE);
    }

    return types;
  }

  /**
   * Build validation criteria
   */
  private buildValidationCriteria(control: any, requirements: any[]): ValidationCriterion[] {
    const criteria: ValidationCriterion[] = [];

    // Standard criteria
    criteria.push({
      name: 'Document Completeness',
      description: 'All required fields and sections are complete',
      checkType: 'automated',
      weight: 0.2
    });

    criteria.push({
      name: 'Document Authenticity',
      description: 'Document has valid signatures, stamps, or digital signatures',
      checkType: 'manual',
      weight: 0.3
    });

    criteria.push({
      name: 'Relevance to Control',
      description: 'Evidence directly demonstrates control implementation',
      checkType: 'manual',
      weight: 0.3
    });

    criteria.push({
      name: 'Currency',
      description: 'Evidence is current and not outdated',
      checkType: 'automated',
      weight: 0.2
    });

    // Add custom criteria from requirements
    for (const req of requirements) {
      if (req.validation_criteria) {
        const customCriteria = req.validation_criteria as any;
        if (Array.isArray(customCriteria)) {
          criteria.push(...customCriteria);
        }
      }
    }

    return criteria;
  }

  /**
   * Check if evidence is from trusted source
   */
  private isFromTrustedSource(evidence: any): boolean {
    // Check if evidence mentions trusted sources
    const evidenceName = evidence.evidence_name?.toLowerCase() || '';
    const evidenceDesc = evidence.evidence_description?.toLowerCase() || '';

    for (const [key, source] of Object.entries(TRUSTED_SOURCES)) {
      const sourceName = source.name.toLowerCase();
      if (evidenceName.includes(sourceName) || evidenceDesc.includes(sourceName)) {
        return true;
      }
    }

    // Check evidence type
    if (evidence.evidence_type === EvidenceType.REGULATORY_REPORT ||
        evidence.evidence_type === EvidenceType.CERTIFICATION_AUDIT ||
        evidence.evidence_type === EvidenceType.EXTERNAL_AUDIT) {
      return true;
    }

    return false;
  }

  /**
   * Validate individual criterion
   */
  private async validateCriterion(
    evidence: any[],
    criterion: ValidationCriterion
  ): Promise<{ passed: boolean; severity: string; recommendation: string }> {

    // Automated checks
    if (criterion.checkType === 'automated' || criterion.checkType === 'both') {

      if (criterion.name === 'Document Completeness') {
        const incomplete = evidence.filter(e =>
          !e.evidence_name || !e.evidence_type || !e.file_url
        );
        if (incomplete.length > 0) {
          return {
            passed: false,
            severity: 'medium',
            recommendation: 'Complete all required fields for uploaded evidence'
          };
        }
      }

      if (criterion.name === 'Currency') {
        const oldEvidence = evidence.filter(e => {
          if (!e.created_at) return false;
          const age = Date.now() - new Date(e.created_at).getTime();
          const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
          return age > maxAge;
        });

        if (oldEvidence.length > 0) {
          return {
            passed: false,
            severity: 'low',
            recommendation: 'Some evidence is over 1 year old. Consider updating.'
          };
        }
      }
    }

    // Manual checks need human validation
    if (criterion.checkType === 'manual' || criterion.checkType === 'both') {
      // Check if manual validation was performed
      const validated = evidence.filter(e =>
        e.validation_status === 'approved' || e.validation_status === 'rejected'
      );

      if (validated.length < evidence.length) {
        return {
          passed: false,
          severity: 'high',
          recommendation: `${evidence.length - validated.length} evidence items need manual validation`
        };
      }
    }

    return { passed: true, severity: 'info', recommendation: '' };
  }

  /**
   * Save validation results
   */
  private async saveValidationResults(
    assessmentId: string,
    controlId: string,
    result: ValidationResult
  ): Promise<void> {

    // Update assessment_controls
    await prisma.assessment_controls.updateMany({
      where: {
        assessment_id: assessmentId,
        control_id: controlId
      },
      data: {
        evidence_submitted: true,
        compliance_status: result.isValid ? 'compliant' : 'non_compliant',
        score: result.score,
        notes: JSON.stringify({
          validation: {
            isValid: result.isValid,
            score: result.score,
            issues: result.issues,
            recommendations: result.recommendations
          }
        })
      }
    });

    // Create findings for critical issues
    for (const issue of result.issues.filter(i => i.severity === 'critical' || i.severity === 'high')) {
      await prisma.assessment_findings.create({
        data: {
          assessment_id: assessmentId,
          control_id: controlId,
          tenant_id: '', // Will be filled by caller
          finding_type: 'gap',
          severity: issue.severity,
          title: issue.message,
          description: issue.recommendation,
          recommendation: issue.recommendation,
          status: 'open'
        }
      });
    }
  }

  /**
   * Get mandatory controls that must be implemented
   */
  async getMandatoryControls(frameworkId: string): Promise<string[]> {
    const controls = await prisma.grc_controls.findMany({
      where: {
        framework_id: frameworkId,
        implementation_status: 'mandatory'
      },
      select: { id: true }
    });

    return controls.map(c => c.id);
  }

  /**
   * Check if all mandatory controls have sufficient evidence
   */
  async validateMandatoryControlsCoverage(assessmentId: string): Promise<{
    allCovered: boolean;
    missingControls: string[];
    insufficientEvidence: string[];
  }> {

    const assessment = await prisma.assessments.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Get mandatory controls
    const mandatoryControls = await this.getMandatoryControls(assessment.framework_id);

    // Get assessment controls
    const assessmentControls = await prisma.assessment_controls.findMany({
      where: {
        assessment_id: assessmentId,
        control_id: { in: mandatoryControls }
      }
    });

    const missingControls: string[] = [];
    const insufficientEvidence: string[] = [];

    for (const mandatoryId of mandatoryControls) {
      const assessmentControl = assessmentControls.find(ac => ac.control_id === mandatoryId);

      if (!assessmentControl) {
        missingControls.push(mandatoryId);
        continue;
      }

      // Check evidence count
      const evidenceCount = await prisma.assessment_evidence.count({
        where: {
          assessment_id: assessmentId,
          control_id: mandatoryId
        }
      });

      if (evidenceCount < 3) {
        insufficientEvidence.push(mandatoryId);
      }
    }

    return {
      allCovered: missingControls.length === 0 && insufficientEvidence.length === 0,
      missingControls,
      insufficientEvidence
    };
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ValidationResult {
  controlId: string;
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
  evidenceCoverage: {
    required: number;
    provided: number;
    percentage: number;
  };
}

export interface ValidationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  recommendation: string;
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const evidenceValidator = new EvidenceValidationEngine();
