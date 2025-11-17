const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIngramMicroStatus() {
  try {
    // Check if IngramMicro tenant exists
    const tenant = await prisma.tenants.findUnique({
      where: { slug: 'ingrammicro' }
    });

    if (tenant) {
      console.log('✅ IngramMicro tenant found:');
      console.log('ID:', tenant.id);
      console.log('Display Name:', tenant.display_name);
      console.log('Type:', tenant.type);
      console.log('Status:', tenant.status);
      console.log('Created:', tenant.created_at);
      
      // Check if user exists for this tenant
      const user = await prisma.users.findFirst({
        where: { 
          tenant_id: tenant.id,
          email: 'Albraraa@ingrammicro.com'
        }
      });

      if (user) {
        console.log('\n✅ User found:');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Full Name:', user.full_name);
        console.log('Role:', user.role);
        console.log('Status:', user.status);
      } else {
        console.log('\n❌ User Albraraa@ingrammicro.com not found for this tenant');
        console.log('Need to create user for existing tenant');
      }

      // Check organization
      const organization = await prisma.organizations.findFirst({
        where: { tenant_id: tenant.id }
      });

      if (organization) {
        console.log('\n✅ Organization found:');
        console.log('ID:', organization.id);
        console.log('Name:', organization.name);
        console.log('Type:', organization.type);
      } else {
        console.log('\n❌ Organization not found for this tenant');
      }

      // Check license
      const license = await prisma.licenses.findFirst({
        where: { tenant_id: tenant.id }
      });

      if (license) {
        console.log('\n✅ License found:');
        console.log('ID:', license.id);
        console.log('Type:', license.type);
        console.log('Status:', license.status);
        console.log('Users Limit:', license.users_limit);
        console.log('Orgs Limit:', license.organizations_limit);
      } else {
        console.log('\n❌ License not found for this tenant');
      }

    } else {
      console.log('❌ IngramMicro tenant not found');
      console.log('Need to create complete tenant setup');
    }

  } catch (error) {
    console.error('Error checking status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIngramMicroStatus();