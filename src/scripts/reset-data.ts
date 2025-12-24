import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetData() {
    console.log('🚀 Iniciando reinicio de datos operativos...')

    try {
        // El orden es CRÍTICO por las llaves foráneas

        console.log('🗑️ Limpiando gastos variables...')
        await prisma.variableExpense.deleteMany({})

        console.log('🗑️ Limpiando ingresos...')
        await prisma.income.deleteMany({})

        console.log('🗑️ Limpiando ítems de cotización...')
        await prisma.quoteItem.deleteMany({})

        console.log('🗑️ Limpiando órdenes de proveedores...')
        await prisma.supplierOrder.deleteMany({})

        console.log('🗑️ Limpiando tareas de proveedores...')
        await prisma.supplierTask.deleteMany({})

        console.log('🗑️ Limpiando cotizaciones...')
        await prisma.quote.deleteMany({})

        console.log('🗑️ Limpiando productos...')
        await prisma.product.deleteMany({})

        console.log('🗑️ Limpiando proyectos...')
        await prisma.project.deleteMany({})

        console.log('🗑️ Limpiando clientes...')
        await prisma.client.deleteMany({})

        console.log('🗑️ Limpiando proveedores...')
        await prisma.supplier.deleteMany({})

        console.log('🗑️ Limpiando gastos fijos...')
        await prisma.fixedExpense.deleteMany({})

        console.log('✅ Reinicio completado con éxito.')
        console.log('👥 Los usuarios y roles han sido conservados.')

    } catch (error) {
        console.error('❌ Error durante el reinicio:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

resetData()
