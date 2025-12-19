'use server'

import { revalidatePath } from 'next/cache'

// --- INCOME ACTIONS ---

export async function createIncome(data: {
    amount: number
    iva?: number
    description?: string
    date: Date
    paymentMethod?: string
    status?: string
    clientId?: string
    quoteId?: string
    projectId?: string
    notes?: string
}) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.income.create({
            data: {
                amount: data.amount,
                iva: data.iva || 0,
                description: data.description,
                date: data.date,
                paymentMethod: data.paymentMethod,
                status: data.status || 'PAID',
                clientId: data.clientId,
                quoteId: data.quoteId,
                projectId: data.projectId,
                notes: data.notes
            }
        })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        console.error('Error creating income:', error)
        return { success: false, error: 'Error al registrar ingreso' }
    }
}

export async function updateIncome(id: string, data: Partial<{
    amount: number
    iva: number
    description: string
    date: Date
    paymentMethod: string
    status: string
    notes: string
}>) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.income.update({
            where: { id },
            data
        })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al actualizar ingreso' }
    }
}

export async function deleteIncome(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.income.delete({ where: { id } })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar ingreso' }
    }
}

// --- VARIABLE EXPENSE ACTIONS ---

export async function createVariableExpense(data: {
    description: string
    amount: number
    iva?: number
    category?: string
    date: Date
    paymentMethod?: string
    supplierId?: string
    supplierOrderId?: string
    quoteId?: string
    proofFile?: string
}) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.variableExpense.create({
            data: {
                description: data.description,
                amount: data.amount,
                iva: data.iva || 0,
                category: data.category,
                date: data.date,
                paymentMethod: data.paymentMethod,
                supplierId: data.supplierId,
                supplierOrderId: data.supplierOrderId,
                quoteId: data.quoteId,
                proofFile: data.proofFile
            }
        })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        console.error('Error creating expense:', error)
        return { success: false, error: 'Error al registrar egreso' }
    }
}

export async function updateVariableExpense(id: string, data: Partial<{
    description: string
    amount: number
    iva: number
    category: string
    date: Date
    paymentMethod: string
    quoteId: string
}>) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.variableExpense.update({
            where: { id },
            data
        })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al actualizar egreso' }
    }
}

export async function deleteVariableExpense(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.variableExpense.delete({ where: { id } })
        revalidatePath('/accounting')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar egreso' }
    }
}

export async function getAccountingSummary(month: string) {
    const { prisma } = await import('@/lib/prisma')
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1))

    const [incomes, variableExpenses, fixedExpenses] = await Promise.all([
        prisma.income.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate
                }
            },
            include: { client: true, quote: true },
            orderBy: { date: 'desc' }
        }),
        prisma.variableExpense.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate
                }
            },
            include: { supplier: true, supplierOrder: true, quote: true },
            orderBy: { date: 'desc' }
        }),
        prisma.fixedExpense.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate
                }
            },
            orderBy: { date: 'desc' }
        })
    ])

    return { incomes, variableExpenses, fixedExpenses }
}
