import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const seedRegulators = [
    {
      name: 'SAMA',
      description: 'Saudi Central Bank',
      type: 'banking',
      website: 'https://www.sama.gov.sa',
      contactEmail: 'info@sama.gov.sa',
      isActive: true,
      publications: [
        { title: 'Cybersecurity Framework Update', url: 'https://www.sama.gov.sa/cyber', publishedAt: new Date() },
      ],
    },
    {
      name: 'NCA',
      description: 'National Cybersecurity Authority',
      type: 'cybersecurity',
      website: 'https://nca.gov.sa',
      contactEmail: 'info@nca.gov.sa',
      isActive: true,
      publications: [
        { title: 'ECC v2.0 Guidance', url: 'https://nca.gov.sa/ecc-v2', publishedAt: new Date() },
      ],
    },
  ]

  for (const r of seedRegulators) {
    const existing = await prisma.regulator.findFirst({ where: { name: r.name } })
    const regulator = existing
      ? existing
      : await prisma.regulator.create({
          data: {
            name: r.name,
            description: r.description,
            type: r.type,
            website: r.website,
            contactEmail: r.contactEmail,
            isActive: r.isActive,
          },
        })

    for (const p of r.publications) {
      const existsPub = await prisma.publication.findFirst({
        where: { regulatorId: regulator.id, title: p.title },
      })
      if (!existsPub) {
        await prisma.publication.create({
          data: {
            regulatorId: regulator.id,
            title: p.title,
            url: p.url,
            publishedAt: p.publishedAt,
          },
        })
      }
    }
  }
}

main()
  .catch(async () => {})
  .finally(async () => {
    await prisma.$disconnect()
  })