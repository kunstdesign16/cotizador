
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Adding column isSubItem to QuoteItem...');
        await prisma.$executeRawUnsafe('ALTER TABLE "QuoteItem" ADD COLUMN IF NOT EXISTS "isSubItem" BOOLEAN DEFAULT false;');
        console.log('Column added successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect()
    }
}

main()
