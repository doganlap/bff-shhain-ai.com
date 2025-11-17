const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function comprehensiveDebug() {
  try {
    console.log('=== COMPREHENSIVE DEBUG ===');
    
    // Test the exact same logic as the auth endpoint
    const email = 'admin@demo.com';
    const password = 'Admin@123';
    
    console.log('1. Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    console.log('\n2. Looking up user:', email.toLowerCase());
    const user = await prisma.users.findFirst({ 
      where: { email: email.toLowerCase() } 
    });
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      tenant_id: user.tenant_id,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });
    
    if (!user || !user.password_hash) {
      console.log('❌ User not found or no password hash');
      return;
    }
    
    console.log('\n3. Testing bcrypt comparison...');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password_hash);
    console.log('Hash starts with:', user.password_hash.substring(0, 10));
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('\n4. Testing alternative passwords...');
      const altPasswords = ['admin123', 'Admin123', 'admin@123', 'Demo@123', 'demo123'];
      for (const pwd of altPasswords) {
        const valid = await bcrypt.compare(pwd, user.password_hash);
        if (valid) {
          console.log(`✅ Password "${pwd}" is valid!`);
          break;
        }
      }
      
      console.log('\n5. Testing bcrypt versions...');
      console.log('bcrypt version:', bcrypt.version);
      console.log('bcryptjs info:', {
        compare: typeof bcrypt.compare,
        hash: typeof bcrypt.hash,
        genSalt: typeof bcrypt.genSalt
      });
      
      console.log('\n6. Creating new hash for comparison...');
      const newHash = await bcrypt.hash(password, 12);
      console.log('New hash for "Admin@123":', newHash);
      console.log('New hash valid:', await bcrypt.compare(password, newHash));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveDebug();