const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testIngramMicroLogin() {
  try {
    console.log('🧪 Testing IngramMicro login credentials...\n');
    
    // Find the user
    const user = await prisma.users.findFirst({
      where: { 
        email: 'Albraraa@ingrammicro.com'
      },
      include: {
        tenants: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Full Name:', user.full_name);
    console.log('  Role:', user.role);
    console.log('  Tenant:', user.tenants.display_name);
    console.log('  Tenant Type:', user.tenants.type);
    console.log('  Tenant Status:', user.tenants.status);

    // Test password
    const testPassword = 'IngramMicro2025!';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isPasswordValid) {
      console.log('\n✅ Password verification: SUCCESS');
      console.log('\n🎉 Login credentials are working correctly!');
      console.log('\n📋 Summary:');
      console.log('  Tenant: IngramMicro (Partner)');
      console.log('  User: Albraraa@ingrammicro.com');
      console.log('  Password: IngramMicro2025!');
      console.log('  Role: Admin');
      console.log('  Status: Active');
    } else {
      console.log('\n❌ Password verification: FAILED');
      console.log('  The stored password hash does not match the expected password');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIngramMicroLogin();