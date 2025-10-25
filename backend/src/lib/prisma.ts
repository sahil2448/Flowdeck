import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Tenant-scoped client helper (we'll enhance this later for RLS)
export function getTenantPrisma(tenantId: string) {
  return prisma; // For now, just return base client
}
