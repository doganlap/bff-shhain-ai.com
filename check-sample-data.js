const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSampleData() {
  try {
    console.log('📊 Checking sample data from key tables...\n');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');
    
    // Check tenants
    console.log('🏢 TENANTS:');
    const tenants = await prisma.tenants.findMany({ take: 5 });
    console.log(`Found ${tenants.length} tenants:`);
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.slug} (${tenant.type}): ${tenant.display_name}`);
    });
    
    // Check users
    console.log('\n👥 USERS:');
    const users = await prisma.users.findMany({ take: 5 });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Check GRC frameworks
    console.log('\n📋 GRC FRAMEWORKS:');
    const frameworks = await prisma.grc_frameworks.findMany({ take: 5 });
    console.log(`Found ${frameworks.length} frameworks:`);
    frameworks.forEach(framework => {
      console.log(`  - ${framework.name} (${framework.jurisdiction})`);
    });
    
    // Check GRC controls
    console.log('\n🛡️ GRC CONTROLS:');
    const controls = await prisma.grc_controls.findMany({ take: 5 });
    console.log(`Found ${controls.length} controls:`);
    controls.forEach(control => {
      console.log(`  - ${control.control_id}: ${control.title?.substring(0, 50)}...`);
    });
    
    // Check assessments
    console.log('\n📊 ASSESSMENTS:');
    const assessments = await prisma.assessments.findMany({ take: 5 });
    console.log(`Found ${assessments.length} assessments:`);
    assessments.forEach(assessment => {
      console.log(`  - ${assessment.title}: ${assessment.status} (${assessment.progress}%)`);
    });
    
    // Check demo requests
    console.log('\n🎯 DEMO REQUESTS:');
    const demoRequests = await prisma.demo_requests.findMany({ take: 5 });
    console.log(`Found ${demoRequests.length} demo requests:`);
    demoRequests.forEach(request => {
      console.log(`  - ${request.email}: ${request.status}`);
    });
    
    // Check POC requests
    console.log('\n🔬 POC REQUESTS:');
    const pocRequests = await prisma.poc_requests.findMany({ take: 5 });
    console.log(`Found ${pocRequests.length} POC requests:`);
    pocRequests.forEach(request => {
      console.log(`  - ${request.company_name}: ${request.status}`);
    });
    
    // Summary counts
    console.log('\n📈 SUMMARY COUNTS:');
    const counts = await Promise.all([
      prisma.tenants.count(),
      prisma.users.count(),
      prisma.grc_frameworks.count(),
      prisma.grc_controls.count(),
      prisma.assessments.count(),
      prisma.demo_requests.count(),
      prisma.poc_requests.count(),
      prisma.partner_invitations.count()
    ]);
    
    console.log(`  Tenants: ${counts[0]}`);
    console.log(`  Users: ${counts[1]}`);
    console.log(`  GRC Frameworks: ${counts[2]}`);
    console.log(`  GRC Controls: ${counts[3]}`);
    console.log(`  Assessments: ${counts[4]}`);
    console.log(`  Demo Requests: ${counts[5]}`);
    console.log(`  POC Requests: ${counts[6]}`);
    console.log(`  Partner Invitations: ${counts[7]}`);
    
    console.log('\n✅ Sample data check completed successfully!');
    
  } catch (error) {
    console.error('❌ Sample data check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSampleData();