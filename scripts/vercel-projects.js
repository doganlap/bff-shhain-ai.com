import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

const GRC_PROJECTS = {
  web: 'grc-web-app',
  bff: 'grc-backend',
  api: 'grc-api'
};

async function manageGRCProjects() {
  try {
    console.log('🏗️  Managing GRC projects...');

    // Create or update projects
    for (const [type, projectName] of Object.entries(GRC_PROJECTS)) {
      console.log(`📦 Setting up ${type} project: ${projectName}`);

      const projectConfig = {
        name: projectName,
        framework: type === 'web' ? 'vite' : 'nodejs',
        buildCommand: type === 'web' ? 'pnpm -C apps/web build' : 'pnpm -C apps/bff build',
        outputDirectory: type === 'web' ? 'apps/web/dist' : 'apps/bff/dist',
        installCommand: 'pnpm install',
        devCommand: type === 'web' ? 'pnpm -C apps/web dev' : 'pnpm -C apps/bff dev',
        environmentVariables: [
          {
            key: 'NODE_ENV',
            value: 'production',
            target: ['production']
          },
          {
            key: 'DATABASE_URL',
            value: process.env.DATABASE_URL || '',
            target: ['production', 'preview'],
            type: 'encrypted'
          }
        ]
      };

      try {
        // Try to get existing project
        const existingProject = await vercel.projects.getProject({
          idOrName: projectName
        });

        console.log(`✅ Project ${projectName} already exists`);

        // Update project settings
        await vercel.projects.updateProject({
          idOrName: projectName,
          requestBody: {
            buildCommand: projectConfig.buildCommand,
            outputDirectory: projectConfig.outputDirectory,
            installCommand: projectConfig.installCommand,
            devCommand: projectConfig.devCommand
          }
        });

        console.log(`🔄 Updated settings for ${projectName}`);

      } catch (error) {
        if (error.status === 404) {
          // Project doesn't exist, create it
          const newProject = await vercel.projects.createProject({
            requestBody: projectConfig
          });

          console.log(`🆕 Created new project: ${newProject.name}`);
        } else {
          console.error(`❌ Error managing project ${projectName}:`, error.message);
        }
      }
    }

    // List all projects
    const allProjects = await vercel.projects.getProjects({
      limit: 20
    });

    console.log('\n📋 Current projects:');
    allProjects.projects.forEach(project => {
      if (Object.values(GRC_PROJECTS).includes(project.name)) {
        console.log(`  ✓ ${project.name} - ${project.framework || 'Unknown'}`);
      }
    });

  } catch (error) {
    console.error('💥 Project management error:', error.message);
    throw error;
  }
}

async function deleteProject(projectName) {
  try {
    await vercel.projects.deleteProject({
      idOrName: projectName
    });
    console.log(`🗑️  Deleted project: ${projectName}`);
  } catch (error) {
    console.error(`❌ Error deleting project ${projectName}:`, error.message);
  }
}

export { manageGRCProjects, deleteProject };
