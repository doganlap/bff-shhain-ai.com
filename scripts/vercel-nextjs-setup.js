#!/usr/bin/env node
import { Vercel } from '@vercel/sdk';
import { execSync } from 'child_process';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

const PROJECT_CONFIG = {
  name: 'my-prisma-postgres-app',
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  installCommand: 'npm install',
  devCommand: 'npm run dev',
  environmentVariables: [
    {
      key: 'DATABASE_URL',
      value: process.env.DATABASE_URL || '',
      target: ['production', 'preview', 'development'],
      type: 'encrypted'
    },
    {
      key: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET || '',
      target: ['production', 'preview'],
      type: 'encrypted'
    },
    {
      key: 'NEXTAUTH_URL',
      value: process.env.NEXTAUTH_URL || '',
      target: ['production', 'preview']
    },
    {
      key: 'NODE_ENV',
      value: 'production',
      target: ['production']
    }
  ]
};

async function setupVercelProject() {
  try {
    console.log('🔧 Setting up Vercel project configuration...');

    // Create or update project
    try {
      const existingProject = await vercel.projects.getProject({
        idOrName: PROJECT_CONFIG.name
      });

      console.log(`✅ Project ${PROJECT_CONFIG.name} already exists`);

      // Update project settings
      await vercel.projects.updateProject({
        idOrName: PROJECT_CONFIG.name,
        requestBody: {
          buildCommand: PROJECT_CONFIG.buildCommand,
          outputDirectory: PROJECT_CONFIG.outputDirectory,
          installCommand: PROJECT_CONFIG.installCommand,
          devCommand: PROJECT_CONFIG.devCommand,
          framework: PROJECT_CONFIG.framework
        }
      });

      console.log('🔄 Updated project settings');

    } catch (error) {
      if (error.status === 404) {
        console.log('🆕 Creating new Vercel project...');

        const newProject = await vercel.projects.createProject({
          requestBody: PROJECT_CONFIG
        });

        console.log(`✅ Created project: ${newProject.name}`);
      } else {
        console.error('❌ Error managing project:', error.message);
        throw error;
      }
    }

    // Setup environment variables
    console.log('🔐 Setting up environment variables...');

    for (const envVar of PROJECT_CONFIG.environmentVariables) {
      if (envVar.value) {
        try {
          await vercel.projects.createProjectEnv({
            idOrName: PROJECT_CONFIG.name,
            upsert: 'true',
            requestBody: {
              key: envVar.key,
              value: envVar.value,
              target: envVar.target,
              type: envVar.type || 'plain',
            },
          });

          console.log(`  ✅ Set ${envVar.key} for [${envVar.target.join(', ')}]`);
        } catch (error) {
          console.error(`  ❌ Failed to set ${envVar.key}:`, error.message);
        }
      } else {
        console.log(`  ⚠️  Skipping ${envVar.key} (no value provided)`);
      }
    }

    // Setup domains (optional)
    const domains = [
      `${PROJECT_CONFIG.name}.vercel.app`,
      // Add custom domains if needed
    ];

    console.log('🌐 Setting up domains...');
    for (const domain of domains) {
      try {
        await vercel.projects.addProjectDomain({
          idOrName: PROJECT_CONFIG.name,
          requestBody: {
            name: domain,
            gitBranch: 'main'
          }
        });
        console.log(`  ✅ Added domain: ${domain}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  Domain ${domain} already configured`);
        } else {
          console.error(`  ❌ Failed to add ${domain}:`, error.message);
        }
      }
    }

    console.log('\n✅ Vercel project setup completed!');

    return PROJECT_CONFIG.name;

  } catch (error) {
    console.error('💥 Vercel setup failed:', error.message);
    throw error;
  }
}

async function deployProject() {
  try {
    console.log('🚀 Starting deployment...');

    // Create deployment using Vercel API
    const deployment = await vercel.deployments.createDeployment({
      name: PROJECT_CONFIG.name,
      gitSource: {
        type: 'github',
        ref: 'main',
        repoId: process.env.GITHUB_REPO_ID // You'll need to set this
      },
      target: 'production'
    });

    console.log(`📦 Deployment created: ${deployment.url}`);
    console.log(`🆔 Deployment ID: ${deployment.id}`);

    // Monitor deployment
    let status = deployment.readyState || 'BUILDING';
    const maxAttempts = 30;
    let attempts = 0;

    while ((status === 'BUILDING' || status === 'QUEUED') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const deploymentStatus = await vercel.deployments.getDeployment({
        idOrUrl: deployment.id
      });

      status = deploymentStatus.readyState;
      attempts++;

      console.log(`📊 Deployment status: ${status} (${attempts}/${maxAttempts})`);
    }

    if (status === 'READY') {
      console.log('🎉 Deployment successful!');
      console.log(`🌐 Live URL: ${deployment.url}`);
    } else if (attempts >= maxAttempts) {
      console.log('⏰ Deployment monitoring timed out. Check Vercel dashboard for status.');
    } else {
      console.log(`❌ Deployment failed with status: ${status}`);
    }

    return deployment;

  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    console.log('\n💡 Try manual deployment:');
    console.log('   vercel deploy --prod');
    throw error;
  }
}

// Export functions for use in other scripts
export { setupVercelProject, deployProject };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === 'setup') {
    setupVercelProject();
  } else if (command === 'deploy') {
    deployProject();
  } else {
    console.log('Usage: node vercel-nextjs-setup.js [setup|deploy]');
  }
}
