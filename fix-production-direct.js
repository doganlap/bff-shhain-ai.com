/**
 * Simple password fix using existing BFF structure
 * This creates a direct database connection to fix the truncated password hashes
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the existing DATABASE_URL from the BFF environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:shahin123@db.xkplcimcnwdklfdnngtd.supabase.co:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function fixProductionPasswords() {
  try {
    console.log('🔧 Fixing production password hashes...');
    console.log('Database URL:', databaseUrl.substring(0, 50) + '...');
    
    // Generate correct bcrypt hashes (60 characters)
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const partnerHash = await bcrypt.hash('Partner@123', 12);
    
    console.log('Generated admin hash:', adminHash);
    console.log('Admin hash length:', adminHash.length);
    console.log('Generated partner hash:', partnerHash);
    console.log('Partner hash length:', partnerHash.length);
    
    // Update admin password
    const adminResult = await prisma.users.updateMany({
      where: { email: 'admin@grc.com' },
      data: { password_hash: adminHash }
    });
    console.log('✅ Admin password updated:', adminResult);
    
    // Update partner password
    const partnerResult = await prisma.users.updateMany({
      where: { email: 'partner@grc.com' },
      data: { password_hash: partnerHash }
    });
    console.log('✅ Partner password updated:', partnerResult);
    
    // Verify updates
    const users = await prisma.users.findMany({
      where: { email: { in: ['admin@grc.com', 'partner@grc.com'] } },
      select: { email: true, password_hash: true }
    });
    
    console.log('\n📋 Verification:');
    users.forEach(user => {
      console.log(`${user.email}: hash length = ${user.password_hash.length}`);
    });
    
    console.log('\n🎉 Production passwords fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProductionPasswords();