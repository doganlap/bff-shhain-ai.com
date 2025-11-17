const prisma = require('./db/prisma');
const bcrypt = require('bcryptjs');

async function findPartnerPassword() {
  try {
    console.log('Finding partner user password...');
    
    // Get the partner user
    const user = await prisma.users.findFirst({
      where: { email: 'partner@test.com' }
    });
    
    if (!user || !user.password_hash) {
      console.log('Partner user not found or no password hash');
      return;
    }
    
    console.log(`Found partner user: ${user.email}`);
    console.log(`Password hash exists: ${user.password_hash.length} characters`);
    
    // Test common passwords
    const commonPasswords = [
      'password123', 'test123', 'Test123!', 'partner123', 'admin123',
      'partner', 'test', '123456', 'password', 'Partner123', 'Test123',
      'partner@test.com', 'testpartner', 'grc123', 'shahin123'
    ];
    
    for (const password of commonPasswords) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid) {
        console.log(`✅ Found password: "${password}"`);
        return;
      }
    }
    
    console.log('❌ No common password found');
    
  } catch (error) {
    console.error('Error finding password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findPartnerPassword();