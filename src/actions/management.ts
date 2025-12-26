'use server'

import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

export async function getManagementDashboardData() {
    try {
        const { prisma } = await import('@/lib/prisma')

        // 1. Get Monthly Stats (Last 6 months)
        const monthlyStats = []
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i)
            const start = startOfMonth(date)
            const end = endOfMonth(date)
            const monthLabel = format(date, 'MMM yy')

            const incomes = await prisma.income.aggregate({
                where: { date: { gte: start, lte: end } },
                _sum: { amount: true }
            })

            const expenses = await prisma.variableExpense.aggregate({
                where: { date: { gte: start, lte: end } },
                _sum: { amount: true }
            })

            const incomeTotal = incomes._sum.amount || 0
            const expenseTotal = expenses._sum.amount || 0

            monthlyStats.push({
                month: monthLabel,
                ingresos: incomeTotal,
                egresos: expenseTotal,
                utilidad: incomeTotal - expenseTotal
            })
        }

        // 2. Project Counts
        const activeProjects = await prisma.project.count({
            where: { status: { not: 'CERRADO' }, isArchived: false }
        })
        const closedProjects = await prisma.project.count({
            where: { status: 'CERRADO', isArchived: false }
        })

        // 3. Control Lists

        // Projects with negative utility (Real expenses > Real income)
        // Only counting projects that have actually started (not just COTIZANDO)
        const negativeUtilityProjects = await prisma.project.findMany({
            where: {
                status: { in: ['PRODUCCION', 'ENTREGADO', 'APROBADO'] },
                totalEgresado: { gt: 0 }
            },
            include: { client: true }
        })
        const filteredNegativeProjects = negativeUtilityProjects.filter(p => p.totalEgresado > p.totalIngresado)

        // Orders with pending balance
        const pendingOrders = await prisma.supplierOrder.findMany({
            where: {
                paymentStatus: { not: 'PAID' }
            },
            include: {
                supplier: true,
                expenses: true
            }
        })
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

        // Aged Projects (> 30 days in non-closed status)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const agedProjects = await prisma.project.findMany({
            where: {
                status: { in: ['APROBADO', 'PRODUCCION', 'ENTREGADO'] },
                createdAt: { lt: thirtyDaysAgo }
            },
            include: { client: true },
            orderBy: { createdAt: 'asc' }
        })

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
