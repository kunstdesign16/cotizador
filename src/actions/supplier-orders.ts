'use server'

import { revalidatePath } from 'next/cache'

export async function createSupplierOrder(
    supplierId: string,
    items: { code: string, name: string, quantity: number }[],
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
