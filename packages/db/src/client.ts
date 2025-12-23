import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

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
  
  // Set the query engine library path - check multiple locations
  if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
    const possiblePaths = [
      // .next/server (where Next.js bundles server code)
      path.join(process.cwd(), '.next', 'server', 'libquery_engine-darwin-arm64.dylib.node'),
      // Root node_modules (where Next.js expects it)
      path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'libquery_engine-darwin-arm64.dylib.node'),
      // Packages/db location
      path.join(process.cwd(), 'packages', 'db', 'node_modules', '.prisma', 'client', 'libquery_engine-darwin-arm64.dylib.node'),
      // Relative to this file (if not bundled)
      path.join(__dirname, '..', '..', 'node_modules', '.prisma', 'client', 'libquery_engine-darwin-arm64.dylib.node'),
    ];
    
    for (const enginePath of possiblePaths) {
      if (existsSync(enginePath)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
        break;
      }
    }
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






