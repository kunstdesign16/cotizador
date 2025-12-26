import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceDeleteNeceser() {
    try {
        console.log('🔍 Buscando proyecto "Neceser"...')
        const project = await (prisma as any).project.findFirst({
            where: {
                name: {
                    contains: 'Neceser',
                    mode: 'insensitive'
                }
            }
        })

        if (!project) {
            console.log('❌ Proyecto "Neceser" no encontrado')
            return
        }

        console.log(`📋 Proyecto encontrado: ${project.name} (${project.id})`)
        console.log('💥 Iniciando eliminación forzada...')

        // Usar una transacción para eliminar todo o nada
        await prisma.$transaction(async (tx) => {
            // 1. Eliminar gastos variables
            const deletedExpenses = await (tx as any).variableExpense.deleteMany({
                where: { projectId: project.id }
            })
            console.log(`   - Gastos eliminados: ${deletedExpenses.count}`)

            // 2. Eliminar ingresos
            const deletedIncomes = await (tx as any).income.deleteMany({
                where: { projectId: project.id }
            })
            console.log(`   - Ingresos eliminados: ${deletedIncomes.count}`)

            // 3. Eliminar órdenes de proveedor
            const deletedOrders = await (tx as any).supplierOrder.deleteMany({
                where: { projectId: project.id }
            })
            console.log(`   - Órdenes eliminadas: ${deletedOrders.count}`)

            // 4. Eliminar Items de Cotización (indirectamente) y Cotizaciones
            // Primero buscamos las cotizaciones para loguear
            const quotes = await (tx as any).quote.findMany({
                where: { projectId: project.id }
            })

            // Eliminar items de esas cotizaciones
            for (const quote of quotes) {
                await (tx as any).quoteItem.deleteMany({
                    where: { quoteId: quote.id }
                })
            }

            // Eliminar las cotizaciones
            const deletedQuotes = await (tx as any).quote.deleteMany({
                where: { projectId: project.id }
            })
            console.log(`   - Cotizaciones eliminadas: ${deletedQuotes.count}`)

            // 5. Eliminar el proyecto
            await (tx as any).project.delete({
                where: { id: project.id }
            })
            console.log(`   - Proyecto eliminado`)
        })

        console.log('\n✅ Proyecto "Neceser" eliminado exitosamente por única ocasión.')
    } catch (error) {
        console.error('❌ Error al eliminar:', error)
    } finally {
        await prisma.$disconnect()
    }
}

forceDeleteNeceser()
