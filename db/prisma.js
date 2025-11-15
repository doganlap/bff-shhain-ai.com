// db/prisma.js

const { PrismaClient } = require('@prisma/client');

// Initialize the Prisma Client
const prisma = new PrismaClient();

// Export the client
module.exports = prisma;
