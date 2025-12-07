import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization to prevent build-time Prisma initialization
function getPrismaClient() {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Prisma not available during build');
  }
  
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  
  return client;
}

// Export a getter function instead of the instance directly
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});






