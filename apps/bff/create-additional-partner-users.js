const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Use Node.js built-in crypto.randomUUID() instead of uuid package
const uuidv4 = () => crypto.randomUUID();

// Generate passwords for 3 additional partner users
const user3Password = bcrypt.hashSync('DoganUser3_2025!', 12);
const user4Password = bcrypt.hashSync('DoganUser4_2025!', 12);
const user5Password = bcrypt.hashSync('DoganUser5_2025!', 12);

console.log('📝 SQL Commands to create 3 additional partner users:');
console.log('');

// User 3
console.log("-- User 3: Partner Manager");
console.log(`INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('${uuidv4()}', 'manager@doganconsult.com', '${user3Password}', 'Partner Manager', 'partner-admin', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());`);

// User 4  
console.log("\n-- User 4: Partner Analyst");
console.log(`INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('${uuidv4()}', 'analyst@doganconsult.com', '${user4Password}', 'Partner Analyst', 'partner-user', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());`);

// User 5
console.log("\n-- User 5: Partner Consultant");
console.log(`INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('${uuidv4()}', 'consultant@doganconsult.com', '${user5Password}', 'Partner Consultant', 'partner-user', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());`);

console.log('\n🎯 Partner User Credentials Summary:');
console.log('1. ahmet@doganconsult.com / DoganCEO2025! (CEO)');
console.log('2. amr@doganconsult.com / DoganCFO2025! (CFO)');
console.log('3. manager@doganconsult.com / DoganUser3_2025! (Manager)');
console.log('4. analyst@doganconsult.com / DoganUser4_2025! (Analyst)');
console.log('5. consultant@doganconsult.com / DoganUser5_2025! (Consultant)');