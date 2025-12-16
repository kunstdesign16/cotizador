'use server'

import { revalidatePath } from 'next/cache'

interface OrderItemInput {
    code: string
    name: string
    quantity: number
    unitCost?: number
}

export async function createSupplierOrder(
    supplierId: string,
    items: OrderItemInput[], // Updated type to include cost
    expectedDate?: Date
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        // 1. Create the Order
        const order = await prisma.supplierOrder.create({
            data: {
                supplierId,
                items: items as any, // Store JSON
                expectedDate,
                status: 'PENDING'
            }
        })

        // 2. Logic to update Linked Quotes
        // Strategy: We need to find which active Quotes contain these products.
        // Or, does the Order link to a specific Quote?
        // Ideally, an Order *can* be linked to a Quote, or just be stock replenishment.
        // For this feature request: "alimente los costos de las cotizaciones" implies we might want to update ANY open quote using this product? 
        // OR better, we check if this order is specifically for a Quote.
        // CURRENT LIMITATION: Our `SupplierOrder` model has optional `quoteId`.
        // The current UI doesn't allow selecting a Quote when creating an order (unlike Tasks).
        // Let's implement a smarter "Find and Update" logic:

        // Find ALL Active/Draft quotes that have items with these product codes AND are associated with this Supplier (via product relation ideally, but code is the link)

        // Let's iterate over the items and update matching QuoteItems in Draft quotes.
        // Getting complex: What if multiple quotes use it? Do we update all?
        // User request: "alimente los costos de las cotizaciones".
        // Safer approach: Update `QuoteItem` where `productCode` matches for DRAFT quotes.

        // Optimization: Run this in parallel or background? Next.js server actions are blocking.
        // Let's do a quick update for DRAFT quotes.

        for (const item of items) {
            if (item.unitCost !== undefined && item.unitCost > 0) {
                // Update DRAFT quotes items with this product code
                await prisma.quoteItem.updateMany({
                    where: {
                        productCode: item.code,
                        quote: {
                            status: { in: ['DRAFT', 'SAVED'] } // Only update non-finalized quotes
                        }
                    },
                    data: {
                        cost_article: item.unitCost,
                        // potentially we could update unit_cost if we wanted to maintain margin, but usually cost updates affect margin.
                        // We will just update the cost.
                    }
                })
            }
        }

        revalidatePath('/suppliers')
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true, id: order.id }
    } catch (error) {
        console.error('Error creating order:', error)
        return { success: false, error: 'Error al crear orden' }
    }
}

export async function updateOrderStatus(id: string, status: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/suppliers')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando estatus' }
    }
}

export async function deleteOrder(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.delete({ where: { id } })
        revalidatePath('/suppliers')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar' }
    }
}
