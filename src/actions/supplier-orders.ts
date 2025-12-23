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
    quoteId?: string,
    taskId?: string
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const order = await prisma.supplierOrder.create({
            data: {
                supplierId,
                items: items as any, // Store JSON
                expectedDate,
                quoteId,
                taskId,
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
    quoteId?: string,
    taskId?: string
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: {
                items: items as any,
                expectedDate,
                quoteId,
                taskId
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
                taskId: original.taskId,
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

/**
 * NEW: Register a payment for an order and sync status.
 * This is the ONLY source of truth for order payments.
 */
export async function registerOrderPayment(orderId: string, amount: number, description?: string, paymentMethod?: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const order = await prisma.supplierOrder.findUnique({
            where: { id: orderId },
            include: {
                expenses: true,
                supplier: true
            }
        }) as any

        if (!order) return { success: false, error: 'Orden no encontrada' }
        if (order.projectId) {
            const project = await (prisma as any).project.findUnique({ where: { id: order.projectId } })
            if (project?.status === 'CERRADO') return { success: false, error: 'El proyecto está CERRADO. No se pueden registrar pagos.' }
        }

        // 1. Calculate Total Ordered
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[])
        const totalOrdered = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
            sum + (item.unitCost || 0) * (item.quantity || 0), 0
        ) : 0

        // 2. Calculate Total already paid (from VariableExpense)
        const totalPaidSoFar = order.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        const pendingBalance = totalOrdered - totalPaidSoFar

        // 3. Validation
        if (amount <= 0) return { success: false, error: 'El monto debe ser mayor a cero' }
        if (amount > pendingBalance + 0.01) { // Small epsilon
            return {
                success: false,
                error: `El pago ($${amount}) excede el saldo pendiente ($${pendingBalance.toFixed(2)})`
            }
        }

        // 4. Create the expense in a transaction
        await prisma.$transaction(async (tx) => {
            // A. Create Expense
            await tx.variableExpense.create({
                data: {
                    description: description || `Pago Orden: ${order.supplier.name}`,
                    amount: amount,
                    iva: amount * 0.16, // Consistent with our tax policy
                    category: 'Material',
                    date: new Date(),
                    supplierId: order.supplierId,
                    supplierOrderId: order.id,
                    projectId: order.projectId,
                    quoteId: order.quoteId,
                    paymentMethod: paymentMethod || 'TRANSFER'
                } as any
            })

            // B. Determine new status
            const newTotalPaid = totalPaidSoFar + amount
            let newStatus = 'PARTIAL'
            if (newTotalPaid >= totalOrdered - 0.01) {
                newStatus = 'PAID'
            }

            // C. Update Order status
            await tx.supplierOrder.update({
                where: { id: order.id },
                data: { paymentStatus: newStatus }
            })
        })

        revalidatePath(`/projects/${order.projectId}`)
        revalidatePath('/supplier-orders')
        revalidatePath('/accounting')

        return { success: true }
    } catch (error) {
        console.error('Error registering order payment:', error)
        return { success: false, error: 'Error al registrar el pago' }
    }
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierOrder.update({
            where: { id },
            data: { paymentStatus }
        })

        // NOTE: Manual sync is now secondary to registerOrderPayment logic
        // But we keep it for backwards compatibility for now
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

export async function createOrderFromQuoteItem(quoteItemId: string, supplierId: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        // 1. Fetch the quote item with its quote and project info
        const item = await prisma.quoteItem.findUnique({
            where: { id: quoteItemId },
            include: {
                quote: {
                    include: {
                        project: true
                    }
                }
            }
        }) as any

        if (!item) return { success: false, error: 'Ítem no encontrado' }
        if (!item.quote.project) return { success: false, error: 'El ítem no está ligado a un proyecto' }

        // 0. CHECK: Block if CERRADO
        if (item.quote.project.status === 'CERRADO') {
            return { success: false, error: 'El proyecto está CERRADO. No se pueden generar nuevas órdenes.' }
        }

        // 2. CHECK: Only allow if project is APROBADO or higher
        const projectStatus = item.quote.project.status
        if (projectStatus === 'COTIZANDO') {
            return {
                success: false,
                error: 'El proyecto debe estar APROBADO para generar órdenes de compra operativos.'
            }
        }

        if (item.orderCreated) {
            return { success: false, error: 'Ya existe una orden para este ítem.' }
        }

        // 3. Create Supplier Order using a transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Order
            const order = await tx.supplierOrder.create({
                data: {
                    supplierId,
                    projectId: item.quote.projectId,
                    quoteId: item.quoteId,
                    quoteItemId: item.id,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    items: [{
                        code: item.productCode || 'N/A',
                        name: item.concept,
                        quantity: item.quantity,
                        unitCost: item.cost_article // Use the quote baseline cost
                    }] as any
                } as any
            })

            // B. Update QuoteItem to mark as ordered
            await tx.quoteItem.update({
                where: { id: item.id },
                data: {
                    orderCreated: true,
                    supplierOrderId: order.id
                } as any
            })

            return order
        })

        revalidatePath(`/projects/${item.quote.projectId}`)
        revalidatePath(`/quotes/${item.quoteId}`)
        revalidatePath('/supplier-orders')

        return { success: true, id: result.id }
    } catch (error) {
        console.error('Error creating order from item:', error)
        return { success: false, error: 'Error al generar la orden de compra.' }
    }
}

// Internal helper to sync expense
async function syncExpenseFromOrder(orderId: string, paymentStatus: string) {
    const { prisma } = await import('@/lib/prisma')

    if (paymentStatus !== 'PAID') return // Only care about paid

    const order = await prisma.supplierOrder.findUnique({
        where: { id: orderId },
        include: { supplier: true }
    }) as any

    if (!order) return

    // Calculate total
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[])
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
                quoteId: order.quoteId,
                projectId: order.projectId
            } as any
        })
    }
}

// ALIASES FOR CONSITENCY
export const updateSupplierOrderStatus = updateOrderStatus
export const updateSupplierOrderPaymentStatus = updatePaymentStatus
