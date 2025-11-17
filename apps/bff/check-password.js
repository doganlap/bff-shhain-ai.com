const prisma = require('./db/prisma');
const bcrypt = require('bcryptjs');

async function checkUserPassword() {
  try {
    console.log('Checking user password details...');
    
    // Get the partner user with password hash
    const user = await prisma.users.findFirst({
      where: { email: 'partner@test.com' }
    });
    
    if (user) {
      console.log(`User found: ${user.email}`);
      console.log(`Password hash exists: ${!!user.password_hash}`);
      console.log(`Password hash length: ${user.password_hash ? user.password_hash.length : 0}`);
      console.log(`Role: ${user.role}`);
      console.log(`Tenant ID: ${user.tenant_id}`);
      
      // Test with a common password
      const testPassword = 'password123';
      if (user.password_hash) {
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        console.log(`Password 'password123' is valid: ${isValid}`);
        
        if (!isValid) {
          // Try other common passwords
          const commonPasswords = ['test123', 'Test123!', 'partner123', 'admin123'];
          for (const pwd of commonPasswords) {
            const valid = await bcrypt.compare(pwd, user.password_hash);
            if (valid) {
              console.log(`Password '${pwd}' is valid!`);
              break;
            }
          }
        }
      }
    } else {
      console.log('No user found with email partner@test.com');
    }
    
  } catch (error) {
    console.error('Error checking user password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPassword();