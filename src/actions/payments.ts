'use server'

import { revalidatePath } from 'next/cache'
import { updatePaymentStatus } from './supplier-orders'

export async function registerPayment({
    orderId,
    type,
    amount,
    iva = 0
}: {
    orderId: string
    type: 'ANTICIPO' | 'TOTAL'
    amount: number
    iva?: number
}) {
    const { prisma } = await import('@/lib/prisma')

    try {
        const order = await prisma.supplierOrder.findUnique({
            where: { id: orderId },
            include: { supplier: true }
        })

        if (!order) {
            return { success: false, error: 'Orden no encontrada' }
        }

        if (type === 'TOTAL') {
            const result = await updatePaymentStatus(orderId, 'PAID')
            return result
        } else {
            // ANTICIPO
            const expense = await prisma.variableExpense.create({
                data: {
                    description: `Anticipo Orden: ${order.supplier.name}`,
                    amount: amount,
                    iva: iva,
                    category: 'Material',
                    date: new Date(),
                    supplierId: order.supplierId,
                    supplierOrderId: order.id,
                    quoteId: order.quoteId
                }
            })

            await updatePaymentStatus(orderId, 'PARTIAL')

            revalidatePath('/suppliers')
            revalidatePath('/accounting')
            return { success: true }
        }
    } catch (error) {
        console.error('Error registering payment:', error)
        return { success: false, error: 'Error al registrar pago' }
    }
}
