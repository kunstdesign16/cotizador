import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.POSTGRES_URL_NON_POOLING
        }
    }
})

async function main() {
    const counts = await prisma.product.groupBy({
        by: ['supplierId'],
        _count: { id: true }
    })

    for (const c of counts) {
        const s = await prisma.supplier.findUnique({
            where: { id: c.supplierId }
        })
        console.log(`${s?.name}: ${c._count.id} products`)
    }
}

main().finally(() => prisma.$disconnect())
