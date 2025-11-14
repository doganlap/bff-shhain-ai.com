/**
 * Mock Data Detection Script
 * 
 * Scans codebase for mock data patterns and generates reports
 * Used in CI/CD pipeline to prevent mock data in production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock data patterns to detect
const MOCK_PATTERNS = [
  // Math.random() usage
  {
    pattern: /Math\.random\(\)/g,
    severity: 'error',
    message: 'Math.random() detected - use real data instead',
    category: 'random-data'
  },
  // Mock/sample data functions
  {
    pattern: /(generateMock|createMock|sampleData|mockData)/gi,
    severity: 'warning',
    message: 'Mock data function detected',
    category: 'mock-functions'
  },
  // Hardcoded sample data arrays
  {
    pattern: /(const|let|var)\s+\w*(sample|mock|test)\w*\s*=\s*\[/gi,
    severity: 'warning',
    message: 'Sample data array detected',
    category: 'sample-arrays'
  },
  // Fallback to mock data
  {
    pattern: /\|\|\s*\[\s*\{.*name.*:.*"/gi,
    severity: 'error',
    message: 'Fallback to mock data detected',
    category: 'fallback-mock'
  },
  // Fake data generators
  {
    pattern: /(faker|chance|casual|@faker-js)/gi,
    severity: 'error',
    message: 'Fake data library detected',
    category: 'fake-libraries'
  },
  // Test data in production files
  {
    pattern: /test.*data/gi,
    severity: 'warning',
    message: 'Test data reference detected',
    category: 'test-data'
  }
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.test\./,
  /\.spec\./,
  /test\//,
  /tests\//,
  /__tests__\//,
  /mock\//,
  /mocks\//,
  /\.md$/,
  /\.json$/,
  /\.log$/
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

class MockDataDetector {
  constructor(options = {}) {
    this.options = {
      failOnError: options.failOnError || false,
      outputFormat: options.outputFormat || 'console', // console, json, markdown
      severityThreshold: options.severityThreshold || 'warning',
      ...options
    };
    
    this.findings = [];
    this.scannedFiles = 0;
    this.errors = 0;
    this.warnings = 0;
  }

  shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    return SCAN_EXTENSIONS.includes(ext) && !this.shouldExcludeFile(filePath);
  }

  scanFile(filePath) {
    if (!this.shouldScanFile(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      this.scannedFiles++;

      lines.forEach((line, lineIndex) => {
        MOCK_PATTERNS.forEach(({ pattern, severity, message, category }) => {
          const matches = line.match(pattern);
          if (matches) {
            const finding = {
              file: filePath,
              line: lineIndex + 1,
              column: line.search(pattern) + 1,
              severity,
              message,
              category,
              code: line.trim(),
              match: matches[0]
            };

            this.findings.push(finding);

            if (severity === 'error') {
              this.errors++;
            } else if (severity === 'warning') {
              this.warnings++;
            }
          }
        });
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);

      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stat.isFile()) {
          this.scanFile(fullPath);
        }
      });
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        scannedFiles: this.scannedFiles,
        totalFindings: this.findings.length,
        errors: this.errors,
        warnings: this.warnings,
        severityThreshold: this.options.severityThreshold
      },
      findings: this.findings,
      categories: this.getCategoriesSummary(),
      filesWithIssues: this.getFilesWithIssues()
    };

    return report;
  }

  getCategoriesSummary() {
    const categories = {};
    this.findings.forEach(finding => {
      if (!categories[finding.category]) {
        categories[finding.category] = { errors: 0, warnings: 0, total: 0 };
      }
      categories[finding.category].total++;
      if (finding.severity === 'error') {
        categories[finding.category].errors++;
      } else if (finding.severity === 'warning') {
        categories[finding.category].warnings++;
      }
    });
    return categories;
  }

  getFilesWithIssues() {
    const files = {};
    this.findings.forEach(finding => {
      if (!files[finding.file]) {
        files[finding.file] = { errors: 0, warnings: 0, total: 0, issues: [] };
      }
      files[finding.file].total++;
      files[finding.file].issues.push({
        line: finding.line,
        severity: finding.severity,
        message: finding.message,
        category: finding.category
      });
      if (finding.severity === 'error') {
        files[finding.file].errors++;
      } else if (finding.severity === 'warning') {
        files[finding.file].warnings++;
      }
    });
    return files;
  }

  formatConsoleOutput(report) {
    console.log('\n🔍 Mock Data Detection Report');
    console.log('=' .repeat(50));
    console.log(`📁 Scanned Files: ${report.summary.scannedFiles}`);
    console.log(`🔍 Total Findings: ${report.summary.totalFindings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`📊 Severity Threshold: ${report.summary.severityThreshold}`);
    console.log('');

    if (report.findings.length > 0) {
      console.log('📋 Detailed Findings:');
      console.log('-'.repeat(50));
      
      report.findings.forEach((finding, index) => {
        const severityIcon = finding.severity === 'error' ? '❌' : '⚠️';
        console.log(`${index + 1}. ${severityIcon} ${finding.file}:${finding.line}`);
        console.log(`   ${finding.message} (${finding.category})`);
        console.log(`   Code: ${finding.code}`);
        console.log('');
      });

      console.log('📁 Files with Issues:');
      console.log('-'.repeat(50));
      Object.entries(report.filesWithIssues).forEach(([file, stats]) => {
        console.log(`${file}: ${stats.total} issues (${stats.errors} errors, ${stats.warnings} warnings)`);
      });
    } else {
      console.log('✅ No mock data patterns detected!');
    }

    console.log('\n' + '='.repeat(50));
  }

  formatJsonOutput(report) {
    return JSON.stringify(report, null, 2);
  }

  formatMarkdownOutput(report) {
    let markdown = '# Mock Data Detection Report\n\n';
    markdown += `**Generated:** ${report.timestamp}\n\n`;
    
    markdown += '## Summary\n\n';
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Files Scanned | ${report.summary.scannedFiles} |\n`;
    markdown += `| Total Findings | ${report.summary.totalFindings} |\n`;
    markdown += `| Errors | ${report.summary.errors} |\n`;
    markdown += `| Warnings | ${report.summary.warnings} |\n`;
    markdown += `| Severity Threshold | ${report.summary.severityThreshold} |\n\n`;

    if (report.findings.length > 0) {
      markdown += '## Detailed Findings\n\n';
      report.findings.forEach((finding, index) => {
        const severityIcon = finding.severity === 'error' ? '❌' : '⚠️';
        markdown += `### ${index + 1}. ${finding.file}:${finding.line}\n\n`;
        markdown += `- **Severity:** ${severityIcon} ${finding.severity}\n`;
        markdown += `- **Category:** ${finding.category}\n`;
        markdown += `- **Message:** ${finding.message}\n`;
        markdown += `- **Code:** \`\`\`${finding.code}\`\`\`\n\n`;
      });

      markdown += '## Files with Issues\n\n';
      Object.entries(report.filesWithIssues).forEach(([file, stats]) => {
        markdown += `- **${file}**: ${stats.total} issues (${stats.errors} errors, ${stats.warnings} warnings)\n`;
      });
    } else {
      markdown += '## ✅ No Issues Found\n\n';
      markdown += 'No mock data patterns were detected in the codebase.\n';
    }

    return markdown;
  }

  outputReport(report) {
    switch (this.options.outputFormat) {
      case 'json':
        console.log(this.formatJsonOutput(report));
        break;
      case 'markdown':
        console.log(this.formatMarkdownOutput(report));
        break;
      case 'console':
      default:
        this.formatConsoleOutput(report);
        break;
    }
  }

  shouldFail() {
    if (this.options.failOnError && this.errors > 0) {
      return true;
    }

    if (this.options.severityThreshold === 'error' && this.errors > 0) {
      return true;
    }

    if (this.options.severityThreshold === 'warning' && (this.errors > 0 || this.warnings > 0)) {
      return true;
    }

    return false;
  }

  run(scanPath = '.') {
    console.log(`🔍 Scanning for mock data patterns in: ${scanPath}`);
    
    const stat = fs.statSync(scanPath);
    if (stat.isDirectory()) {
      this.scanDirectory(scanPath);
    } else if (stat.isFile()) {
      this.scanFile(scanPath);
    }

    const report = this.generateReport();
    this.outputReport(report);

    if (this.shouldFail()) {
      console.error('\n❌ Mock data detection failed!');
      process.exit(1);
    } else {
      console.log('\n✅ Mock data detection passed!');
      process.exit(0);
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  let scanPath = '.';

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fail-on-error':
        options.failOnError = true;
        break;
      case '--format':
        options.outputFormat = args[++i];
        break;
      case '--threshold':
        options.severityThreshold = args[++i];
        break;
      default:
        if (!args[i].startsWith('--')) {
          scanPath = args[i];
        }
        break;
    }
  }

  const detector = new MockDataDetector(options);
  detector.run(scanPath);
}

module.exports = MockDataDetector;