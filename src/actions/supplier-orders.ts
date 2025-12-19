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
    expectedDate?: Date,
    quoteId?: string
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const order = await prisma.supplierOrder.create({
            data: {
                supplierId,
                items: items as any, // Store JSON
                expectedDate,
                quoteId,
                status: 'PENDING'
            }
        })

        // Sync logic: Update DRAFT quotes items with this product code
        for (const item of items) {
            if (item.unitCost !== undefined && item.unitCost > 0) {
                await prisma.quoteItem.updateMany({
                    where: {
                        productCode: item.code,
                        quote: {
                            status: { in: ['DRAFT', 'SAVED'] }
                        }
                    },
                    data: {
                        cost_article: item.unitCost,
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

export async function updateSupplierOrder(
    id: string,
    items: OrderItemInput[],
    expectedDate?: Date,
    quoteId?: string
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: {
                items: items as any,
                expectedDate,
                quoteId
            }
        })

        // Sync logic: Re-run update logic for costs
        // Note: This matches the logic in create. Ideally enable refactoring into a helper if reused more.
        for (const item of items) {
            if (item.unitCost !== undefined && item.unitCost > 0) {
                await prisma.quoteItem.updateMany({
                    where: {
                        productCode: item.code,
                        quote: {
                            status: { in: ['DRAFT', 'SAVED'] }
                        }
                    },
                    data: {
                        cost_article: item.unitCost,
                    }
                })
            }
        }

        revalidatePath('/suppliers')
        // We can't easily adhere to the supplierId pattern without fetching it, but usually the UI handles the refresh via router.refresh() 
        // or revalidating the specific page if we knew the supplier ID. 
        // For now, revalidate general paths.
        return { success: true }
    } catch (error) {
        console.error('Error updating order:', error)
        return { success: false, error: 'Error al actualizar orden' }
    }
}

// ALIASES FOR CONSITENCY
export const updateSupplierOrderStatus = updateOrderStatus
export const updateSupplierOrderPaymentStatus = updatePaymentStatus

export async function updateOrderStatus(id: string, status: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/suppliers')
        revalidatePath('/dashboard')
        revalidatePath(`/suppliers/${id}`) // If checking specifically
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
        revalidatePath('/supplier-orders')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar' }
    }
}

export async function duplicateSupplierOrder(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const original = await prisma.supplierOrder.findUnique({
            where: { id }
        })

        if (!original) {
            return { success: false, error: 'Orden no encontrada' }
        }

        const duplicate = await prisma.supplierOrder.create({
            data: {
                supplierId: original.supplierId,
                quoteId: original.quoteId,
                items: original.items as any,
                expectedDate: original.expectedDate,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            }
        })

        revalidatePath('/suppliers')
        revalidatePath('/supplier-orders')
        revalidatePath('/dashboard')
        return { success: true, id: duplicate.id }
    } catch (error) {
        console.error('Error duplicating order:', error)
        return { success: false, error: 'Error al duplicar orden' }
    }
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: { paymentStatus }
        })

        if (paymentStatus === 'PAID') {
            await syncExpenseFromOrder(id, paymentStatus)
        }

        revalidatePath('/suppliers')
        revalidatePath('/supplier-orders')
        revalidatePath('/accounting')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando estatus de pago' }
    }
}

// Internal helper to sync expense
async function syncExpenseFromOrder(orderId: string, paymentStatus: string) {
    const { prisma } = await import('@/lib/prisma')

    if (paymentStatus !== 'PAID') return // Only care about paid

    const order = await prisma.supplierOrder.findUnique({
        where: { id: orderId },
        include: { supplier: true }
    })

    if (!order) return

    // Calculate total
    const total = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
        sum + (item.unitCost || 0) * (item.quantity || 0), 0
    ) : 0
    const iva = total * 0.16

    // Check if exists
    const existing = await prisma.variableExpense.findFirst({
        where: { supplierOrderId: orderId }
    })

    if (!existing) {
        await prisma.variableExpense.create({
            data: {
                description: `Orden de Compra: ${order.supplier.name}`,
                amount: total,
                iva: iva,
                category: 'Material', // Default
                date: new Date(),
                supplierId: order.supplierId,
                supplierOrderId: order.id,
                quoteId: order.quoteId
            }
        })
    }
}
