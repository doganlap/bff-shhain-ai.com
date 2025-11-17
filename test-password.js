const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('Testing password for admin@demo.com...');
    
    const user = await prisma.users.findFirst({
      where: { email: 'admin@demo.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      tenant_id: user.tenant_id,
      hasPasswordHash: !!user.password_hash
    });
    
    if (user.password_hash) {
      console.log('Password hash exists, length:', user.password_hash.length);
      
      // Test the password
      const testPassword = 'Admin@123';
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('Password "Admin@123" valid:', isValid);
      
      if (!isValid) {
        // Try some other common passwords
        const altPasswords = ['admin123', 'Admin123', 'admin@123', 'Demo@123'];
        for (const pwd of altPasswords) {
          const valid = await bcrypt.compare(pwd, user.password_hash);
          if (valid) {
            console.log(`Password "${pwd}" is valid!`);
            break;
          }
        }
      }
    } else {
      console.log('No password hash found for user');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();