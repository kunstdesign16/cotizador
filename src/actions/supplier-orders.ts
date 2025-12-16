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
        const order = await prisma.supplierOrder.create({
            data: {
                supplierId,
                items: items as any, // Store JSON
                expectedDate,
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
    expectedDate?: Date
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: {
                items: items as any,
                expectedDate
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
        revalidatePath('/supplier-orders')
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
                items: original.items,
                expectedDate: original.expectedDate,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            }
        })

        revalidatePath('/suppliers')
        revalidatePath('/supplier-orders')
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
        revalidatePath('/suppliers')
        revalidatePath('/supplier-orders')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando estatus de pago' }
    }
}
