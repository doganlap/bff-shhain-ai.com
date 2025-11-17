const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function registerIngramMicroTenant() {
  try {
    console.log('🚀 Registering IngramMicro tenant and user...');
    
    // First, check existing tenant types
    const existingTenants = await prisma.tenants.findMany();
    console.log('Existing tenant types:');
    existingTenants.forEach(t => {
      console.log(`- ${t.display_name} (type: ${t.type}, status: ${t.status})`);
    });
    
    // Generate unique IDs
    const tenantId = uuidv4();
    const userId = uuidv4();
    
    // Hash password
    const password = 'IngramMicro2025!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create tenant with valid type (use 'partner' or 'demo' based on existing data)
    const tenant = await prisma.tenants.create({
      data: {
        id: tenantId,
        slug: 'ingrammicro',
        display_name: 'IngramMicro',
        type: 'partner', // Using valid type from existing tenants
        status: 'active',
        country: 'USA',
        sector: 'Technology Distribution',
        metadata: JSON.stringify({
          plan: 'enterprise',
          users: 50,
          features: ['full-access', 'api-integration', 'advanced-analytics'],
          company: 'Ingram Micro Inc.',
          website: 'https://www.ingrammicro.com'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ Tenant created:', tenant.display_name);
    
    // Create user
    const user = await prisma.users.create({
      data: {
        id: userId,
        email: 'Albraraa@ingrammicro.com',
        password_hash: hashedPassword,
        full_name: 'Albraraa',
        role: 'admin',
        tenant_id: tenantId,
        status: 'active',
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
    
    console.log('✅ User created:', user.email);
    
    // Create default organization for the tenant
    const orgId = uuidv4();
    const organization = await prisma.organizations.create({
      data: {
        id: orgId,
        name: 'IngramMicro Corporate',
        tenant_id: tenantId,
        type: 'enterprise',
        status: 'active',
        metadata: JSON.stringify({
          size: 'large',
          industry: 'Technology Distribution',
          headquarters: 'Irvine, California',
          employees: 15000
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ Organization created:', organization.name);
    
    // Create default license for the tenant
    const licenseId = uuidv4();
    const license = await prisma.licenses.create({
      data: {
        id: licenseId,
        name: 'IngramMicro Enterprise License',
        type: 'enterprise',
        status: 'active',
        tenant_id: tenantId,
        organization_id: orgId,
        user_id: userId,
        max_users: 50,
        max_organizations: 10,
        max_assessments: 1000,
        features: JSON.stringify([
          'full-dashboard',
          'risk-management',
          'compliance-tracking',
          'assessment-tools',
          'api-access',
          'advanced-reports',
          'multi-tenant',
          'custom-branding'
        ]),
        expires_at: new Date('2025-12-31T23:59:59Z'),
        metadata: JSON.stringify({
          plan: 'enterprise',
          support_level: 'premium',
          onboarding: 'complete'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ License created:', license.name);
    
    console.log('\n🎉 IngramMicro setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: Albraraa@ingrammicro.com');
    console.log('   Password: IngramMicro2025!');
    console.log('   Tenant: IngramMicro');
    console.log('   Role: Admin');
    
    return {
      tenant,
      user,
      organization,
      license
    };
    
  } catch (error) {
    console.error('❌ Error registering IngramMicro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the registration
registerIngramMicroTenant()
  .then(result => {
    console.log('\n✅ Registration process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Registration failed:', error);
    process.exit(1);
  });