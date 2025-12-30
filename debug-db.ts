
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database connection...')
    try {
        // Check if column exists using raw SQL
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Project' AND column_name = 'financialStatus';
    `
        console.log('Column check result:', result)

        // Check all columns in Project
        const allColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Project';
    `
        console.log('All columns in Project:', allColumns)

    } catch (e) {
        console.error('Error querying database:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
