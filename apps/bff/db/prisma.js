// db/prisma.js

import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize the Prisma Client
const prismaClient = new PrismaClient();

// Extend it with Vercel Accelerate
const prisma = prismaClient.$extends(withAccelerate());

// Export the accelerated client
export default prisma;
