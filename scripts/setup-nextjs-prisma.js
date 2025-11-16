#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const PROJECT_NAME = 'my-prisma-postgres-app';
const PROJECT_PATH = join(process.cwd(), PROJECT_NAME);

function runCommand(command, options = {}) {
  try {
    console.log(`🔄 Running: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      ...options
    });
    console.log(`✅ Completed: ${command}\n`);
    return result;
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    console.error(`Error: ${error.message}\n`);
    throw error;
  }
}

async function setupNextjsPrismaProject() {
  try {
    console.log('🚀 Setting up Next.js project with Prisma Postgres\n');

    // Step 1: Create Next.js project with Prisma Postgres template
    console.log('📦 Step 1: Creating Next.js project with Prisma template...');

    if (existsSync(PROJECT_PATH)) {
      console.log(`⚠️  Directory ${PROJECT_NAME} already exists. Removing it...`);
      runCommand(`rmdir /s /q "${PROJECT_NAME}"`, { stdio: 'inherit' });
    }

    runCommand(`npx create-next-app@latest --template prisma-postgres ${PROJECT_NAME}`, {
      stdio: 'inherit'
    });

    // Navigate to project directory for subsequent commands
    process.chdir(PROJECT_PATH);
    console.log(`📁 Changed directory to: ${PROJECT_PATH}\n`);

    // Step 2: Install dependencies
    console.log('📦 Step 2: Installing dependencies...');
    runCommand('npm install');

    // Step 3: Connect Vercel project
    console.log('🔗 Step 3: Connecting to Vercel...');
    console.log('💡 Note: You may need to authenticate with Vercel first');
    console.log('   Run: vercel login (if not already logged in)');

    try {
      runCommand('vercel link');
    } catch (error) {
      console.log('⚠️  Vercel link failed. You may need to:');
      console.log('   1. Run "vercel login" first');
      console.log('   2. Ensure you have the correct permissions');
      console.log('   3. Manually run "vercel link" in the project directory');
      console.log('\n📝 Continuing with other setup steps...\n');
    }

    // Step 4: Pull environment variables
    console.log('🔧 Step 4: Pulling environment variables from Vercel...');
    try {
      runCommand('vercel env pull .env.development.local');
    } catch (error) {
      console.log('⚠️  Failed to pull environment variables. You may need to:');
      console.log('   1. Complete the Vercel link step first');
      console.log('   2. Ensure your Vercel project has a DATABASE_URL configured');
      console.log('   3. Manually run "vercel env pull .env.development.local"');
      console.log('\n📝 Continuing with other setup steps...\n');
    }

    // Step 5: Run Prisma migrations
    console.log('🗄️  Step 5: Setting up database schema...');
    try {
      runCommand('npx prisma migrate dev --name init');
    } catch (error) {
      console.log('⚠️  Database migration failed. You may need to:');
      console.log('   1. Ensure DATABASE_URL is properly configured');
      console.log('   2. Check your database connection');
      console.log('   3. Manually run "npx prisma migrate dev --name init"');
      console.log('\n📝 Continuing with seeding...\n');
    }

    // Step 6: Seed the database
    console.log('🌱 Step 6: Seeding the database...');
    try {
      runCommand('npx prisma db seed');
    } catch (error) {
      console.log('⚠️  Database seeding failed. You may need to:');
      console.log('   1. Ensure the migration completed successfully');
      console.log('   2. Check your database connection');
      console.log('   3. Manually run "npx prisma db seed"');
      console.log('\n📝 Continuing with deployment...\n');
    }

    // Step 7: Deploy to Vercel
    console.log('🚀 Step 7: Deploying to Vercel...');
    try {
      runCommand('vercel deploy');
      console.log('\n🎉 Deployment initiated! Check your Vercel dashboard for status.');
    } catch (error) {
      console.log('⚠️  Deployment failed. You can manually deploy by running:');
      console.log('   vercel deploy');
      console.log('\nAlternatively, push your code to GitHub and enable automatic deployments.');
    }

    console.log('\n✅ Setup completed!');
    console.log('\n📋 Next steps:');
    console.log(`   1. cd ${PROJECT_NAME}`);
    console.log('   2. npm run dev (to start development server)');
    console.log('   3. Check your Vercel dashboard for deployment status');
    console.log('   4. Visit your deployed app URL');

    console.log('\n🔧 Useful commands:');
    console.log('   • npm run dev          - Start development server');
    console.log('   • npx prisma studio    - Open Prisma Studio');
    console.log('   • vercel --prod        - Deploy to production');
    console.log('   • npx prisma generate  - Regenerate Prisma client');

  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. npx create-next-app@latest --template prisma-postgres my-prisma-postgres-app');
    console.log('2. cd my-prisma-postgres-app');
    console.log('3. npm install');
    console.log('4. vercel link');
    console.log('5. vercel env pull .env.development.local');
    console.log('6. npx prisma migrate dev --name init');
    console.log('7. npx prisma db seed');
    console.log('8. vercel deploy');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupNextjsPrismaProject();
}

export { setupNextjsPrismaProject };
