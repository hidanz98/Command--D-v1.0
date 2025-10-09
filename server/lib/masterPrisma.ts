/**
 * MASTER PRISMA CLIENT
 * 
 * Cliente Prisma para o banco de dados master (Otávio)
 * 
 * TODO: Criar schema-master.prisma separado e gerar client dedicado
 * Por enquanto, usa o mesmo client mas pode usar DATABASE_URL diferente
 */

import { PrismaClient } from '@prisma/client';

const globalForMasterPrisma = globalThis as unknown as {
  masterPrisma: PrismaClient | undefined;
};

export const masterPrisma =
  globalForMasterPrisma.masterPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        // Usa MASTER_DATABASE_URL se configurado, senão usa o mesmo banco
        url: process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForMasterPrisma.masterPrisma = masterPrisma;
}

// Garantir que a conexão seja fechada adequadamente
process.on('beforeExit', async () => {
  await masterPrisma.$disconnect();
});

export default masterPrisma;
