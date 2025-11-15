/**
 * ONBOARDING API ENDPOINTS
 *
 * REST API for organization onboarding workflow
 */

import { Router } from 'express';
import { onboardingEngine, OnboardingRequest } from '../services/organization-onboarding';
import { applicabilityEngine } from '../services/applicability-engine';
import { templateGenerator } from '../services/assessment-template-generator';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// POST /api/onboarding
// Complete organization onboarding
// ============================================

router.post('/onboarding', async (req, res) => {
  try {
    const request: OnboardingRequest = req.body;

    // Validate required fields
    if (!request.organizationName || !request.sector || !request.ownerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: organizationName, sector, ownerEmail'
      });
    }

    // Execute onboarding
    const result = await onboardingEngine.onboardOrganization(request);

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Organization onboarded successfully'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Onboarding failed',
      details: error.message
    });
  }
});

// ============================================
// POST /api/onboarding/preview
// Preview applicable frameworks before onboarding
// ============================================

router.post('/onboarding/preview', async (req, res) => {
  try {
    const profile = {
      organizationId: 'preview',
      tenantId: 'preview',
      sector: req.body.sector,
      subSector: req.body.subSector,
      legalType: req.body.legalType,
      companySize: req.body.companySize,
      employeeCount: req.body.employeeCount,
      annualRevenueSar: req.body.annualRevenueSar,
      businessActivities: req.body.businessActivities || [],
      serviceTypes: req.body.serviceTypes || [],
      operatesRegions: req.body.operatesRegions || [],
      hasInternational: req.body.hasInternational || false,
      storesPii: req.body.storesPii || false,
      processesPayments: req.body.processesPayments || false,
      hasOnlinePlatform: req.body.hasOnlinePlatform || false,
      usesCloudServices: req.body.usesCloudServices || false,
      existingCertifications: req.body.existingCertifications || [],
      criticalInfrastructure: req.body.criticalInfrastructure || false,
      handlesGovtData: req.body.handlesGovtData || false
    };

    // Calculate applicability
    const applicability = await applicabilityEngine.calculateApplicability(profile);

    return res.status(200).json({
      success: true,
      data: {
        totalFrameworks: applicability.totalFrameworks,
        applicableCount: applicability.applicableFrameworks.length,
        mandatoryCount: applicability.mandatoryCount,
        recommendedCount: applicability.recommendedCount,
        frameworks: applicability.applicableFrameworks.map(f => ({
          id: f.frameworkId,
          name: f.frameworkName,
          isMandatory: f.isMandatory,
          priority: f.priorityLevel,
          estimatedControls: f.estimatedControls,
          estimatedTimeline: f.estimatedTimeline
        }))
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Preview failed',
      details: error.message
    });
  }
});

// ============================================
// GET /api/onboarding/:organizationId/status
// Get onboarding status
// ============================================

router.get('/onboarding/:organizationId/status', async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Get organization
    const organization = await prisma.organizations.findUnique({
      where: { id: organizationId },
      include: {
        organization_profiles: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Get assessments
    const assessments = await prisma.assessments.findMany({
      where: { organization_id: organizationId },
      include: {
        grc_frameworks: true
      }
    });

    // Get users
    const users = await prisma.users.findMany({
      where: { tenant_id: organization.tenant_id }
    });

    // Calculate progress
    const totalControls = await prisma.assessment_controls.count({
      where: {
        assessment_id: { in: assessments.map(a => a.id) }
      }
    });

    const completedControls = await prisma.assessment_controls.count({
      where: {
        assessment_id: { in: assessments.map(a => a.id) },
        status: 'completed'
      }
    });

    const progress = totalControls > 0 ? Math.round((completedControls / totalControls) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          status: organization.status,
          createdAt: organization.created_at
        },
        profile: organization.organization_profiles?.[0] || null,
        assessments: assessments.map(a => ({
          id: a.id,
          framework: a.grc_frameworks?.name,
          status: a.status,
          progress: a.progress,
          dueDate: a.due_date
        })),
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        })),
        progress: {
          overall: progress,
          totalControls,
          completedControls
        }
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get status',
      details: error.message
    });
  }
});

