#!/usr/bin/env node
import { deployProject } from './vercel-deployment.js';
import { manageGRCProjects } from './vercel-projects.js';
import { setupEnvironmentVariables } from './vercel-env.js';
import { manageDomains } from './vercel-domains.js';
import { monitorProjectHealth, getLogsAndStatus } from './vercel-monitoring.js';
import { manageTeam } from './vercel-teams.js';
import { listIntegrations } from './vercel-integrations.js';
import { setupNextjsPrismaProject } from './setup-nextjs-prisma.js';
import { setupVercelProject } from './vercel-nextjs-setup.js';

const PROJECT_NAMES = ['grc-web-app', 'grc-backend', 'grc-api'];

async function main() {
  try {
    console.log('🚀 GRC Vercel Management Suite\n');

    const command = process.argv[2];

    switch (command) {
      case 'deploy':
        console.log('📦 Starting deployment...');
        await deployProject();
        break;

      case 'setup-projects':
        console.log('🏗️  Setting up projects...');
        await manageGRCProjects();
        break;

      case 'setup-env':
        console.log('🔧 Setting up environment variables...');
        await setupEnvironmentVariables(PROJECT_NAMES);
        break;

      case 'setup-domains':
        const projectName = process.argv[3] || 'grc-web-app';
        console.log(`🌐 Setting up domains for ${projectName}...`);
        await manageDomains(projectName);
        break;

      case 'monitor':
        console.log('📊 Monitoring project health...');
        for (const project of PROJECT_NAMES) {
          console.log(`\n--- ${project} ---`);
          await monitorProjectHealth(project);
        }
        break;

      case 'team':
        console.log('👥 Managing team...');
        await manageTeam();
        break;

      case 'integrations':
        console.log('🔌 Listing integrations...');
        await listIntegrations();
        break;

      case 'logs':
        const deploymentUrl = process.argv[3];
        if (!deploymentUrl) {
          console.error('❌ Please provide a deployment URL or ID');
          console.log('Usage: node scripts/vercel-cli.js logs <deployment-url>');
          process.exit(1);
        }
        console.log(`📋 Getting logs and status for: ${deploymentUrl}`);
        await getLogsAndStatus(deploymentUrl);
        break;

      case 'setup-nextjs':
        console.log('⚡ Setting up Next.js with Prisma Postgres...');
        await setupNextjsPrismaProject();
        break;

      case 'setup-nextjs-vercel':
        console.log('🔧 Setting up Vercel project configuration...');
        await setupVercelProject();
        break;

      case 'full-setup':
        console.log('🎯 Running full GRC setup...');

        console.log('\n1. Setting up projects...');
        await manageGRCProjects();

        console.log('\n2. Setting up environment variables...');
        await setupEnvironmentVariables(PROJECT_NAMES);

        console.log('\n3. Setting up domains...');
        await manageDomains('grc-web-app');

        console.log('\n4. Checking team configuration...');
        await manageTeam();

        console.log('\n✅ Full setup complete!');
        break;

      default:
        console.log('📚 Available commands:');
        console.log('  deploy                 - Deploy the current project');
        console.log('  setup-projects         - Create/update all GRC projects');
        console.log('  setup-env             - Configure environment variables');
        console.log('  setup-domains         - Configure domains (optional: project name)');
        console.log('  monitor               - Monitor all projects health');
        console.log('  logs <url>            - Get deployment logs and status');
        console.log('  setup-nextjs          - Create Next.js app with Prisma Postgres');
        console.log('  setup-nextjs-vercel   - Configure Vercel for Next.js project');
        console.log('  team                  - Manage team settings');
        console.log('  integrations          - List available integrations');
        console.log('  full-setup            - Run complete setup process');
        console.log('\nUsage: node scripts/vercel-cli.js <command>');
        break;
    }

  } catch (error) {
    console.error('💥 Command failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
