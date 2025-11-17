const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('Debugging auth issue...');
    
    // Test the exact same logic as the auth endpoint
    const email = 'admin@demo.com';
    const password = 'Admin@123';
    
    console.log('Looking up user with email:', email.toLowerCase());
    const user = await prisma.users.findFirst({ 
      where: { email: email.toLowerCase() } 
    });
    
    console.log('User lookup result:', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      hasPasswordHash: !!user?.password_hash
    });
    
    if (!user || !user.password_hash) {
      console.log('User not found or no password hash');
      return;
    }
    
    console.log('Comparing passwords...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result:', isValid);
    
    if (isValid) {
      console.log('✅ Password is valid!');
    } else {
      console.log('❌ Password is invalid');
      
      // Let's also check if the hash was created with a different bcrypt version
      console.log('Password hash details:');
      console.log('- Hash:', user.password_hash);
      console.log('- Hash starts with:', user.password_hash.substring(0, 10));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();