const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserLookup() {
  try {
    console.log('Testing user lookup...');
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if user exists
    const user = await prisma.users.findFirst({ 
      where: { email: 'admin@demo.com' } 
    });
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash ? user.password_hash.length : 0
      });
      
      // Test bcrypt comparison
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('Admin@123', user.password_hash);
      console.log('✅ Password comparison result:', isValid);
      
    } else {
      console.log('❌ User not found');
      
      // List all users
      const allUsers = await prisma.users.findMany({
        select: { id: true, email: true, role: true }
      });
      console.log('Available users:', allUsers);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUserLookup();