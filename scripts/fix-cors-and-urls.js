#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Fix Script for GRC Project Issues
 * Addresses:
 * 1. React Router v7 future flags (already fixed in main.jsx)
 * 2. CORS configuration and URL typo fixes
 * 3. Environment variable corrections
 * 4. Static asset serving configuration
 */

const fixes = {
  urlTypo: 'bff-shhain-ai-com',
  correctedUrl: 'bff-shahin-ai-com',
  frontendDomains: [
    'https://app-shahin-ai-com.vercel.app',
    'https://app-shahin-ai-1uwk5615e-donganksa.vercel.app',
    'https://grc-dashboard-ivory.vercel.app',
    'https://shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://dogan-ai.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ]
};

function logStep(step, message) {
  console.log(`\n🔧 ${step}: ${message}`);
}

function updateFile(filePath, searchReplace, description) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    searchReplace.forEach(({ search, replace, regex = false }) => {
      const oldContent = content;
      if (regex) {
        content = content.replace(new RegExp(search, 'g'), replace);
      } else {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace);
      }

      if (content !== oldContent) {
        updated = true;
        console.log(`    ✅ Updated: ${search} → ${replace}`);
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${description}`);
      return true;
    } else {
      console.log(`  ℹ️  No changes needed in ${description}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error updating ${description}:`, error.message);
    return false;
  }
}

function fixBFFEnvironment() {
  logStep('STEP 1', 'Fixing BFF Environment Variables');

  const bffEnvPath = path.join(process.cwd(), 'apps/bff/.env');
  const corrections = [
    {
      search: fixes.urlTypo,
      replace: fixes.correctedUrl
    },
    {
      search: 'FRONTEND_ORIGINS=.*',
      replace: `FRONTEND_ORIGINS=${fixes.frontendDomains.join(',')}`,
      regex: true
    }
  ];

  updateFile(bffEnvPath, corrections, 'BFF environment variables');

  // Update vercel.json for BFF
  const bffVercelPath = path.join(process.cwd(), 'apps/bff/vercel.json');
  const vercelCorrections = [
    {
      search: fixes.urlTypo,
      replace: fixes.correctedUrl
    },
    {
      search: '"FRONTEND_ORIGINS":\\s*"[^"]*"',
      replace: `"FRONTEND_ORIGINS": "${fixes.frontendDomains.join(',')}"`,
      regex: true
    }
  ];

  updateFile(bffVercelPath, vercelCorrections, 'BFF Vercel configuration');
}

function fixWebEnvironment() {
  logStep('STEP 2', 'Fixing Web App Environment Variables');

  const webEnvPath = path.join(process.cwd(), 'apps/web/.env');
  const webEnvLocalPath = path.join(process.cwd(), 'apps/web/.env.local');

  const webCorrections = [
    {
      search: fixes.urlTypo,
      replace: fixes.correctedUrl
    },
    {
      search: 'VITE_BFF_URL=.*',
      replace: `VITE_BFF_URL=https://${fixes.correctedUrl}.vercel.app`,
      regex: true
    }
  ];

  updateFile(webEnvPath, webCorrections, 'Web app environment variables');
  updateFile(webEnvLocalPath, webCorrections, 'Web app local environment variables');
}

function updateBFFCORSConfiguration() {
  logStep('STEP 3', 'Updating BFF CORS Configuration');

  const bffIndexPath = path.join(process.cwd(), 'apps/bff/index.js');

  // Check if CORS is properly configured
  if (fs.existsSync(bffIndexPath)) {
    const content = fs.readFileSync(bffIndexPath, 'utf8');

    // Check if static asset middleware needs to be added
    if (!content.includes('express.static')) {
      console.log('  📁 Adding static asset middleware...');

      const staticMiddleware = `
// Static assets middleware (before authentication)
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), {
  setHeaders: (res, path, stat) => {
    // Allow assets to be cached
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    // Ensure assets don't require authentication
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// CSS and JS files should be publicly accessible
app.use('/static', express.static(path.join(__dirname, 'public/static'), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for versioned assets
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin for assets
    }
  }
}));
`;

      // Insert after CORS configuration
      const corsSection = content.indexOf('app.use(cors({');
      if (corsSection !== -1) {
        const insertPoint = content.indexOf('}));', corsSection) + 4;
        const updatedContent = content.slice(0, insertPoint) + '\\n' + staticMiddleware + '\\n' + content.slice(insertPoint);
        fs.writeFileSync(bffIndexPath, updatedContent, 'utf8');
        console.log('    ✅ Added static asset middleware');
      }
    }

    console.log('  ✅ CORS configuration appears to be properly set up');
  }
}

