// db/prisma.js

const { PrismaClient } = require('@prisma/client');

let prismaInstance = null;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL environment variable is required to use PrismaClient');
    error.code = 'DB_CONFIG_MISSING';
    throw error;
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }

  return prismaInstance;
}

function getPrismaClient() {
  return createPrismaClient();
}

const prismaProxy = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getPrismaClient();
      const value = client[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
    set(_, prop, value) {
      const client = getPrismaClient();
      client[prop] = value;
      return true;
    },
    has(_, prop) {
      const client = getPrismaClient();
      return prop in client;
    }
  }
);

module.exports = prismaProxy;
module.exports.getPrismaClient = getPrismaClient;
module.exports.isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);
