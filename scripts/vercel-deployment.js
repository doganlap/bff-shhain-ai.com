import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

const PROJECT_NAME = 'grc-assessment';
const TEAM_ID = process.env.VERCEL_TEAM_ID;

async function deployProject() {
  try {
    console.log('🚀 Starting deployment automation...');

    // Create deployment
    const deployment = await vercel.deployments.createDeployment({
      name: PROJECT_NAME,
      files: [
        {
          file: 'package.json',
          data: JSON.stringify({
            name: 'grc-assessment',
            version: '1.0.0',
            scripts: {
              build: 'pnpm build',
              start: 'pnpm start'
            }
          }, null, 2)
        }
      ],
      projectSettings: {
        buildCommand: 'pnpm -C apps/web build',
        outputDirectory: 'apps/web/dist',
        installCommand: 'pnpm install'
      }
    });

    console.log(`✅ Deployment created: ${deployment.url}`);
    console.log(`📊 Deployment ID: ${deployment.id}`);

    // Wait for deployment to complete
    let status = 'BUILDING';
    while (status === 'BUILDING' || status === 'QUEUED') {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const deploymentStatus = await vercel.deployments.getDeployment({
        idOrUrl: deployment.id
      });

      status = deploymentStatus.readyState;
      console.log(`📈 Deployment status: ${status}`);
    }

    if (status === 'READY') {
      console.log('🎉 Deployment successful!');
      return deployment;
    } else {
      console.log('❌ Deployment failed');
      throw new Error(`Deployment failed with status: ${status}`);
    }

  } catch (error) {
    console.error('💥 Deployment error:', error.message);
    throw error;
  }
}

export { deployProject };
