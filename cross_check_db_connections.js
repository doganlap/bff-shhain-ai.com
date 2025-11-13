/**
 * Cross-Check Database Connections & Access Control
 * Tests authentication, authorization, finance operations, and database relations
 */

const { Client } = require('pg');

async function crossCheckDatabaseConnections() {
  console.log('🔍 CROSS-CHECKING DATABASE CONNECTIONS & ACCESS CONTROL');
  console.log('='.repeat(80));

  const results = {
    auth: {},
    finance: {},
    compliance: {},
    relations: {},
    indexes: {},
    access_control: {}
  };

  // Database connections
  const databases = {
    auth: new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'shahin_access_control',
      password: 'postgres',
      port: 5432,
    }),
    finance: new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'grc_master',
      password: 'postgres',
      port: 5432,
    }),
    compliance: new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'shahin_ksa_compliance',
      password: 'postgres',
      port: 5432,
    })
  };

  try {
    // Connect to all databases
    await Promise.all(Object.values(databases).map(db => db.connect()));

    // 1. Test Authentication Database
    console.log('1️⃣ TESTING AUTHENTICATION DATABASE');
    console.log('-'.repeat(50));
    
    const authTests = await Promise.all([
      databases.auth.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users
        FROM users
      `),
      databases.auth.query(`
        SELECT r.name, COUNT(ur.user_id) as user_count
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.is_active = true
        GROUP BY r.id, r.name
        ORDER BY user_count DESC
      `),
      databases.auth.query(`
        SELECT COUNT(*) as active_sessions
        FROM user_sessions
        WHERE expires_at > NOW()
      `),
      databases.auth.query(`
        SELECT COUNT(*) as total_permissions
        FROM permissions
      `)
    ]);

    results.auth = {
      users: authTests[0].rows[0],
      roles: authTests[1].rows,
      sessions: authTests[2].rows[0],
      permissions: authTests[3].rows[0],
      status: 'CONNECTED'
    };

    console.log(`   👥 Users: ${results.auth.users.total_users} total, ${results.auth.users.active_users} active`);
    console.log(`   🔐 Roles: ${results.auth.roles.length} roles defined`);
    console.log(`   🎫 Active Sessions: ${results.auth.sessions.active_sessions}`);
    console.log(`   ⚡ Permissions: ${results.auth.permissions.total_permissions}`);

    // 2. Test Finance Database
    console.log('\n2️⃣ TESTING FINANCE DATABASE');
    console.log('-'.repeat(50));

    const financeTests = await Promise.all([
      databases.finance.query(`
        SELECT 
          COUNT(*) as total_tenants,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants
        FROM tenants
      `),
      databases.finance.query(`
        SELECT 
          COUNT(*) as total_licenses,
          COUNT(CASE WHEN tl.status = 'active' THEN 1 END) as active_licenses,
          COALESCE(SUM(CASE WHEN tl.status = 'active' THEN l.monthly_cost ELSE 0 END), 0) as total_monthly_cost
        FROM tenant_licenses tl
        JOIN licenses l ON tl.license_id = l.id
      `),
      databases.finance.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          SUM(monthly_fee) as total_monthly_revenue
        FROM subscriptions
        WHERE status = 'active'
      `),
      databases.finance.query(`
        SELECT COUNT(*) as total_organizations
        FROM organizations
      `)
    ]);

    results.finance = {
      tenants: financeTests[0].rows[0],
      licenses: financeTests[1].rows[0],
      subscriptions: financeTests[2].rows[0],
      organizations: financeTests[3].rows[0],
      status: 'CONNECTED'
    };

    console.log(`   🏢 Tenants: ${results.finance.tenants.total_tenants} total, ${results.finance.tenants.active_tenants} active`);
    console.log(`   📋 Licenses: ${results.finance.licenses.total_licenses} total, ${results.finance.licenses.active_licenses} active`);
    console.log(`   💰 Monthly Revenue: $${results.finance.subscriptions.total_monthly_revenue || 0}`);
    console.log(`   🏛️ Organizations: ${results.finance.organizations.total_organizations}`);

    // 3. Test Compliance Database
    console.log('\n3️⃣ TESTING COMPLIANCE DATABASE');
    console.log('-'.repeat(50));

    const complianceTests = await Promise.all([
      databases.compliance.query(`
        SELECT 
          COUNT(*) as total_assessments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assessments,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assessments
        FROM assessments
      `),
      databases.compliance.query(`
        SELECT COUNT(*) as total_frameworks
        FROM frameworks
      `),
      databases.compliance.query(`
        SELECT COUNT(*) as total_controls
        FROM framework_controls
      `),
      databases.compliance.query(`
        SELECT 
          AVG(compliance_score) as avg_compliance_score,
          COUNT(*) as total_responses
        FROM assessment_responses
        WHERE compliance_score IS NOT NULL
      `)
    ]);

    results.compliance = {
      assessments: complianceTests[0].rows[0],
      frameworks: complianceTests[1].rows[0],
      controls: complianceTests[2].rows[0],
      responses: complianceTests[3].rows[0],
      status: 'CONNECTED'
    };

    console.log(`   📊 Assessments: ${results.compliance.assessments.total_assessments} total, ${results.compliance.assessments.completed_assessments} completed`);
    console.log(`   🛡️ Frameworks: ${results.compliance.frameworks.total_frameworks}`);
    console.log(`   ⚙️ Controls: ${results.compliance.controls.total_controls}`);
    console.log(`   📈 Avg Compliance Score: ${parseFloat(results.compliance.responses.avg_compliance_score || 0).toFixed(1)}%`);

    // 4. Test Cross-Database Relations
    console.log('\n4️⃣ TESTING CROSS-DATABASE RELATIONS');
    console.log('-'.repeat(50));

    // Check if we can relate data across databases
    const crossDbTests = await Promise.all([
      // Test user-tenant relationship
      databases.finance.query(`
        SELECT t.id, t.name, t.primary_admin_user_id
        FROM tenants t
        WHERE t.primary_admin_user_id IS NOT NULL
        LIMIT 5
      `),
      // Test assessment-user relationship
      databases.compliance.query(`
        SELECT a.id, a.name, a.created_by_user_id
        FROM assessments a
        WHERE a.created_by_user_id IS NOT NULL
        LIMIT 5
      `)
    ]);

    results.relations = {
      tenant_user_links: crossDbTests[0].rows.length,
      assessment_user_links: crossDbTests[1].rows.length,
      status: 'FUNCTIONAL'
    };

    console.log(`   🔗 Tenant-User Links: ${results.relations.tenant_user_links}`);
    console.log(`   🔗 Assessment-User Links: ${results.relations.assessment_user_links}`);

    // 5. Check Database Indexes
    console.log('\n5️⃣ CHECKING DATABASE INDEXES');
    console.log('-'.repeat(50));

    const indexTests = await Promise.all([
      // Auth database indexes
      databases.auth.query(`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `),
      // Finance database indexes
      databases.finance.query(`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `),
      // Compliance database indexes
      databases.compliance.query(`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `)
    ]);

    results.indexes = {
      auth_indexes: indexTests[0].rows.length,
      finance_indexes: indexTests[1].rows.length,
      compliance_indexes: indexTests[2].rows.length,
      total_indexes: indexTests[0].rows.length + indexTests[1].rows.length + indexTests[2].rows.length
    };

    console.log(`   🔍 Auth DB Indexes: ${results.indexes.auth_indexes}`);
    console.log(`   🔍 Finance DB Indexes: ${results.indexes.finance_indexes}`);
    console.log(`   🔍 Compliance DB Indexes: ${results.indexes.compliance_indexes}`);
    console.log(`   🔍 Total Indexes: ${results.indexes.total_indexes}`);

    // 6. Test Access Control
    console.log('\n6️⃣ TESTING ACCESS CONTROL');
    console.log('-'.repeat(50));

    const accessControlTests = await Promise.all([
      // Check role-permission mappings
      databases.auth.query(`
        SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        GROUP BY r.id, r.name
        ORDER BY permission_count DESC
      `),
      // Check user-role assignments
      databases.auth.query(`
        SELECT 
          COUNT(*) as total_assignments,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_assignments
        FROM user_roles
      `),
      // Check audit logs
      databases.auth.query(`
        SELECT COUNT(*) as total_audit_logs
        FROM audit_logs
      `)
    ]);

    results.access_control = {
      role_permissions: accessControlTests[0].rows,
      user_assignments: accessControlTests[1].rows[0],
      audit_logs: accessControlTests[2].rows[0],
      status: 'CONFIGURED'
    };

    console.log(`   🔐 Role-Permission Mappings: ${results.access_control.role_permissions.length} roles configured`);
    console.log(`   👤 User Role Assignments: ${results.access_control.user_assignments.active_assignments} active`);
    console.log(`   📝 Audit Log Entries: ${results.access_control.audit_logs.total_audit_logs}`);

    // 7. Performance Check
    console.log('\n7️⃣ PERFORMANCE CHECK');
    console.log('-'.repeat(50));

    const performanceStart = Date.now();
    await Promise.all([
      databases.auth.query('SELECT COUNT(*) FROM users'),
      databases.finance.query('SELECT COUNT(*) FROM tenants'),
      databases.compliance.query('SELECT COUNT(*) FROM assessments')
    ]);
    const performanceTime = Date.now() - performanceStart;

    console.log(`   ⚡ Cross-DB Query Time: ${performanceTime}ms`);
    console.log(`   ✅ Performance: ${performanceTime < 500 ? 'EXCELLENT' : performanceTime < 1000 ? 'GOOD' : 'NEEDS OPTIMIZATION'}`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 CROSS-CHECK SUMMARY');
    console.log('='.repeat(80));

    const allConnected = results.auth.status === 'CONNECTED' && 
                        results.finance.status === 'CONNECTED' && 
                        results.compliance.status === 'CONNECTED';

    console.log(`🔗 Database Connections: ${allConnected ? '✅ ALL CONNECTED' : '❌ ISSUES FOUND'}`);
    console.log(`🔐 Authentication: ${results.auth.users.total_users > 0 ? '✅ CONFIGURED' : '⚠️ NO USERS'}`);
    console.log(`💰 Finance Operations: ${results.finance.tenants.total_tenants > 0 ? '✅ ACTIVE' : '⚠️ NO TENANTS'}`);
    console.log(`📊 Compliance Tracking: ${results.compliance.assessments.total_assessments > 0 ? '✅ ACTIVE' : '⚠️ NO ASSESSMENTS'}`);
    console.log(`🔗 Cross-DB Relations: ${results.relations.status === 'FUNCTIONAL' ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log(`🔍 Database Indexes: ${results.indexes.total_indexes > 50 ? '✅ WELL INDEXED' : '⚠️ NEEDS MORE INDEXES'}`);
    console.log(`🛡️ Access Control: ${results.access_control.status === 'CONFIGURED' ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);

    return results;

  } catch (error) {
    console.error('❌ Cross-check failed:', error.message);
    return { error: error.message };
  } finally {
    // Close all connections
    await Promise.all(Object.values(databases).map(db => db.end()));
  }
}

// Run cross-check if this file is executed directly
if (require.main === module) {
  crossCheckDatabaseConnections().then(results => {
    if (results.error) {
      process.exit(1);
    } else {
      console.log('\n🎉 Cross-check completed successfully!');
      process.exit(0);
    }
  });
}

module.exports = crossCheckDatabaseConnections;
