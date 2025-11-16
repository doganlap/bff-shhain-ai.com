const bcrypt = require('bcryptjs');

// Generate correct password hashes
const ahmetPassword = bcrypt.hashSync('DoganCEO2025!', 12);
const amrPassword = bcrypt.hashSync('DoganCFO2025!', 12);

console.log('Ahmet Dogan (CEO) password hash:');
console.log(ahmetPassword);
console.log('\nAmr Elsayed (CFO) password hash:');
console.log(amrPassword);

console.log('\n📝 SQL Commands to update passwords:');
console.log(`UPDATE users SET password_hash = '${ahmetPassword}' WHERE email = 'ahmet@doganconsult.com';`);
console.log(`UPDATE users SET password_hash = '${amrPassword}' WHERE email = 'amr@doganconsult.com';`);