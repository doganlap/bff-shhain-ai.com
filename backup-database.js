/**
 * DATABASE BACKUP SCRIPT
 * Pulls all data from production database and saves to JSON files
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('🚀 Starting database backup...\n');

  const backupDir = path.join(__dirname, 'backup', new Date().toISOString().split('T')[0]);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [
    'tenants',
    'users',
    'organizations',
    'organization_profiles',
    'grc_frameworks',
    'assessments',
    'assessment_controls',
    'control_evidence',
    'grc_controls',
    'framework_controls',
    'tasks',
    'notifications',
    'activity_logs',
    'audit_logs',
    'licenses',
    'subscriptions'
  ];

  let totalRecords = 0;

  for (const table of tables) {
    try {
      console.log(`📦 Backing up ${table}...`);

      // Use raw query to get all data
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`);

      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      console.log(`   ✅ Saved ${data.length} records to ${table}.json`);
      totalRecords += data.length;

    } catch (error) {
      console.error(`   ❌ Error backing up ${table}:`, error.message);
    }
  }

  console.log(`\n✅ Backup complete!`);
  console.log(`📁 Location: ${backupDir}`);
  console.log(`📊 Total records: ${totalRecords}`);

  await prisma.$disconnect();
}

backupDatabase().catch(console.error);
