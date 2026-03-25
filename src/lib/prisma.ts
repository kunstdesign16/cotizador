import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Debug: print which DB URL is being used (first 60 chars only)
const dbUrl = process.env.POSTGRES_PRISMA_URL || 'NOT SET'
console.log('[PRISMA DEBUG] URL starts with:', dbUrl.substring(0, 60))

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
