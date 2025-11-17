const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgres://38452a313303a24baeddfbfe8046678d396610943c9b34e65432968f33793f7f:sk_ziZoE_g62VBpHvM3Nv6C7@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
});

async function checkAndCreateDemoUser() {
  try {
    // Check existing users
    console.log('Checking existing users...');
    const users = await prisma.users.findMany({
      select: { id: true, email: true, role: true, tenant_id: true }
    });

    console.log('Existing users:');
    console.log(JSON.stringify(users, null, 2));

    // Check if demo user exists
    const demoUser = await prisma.users.findFirst({
      where: { email: 'demo@shahin-ai.com' }
    });

    if (demoUser) {
      console.log('Demo user already exists:', demoUser.email);
      return;
    }

    // Get or create a tenant
    let tenant = await prisma.tenants.findFirst();
    if (!tenant) {
      console.log('Creating demo tenant...');
      tenant = await prisma.tenants.create({
        data: {
          id: '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
          name: 'Demo Organization',
          domain: 'demo.shahin-ai.com',
          status: 'active',
          tier: 'enterprise',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('demo123', 12);

    // Create demo user
    console.log('Creating demo user...');
    const newUser = await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'demo@shahin-ai.com',
        password_hash: passwordHash,
        role: 'admin',
        tenant_id: tenant.id,
        full_name: 'Demo User',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('Demo user created successfully:', {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenant_id: newUser.tenant_id
    });

    // Test login credentials
    console.log('\nDemo credentials:');
    console.log('Email: demo@shahin-ai.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateDemoUser();
