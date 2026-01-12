'use server'

import { revalidatePath } from 'next/cache'
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
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
    } catch (_error) {
        return { success: false, error: 'Error' }
    }
}

export async function deleteIncome(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.income.delete({ where: { id } })
        revalidatePath('/accounting')
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error' }
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
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
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
    } catch (_error) {
        return { success: false, error: 'Error' }
    }
}

export async function deleteVariableExpense(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.variableExpense.delete({ where: { id } })
        revalidatePath('/accounting')
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error' }
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

export async function getAccountingTrends() {
    const { prisma } = await import('@/lib/prisma')

    // Get last 6 months
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push(d.toISOString().slice(0, 7))
    }

    const trends = await Promise.all(months.map(async (month) => {
        const startDate = new Date(`${month}-01`)
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1))

        const [incomes, variableExpenses, fixedExpenses, quotes] = await Promise.all([
            prisma.income.findMany({
                where: { date: { gte: startDate, lt: endDate } },
                select: { amount: true, iva: true }
            }),
            prisma.variableExpense.findMany({
                where: { date: { gte: startDate, lt: endDate } },
                select: { amount: true, iva: true }
            }),
            prisma.fixedExpense.findMany({
                where: { date: { gte: startDate, lt: endDate } },
                select: { amount: true }
            }),
            prisma.quote.findMany({
                where: {
                    isApproved: true,
                    project: {
                        createdAt: { gte: startDate, lt: endDate }
                    }
                },
                select: { isr_amount: true }
            })
        ])

        const totalIncome = incomes.reduce((sum, i) => {
            const iva = (i.iva || 0) > 0 ? i.iva : (i.amount - (i.amount / 1.16))
            return sum + (i.amount - iva)
        }, 0)

        const totalExpense = variableExpenses.reduce((sum, e) => sum + e.amount, 0) + fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalISR = quotes.reduce((sum, q) => sum + (q.isr_amount || 0), 0)

        return {
            month,
            label: format(startDate, 'MMM yy', { locale: es }),
            income: totalIncome,
            expense: totalExpense,
            utilidad: totalIncome - totalExpense - totalISR
        }
    }))

    return trends
}
