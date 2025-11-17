/**
 * Fix production password hashes
 * Run this script locally to update the production database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // This should point to your production database
    }
  }
});

async function fixPasswords() {
  try {
    console.log('Fixing production password hashes...');
    
    // Fix admin password
    const adminHash = await bcrypt.hash('Admin@123', 12);
    console.log('Generated admin hash (length):', adminHash.length);
    
    const adminResult = await prisma.users.updateMany({
      where: { email: 'admin@grc.com' },
      data: { password_hash: adminHash }
    });
    console.log('Admin update result:', adminResult);
    
    // Fix partner password
    const partnerHash = await bcrypt.hash('Partner@123', 12);
    console.log('Generated partner hash (length):', partnerHash.length);
    
    const partnerResult = await prisma.users.updateMany({
      where: { email: 'partner@grc.com' },
      data: { password_hash: partnerHash }
    });
    console.log('Partner update result:', partnerResult);
    
    console.log('✅ Password hashes fixed successfully!');
    
    // Verify the updates
    const users = await prisma.users.findMany({
      where: { email: { in: ['admin@grc.com', 'partner@grc.com'] } },
      select: { email: true, password_hash: true }
    });
    
    users.forEach(user => {
      console.log(`${user.email}: hash length = ${user.password_hash.length}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  fixPasswords();
} else {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please set DATABASE_URL to your production database URL');
}