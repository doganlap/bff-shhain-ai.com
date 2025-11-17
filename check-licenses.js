const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLicenses() {
  try {
    console.log('Checking licenses in database...');
    
    // Check if licenses table exists
    const licenses = await prisma.$queryRaw`SELECT * FROM licenses`;
    console.log('Licenses found:', licenses.length);
    
    if (licenses.length > 0) {
      licenses.forEach(license => {
        console.log(`- ${license.id}: ${license.name} (${license.type}) - Status: ${license.status}`);
      });
    } else {
      console.log('No licenses found in database');
    }
    
    // Also check for products table
    try {
      const products = await prisma.$queryRaw`SELECT * FROM products`;
      console.log('Products found:', products.length);
      if (products.length > 0) {
        products.forEach(product => {
          console.log(`- ${product.id}: ${product.name} - ${product.description}`);
        });
      }
    } catch (productError) {
      console.log('Products table not found or error:', productError.message);
    }
    
  } catch (error) {
    console.error('Error checking licenses:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLicenses();