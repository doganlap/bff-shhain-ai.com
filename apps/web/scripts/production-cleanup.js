/**
 * Production Cleanup Script
 * Removes mock data and ensures production readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', 'src');

// Mock data patterns to clean
const MOCK_PATTERNS = [
  {
    pattern: /Math\.random\(\)/g,
    replacement: '0', // Replace with deterministic value
    description: 'Math.random() calls'
  },
  {
    pattern: /generateMock\w*\(/g,
    replacement: 'null /* MOCK_REMOVED */(',
    description: 'Mock data generators'
  },
  {
    pattern: /mockData\w*/gi,
    replacement: 'null /* MOCK_REMOVED */',
    description: 'Mock data references'
  },
  {
    pattern: /sampleData\w*/gi,
    replacement: 'null /* MOCK_REMOVED */',
    description: 'Sample data references'
  }
];

// Files to exclude from cleanup
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /mocks/,
  /detect-mock-data\.js/,
  /mockData\.config\.js/
];

class ProductionCleaner {
  constructor() {
    this.cleanedFiles = [];
    this.skippedFiles = [];
    this.errors = [];
  }

  shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  cleanFile(filePath) {
    if (this.shouldExcludeFile(filePath)) {
      this.skippedFiles.push(filePath);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      let changes = [];

      MOCK_PATTERNS.forEach(({ pattern, replacement, description }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
          changes.push(description);
        }
      });

      if (modified) {
        // Add production safety comment at the top
        const productionHeader = `/**
 * PRODUCTION BUILD - Mock data removed
 * Generated: ${new Date().toISOString()}
 * Changes: ${changes.join(', ')}
 */

`;
        
        const newContent = productionHeader + content;
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.cleanedFiles.push({ file: filePath, changes });
      }
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  cleanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);

      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          this.cleanDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.jsx')) {
          this.cleanFile(fullPath);
        }
      });
    } catch (error) {
      console.error(`Error cleaning directory ${dirPath}:`, error.message);
    }
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        cleanedFiles: this.cleanedFiles.length,
        skippedFiles: this.skippedFiles.length,
        errors: this.errors.length
      },
      cleanedFiles: this.cleanedFiles,
      skippedFiles: this.skippedFiles,
      errors: this.errors
    };
  }

  run() {
    console.log('🧹 Starting production cleanup...');
    console.log(`📁 Target directory: ${rootDir}`);
    
    this.cleanDirectory(rootDir);
    
    const report = this.generateReport();
    
    console.log('\n📊 Cleanup Report:');
    console.log(`✅ Files cleaned: ${report.summary.cleanedFiles}`);
    console.log(`⏭️  Files skipped: ${report.summary.skippedFiles}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    
    if (report.cleanedFiles.length > 0) {
      console.log('\n📝 Cleaned files:');
      report.cleanedFiles.forEach(({ file, changes }) => {
        console.log(`  📄 ${file}`);
        changes.forEach(change => console.log(`     - ${change}`));
      });
    }
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      report.errors.forEach(({ file, error }) => {
        console.log(`  📄 ${file}: ${error}`);
      });
    }
    
    console.log('\n✅ Production cleanup completed!');
    return report;
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new ProductionCleaner();
  cleaner.run();
}

export default ProductionCleaner;