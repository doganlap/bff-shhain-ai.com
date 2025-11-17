const prisma = require('./db/prisma');

async function checkPartnerSetup() {
  try {
    console.log('Checking partner setup...');
    
    // Check if partner user exists
    const partnerUser = await prisma.users.findFirst({
      where: {
        is_partner: true
      },
      include: {
        tenants: true
      }
    });
    
    if (partnerUser) {
      console.log(`Found partner user: ${partnerUser.email}`);
      console.log(`- Partner: ${partnerUser.is_partner}`);
      console.log(`- Role: ${partnerUser.role}`);
      console.log(`- Tenant ID: ${partnerUser.tenant_id}`);
      console.log(`- Tenant type: ${partnerUser.tenants?.type}`);
      console.log(`- Tenant status: ${partnerUser.tenants?.status}`);
      console.log(`- Has password: ${!!partnerUser.password_hash}`);
    } else {
      console.log('No partner user found with is_partner=true');
    }
    
    // Check all users
    const allUsers = await prisma.users.findMany({
      select: {
        email: true,
        role: true,
        is_partner: true,
        tenant_id: true,
        password_hash: true
      }
    });
    
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (role: ${user.role}, partner: ${user.is_partner}, has pwd: ${!!user.password_hash})`);
    });
    
    // Check tenants
    const tenants = await prisma.tenants.findMany({
      select: {
        id: true,
        slug: true,
        type: true,
        status: true
      }
    });
    
    console.log('\nAll tenants:');
    tenants.forEach(tenant => {
      console.log(`- ${tenant.slug} (type: ${tenant.type}, status: ${tenant.status})`);
    });
    
  } catch (error) {
    console.error('Error checking partner setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerSetup();