'use server'

import { revalidatePath } from 'next/cache'
import { updatePaymentStatus } from './supplier-orders'

export async function registerPayment({
    orderId,
    quoteId,
    supplierId,
    type,
    amount,
    iva = 0,
    description
}: {
    orderId?: string
    quoteId?: string
    supplierId?: string
    type: 'ANTICIPO' | 'TOTAL'
    amount: number
    iva?: number
    description?: string
}) {
    const { prisma } = await import('@/lib/prisma')

    try {
        let finalQuoteId = quoteId
        let finalSupplierId = supplierId
        let finalDescription = description

        if (orderId) {
            const order = await prisma.supplierOrder.findUnique({
                where: { id: orderId },
                include: { supplier: true }
            })

            if (!order) {
                return { success: false, error: 'Orden no encontrada' }
            }

            finalQuoteId = order.quoteId || finalQuoteId
            finalSupplierId = order.supplierId
            finalDescription = finalDescription || `Anticipo Orden: ${order.supplier.name}`

            if (type === 'TOTAL') {
                const result = await updatePaymentStatus(orderId, 'PAID')
                return result
            }
        }

        // Create VariableExpense
        await prisma.variableExpense.create({
            data: {
                description: finalDescription || 'Pago registrado',
                amount: amount,
                iva: iva,
                category: 'Material',
                date: new Date(),
                supplierId: finalSupplierId,
                supplierOrderId: orderId,
                quoteId: finalQuoteId
            }
        })

        if (orderId) {
            await updatePaymentStatus(orderId, 'PARTIAL')
        }

        revalidatePath('/suppliers')
        revalidatePath('/accounting')
        revalidatePath('/dashboard')
        return { success: true }

    } catch (error) {
        console.error('Error registering payment:', error)
        return { success: false, error: 'Error al registrar pago' }
    }
}
