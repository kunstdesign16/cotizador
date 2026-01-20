import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Note: Next.js HMR can cause multiple client instances or listeners.
// The global prisma pattern above handles the client instance.
// We avoid adding process.on('beforeExit') here as it causes MaxListenersExceededWarning in dev.
