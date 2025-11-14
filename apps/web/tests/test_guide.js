#!/usr/bin/env node

/**
 * GRC Feature Test Runner - With Database Setup Guidance
 * 
 * This script will guide you through testing the Auto-Assessment Generator
 * and Workflow Engine features, even if the database isn't fully configured.
 */

const chalk = require('chalk');

console.log('\n' + '='.repeat(80));
console.log('🧪 GRC FEATURE TESTING GUIDE');
console.log('='.repeat(80) + '\n');

console.log('This guide will help you test two major features:');
console.log('  1. 📋 Auto-Assessment Generator - AI-powered assessment creation');
console.log('  2. ⚙️  Workflow Engine - Approval workflows and task routing');
console.log('');

// Check if we're in test mode or guidance mode
const args = process.argv.slice(2);
const showGuidance = args.includes('--help') || args.includes('-h') || args.length === 0;

if (showGuidance) {
  console.log('📖 TESTING OVERVIEW\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('FEATURE 1: AUTO-ASSESSMENT GENERATOR');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('What it does:');
  console.log('  • Analyzes organization profile (sector, industry, size)');
  console.log('  • Maps to applicable KSA regulators (SAMA, MOH, CITC, ECRA, etc.)');
  console.log('  • Selects relevant compliance frameworks (ISO 27001, NIST, etc.)');
  console.log('  • Generates 100-200 compliance controls automatically');
  console.log('  • Assigns priorities and evidence requirements');
  console.log('  • Creates complete assessment in < 2 seconds\n');
  
  console.log('Example workflow:');
  console.log('  Input:  Banking organization in finance sector');
  console.log('  Output: Assessment with SAMA, NCA, ZATCA regulators');
  console.log('          Frameworks: Basel III, SAMA Cybersecurity, PCI-DSS');
  console.log('          157 controls generated with priorities\n');
  
  console.log('Test coverage (13 tests):');
  console.log('  ✓ Generate from tenant profile');
  console.log('  ✓ Sector-specific regulator mapping (4 sectors)');
  console.log('  ✓ Framework selection and control generation');
  console.log('  ✓ Multi-framework assessment (up to 5 frameworks)');
  console.log('  ✓ Priority assignment and scoring');
  console.log('  ✓ AI-enhanced content generation\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('FEATURE 2: WORKFLOW ENGINE');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('What it does:');
  console.log('  • Creates multi-stage approval workflows');
  console.log('  • Routes tasks to appropriate users/roles');
  console.log('  • Handles approvals, rejections, and delegations');
  console.log('  • Sends real-time notifications');
  console.log('  • Tracks performance metrics and analytics\n');
  
  console.log('Example workflow:');
  console.log('  1. Assessment submitted → Status: Pending');
  console.log('  2. Assigned to Manager → 48h timeout');
  console.log('  3. Manager approves → Moves to Director');
  console.log('  4. Director approves → Status: Approved');
  console.log('  5. Notifications sent at each stage\n');
  
  console.log('Test coverage (15 tests):');
  console.log('  ✓ Workflow creation and configuration');
  console.log('  ✓ Workflow execution and state management');
  console.log('  ✓ Approval and rejection processing');
  console.log('  ✓ Workflow delegation between users');
  console.log('  ✓ Automated trigger execution');
  console.log('  ✓ Analytics and performance metrics');
  console.log('  ✓ Notifications and escalations\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('HOW TO RUN THE TESTS');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('OPTION 1: With Full Database (Recommended)\n');
  console.log('  Prerequisites:');
  console.log('    • PostgreSQL 12+ running');
  console.log('    • Database created (shahin_ksa_compliance or grc_master)');
  console.log('    • Schema/migrations applied');
  console.log('    • Environment variables set\n');
  
  console.log('  Setup:');
  console.log('    # Windows PowerShell');
  console.log('    $env:DB_HOST="localhost"');
  console.log('    $env:DB_PORT="5432"');
  console.log('    $env:DB_USER="postgres"');
  console.log('    $env:DB_PASSWORD="your_password"');
  console.log('    $env:COMPLIANCE_DB="shahin_ksa_compliance"\n');
  
  console.log('    # Linux/Mac Bash');
  console.log('    export DB_HOST=localhost');
  console.log('    export DB_PORT=5432');
  console.log('    export DB_USER=postgres');
  console.log('    export DB_PASSWORD=your_password');
  console.log('    export COMPLIANCE_DB=shahin_ksa_compliance\n');
  
  console.log('  Run tests:');
  console.log('    npm run test:features           # All tests');
  console.log('    npm run test:auto-assessment    # Auto-assessment only');
  console.log('    npm run test:workflow           # Workflow only\n');
  
  console.log('OPTION 2: Mock/Demo Mode (No Database Required)\n');
  console.log('  For demonstration or code review purposes, you can review:');
  console.log('    • Test file: tests/test_auto_assessment_generator.js');
  console.log('    • Test file: tests/test_workflow_engine.js');
  console.log('    • Documentation: tests/TESTING_DOCUMENTATION.md');
  console.log('    • Visual guide: tests/VISUAL_GUIDE.md\n');
  
  console.log('OPTION 3: Check Database Connection First\n');
  console.log('  Test if your database is accessible:');
  console.log('    node tests/test_db_connection.js\n');
  
  console.log('  This will check:');
  console.log('    ✓ PostgreSQL connectivity');
  console.log('    ✓ Database existence');
  console.log('    ✓ Required tables');
  console.log('    ✓ Permissions\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('WHAT TO EXPECT');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('When tests run successfully:');
  console.log('  • Duration: 15-25 seconds total');
  console.log('  • Auto-assessment tests: 8-12 seconds (13 tests)');
  console.log('  • Workflow tests: 6-10 seconds (15 tests)');
  console.log('  • All test data is automatically cleaned up\n');
  
  console.log('Success output:');
  console.log('  ═══════════════════════════════════════════════════════════');
  console.log('  📊 COMBINED TEST SUMMARY');
  console.log('  ═══════════════════════════════════════════════════════════');
  console.log('  Total Tests: 28');
  console.log('  ✅ Passed: 28');
  console.log('  ❌ Failed: 0');
  console.log('  ⏱️  Total Duration: 24.5s');
  console.log('  ═══════════════════════════════════════════════════════════');
  console.log('  🎉 ALL TESTS PASSED!\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('DOCUMENTATION & RESOURCES');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('Quick references:');
  console.log('  📄 HOW_TO_TEST.md                    - Quick start guide');
  console.log('  📄 TESTING_COMPLETE.md               - Complete overview');
  console.log('  📄 FEATURE_TESTING_SUMMARY.md        - Detailed specifications');
  console.log('  📄 tests/TESTING_DOCUMENTATION.md    - 40+ page comprehensive guide');
  console.log('  📄 tests/VISUAL_GUIDE.md             - Diagrams and flowcharts\n');
  
  console.log('Test files:');
  console.log('  📝 tests/test_auto_assessment_generator.js  - Auto-assessment tests');
  console.log('  📝 tests/test_workflow_engine.js            - Workflow tests');
  console.log('  📝 tests/run_all_tests.js                   - Combined runner\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('TROUBLESHOOTING');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('Common issues:\n');
  console.log('❌ "Database connection failed"');
  console.log('   → Check if PostgreSQL is running');
  console.log('   → Verify DB_PASSWORD environment variable');
  console.log('   → Test: psql -U postgres -d shahin_ksa_compliance\n');
  
  console.log('❌ "Table does not exist"');
  console.log('   → Run database migrations');
  console.log('   → Command: psql -d shahin_ksa_compliance -f database/schema.sql\n');
  
  console.log('❌ "Permission denied"');
  console.log('   → Grant database permissions');
  console.log('   → SQL: GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;\n');
  
  console.log('❌ "Module not found"');
  console.log('   → Install dependencies');
  console.log('   → Command: npm install\n');
  
  console.log('For more troubleshooting, see: tests/TESTING_DOCUMENTATION.md\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('NEXT STEPS');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('To begin testing:\n');
  console.log('  1. Check database connection:');
  console.log('     node tests/test_db_connection.js\n');
  
  console.log('  2. If database is ready, run tests:');
  console.log('     npm run test:features\n');
  
  console.log('  3. Review results and documentation\n');
  
  console.log('  4. For detailed help:');
  console.log('     node tests/test_guide.js --help\n');
  
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
} else {
  console.log('Run with --help to see the testing guide\n');
}

// Exit
process.exit(0);
