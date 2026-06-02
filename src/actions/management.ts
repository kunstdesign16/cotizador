'use server'

import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

export async function getManagementDashboardData() {
    try {
        const { prisma } = await import('@/lib/prisma')

        // 1. Prepare Monthly Stats promises (Last 6 months)
        const monthlyStatsPromises = []
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i)
            const start = startOfMonth(date)
            const end = endOfMonth(date)
            const monthLabel = format(date, 'MMM yy')

            monthlyStatsPromises.push(
                Promise.all([
                    prisma.income.findMany({
                        where: { date: { gte: start, lte: end } },
                        select: { amount: true, iva: true }
                    }),
                    prisma.variableExpense.findMany({
                        where: { date: { gte: start, lte: end } },
                        select: { amount: true, iva: true }
                    }),
                    prisma.quote.findMany({
                        where: {
                            isApproved: true,
                            project: {
                                createdAt: { gte: start, lte: end }
                            }
                        },
                        select: { isr_amount: true }
                    })
                ]).then(([incomes, expenses, quotes]) => {
                    const incomeSubtotal = incomes.reduce((sum, i) => {
                        const iva = (i.iva || 0) > 0 ? i.iva : (i.amount - (i.amount / 1.16))
                        return sum + (i.amount - iva)
                    }, 0)

                    // expense.amount = subtotal (sin IVA) — consistent after migration
                    const expenseSubtotal = expenses.reduce((sum, e) => sum + e.amount, 0)
                    const isrTotal = quotes.reduce((sum, q) => sum + (q.isr_amount || 0), 0)

                    return {
                        month: monthLabel,
                        ingresos: incomeSubtotal,
                        egresos: expenseSubtotal,
                        utilidad: incomeSubtotal - expenseSubtotal - isrTotal
                    }
                })
            )
        }

        // 2. Prepare other promises
        const activeProjectsPromise = (prisma as any).project.count({
            where: {
                status: { notIn: ['closed', 'cancelled'] },
                financialStatus: 'ABIERTO'
            }
        })
        const closedProjectsPromise = (prisma as any).project.count({
            where: {
                OR: [
                    { financialStatus: 'CERRADO' },
                    { status: 'closed' }
                ],
                status: { not: 'cancelled' }
            }
        })
        const negativeUtilityProjectsPromise = (prisma as any).project.findMany({
            where: {
                status: { in: ['active', 'closed'] },
                financialStatus: 'ABIERTO',
                totalEgresado: { gt: 0 }
            },
            include: { client: true }
        })
        const pendingOrdersPromise = prisma.supplierOrder.findMany({
            where: {
                paymentStatus: { not: 'PAID' }
            },
            include: {
                supplier: true,
                expenses: true
            }
        })
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const agedProjectsPromise = (prisma as any).project.findMany({
            where: {
                status: { in: ['active'] },
                financialStatus: 'ABIERTO',
                createdAt: { lt: thirtyDaysAgo }
            },
            include: { client: true },
            orderBy: { createdAt: 'asc' }
        })

        // 3. Resolve everything in parallel
        const [
            monthlyStats,
            activeProjects,
            closedProjects,
            negativeUtilityProjects,
            pendingOrders,
            agedProjects
        ] = await Promise.all([
            Promise.all(monthlyStatsPromises),
            activeProjectsPromise,
            closedProjectsPromise,
            negativeUtilityProjectsPromise,
            pendingOrdersPromise,
            agedProjectsPromise
        ])

        const filteredNegativeProjects = negativeUtilityProjects.filter((p: any) => p.totalEgresado > p.totalIngresado)

        // Manually calculate remaining balance for each order
        const ordersWithBalance = pendingOrders.map((order: any) => {
            const totalItems = (order.items as any[] || []).reduce((acc, item) => acc + (item.quantity * (item.unitCost || 0)), 0)
            const paid = order.expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0)
            return {
                ...order,
                total: totalItems,
                paid,
                balance: totalItems - paid
            }
        }).filter(o => o.balance > 0)

        return {
            monthlyStats,
            activeProjects,
            closedProjects,
            negativeUtilityProjects: JSON.parse(JSON.stringify(filteredNegativeProjects)),
            pendingOrders: JSON.parse(JSON.stringify(ordersWithBalance)),
            agedProjects: JSON.parse(JSON.stringify(agedProjects))
        }

    } catch (_error) {
        console.error('Error fetching management data:', _error)
        throw _error
    }
}
