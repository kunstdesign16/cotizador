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
        const finalQuoteId = quoteId
        const finalSupplierId = supplierId
        const finalDescription = description

        if (orderId) {
            // Redirect to the specialized order payment logic
            const { registerOrderPayment } = await import('./supplier-orders')
            return await registerOrderPayment(orderId, amount, description)
        }

        if (finalQuoteId) {
            const quote = await (prisma as any).quote.findUnique({
                where: { id: finalQuoteId },
                include: { project: true }
            }) as any
            if (quote?.project?.status === 'CERRADO') {
                return { success: false, error: 'El proyecto está CERRADO. No se pueden registrar pagos.' }
            }
        }

        // Create VariableExpense
        let projectId = null
        if (finalQuoteId) {
            const quote = await (prisma as any).quote.findUnique({
                where: { id: finalQuoteId }
            })
            projectId = quote?.projectId
        }

        await (prisma as any).variableExpense.create({
            data: {
                description: finalDescription || 'Pago registrado',
                amount: amount,
                iva: iva,
                category: 'Material',
                date: new Date(),
                supplierId: finalSupplierId,
                supplierOrderId: orderId,
                quoteId: finalQuoteId,
                projectId: projectId
            } as any
        })

        if (orderId) {
            await updatePaymentStatus(orderId, 'PARTIAL')
        }

        revalidatePath('/suppliers')
        revalidatePath('/accounting')
        revalidatePath('/dashboard')
        return { success: true }

    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
    }
}
