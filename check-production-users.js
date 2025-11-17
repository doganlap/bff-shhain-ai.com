/**
 * Check what users exist in production database
 */

const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:shahin123@db.xkplcimcnwdklfdnngtd.supabase.co:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in production database...');
    
    const users = await prisma.users.findMany({
      select: { 
        id: true, 
        email: true, 
        role: true, 
        password_hash: true,
        created_at: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`
📧 ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${!!user.password_hash}`);
      console.log(`   Hash Length: ${user.password_hash ? user.password_hash.length : 0}`);
      console.log(`   Created: ${user.created_at}`);
      if (user.password_hash) {
        console.log(`   Hash Preview: ${user.password_hash.substring(0, 30)}...`);
      }
    });
    
    // Check specific users
    const adminUser = await prisma.users.findFirst({ where: { email: 'admin@grc.com' } });
    const partnerUser = await prisma.users.findFirst({ where: { email: 'partner@grc.com' } });
    
    console.log('\n🔍 Specific user checks:');
    console.log('Admin user found:', !!adminUser);
    console.log('Partner user found:', !!partnerUser);
    
    if (adminUser) {
      console.log('Admin user ID:', adminUser.id);
      console.log('Admin hash length:', adminUser.password_hash ? adminUser.password_hash.length : 0);
    }
    
    if (partnerUser) {
      console.log('Partner user ID:', partnerUser.id);
      console.log('Partner hash length:', partnerUser.password_hash ? partnerUser.password_hash.length : 0);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();