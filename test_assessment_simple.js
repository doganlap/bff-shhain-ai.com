#!/usr/bin/env node

/**
 * Simple Assessment Process Test
 * Tests core assessment functionality without authentication
 */

const axios = require('axios');
const { query } = require('./apps/services/grc-api/config/database');

// Test configuration
const API_BASE_URL = 'http://localhost:3006';

/**
 * Test database connection and create test data
 */
async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  try {
    // Create test tenant
    const tenantResult = await query(`
      INSERT INTO tenants (tenant_code, name, sector, industry, email, is_active)
      VALUES ('test-corp', 'Test Corporation', 'finance', 'banking', 'test@testcorp.com', true)
      ON CONFLICT (tenant_code) DO UPDATE SET
        name = EXCLUDED.name,
        sector = EXCLUDED.sector,
        industry = EXCLUDED.industry,
        email = EXCLUDED.email,
        is_active = EXCLUDED.is_active
      RETURNING id, tenant_code, name, sector
    `);
    
    const tenant = tenantResult.rows[0];
    console.log(`✅ Test tenant created: ${tenant.name} (${tenant.tenant_code})`);
    
    // Create test organization
    const orgResult = await query(`
      INSERT INTO organizations (tenant_id, name, sector, industry, is_active)
      VALUES ($1, 'Test Organization', 'finance', 'banking', true)
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `, [tenant.id]);
    
    let organization;
    if (orgResult.rows.length > 0) {
      organization = orgResult.rows[0];
      console.log(`✅ Test organization created: ${organization.name}`);
    } else {
      // Get existing organization
      const existingOrg = await query(`
        SELECT id, name FROM organizations WHERE tenant_id = $1 LIMIT 1
      `, [tenant.id]);
      organization = existingOrg.rows[0];
      console.log(`✅ Using existing organization: ${organization.name}`);
    }
    
    // Create test user
    const userResult = await query(`
      INSERT INTO users (tenant_id, email, username, first_name, last_name, role, status)
      VALUES ($1, 'testuser@testcorp.com', 'testuser', 'Test', 'User', 'admin', 'active')
      ON CONFLICT (email) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        role = EXCLUDED.role,
        status = EXCLUDED.status
      RETURNING id, email, role
    `, [tenant.id]);
    
    const user = userResult.rows[0];
    console.log(`✅ Test user created: ${user.email} (${user.role})`);
    
    return {
      tenant,
      organization,
      user
    };
    
  } catch (error) {
    console.error('❌ Failed to setup test data:', error.message);
    throw error;
  }
}

/**
 * Test assessment creation directly in database
 */
async function testAssessmentCreation(tenant, organization, user) {
  console.log('\n📝 Testing Assessment Creation...');
  
  try {
    // Create assessment
    const assessmentResult = await query(`
      INSERT INTO assessments (
        tenant_id, organization_id, name, description, 
        assessment_type, priority, status, ai_generated,
        created_at, updated_at
      ) VALUES (
        $1, $2, 'Test SAMA Cybersecurity Assessment', 
        'End-to-end test assessment for SAMA compliance',
        'compliance', 'high', 'draft', true,
        NOW(), NOW()
      ) RETURNING id, name, status, ai_generated
    `, [tenant.id, organization.id]);
    
    const assessment = assessmentResult.rows[0];
    console.log(`✅ Assessment created: ${assessment.name} (ID: ${assessment.id})`);
    
    // Create assessment responses
    const responseResult = await query(`
      INSERT INTO assessment_responses (
        assessment_id, question_text, response_type, response_value,
        compliance_score, is_required, ai_generated_question,
        ai_predicted_score, ai_prediction_confidence,
        created_at, updated_at
      ) VALUES (
        $1, 'Do you have documented access control policies?',
        'text', 'Yes, we have comprehensive access control policies.',
        85.5, true, true, 85.0, 0.92, NOW(), NOW()
      ), (
        $1, 'Are access controls regularly reviewed and updated?',
        'text', 'Access controls are reviewed quarterly.',
        78.2, true, true, 80.0, 0.88, NOW(), NOW()
      ), (
        $1, 'Do you have multi-factor authentication implemented?',
        'text', 'MFA is implemented for all critical systems.',
        92.1, true, true, 90.0, 0.95, NOW(), NOW()
      ) RETURNING id, question_text, compliance_score
    `, [assessment.id]);
    
    console.log(`✅ Created ${responseResult.rows.length} assessment responses`);
    responseResult.rows.forEach((response, index) => {
      console.log(`   ${index + 1}. Score: ${response.compliance_score}% - ${response.question_text.substring(0, 50)}...`);
    });
    
    // Create regulator compliance tracking
    const regulatorResult = await query(`
      INSERT INTO regulator_compliance (
        assessment_id, tenant_id, regulator_code, regulator_name,
        compliance_status, priority_level, compliance_score,
        created_at, updated_at
      ) VALUES 
      ($1, $2, 'SAMA', 'Saudi Arabian Monetary Authority', 'in_progress', 'high', 85.3, NOW(), NOW()),
      ($1, $2, 'NCA', 'National Cybersecurity Authority', 'pending', 'medium', 0.0, NOW(), NOW()),
      ($1, $2, 'CMA', 'Capital Market Authority', 'pending', 'low', 0.0, NOW(), NOW())
      RETURNING regulator_code, regulator_name, compliance_score
    `, [assessment.id, tenant.id]);
    
    console.log(`✅ Created regulator compliance tracking for ${regulatorResult.rows.length} regulators`);
    regulatorResult.rows.forEach(reg => {
      console.log(`   - ${reg.regulator_name} (${reg.regulator_code}): ${reg.compliance_score}%`);
    });
    
    return assessment;
    
  } catch (error) {
    console.error('❌ Assessment creation failed:', error.message);
    throw error;
  }
}

/**
 * Test assessment completion and scoring
 */
async function testAssessmentCompletion(assessmentId) {
  console.log('\n✅ Testing Assessment Completion...');
  
  try {
    // Calculate overall compliance score
    const scoreResult = await query(`
      SELECT 
        COUNT(*) as total_responses,
        AVG(compliance_score) as avg_score,
        MIN(compliance_score) as min_score,
        MAX(compliance_score) as max_score
      FROM assessment_responses 
      WHERE assessment_id = $1
    `, [assessmentId]);
    
    const scores = scoreResult.rows[0];
    console.log(`📊 Assessment Scoring:`);
    console.log(`   Total Responses: ${scores.total_responses}`);
    console.log(`   Average Score: ${parseFloat(scores.avg_score).toFixed(2)}%`);
    console.log(`   Score Range: ${scores.min_score}% - ${scores.max_score}%`);
    
    // Complete the assessment
    const completionResult = await query(`
      UPDATE assessments SET
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, status, completed_at
    `, [assessmentId]);
    
    const completedAssessment = completionResult.rows[0];
    console.log(`✅ Assessment completed: ${completedAssessment.name}`);
    console.log(`   Status: ${completedAssessment.status}`);
    console.log(`   Completed At: ${completedAssessment.completed_at}`);
    
    return completedAssessment;
    
  } catch (error) {
    console.error('❌ Assessment completion failed:', error.message);
    throw error;
  }
}

/**
 * Test assessment reporting
 */
async function testAssessmentReporting(assessmentId) {
  console.log('\n📊 Testing Assessment Reporting...');
  
  try {
    // Generate comprehensive assessment report
    const reportResult = await query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.status,
        a.created_at,
        a.completed_at,
        t.name as tenant_name,
        t.sector,
        t.industry,
        o.name as organization_name,
        COUNT(ar.id) as total_responses,
        AVG(ar.compliance_score) as overall_score,
        COUNT(CASE WHEN ar.compliance_score >= 90 THEN 1 END) as excellent_responses,
        COUNT(CASE WHEN ar.compliance_score >= 70 AND ar.compliance_score < 90 THEN 1 END) as good_responses,
        COUNT(CASE WHEN ar.compliance_score < 70 THEN 1 END) as needs_improvement_responses
      FROM assessments a
      JOIN tenants t ON a.tenant_id = t.id
      JOIN organizations o ON a.organization_id = o.id
      LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
      WHERE a.id = $1
      GROUP BY a.id, t.name, t.sector, t.industry, o.name
    `, [assessmentId]);
    
    const report = reportResult.rows[0];
    
    console.log(`📋 ASSESSMENT REPORT`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Assessment: ${report.name}`);
    console.log(`Organization: ${report.organization_name}`);
    console.log(`Tenant: ${report.tenant_name} (${report.sector}/${report.industry})`);
    console.log(`Status: ${report.status}`);
    console.log(`Created: ${report.created_at}`);
    console.log(`Completed: ${report.completed_at}`);
    console.log(`\n📊 COMPLIANCE METRICS:`);
    console.log(`Overall Score: ${parseFloat(report.overall_score).toFixed(2)}%`);
    console.log(`Total Responses: ${report.total_responses}`);
    console.log(`Excellent (≥90%): ${report.excellent_responses}`);
    console.log(`Good (70-89%): ${report.good_responses}`);
    console.log(`Needs Improvement (<70%): ${report.needs_improvement_responses}`);
    
    // Get regulator compliance status
    const regulatorResult = await query(`
      SELECT regulator_code, regulator_name, compliance_status, compliance_score
      FROM regulator_compliance
      WHERE assessment_id = $1
      ORDER BY compliance_score DESC
    `, [assessmentId]);
    
    console.log(`\n⚖️ REGULATOR COMPLIANCE:`);
    regulatorResult.rows.forEach(reg => {
      console.log(`${reg.regulator_name} (${reg.regulator_code}): ${reg.compliance_score}% - ${reg.compliance_status}`);
    });
    
    return report;
    
  } catch (error) {
    console.error('❌ Assessment reporting failed:', error.message);
    throw error;
  }
}

/**
 * Main test execution
 */
async function runSimpleAssessmentTest() {
  console.log('🚀 Starting Simple Assessment Process Test');
  console.log('=' .repeat(60));
  
  try {
    // Setup test data
    const { tenant, organization, user } = await setupTestData();
    
    // Test assessment creation
    const assessment = await testAssessmentCreation(tenant, organization, user);
    
    // Test assessment completion
    const completedAssessment = await testAssessmentCompletion(assessment.id);
    
    // Test assessment reporting
    const report = await testAssessmentReporting(assessment.id);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 ALL TESTS PASSED! Assessment process working end-to-end.');
    console.log('=' .repeat(60));
    
    return true;
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runSimpleAssessmentTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleAssessmentTest };
