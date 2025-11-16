import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

const GRC_ENV_VARIABLES = [
  {
    key: 'DATABASE_URL',
    value: process.env.DATABASE_URL || '',
    environments: ['production', 'preview'],
    encrypt: true
  },
  {
    key: 'NEXTAUTH_SECRET',
    value: process.env.NEXTAUTH_SECRET || '',
    environments: ['production', 'preview'],
    encrypt: true
  },
  {
    key: 'NEXTAUTH_URL',
    value: process.env.NEXTAUTH_URL || 'https://your-domain.vercel.app',
    environments: ['production', 'preview']
  },
  {
    key: 'API_BASE_URL',
    value: 'https://your-api-domain.vercel.app',
    environments: ['production']
  },
  {
    key: 'API_BASE_URL',
    value: 'https://your-api-preview.vercel.app',
    environments: ['preview']
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    environments: ['production']
  },
  {
    key: 'NODE_ENV',
    value: 'development',
    environments: ['development']
  },
  {
    key: 'DEBUG',
    value: 'true',
    environments: ['development', 'preview']
  },
  {
    key: 'CORS_ORIGINS',
    value: 'https://your-domain.vercel.app,https://localhost:3000',
    environments: ['production', 'preview', 'development']
  }
];

async function setupEnvironmentVariables(projectNames) {
  try {
    console.log('🔧 Setting up environment variables...');

    for (const projectName of projectNames) {
      console.log(`\n📦 Configuring ${projectName}...`);

      for (const variable of GRC_ENV_VARIABLES) {
        const targets = variable.environments;

        try {
          await vercel.projects.createProjectEnv({
            idOrName: projectName,
            upsert: 'true',
            requestBody: {
              key: variable.key,
              value: variable.value,
              target: targets,
              type: variable.encrypt ? 'encrypted' : 'plain',
            },
          });

          console.log(`  ✅ Set ${variable.key} for [${targets.join(', ')}]`);
        } catch (error) {
          console.error(`  ❌ Failed to set ${variable.key}:`, error.message);
        }
      }

      // List current environment variables
      try {
        const envVars = await vercel.projects.filterProjectEnvs({
          idOrName: projectName,
        });

        console.log(`\n📋 Current environment variables for ${projectName}:`);
        envVars.envs.forEach(env => {
          console.log(`  • ${env.key} (${env.target?.join(', ') || 'all'})`);
        });
      } catch (error) {
        console.error(`❌ Failed to list env vars for ${projectName}:`, error.message);
      }
    }

  } catch (error) {
    console.error('💥 Environment setup error:', error.message);
    throw error;
  }
}

async function removeEnvironmentVariable(projectName, envKey, target = null) {
  try {
    // First get the environment variable ID
    const envVars = await vercel.projects.filterProjectEnvs({
      idOrName: projectName,
    });

    const envVar = envVars.envs.find(env =>
      env.key === envKey &&
      (!target || env.target?.includes(target))
    );

    if (!envVar) {
      console.log(`⚠️  Environment variable ${envKey} not found`);
      return;
    }

    await vercel.projects.removeProjectEnv({
      idOrName: projectName,
      id: envVar.id,
    });

    console.log(`🗑️  Removed ${envKey} from ${projectName}`);
  } catch (error) {
    console.error(`❌ Failed to remove ${envKey}:`, error.message);
  }
}

export { setupEnvironmentVariables, removeEnvironmentVariable };
