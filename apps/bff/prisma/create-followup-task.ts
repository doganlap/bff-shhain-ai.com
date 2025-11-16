import { PrismaClient } from '@prisma/client'

const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
if (url) process.env.DATABASE_URL = url

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0)

  const task = await prisma.tasks.create({
    data: {
      tenant_id: 'default',
      task_type: 'follow_up',
      title: 'Follow-up: Tomorrow',
      description: 'Auto-created follow-up task scheduled for tomorrow',
      priority: 'medium',
      status: 'pending',
      due_date: tomorrow
    }
  })

  console.log('✅ Follow-up task created')
  console.log(`   id: ${task.id}`)
  console.log(`   due_date: ${task.due_date?.toISOString()}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error creating follow-up task:', e?.message || e)
    await prisma.$disconnect()
    process.exit(1)
  })