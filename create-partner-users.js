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

async function createDoganConsultUsers() {
  try {
    console.log('Creating Dogan Consult partner users...');

    // Get or create Dogan Consult tenant
    let doganTenant = await prisma.tenants.findFirst({
      where: { slug: 'dogan-consult' }
    });

    if (!doganTenant) {
      console.log('Creating Dogan Consult tenant...');
      doganTenant = await prisma.tenants.create({
        data: {
          id: randomUUID(),
          slug: 'dogan-consult',
          display_name: 'Dogan Consult',
          type: 'partner',
          status: 'active',
          country: 'AE',
          sector: 'consulting',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Dogan Consult tenant created:', doganTenant.id);
    } else {
      console.log('Using existing Dogan Consult tenant:', doganTenant.id);
    }

    // Check if Ahmet Dogan exists
    const ahmetExists = await prisma.users.findFirst({
      where: { email: 'ahmet@doganconsult.com' }
    });

    if (!ahmetExists) {
      // Create Ahmet Dogan (CEO)
      const ahmetPassword = await bcrypt.hash('DoganCEO2025!', 12);
      const ahmetUser = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: 'ahmet@doganconsult.com',
          password_hash: ahmetPassword,
          full_name: 'Ahmet Dogan',
          role: 'partner-admin',
          tenant_id: doganTenant.id,
          is_partner: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Ahmet Dogan (CEO) created:', ahmetUser.email);
    } else {
      console.log('ℹ️  Ahmet Dogan already exists');
    }

    // Check if Amr Elsayed exists
    const amrExists = await prisma.users.findFirst({
      where: { email: 'amr@doganconsult.com' }
    });

    if (!amrExists) {
      // Create Amr Elsayed (CFO)
      const amrPassword = await bcrypt.hash('DoganCFO2025!', 12);
      const amrUser = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: 'amr@doganconsult.com',
          password_hash: amrPassword,
          full_name: 'Amr Elsayed',
          role: 'partner-admin',
          tenant_id: doganTenant.id,
          is_partner: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Amr Elsayed (CFO) created:', amrUser.email);
    } else {
      console.log('ℹ️  Amr Elsayed already exists');
    }

    console.log('\n🎉 Dogan Consult partner users created successfully!');
    console.log('\n📧 Partner Credentials:');
    console.log('Ahmet Dogan (CEO):');
    console.log('  Email: ahmet@doganconsult.com');
    console.log('  Password: DoganCEO2025!');
    console.log('');
    console.log('Amr Elsayed (CFO):');
    console.log('  Email: amr@doganconsult.com');
    console.log('  Password: DoganCFO2025!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDoganConsultUsers();