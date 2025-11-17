const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  const id = 'asm-001'
  const exists = await prisma.$queryRaw`SELECT id FROM "assessments" WHERE id = ${id} LIMIT 1`
  if (!exists.length) {
    await prisma.$executeRaw`INSERT INTO "assessments" (id, title, framework_id, organization_id, assessment_type, status, progress, score, created_at, updated_at) VALUES (${id}, ${'ISO 27001 Readiness'}, ${'ISO27001'}, ${'org-1'}, ${'standard'}, ${'draft'}, ${0}, ${0}, NOW(), NOW())`
  }
}

run().catch(()=>{}).finally(async()=>{ await prisma.$disconnect() })