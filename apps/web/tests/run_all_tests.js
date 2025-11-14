#!/usr/bin/env node

/**
 * Combined Test Runner
 * Runs all GRC feature tests including Auto-Assessment and Workflow Engine
 */

const { runTests: runAutoAssessmentTests } = require('./test_auto_assessment_generator');
const { runTests: runWorkflowTests } = require('./test_workflow_engine');

const chalk = require('chalk');

console.log('\n' + '='.repeat(80));
console.log(chalk.bold.cyan('🧪 GRC COMPREHENSIVE TEST SUITE'));
console.log('='.repeat(80));
console.log(chalk.gray('Testing Auto-Assessment Generator and Workflow Engine\n'));

async function runAllTests() {
  const startTime = new Date();
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    // Run Auto-Assessment Tests
    console.log(chalk.bold.yellow('\n📋 RUNNING AUTO-ASSESSMENT GENERATOR TESTS...\n'));
    const autoAssessmentResults = await runAutoAssessmentTests();
    totalPassed += autoAssessmentResults.passed;
    totalFailed += autoAssessmentResults.failed;
    
    // Run Workflow Engine Tests
    console.log(chalk.bold.yellow('\n⚙️  RUNNING WORKFLOW ENGINE TESTS...\n'));
    const workflowResults = await runWorkflowTests();
    totalPassed += workflowResults.passed;
    totalFailed += workflowResults.failed;
    
    // Print combined summary
    const duration = ((new Date() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.cyan('📊 COMBINED TEST SUMMARY'));
    console.log('='.repeat(80));
    console.log(`${chalk.bold('Total Tests:')} ${totalPassed + totalFailed}`);
    console.log(`${chalk.green('✅ Passed:')} ${totalPassed}`);
    console.log(`${chalk.red('❌ Failed:')} ${totalFailed}`);
    console.log(`${chalk.blue('⏱️  Total Duration:')} ${duration}s`);
    console.log('='.repeat(80));
    
    if (totalFailed === 0) {
      console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED!\n'));
    } else {
      console.log(chalk.red.bold(`\n❌ ${totalFailed} TEST(S) FAILED\n`));
    }
    
    process.exit(totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test suite error:'), error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
