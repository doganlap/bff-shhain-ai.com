const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'Admin@123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Generated Hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Comparison Result:', isValid);
}

testPassword();