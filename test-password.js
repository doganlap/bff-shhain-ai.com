const bcrypt = require('bcryptjs');
const prisma = require('./db/prisma');

async function testPassword() {
  try {
    const user = await prisma.users.findFirst({
      where: { email: 'admin@demo.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Testing password comparison...');
    console.log('Password hash:', user.password_hash);
    
    // Test the password
    const isValid = await bcrypt.compare('Admin@123', user.password_hash);
    console.log('Password valid:', isValid);
    
    // Test with different variations
    const variations = ['Admin@123', 'admin@123', 'Admin123', 'admin123'];
    for (const pwd of variations) {
      const valid = await bcrypt.compare(pwd, user.password_hash);
      console.log(`Password '${pwd}': ${valid}`);
    }
    
  } catch (error) {
    console.error('Error testing password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();