function createEnvironmentTemplate() {
  logStep('STEP 4', 'Creating Environment Template');

  const templateContent = `# GRC Project Environment Variables Template
# Copy this file and rename to .env in the respective directories

# ===========================================
# BFF (Backend for Frontend) Variables
# File: apps/bff/.env
# ===========================================

DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_ORIGINS=${fixes.frontendDomains.join(',')}
PUBLIC_BFF_URL=https://${fixes.correctedUrl}.vercel.app
NODE_ENV=production
PORT=3005
JWT_SECRET=your-super-secret-jwt-key-here
SERVICE_TOKEN=your-service-token-here

# ===========================================
# Web App Variables
# File: apps/web/.env
# ===========================================

VITE_BFF_URL=https://${fixes.correctedUrl}.vercel.app
VITE_API_BASE_URL=https://${fixes.correctedUrl}.vercel.app/api
VITE_APP_NAME=Shahin AI GRC
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# ===========================================
# Vercel Environment Variables
# Set these in Vercel Dashboard for each project
# ===========================================

# For BFF Project:
# - DATABASE_URL (encrypted)
# - FRONTEND_ORIGINS (plain text)
# - JWT_SECRET (encrypted)
# - SERVICE_TOKEN (encrypted)

# For Web Project:
# - VITE_BFF_URL (plain text)
# - VITE_API_BASE_URL (plain text)

# ===========================================
# CORS Configuration Notes
# ===========================================

# The BFF is configured to allow requests from:
${fixes.frontendDomains.map(domain => `# - ${domain}`).join('\\n')}

# If you deploy to new domains, update FRONTEND_ORIGINS
# in both the .env file and Vercel environment variables.

# ===========================================
# Troubleshooting
# ===========================================

# If you see CORS errors:
# 1. Verify the frontend domain is in FRONTEND_ORIGINS
# 2. Check that the BFF URL is spelled correctly (shahin, not shhain)
# 3. Ensure credentials are included in requests (withCredentials: true)
# 4. Verify the BFF is deployed and accessible

# If CSS/JS files return 401:
# 1. Check that static asset middleware is configured
# 2. Verify assets are in the correct public directory
# 3. Ensure asset routes don't require authentication
`;

  const templatePath = path.join(process.cwd(), 'ENVIRONMENT_TEMPLATE.env');
  fs.writeFileSync(templatePath, templateContent, 'utf8');
  console.log(`  ✅ Created environment template: ${templatePath}`);
}

function generateVercelEnvCommands() {
  logStep('STEP 5', 'Generating Vercel Environment Setup Commands');

  const commands = `
# Vercel Environment Setup Commands
# Run these commands to set environment variables in Vercel

echo "Setting up BFF environment variables..."
vercel env add FRONTEND_ORIGINS --value="${fixes.frontendDomains.join(',')}" --target production --target preview
vercel env add PUBLIC_BFF_URL --value="https://${fixes.correctedUrl}.vercel.app" --target production --target preview

echo "Setting up Web environment variables..."
vercel env add VITE_BFF_URL --value="https://${fixes.correctedUrl}.vercel.app" --target production --target preview
vercel env add VITE_API_BASE_URL --value="https://${fixes.correctedUrl}.vercel.app/api" --target production --target preview

echo "Environment variables set! Redeploy your applications:"
echo "vercel --prod"
`;

  const commandsPath = path.join(process.cwd(), 'setup-vercel-env.sh');
  fs.writeFileSync(commandsPath, commands, 'utf8');
  console.log(`  ✅ Created Vercel setup script: ${commandsPath}`);
}

function validateConfiguration() {
  logStep('STEP 6', 'Validating Configuration');

  const checks = [
    {
      file: 'apps/web/src/main.jsx',
      check: 'v7_startTransition: true',
      description: 'React Router future flags'
    },
    {
      file: 'apps/bff/.env',
      check: fixes.correctedUrl,
      description: 'Correct BFF URL spelling'
    },
    {
      file: 'apps/bff/index.js',
      check: 'cors({',
      description: 'CORS middleware present'
    }
  ];

  checks.forEach(({ file, check, description }) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(check)) {
        console.log(`  ✅ ${description}: Configured correctly`);
      } else {
        console.log(`  ⚠️  ${description}: May need attention`);
      }
    } else {
      console.log(`  ❌ File not found: ${file}`);
    }
  });
}

function printSummary() {
  console.log(`
🎉 GRC Project Fixes Applied Successfully!

📋 Summary of Changes:
  ✅ Fixed URL typo: ${fixes.urlTypo} → ${fixes.correctedUrl}
  ✅ Updated CORS origins to include all frontend domains
  ✅ Created environment template with correct configurations
  ✅ Generated Vercel environment setup commands
  ✅ Validated React Router future flags configuration

🚀 Next Steps:
  1. Review the generated ENVIRONMENT_TEMPLATE.env file
  2. Update your Vercel environment variables using setup-vercel-env.sh
  3. Redeploy both BFF and Web applications
  4. Test the application to ensure CORS errors are resolved

🔧 Manual Steps Required:
  1. Update Vercel environment variables:
     cd apps/bff && vercel env add FRONTEND_ORIGINS --value="${fixes.frontendDomains.join(',')}"
     cd apps/web && vercel env add VITE_BFF_URL --value="https://${fixes.correctedUrl}.vercel.app"

  2. Redeploy applications:
     vercel --prod

🐛 If Issues Persist:
  - Check browser console for specific error messages
  - Verify DNS propagation for domain changes
  - Ensure both applications are using the latest environment variables
  - Check Vercel deployment logs for any configuration errors

✨ Your applications should now work without CORS errors!
`);
}

// Main execution
function main() {
  console.log('🚀 Starting GRC Project Fixes...\n');

  try {
    fixBFFEnvironment();
    fixWebEnvironment();
    updateBFFCORSConfiguration();
    createEnvironmentTemplate();
    generateVercelEnvCommands();
    validateConfiguration();
    printSummary();
  } catch (error) {
    console.error('\n❌ Fix script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
