// Test script to verify bypass auth is working
require('dotenv').config();

console.log('BYPASS_AUTH value:', process.env.BYPASS_AUTH);
console.log('Environment loaded:', process.env.BYPASS_AUTH === 'true' ? 'BYPASS ENABLED' : 'BYPASS DISABLED');