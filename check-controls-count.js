const { PrismaClient } = require('@prisma/client');

async function checkControlsCount() {
  const prisma = new PrismaClient();
  
  try {
    // Check GRC controls count
    const controlsCount = await prisma.grc_controls.count();
    console.log(`🛡️ GRC CONTROLS: ${controlsCount} controls found`);
    
    // Check frameworks count
    const frameworksCount = await prisma.grc_frameworks.count();
    console.log(`📋 GRC FRAMEWORKS: ${frameworksCount} frameworks found`);
    
    // Check tenants count
    const tenantsCount = await prisma.tenants.count();
    console.log(`🏢 TENANTS: ${tenantsCount} tenants found`);
    
    // Check users count
    const usersCount = await prisma.users.count();
    console.log(`👥 USERS: ${usersCount} users found`);
    
    console.log('\n✅ Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkControlsCount();