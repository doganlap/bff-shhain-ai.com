const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductionConnection() {
  try {
    console.log('🌐 Testing production database connection...');
    const result = await prisma.$queryRaw`SELECT current_database(), version(), now()`;
    console.log('✅ Production database connected:', result[0]);
    
    const controlCount = await prisma.grc_controls.count();
    console.log('📊 Total controls in production:', controlCount);
    
    await prisma.$disconnect();
    console.log('✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Production database connection failed:', error.message);
    process.exit(1);
  }
}

testProductionConnection();