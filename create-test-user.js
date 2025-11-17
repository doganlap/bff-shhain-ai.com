const prisma = require('./db/prisma');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: 'testuser@example.com' }
    });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Get the first tenant
    const tenant = await prisma.tenants.findFirst();
    if (!tenant) {
      console.log('No tenant found, cannot create test user');
      return;
    }
    
    // Create test user with known password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const testUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: 'testuser@example.com',
        password_hash: passwordHash,
        full_name: 'Test User',
        role: 'user',
        tenant_id: tenant.id,
        is_partner: false,
        is_super_admin: false,
        metadata: {}
      }
    });
    
    console.log(`Test user created: ${testUser.email}`);
    console.log(`Password: password123`);
    console.log(`Role: ${testUser.role}`);
    console.log(`Tenant: ${testUser.tenant_id}`);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();