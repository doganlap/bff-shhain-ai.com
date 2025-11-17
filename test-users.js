const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if users table exists and has data
    const userCount = await prisma.users.count();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          tenant_id: true,
          created_at: true
        }
      });
      console.log('Users found:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.full_name || 'No name'}) - Role: ${user.role}, Tenant: ${user.tenant_id}`);
      });
    } else {
      console.log('No users found in database');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();