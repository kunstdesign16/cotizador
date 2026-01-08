import { PrismaClient } from '@prisma/client'

async function main() {
    console.log('Testing connection via postgres:WKZwwlw7hMfy5YxJ@aws-1-us-east-1.pooler.supabase.com:5432...')
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgres://postgres:WKZwwlw7hMfy5YxJ@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
            }
        }
    })
    try {
        const result: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
        console.log('Tables in public schema:', JSON.stringify(result, null, 2))

        const userCount = await prisma.user.count()
        console.log('User count:', userCount)

    } catch (e) {
        console.error('Error querying DB:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
