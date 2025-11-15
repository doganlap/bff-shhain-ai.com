/**
 * IMPORT GRC TASKS FROM CSV
 * Imports 6,911 execution tasks into the database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

async function importTasks() {
  console.log('🚀 Starting GRC tasks import...\n');

  const csvPath = path.join(__dirname, '..', '..', '..', '..', 'grc_execution_tasks.csv');
  const tasks = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse CSV and map to database schema
        const description = row['Description'] || '';
        const descParts = description.split('\n\n');

        // Map priority
        const priorityMap = {
          'Critical': 'critical',
          'High': 'high',
          'Medium': 'medium',
          'Low': 'low'
        };
        const priority = priorityMap[row['Priority']] || 'medium';

        const task = {
          tenant_id: 'default',
          task_type: 'assessment',
          title: row['Summary'] || '',
          title_ar: descParts[1] || null,
          description: descParts[0] || '',
          description_ar: descParts[1] || null,
          control_id: row['Control ID'] || null,
          priority: priority,
          status: 'pending',
          assigned_to_name: row['Assignee'] || null,
          due_date: row['Due Date'] ? new Date(row['Due Date']) : null,
          // Store additional info in completion_notes for now
          completion_notes: JSON.stringify({
            section: row['Section'],
            frameworks: row['Frameworks'] ? row['Frameworks'].split(';').map(f => f.trim()) : [],
            domain: row['Domain'],
            labels: row['Labels'] ? row['Labels'].split(';').map(l => l.trim()) : [],
            evidence_types: row['Evidence (Min)'] ? row['Evidence (Min)'].split(';').map(e => e.trim()) : [],
            rice_score: row['RICE'] ? parseFloat(row['RICE']) : null,
            wsjf_score: row['WSJF'] ? parseFloat(row['WSJF']) : null,
            next_review: row['Next Review']
          }),
          created_at: new Date(),
          updated_at: new Date()
        };

        tasks.push(task);
      })
      .on('end', async () => {
        try {
          console.log(`📦 Parsed ${tasks.length} tasks from CSV`);
          console.log('💾 Inserting into database...\n');

          // Insert in batches of 500 to avoid memory issues
          const batchSize = 500;
          let imported = 0;

          for (let i = 0; i < tasks.length; i += batchSize) {
            const batch = tasks.slice(i, i + batchSize);

            await prisma.tasks.createMany({
              data: batch,
              skipDuplicates: true
            });

            imported += batch.length;
            console.log(`   ✅ Imported ${imported}/${tasks.length} tasks`);
          }

          console.log('\n✅ Import complete!');
          console.log(`📊 Total tasks imported: ${imported}`);

          await prisma.$disconnect();
          resolve();

        } catch (error) {
          console.error('❌ Error importing tasks:', error);
          await prisma.$disconnect();
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

importTasks().catch(console.error);
