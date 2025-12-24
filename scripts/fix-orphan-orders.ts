import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrphanOrders() {
    console.log('🔍 Buscando órdenes con total = $0...')

    // Encontrar todas las órdenes
    const orders = await (prisma as any).supplierOrder.findMany({
        include: {
            supplier: true,
            quote: true,
            project: true,
            quoteItem: true
        }
    })

    console.log(`📊 Total de órdenes: ${orders.length}`)

    let orphanCount = 0
    let fixedCount = 0
    let deletedCount = 0

    for (const order of orders) {
        // Calcular total de la orden
        const items = order.items as any[]
        const total = items.reduce((sum, item) => {
            const unitCost = item.unitCost || 0
            const quantity = item.quantity || 0
            return sum + (unitCost * quantity)
        }, 0)

        if (total === 0) {
            orphanCount++
            console.log(`\n❌ Orden huérfana encontrada:`)
            console.log(`   ID: ${order.id}`)
            console.log(`   Proveedor: ${order.supplier?.name || 'N/A'}`)
            console.log(`   Proyecto: ${order.project?.name || 'N/A'}`)
            console.log(`   Items: ${JSON.stringify(items)}`)

            // Intentar corregir si tiene quoteItem vinculado
            if (order.quoteItem) {
                const quoteItem = order.quoteItem
                const correctTotal = quoteItem.internal_unit_cost * quoteItem.quantity

                if (correctTotal > 0) {
                    // Corregir la orden
                    await (prisma as any).supplierOrder.update({
                        where: { id: order.id },
                        data: {
                            items: [{
                                code: quoteItem.productCode || 'N/A',
                                name: quoteItem.concept,
                                quantity: quoteItem.quantity,
                                unitCost: quoteItem.internal_unit_cost,
                                totalCost: correctTotal
                            }]
                        }
                    })

                    console.log(`   ✅ CORREGIDA: Total ahora es $${correctTotal.toFixed(2)}`)
                    fixedCount++
                } else {
                    // El quoteItem tampoco tiene costo válido - eliminar orden
                    await (prisma as any).supplierOrder.delete({
                        where: { id: order.id }
                    })

                    // Desmarcar el quoteItem
                    await (prisma as any).quoteItem.update({
                        where: { id: quoteItem.id },
                        data: {
                            orderCreated: false,
                            supplierOrderId: null
                        }
                    })

                    console.log(`   🗑️  ELIMINADA: QuoteItem sin costo válido`)
                    deletedCount++
                }
            } else {
                // Orden sin quoteItem vinculado - eliminar
                await (prisma as any).supplierOrder.delete({
                    where: { id: order.id }
                })

                console.log(`   🗑️  ELIMINADA: Sin quoteItem vinculado`)
                deletedCount++
            }
        }
    }

    console.log(`\n📊 Resumen:`)
    console.log(`   Total órdenes: ${orders.length}`)
    console.log(`   Órdenes huérfanas: ${orphanCount}`)
    console.log(`   Órdenes corregidas: ${fixedCount}`)
    console.log(`   Órdenes eliminadas: ${deletedCount}`)

    if (orphanCount === 0) {
        console.log(`\n✅ No hay órdenes huérfanas`)
    } else {
        console.log(`\n✨ Limpieza completada`)
    }
}

fixOrphanOrders()
    .catch((error) => {
        console.error('❌ Error en limpieza:', error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
