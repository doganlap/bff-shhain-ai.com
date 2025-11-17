/*******************************************************
 * PRODUCTION DATABASE SEEDING SCRIPT
 * 
 * This script seeds the production database with:
 * - Master tenant and organization
 * - Default frameworks and controls
 * - Demo user accounts
 * - Partner organization setup
 * - Essential GRC data
 *******************************************************/

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Master tenant and organization data
const MASTER_TENANT_ID = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5';
const MASTER_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

// Default frameworks with comprehensive GRC data
const FRAMEWORKS = [
  {
    id: 'framework-iso27001',
    name: 'ISO 27001:2022',
    description: 'Information Security Management System',
    version: '2022',
    category: 'Security',
    isActive: true,
    tenantId: MASTER_TENANT_ID,
    controls: [
      {
        id: 'control-iso-1',
        code: 'A.5.1',
        title: 'Information security policies',
        description: 'Policies for information security',
        category: 'Governance',
        implementationStatus: 'Implemented',
        priority: 'High'
      },
      {
        id: 'control-iso-2',
        code: 'A.6.1',
        title: 'Organization of information security',
        description: 'Internal organization',
        category: 'Governance',
        implementationStatus: 'Implemented',
        priority: 'High'
      },
      {
        id: 'control-iso-3',
        code: 'A.7.1',
        title: 'Human resource security',
        description: 'Prior to employment',
        category: 'Human Resources',
        implementationStatus: 'In Progress',
        priority: 'Medium'
      }
    ]
  },
  {
    id: 'framework-soc2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2',
    version: '2023',
    category: 'Compliance',
    isActive: true,
    tenantId: MASTER_TENANT_ID,
    controls: [
      {
        id: 'control-soc-1',
        code: 'CC1.1',
        title: 'Control Environment',
        description: 'Integrity and ethical values',
        category: 'Governance',
        implementationStatus: 'Implemented',
        priority: 'High'
      },
      {
        id: 'control-soc-2',
        code: 'CC2.1',
        title: 'Communication',
        description: 'Communication with external parties',
        category: 'Communication',
        implementationStatus: 'Implemented',
        priority: 'Medium'
      }
    ]
  },
  {
    id: 'framework-iso27701',
    name: 'ISO 27701:2019',
    description: 'Privacy Information Management System',
    version: '2019',
    category: 'Privacy',
    isActive: true,
    tenantId: MASTER_TENANT_ID,
    controls: [
      {
        id: 'control-privacy-1',
        code: 'P.7.1',
        title: 'Information security policy',
        description: 'Privacy policy and procedures',
        category: 'Privacy',
        implementationStatus: 'Implemented',
        priority: 'High'
      }
    ]
  }
];

// Demo users with different roles
const DEMO_USERS = [
  {
    id: 'user-admin-001',
    email: 'admin@shahin-ai.com',
    password: 'SuperAdmin2025',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID,
    isActive: true
  },
  {
    id: 'user-manager-001',
    email: 'manager@shahin-ai.com',
    password: 'Manager2025',
    firstName: 'GRC',
    lastName: 'Manager',
    role: 'manager',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID,
    isActive: true
  },
  {
    id: 'user-analyst-001',
    email: 'analyst@shahin-ai.com',
    password: 'Analyst2025',
    firstName: 'Risk',
    lastName: 'Analyst',
    role: 'analyst',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID,
    isActive: true
  },
  {
    id: 'user-auditor-001',
    email: 'auditor@shahin-ai.com',
    password: 'Auditor2025',
    firstName: 'Compliance',
    lastName: 'Auditor',
    role: 'auditor',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID,
    isActive: true
  }
];

// Partner organization data
const PARTNER_ORG = {
  id: 'partner-org-001',
  name: 'Shahin Partners LLC',
  tenant_id: MASTER_TENANT_ID
};

// Demo organization for testing
const DEMO_ORG = {
  id: 'demo-org-001',
  name: 'Demo Corporation',
  tenant_id: MASTER_TENANT_ID
};

// Sample risks for demonstration
const SAMPLE_RISKS = [
  {
    id: 'risk-001',
    title: 'Data Breach Risk',
    description: 'Unauthorized access to sensitive customer data',
    category: 'Security',
    impact: 'High',
    probability: 'Medium',
    riskScore: 7.5,
    status: 'Open',
    ownerId: 'user-manager-001',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID
  },
  {
    id: 'risk-002',
    title: 'Compliance Gap',
    description: 'Missing controls for ISO 27001 certification',
    category: 'Compliance',
    impact: 'High',
    probability: 'High',
    riskScore: 8.5,
    status: 'Mitigation',
    ownerId: 'user-analyst-001',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID
  }
];

// Sample assessments
const SAMPLE_ASSESSMENTS = [
  {
    id: 'assessment-001',
    title: 'ISO 27001 Gap Analysis',
    description: 'Comprehensive gap analysis against ISO 27001:2022 controls',
    frameworkId: 'framework-iso27001',
    status: 'In Progress',
    progress: 65,
    assignedToId: 'user-auditor-001',
    tenantId: MASTER_TENANT_ID,
    organizationId: MASTER_ORG_ID
  }
];

