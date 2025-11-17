const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function completeIngramMicroSetup() {
  try {
    // Get the existing IngramMicro tenant
    const tenant = await prisma.tenants.findUnique({
      where: { slug: 'ingrammicro' }
    });

    if (!tenant) {
      console.log('❌ IngramMicro tenant not found');
      return;
    }

    console.log('✅ Found IngramMicro tenant:', tenant.id);

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { 
        tenant_id: tenant.id,
        email: 'Albraraa@ingrammicro.com'
      }
    });

    let user;
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.id);
      user = existingUser;
    } else {
      // Create user with hashed password
      const hashedPassword = await bcrypt.hash('IngramMicro2025!', 10);
      
      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          email: 'Albraraa@ingrammicro.com',
          password_hash: hashedPassword,
          full_name: 'Albraraa',
          role: 'admin',
          tenant_id: tenant.id,
          metadata: JSON.stringify({
            department: 'IT Security',
            position: 'GRC Administrator',
            phone: '+1-555-0123',
            timezone: 'America/New_York'
          }),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created user:', user.id);
    }

    // Check if organization already exists
    const existingOrg = await prisma.organizations.findFirst({
      where: { tenant_id: tenant.id }
    });

    let organization;
    if (existingOrg) {
      console.log('✅ Organization already exists:', existingOrg.id);
      organization = existingOrg;
    } else {
      // Create organization
      organization = await prisma.organizations.create({
        data: {
          id: crypto.randomUUID(),
          tenant_id: tenant.id,
          name: 'Ingram Micro Inc.',
          sector: 'Technology Distribution',
          country: 'USA',
          contact_email: 'Albraraa@ingrammicro.com',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created organization:', organization.id);
    }

    // Check if license already exists
    const existingLicense = await prisma.licenses.findFirst({
      where: { tenant_id: tenant.id }
    });

    let license;
    if (existingLicense) {
      console.log('✅ License already exists:', existingLicense.id);
      license = existingLicense;
    } else {
      // Create enterprise license
      license = await prisma.licenses.create({
        data: {
          id: crypto.randomUUID(),
          tenant_id: tenant.id,
          license_key: 'INGRAM-ENT-2025-' + crypto.randomUUID().substring(0, 8).toUpperCase(),
          plan_type: 'enterprise',
          seats: 50,
          status: 'active',
          expiry_date: new Date('2026-12-31T23:59:59Z'),
          features: JSON.stringify({
            'full-access': true,
            'api-integration': true,
            'advanced-analytics': true,
            'custom-branding': true,
            'priority-support': true,
            'unlimited-assessments': true,
            'advanced-reporting': true,
            'multi-language-support': true
          }),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created license:', license.id);
    }

    // Note: Users are not directly linked to organizations in this schema
    console.log('✅ User setup completed (no direct organization link in schema)');

    console.log('\n🎉 IngramMicro setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: Albraraa@ingrammicro.com');
    console.log('Password: IngramMicro2025!');
    console.log('\n🔗 Tenant Details:');
    console.log('Tenant ID:', tenant.id);
    console.log('Organization ID:', organization.id);
    console.log('License ID:', license.id);
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('❌ Error completing setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeIngramMicroSetup();