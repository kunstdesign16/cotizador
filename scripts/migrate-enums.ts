
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Migrating Project Statuses...')

    await prisma.project.updateMany({ where: { status: 'COTIZANDO' }, data: { status: 'draft' } })
    await prisma.project.updateMany({ where: { status: 'EN_PRODUCCION' }, data: { status: 'active' } })
    await prisma.project.updateMany({ where: { status: 'APROBADO' }, data: { status: 'active' } }) // Map legacy APROBADO to active
    await prisma.project.updateMany({ where: { status: 'ENTREGADO' }, data: { status: 'closed' } })
    await prisma.project.updateMany({ where: { status: 'CANCELADO' }, data: { status: 'cancelled' } })

    console.log('Migrating Quote Statuses...')
    await prisma.quote.updateMany({ where: { status: 'DRAFT' }, data: { status: 'draft' } })
    await prisma.quote.updateMany({ where: { status: 'BORRADOR' }, data: { status: 'draft' } })
    await prisma.quote.updateMany({ where: { status: 'SENT' }, data: { status: 'draft' } }) // Map SENT to draft as per strict rules
    await prisma.quote.updateMany({ where: { status: 'APROBADA' }, data: { status: 'approved' } })
    await prisma.quote.updateMany({ where: { status: 'APPROVED' }, data: { status: 'approved' } })
    await prisma.quote.updateMany({ where: { status: 'REJECTED' }, data: { status: 'rejected' } })
    await prisma.quote.updateMany({ where: { status: 'REPLACED' }, data: { status: 'replaced' } })
    // Handle COBRADO/FACTURADO legacy?
    await prisma.quote.updateMany({ where: { status: 'COBRADO' }, data: { status: 'approved' } })
    await prisma.quote.updateMany({ where: { status: 'FACTURADO' }, data: { status: 'approved' } })

    console.log('✅ Migration complete. Ready for Schema Push.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
