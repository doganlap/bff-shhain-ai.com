const prisma = require('./db/prisma');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
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
    
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.full_name}) - Role: ${user.role}, Tenant: ${user.tenant_id}`);
    });
    
    // Check specific admin user
    const adminUser = await prisma.users.findFirst({
      where: { email: 'admin@demo.com' }
    });
    
    if (adminUser) {
      console.log('\nAdmin user found:', adminUser.email);
      console.log('Password hash exists:', !!adminUser.password_hash);
    } else {
      console.log('\nAdmin user NOT found');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();