// ============================================
// POST /api/onboarding/bulk
// Bulk onboard multiple organizations
// ============================================

router.post('/onboarding/bulk', async (req, res) => {
  try {
    const requests: OnboardingRequest[] = req.body.organizations;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: organizations array required'
      });
    }

    // Execute bulk onboarding
    const results = await onboardingEngine.bulkOnboard(requests);

    const successCount = results.filter(r => r.success).length;
    const failCount = requests.length - successCount;

    return res.status(201).json({
      success: true,
      data: {
        total: requests.length,
        successful: successCount,
        failed: failCount,
        results
      }
    });

  } catch (error) {
    console.error('Bulk onboarding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Bulk onboarding failed',
      details: error.message
    });
  }
});

// ============================================
// GET /api/onboarding/sectors
// Get available sectors and subsectors
// ============================================

router.get('/onboarding/sectors', async (req, res) => {
  try {
    const sectors = {
      'banking': {
        name: 'Banking & Financial Services',
        name_ar: 'الخدمات المصرفية والمالية',
        subsectors: ['retail_banking', 'corporate_banking', 'investment_banking', 'islamic_banking']
      },
      'insurance': {
        name: 'Insurance',
        name_ar: 'التأمين',
        subsectors: ['general_insurance', 'health_insurance', 'life_insurance', 'reinsurance']
      },
      'fintech': {
        name: 'Financial Technology',
        name_ar: 'التقنية المالية',
        subsectors: ['digital_payments', 'lending', 'investment_tech', 'insurtech', 'blockchain']
      },
      'healthcare': {
        name: 'Healthcare',
        name_ar: 'الرعاية الصحية',
        subsectors: ['hospitals', 'clinics', 'laboratories', 'pharmacies', 'telemedicine']
      },
      'telecom': {
        name: 'Telecommunications',
        name_ar: 'الاتصالات',
        subsectors: ['mobile', 'internet_services', 'data_centers', 'cloud_services']
      },
      'energy': {
        name: 'Energy & Utilities',
        name_ar: 'الطاقة والمرافق',
        subsectors: ['oil_gas', 'electricity', 'water', 'renewable_energy']
      },
      'government': {
        name: 'Government',
        name_ar: 'الحكومة',
        subsectors: ['federal', 'municipal', 'agencies', 'digital_government']
      },
      'education': {
        name: 'Education',
        name_ar: 'التعليم',
        subsectors: ['universities', 'schools', 'training', 'edtech']
      },
      'retail': {
        name: 'Retail & E-Commerce',
        name_ar: 'التجزئة والتجارة الإلكترونية',
        subsectors: ['ecommerce', 'retail_stores', 'marketplace', 'logistics']
      },
      'manufacturing': {
        name: 'Manufacturing',
        name_ar: 'التصنيع',
        subsectors: ['automotive', 'electronics', 'food', 'chemicals', 'pharmaceuticals']
      },
      'transportation': {
        name: 'Transportation & Logistics',
        name_ar: 'النقل والخدمات اللوجستية',
        subsectors: ['airlines', 'shipping', 'logistics', 'public_transport']
      },
      'technology': {
        name: 'Technology Services',
        name_ar: 'خدمات التقنية',
        subsectors: ['software', 'cloud_services', 'managed_services', 'cybersecurity']
      },
      'real_estate': {
        name: 'Real Estate',
        name_ar: 'العقارات',
        subsectors: ['development', 'property_management', 'brokerage']
      }
    };

    return res.status(200).json({
      success: true,
      data: sectors
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get sectors'
    });
  }
});

// ============================================
// GET /api/onboarding/frameworks
// Get all available frameworks
// ============================================

router.get('/onboarding/frameworks', async (req, res) => {
  try {
    const frameworks = await prisma.grc_frameworks.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        name_ar: true,
        category: true,
        authority: true,
        version: true,
        is_active: true
      },
      where: {
        is_active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: frameworks
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get frameworks'
    });
  }
});

export default router;
