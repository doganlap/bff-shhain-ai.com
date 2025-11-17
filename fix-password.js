const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswordHash() {
  try {
    console.log('Fixing password hash for admin@demo.com...');
    
    // Generate the correct password hash
    const correctPassword = 'Admin@123';
    const correctHash = await bcrypt.hash(correctPassword, 12);
    console.log('Generated correct hash:', correctHash);
    console.log('Hash length:', correctHash.length);
    
    // Update the user with the correct hash
    const updatedUser = await prisma.users.update({
      where: { 
        tenant_id_email: {
          tenant_id: 'tenant-001',
          email: 'admin@demo.com'
        }
      },
      data: { password_hash: correctHash }
    });
    
    console.log('Updated user:', {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role
    });
    
    // Verify the update
    const user = await prisma.users.findFirst({
      where: { email: 'admin@demo.com' }
    });
    
    console.log('Verification:');
    console.log('- Password hash length:', user.password_hash.length);
    console.log('- Password valid:', await bcrypt.compare('Admin@123', user.password_hash));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordHash();