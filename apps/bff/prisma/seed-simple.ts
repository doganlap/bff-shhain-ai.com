// Simple seed script for testing
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...')

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Create a simple framework
    const framework = await prisma.framework.upsert({
      where: { id: 'TEST-FRAMEWORK' },
      update: {},
      create: {
        id: 'TEST-FRAMEWORK',
        name: 'Test Framework',
        description: 'Test framework for development',
        category: 'test'
      }
    })

    console.log('✅ Created framework:', framework.name)

    // Create a simple organization
    const organization = await prisma.organization.upsert({
      where: { id: 'TEST-ORG' },
      update: {},
      create: {
        id: 'TEST-ORG',
        name: 'Test Organization',
        tenantId: 'test-tenant'
      }
    })

    console.log('✅ Created organization:', organization.name)

    // Create a simple user
    const user = await prisma.user.upsert({
      where: { id: 'test-user' },
      update: {},
      create: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER'
      }
    })

    console.log('✅ Created user:', user.email)

    console.log('🎉 Simple seeding completed successfully!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })