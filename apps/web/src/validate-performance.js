#!/usr/bin/env node
/**
 * Performance Validation Script
 * Validates Artillery.js test results against production benchmarks
 */

const fs = require('fs');
const path = require('path');

// Performance Thresholds
const THRESHOLDS = {
  avgResponseTime: 200,     // Max 200ms average response time
  p95ResponseTime: 500,     // Max 500ms 95th percentile
  p99ResponseTime: 1000,    // Max 1s 99th percentile
  minRequestRate: 10,       // Min 10 requests per second
  maxErrorRate: 0.05,       // Max 5% error rate
  minSuccessRate: 0.95      // Min 95% success rate
};

function validateResults(filePath) {
  console.log(`\n🔍 Validating performance results: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Results file not found: ${filePath}`);
    return false;
  }

  const results = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const aggregate = results.aggregate;

  if (!aggregate) {
    console.error(`❌ No aggregate data found in ${filePath}`);
    return false;
  }

  let passed = true;
  const metrics = {
    avgResponseTime: aggregate.latency?.mean || 0,
    p95ResponseTime: aggregate.latency?.p95 || 0,
    p99ResponseTime: aggregate.latency?.p99 || 0,
    requestRate: aggregate.rps?.mean || 0,
    errorRate: (aggregate.errors || 0) / (aggregate.scenariosCompleted || 1),
    successRate: (aggregate.scenariosCompleted || 0) / ((aggregate.scenariosCompleted || 0) + (aggregate.errors || 0))
  };

  console.log(`\n📊 Performance Metrics for ${path.basename(filePath)}:`);
  console.log(`   Average Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`);
  console.log(`   95th Percentile: ${metrics.p95ResponseTime.toFixed(2)}ms`);
  console.log(`   99th Percentile: ${metrics.p99ResponseTime.toFixed(2)}ms`);
  console.log(`   Request Rate: ${metrics.requestRate.toFixed(2)} req/s`);
  console.log(`   Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
  console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(2)}%`);

  // Validate each threshold
  if (metrics.avgResponseTime > THRESHOLDS.avgResponseTime) {
    console.error(`❌ Average response time too high: ${metrics.avgResponseTime}ms > ${THRESHOLDS.avgResponseTime}ms`);
    passed = false;
  } else {
    console.log(`✅ Average response time: ${metrics.avgResponseTime.toFixed(2)}ms ≤ ${THRESHOLDS.avgResponseTime}ms`);
  }

  if (metrics.p95ResponseTime > THRESHOLDS.p95ResponseTime) {
    console.error(`❌ 95th percentile too high: ${metrics.p95ResponseTime}ms > ${THRESHOLDS.p95ResponseTime}ms`);
    passed = false;
  } else {
    console.log(`✅ 95th percentile: ${metrics.p95ResponseTime.toFixed(2)}ms ≤ ${THRESHOLDS.p95ResponseTime}ms`);
  }

  if (metrics.p99ResponseTime > THRESHOLDS.p99ResponseTime) {
    console.error(`❌ 99th percentile too high: ${metrics.p99ResponseTime}ms > ${THRESHOLDS.p99ResponseTime}ms`);
    passed = false;
  } else {
    console.log(`✅ 99th percentile: ${metrics.p99ResponseTime.toFixed(2)}ms ≤ ${THRESHOLDS.p99ResponseTime}ms`);
  }

  if (metrics.requestRate < THRESHOLDS.minRequestRate) {
    console.error(`❌ Request rate too low: ${metrics.requestRate} req/s < ${THRESHOLDS.minRequestRate} req/s`);
    passed = false;
  } else {
    console.log(`✅ Request rate: ${metrics.requestRate.toFixed(2)} req/s ≥ ${THRESHOLDS.minRequestRate} req/s`);
  }

  if (metrics.errorRate > THRESHOLDS.maxErrorRate) {
    console.error(`❌ Error rate too high: ${(metrics.errorRate * 100).toFixed(2)}% > ${(THRESHOLDS.maxErrorRate * 100)}%`);
    passed = false;
  } else {
    console.log(`✅ Error rate: ${(metrics.errorRate * 100).toFixed(2)}% ≤ ${(THRESHOLDS.maxErrorRate * 100)}%`);
  }

  if (metrics.successRate < THRESHOLDS.minSuccessRate) {
    console.error(`❌ Success rate too low: ${(metrics.successRate * 100).toFixed(2)}% < ${(THRESHOLDS.minSuccessRate * 100)}%`);
    passed = false;
  } else {
    console.log(`✅ Success rate: ${(metrics.successRate * 100).toFixed(2)}% ≥ ${(THRESHOLDS.minSuccessRate * 100)}%`);
  }

  return passed;
}

function main() {
  console.log('🚀 GRC Platform Performance Validation');
  console.log('=====================================');

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Usage: node validate-performance.js <results-file1> [results-file2] ...');
    process.exit(1);
  }

  let allPassed = true;

  for (const file of args) {
    const passed = validateResults(file);
    if (!passed) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('🎉 ALL PERFORMANCE TESTS PASSED!');
    console.log('✅ System meets all production performance requirements');
    console.log('🚀 Ready for production deployment!');
    process.exit(0);
  } else {
    console.error('❌ PERFORMANCE TESTS FAILED!');
    console.error('🚨 System does not meet production performance requirements');
    console.error('🛠️  Please optimize before deployment');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateResults, THRESHOLDS };
