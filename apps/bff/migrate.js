require('dotenv').config({ path: '.env.migration' });
const { PrismaClient } = require('@prisma/client');

// --- Configuration ---
const oldDbUrl = process.env.OLD_DATABASE_URL;
const newDbUrl = process.env.POSTGRES_PRISMA_URL;

// --- Prisma Clients ---
const oldPrisma = new PrismaClient({ datasources: { db: { url: oldDbUrl } } });
const newPrisma = new PrismaClient({ datasources: { db: { url: newDbUrl } } });

async function main() {
  console.log('Starting data migration...');

  try {
    // --- Transfer Data ---
    console.log('Migrating Organizations...');
    const organizations = await oldPrisma.organization.findMany();
    await newPrisma.organization.createMany({ data: organizations, skipDuplicates: true });

    console.log('Migrating Users...');
    const users = await oldPrisma.user.findMany();
    await newPrisma.user.createMany({ data: users, skipDuplicates: true });

    console.log('Migrating Frameworks...');
    const frameworks = await oldPrisma.framework.findMany();
    await newPrisma.framework.createMany({ data: frameworks, skipDuplicates: true });

    console.log('Migrating Controls...');
    const controls = await oldPrisma.control.findMany();
    await newPrisma.control.createMany({ data: controls, skipDuplicates: true });

    console.log('Migrating Risks...');
    const risks = await oldPrisma.risk.findMany();
    await newPrisma.risk.createMany({ data: risks, skipDuplicates: true });

    console.log('Migrating Assessments...');
    const assessments = await oldPrisma.assessment.findMany();
    await newPrisma.assessment.createMany({ data: assessments, skipDuplicates: true });

    console.log('Migrating Evidence...');
    const evidence = await oldPrisma.evidence.findMany();
    await newPrisma.evidence.createMany({ data: evidence, skipDuplicates: true });

    console.log('Migrating Audit Logs...');
    const auditLogs = await oldPrisma.auditLog.findMany();
    await newPrisma.auditLog.createMany({ data: auditLogs, skipDuplicates: true });


    console.log('\n✅ Data migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

main();
