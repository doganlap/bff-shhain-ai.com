const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Regulator" (name, description, type, website, "contactEmail", "contactPhone", address, "countryCode", sectors, jurisdictions, "isActive")
     VALUES
     ('SAMA','Saudi Central Bank','banking','https://www.sama.gov.sa','info@sama.gov.sa','+966-11-0000000','Riyadh, Saudi Arabia','SA', ARRAY['Banking','Financial Services'], ARRAY['Saudi Arabia'], true),
     ('NCA','National Cybersecurity Authority','cybersecurity','https://nca.gov.sa','info@nca.gov.sa','+966-11-1111111','Riyadh, Saudi Arabia','SA', ARRAY['Cybersecurity'], ARRAY['Saudi Arabia'], true)
     ON CONFLICT (name) DO NOTHING;`
  )

  const regs = await prisma.$queryRawUnsafe(`SELECT id, name FROM "Regulator"`)
  for (const r of regs) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Publication" ("regulatorId", title, url)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING;`,
      r.id,
      `${r.name} Introductory Guidance`,
      'https://example.org/doc'
    )
  }
}

run()
  .catch(() => {})
  .finally(async () => {
    await prisma.$disconnect()
  })