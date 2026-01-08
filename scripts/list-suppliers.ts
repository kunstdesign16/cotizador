import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.POSTGRES_URL_NON_POOLING
        }
    }
})

async function main() {
    const suppliers = await prisma.supplier.findMany({
        include: {
            _count: {
                select: { products: true, orders: true, tasks: true, expenses: true }
            }
        }
    })

    console.log('--- Current Suppliers ---')
    suppliers.forEach(s => {
        console.log(`ID: ${s.id} | Name: ${s.name} | Items: ${JSON.stringify(s._count)}`)
    })
}

main().finally(() => prisma.$disconnect())
