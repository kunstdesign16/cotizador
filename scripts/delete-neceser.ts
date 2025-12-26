import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAndDeleteNecesar() {
    try {
        const project = await (prisma as any).project.findFirst({
            where: {
                name: {
                    contains: 'Neceser',
                    mode: 'insensitive'
                }
            },
            include: {
                quotes: true,
                supplierOrders: true,
                incomes: true,
                expenses: true
            }
        })

        if (!project) {
            console.log('❌ Proyecto "Neceser" no encontrado')
            return
        }

        console.log('📋 Proyecto encontrado:')
        console.log('   ID:', project.id)
        console.log('   Nombre:', project.name)
        console.log('   Estado:', project.status)
        console.log('   Cotizaciones:', project.quotes.length)
        console.log('   Órdenes:', project.supplierOrders.length)
        console.log('   Ingresos:', project.incomes.length)
        console.log('   Gastos:', project.expenses.length)

        const result = await deleteProject(project.id)

        if (result.success) {
            console.log('\n✅ Proyecto eliminado exitosamente')
        } else {
            console.log('\n❌ Error al eliminar:', result.error)
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

findAndDeleteNecesar()