async function main() {
  try {
    console.log('🚀 Starting production database seeding...');

    // 1. Create master tenant
    console.log('Creating master tenant...');
    await prisma.tenants.upsert({
      where: { id: MASTER_TENANT_ID },
      update: {},
      create: {
        id: MASTER_TENANT_ID,
        slug: 'shahin-master',
        display_name: 'Shahin Master Tenant',
        type: 'master',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // 2. Create master organization
    console.log('Creating master organization...');
    await prisma.organizations.upsert({
      where: { id: MASTER_ORG_ID },
      update: {},
      create: {
        id: MASTER_ORG_ID,
        name: 'Shahin GRC Platform',
        tenant_id: MASTER_TENANT_ID,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // 3. Create partner organization
    console.log('Creating partner organization...');
    await prisma.organizations.upsert({
      where: { id: PARTNER_ORG.id },
      update: {},
      create: {
        ...PARTNER_ORG,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // 4. Create demo organization
    console.log('Creating demo organization...');
    await prisma.organizations.upsert({
      where: { id: DEMO_ORG.id },
      update: {},
      create: {
        ...DEMO_ORG,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // 5. Create frameworks and controls
    console.log('Creating frameworks and controls...');
    for (const framework of FRAMEWORKS) {
      await prisma.grc_frameworks.upsert({
        where: { id: framework.id },
        update: {},
        create: {
          id: framework.id,
          name: framework.name,
          description: framework.description,
          version: framework.version,
          tenant_id: framework.tenantId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Create controls for each framework
      for (const control of framework.controls) {
        await prisma.grc_controls.upsert({
          where: { id: control.id },
          update: {},
          create: {
            id: control.id,
            framework_id: framework.id,
            control_id: control.code,
            title: control.title,
            description: control.description,
            category: control.category,
            implementation_status: control.implementationStatus,
            tenant_id: framework.tenantId,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    }

    // 6. Create demo users
    console.log('Creating demo users...');
    for (const user of DEMO_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await prisma.users.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password_hash: hashedPassword,
          full_name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          tenant_id: user.tenantId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // 7. Create sample risks
    console.log('Creating sample risks...');
    for (const risk of SAMPLE_RISKS) {
      await prisma.risk.upsert({
        where: { id: risk.id },
        update: {},
        create: {
          id: risk.id,
          title: risk.title,
          description: risk.description,
          category: risk.category,
          likelihood: Math.round(risk.riskScore),
          impact: Math.round(risk.riskScore * 10),
          status: risk.status,
          organizationId: risk.organizationId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // 8. Create sample assessments
    console.log('Creating sample assessments...');
    for (const assessment of SAMPLE_ASSESSMENTS) {
      await prisma.assessments.upsert({
        where: { id: assessment.id },
        update: {},
        create: {
          id: assessment.id,
          title: assessment.title,
          framework_id: assessment.frameworkId,
          status: assessment.status,
          progress: assessment.progress,
          assigned_to: assessment.assignedToId,
          tenant_id: assessment.tenantId,
          organization_id: assessment.organizationId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // 9. Create audit logs
    console.log('Creating audit logs...');
    await prisma.audit_logs.createMany({
      data: [
        {
          id: generateUUID(),
          tenant_id: MASTER_TENANT_ID,
          user_id: 'user-admin-001',
          action: 'SYSTEM_SETUP',
          resource: 'Database',
          resource_id: 'production-seed',
          details: JSON.stringify({ message: 'Production database seeded successfully' }),
          created_at: new Date()
        },
        {
          id: generateUUID(),
          tenant_id: MASTER_TENANT_ID,
          user_id: 'user-admin-001',
          action: 'FRAMEWORK_CREATED',
          resource: 'ISO 27001',
          resource_id: 'framework-iso27001',
          details: JSON.stringify({ message: 'ISO 27001 framework created with 3 controls' }),
          created_at: new Date()
        }
      ],
      skipDuplicates: true
    });

    console.log('✅ Production database seeding completed successfully!');
    console.log('');
    console.log('📊 Seeding Summary:');
    console.log(`- Master Tenant: ${MASTER_TENANT_ID}`);
    console.log(`- Master Organization: ${MASTER_ORG_ID}`);
    console.log(`- Partner Organization: ${PARTNER_ORG.id}`);
    console.log(`- Demo Organization: ${DEMO_ORG.id}`);
    console.log(`- Frameworks: ${FRAMEWORKS.length}`);
    console.log(`- Controls: ${FRAMEWORKS.reduce((sum, f) => sum + f.controls.length, 0)}`);
    console.log(`- Demo Users: ${DEMO_USERS.length}`);
    console.log(`- Sample Risks: ${SAMPLE_RISKS.length}`);
    console.log(`- Sample Assessments: ${SAMPLE_ASSESSMENTS.length}`);
    console.log('');
    console.log('🔑 Default Login Credentials:');
    console.log('- admin@shahin-ai.com / SuperAdmin2025 (Admin)');
    console.log('- manager@shahin-ai.com / Manager2025 (Manager)');
    console.log('- analyst@shahin-ai.com / Analyst2025 (Analyst)');
    console.log('- auditor@shahin-ai.com / Auditor2025 (Auditor)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;