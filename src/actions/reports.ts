'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Verify admin access for all report actions
async function verifyAdminAccess() {
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value

    if (role !== 'admin') {
        throw new Error('Acceso no autorizado. Solo administradores pueden generar reportes.')
    }
    return role
}

// Get list of all projects for selector
export async function getProjectsList() {
    await verifyAdminAccess()

    try {
        const projects = await prisma.project.findMany({
            include: {
                client: true,
                quotes: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        return {
            success: true,
            projects: projects.map(p => ({
                id: p.id,
                name: p.name,
                clientName: p.client.name,
                status: p.status,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                quotesCount: p.quotes.length
            }))
        }
    } catch (_error: any) {
        console.error('Error fetching projects list:', error)
        return { success: false, error: error.message }
    }
}

// Get complete project report
export async function getProjectReport(projectId: string) {
    await verifyAdminAccess()

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                client: true,
                user: true,
                quotes: {
                    include: {
                        items: true,
                        user: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                supplierOrders: {
                    include: {
                        supplier: true,
                        quote: {
                            select: {
                                project_name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                supplierTasks: {
                    include: {
                        supplier: true,
                        quote: {
                            select: {
                                project_name: true
                            }
                        }
                    },
                    orderBy: { expectedDate: 'asc' }
                },
                incomes: {
                    orderBy: { date: 'desc' }
                },
                expenses: {
                    include: {
                        supplier: true
                    },
                    orderBy: { date: 'desc' }
                }
            }
        })

        if (!project) {
            return { success: false, error: 'Proyecto no encontrado' }
        }

        // Calculate financial summary
        const totalIngresos = project.incomes.reduce((sum, income) => sum + income.amount, 0)
        const totalEgresos = project.expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const utilidad = totalIngresos - totalEgresos
        const margenUtilidad = totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0

        // Quotes summary
        const quotesSummary = {
            total: project.quotes.length,
            draft: project.quotes.filter(q => q.status === 'DRAFT').length,
            sent: project.quotes.filter(q => q.status === 'SENT').length,
            approved: project.quotes.filter(q => q.status === 'APPROVED').length,
            facturado: project.quotes.filter(q => q.status === 'FACTURADO').length,
            cobrado: project.quotes.filter(q => q.status === 'COBRADO').length,
            totalCotizado: project.quotes.reduce((sum, q) => sum + q.total, 0)
        }

        // Tasks summary
        const tasksSummary = {
            total: project.supplierTasks.length,
            pending: project.supplierTasks.filter(t => t.status === 'PENDING').length,
            inProgress: project.supplierTasks.filter(t => t.status === 'IN_PROGRESS').length,
            completed: project.supplierTasks.filter(t => t.status === 'COMPLETED').length
        }

        // Orders summary
        const ordersSummary = {
            total: project.supplierOrders.length,
            pending: project.supplierOrders.filter(o => o.status === 'PENDING').length,
            ordered: project.supplierOrders.filter(o => o.status === 'ORDERED').length,
            received: project.supplierOrders.filter(o => o.status === 'RECEIVED').length
        }

        return {
            success: true,
            report: {
                project: {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt
                },
                client: {
                    name: project.client.name,
                    company: project.client.company,
                    email: project.client.email,
                    phone: project.client.phone
                },
                financial: {
                    totalIngresos,
                    totalEgresos,
                    utilidad,
                    margenUtilidad: margenUtilidad.toFixed(2)
                },
                quotes: quotesSummary,
                quotesDetail: project.quotes,
                tasks: tasksSummary,
                tasksDetail: project.supplierTasks,
                orders: ordersSummary,
                ordersDetail: project.supplierOrders,
                incomes: project.incomes,
                expenses: project.expenses
            }
        }
    } catch (_error: any) {
        console.error('Error generating project report:', error)
        return { success: false, error: error.message }
    }
}

// Get financial kardex for a period
export async function getFinancialKardex(
    startDate: string,
    endDate: string,
    flowType: 'all' | 'ingresos' | 'egresos' = 'all'
) {
    await verifyAdminAccess()

    try {
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Include full end date

        // Fetch incomes
        const incomes = flowType !== 'egresos' ? await prisma.income.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                client: true,
                project: true,
                quote: {
                    select: {
                        project_name: true
                    }
                }
            },
            orderBy: { date: 'asc' }
        }) : []

        // Fetch variable expenses
        const variableExpenses = flowType !== 'ingresos' ? await prisma.variableExpense.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                supplier: true,
                project: true,
                quote: {
                    select: {
                        project_name: true
                    }
                }
            },
            orderBy: { date: 'asc' }
        }) : []

        // Fetch fixed expenses
        const fixedExpenses = flowType !== 'ingresos' ? await prisma.fixedExpense.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { date: 'asc' }
        }) : []

        // Combine and format transactions
        const transactions: any[] = []

        incomes.forEach(income => {
            transactions.push({
                date: income.date,
                type: 'INGRESO',
                proyecto: income.project?.name || income.quote?.project_name || '-',
                concepto: income.description || `Ingreso de ${income.client?.name || 'Cliente'}`,
                cliente: income.client?.name || '-',
                ingreso: income.amount,
                egreso: 0,
                saldo: 0 // Will calculate later
            })
        })

        variableExpenses.forEach(expense => {
            transactions.push({
                date: expense.date,
                type: 'EGRESO_VARIABLE',
                proyecto: expense.project?.name || expense.quote?.project_name || '-',
                concepto: expense.description,
                cliente: expense.supplier?.name || '-',
                ingreso: 0,
                egreso: expense.amount,
                saldo: 0
            })
        })

        fixedExpenses.forEach(expense => {
            transactions.push({
                date: expense.date,
                type: 'EGRESO_FIJO',
                proyecto: '-',
                concepto: expense.description,
                cliente: expense.category || 'Gasto Fijo',
                ingreso: 0,
                egreso: expense.amount,
                saldo: 0
            })
        })

        // Sort by date
        transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

        // Calculate running balance
        let runningBalance = 0
        transactions.forEach(transaction => {
            runningBalance += transaction.ingreso - transaction.egreso
            transaction.saldo = runningBalance
        })

        // Calculate totals
        const totals = {
            totalIngresos: transactions.reduce((sum, t) => sum + t.ingreso, 0),
            totalEgresos: transactions.reduce((sum, t) => sum + t.egreso, 0),
            saldoFinal: runningBalance
        }

        return {
            success: true,
            kardex: {
                startDate: start,
                endDate: end,
                flowType,
                transactions,
                totals
            }
        }
    } catch (_error: any) {
        console.error('Error generating financial kardex:', error)
        return { success: false, error: error.message }
    }
}

// Get client report
export async function getClientReport(clientId: string) {
    await verifyAdminAccess()

    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                projects: {
                    include: {
                        quotes: true,
                        incomes: true,
                        expenses: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                quotes: {
                    include: {
                        items: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                incomes: {
                    orderBy: { date: 'desc' }
                }
            }
        })

        if (!client) {
            return { success: false, error: 'Cliente no encontrado' }
        }

        // Calculate metrics
        const totalProyectos = client.projects.length
        const totalCotizaciones = client.quotes.length
        const totalIngresos = client.incomes.reduce((sum, income) => sum + income.amount, 0)

        // Calculate total expenses from projects
        const totalEgresos = client.projects.reduce((sum, project) => {
            return sum + project.expenses.reduce((expSum, exp) => expSum + exp.amount, 0)
        }, 0)

        const utilidadTotal = totalIngresos - totalEgresos
        const margenPromedio = totalIngresos > 0 ? (utilidadTotal / totalIngresos) * 100 : 0

        // Quotes by status
        const quotesByStatus = {
            draft: client.quotes.filter(q => q.status === 'DRAFT').length,
            sent: client.quotes.filter(q => q.status === 'SENT').length,
            approved: client.quotes.filter(q => q.status === 'APPROVED').length,
            facturado: client.quotes.filter(q => q.status === 'FACTURADO').length,
            cobrado: client.quotes.filter(q => q.status === 'COBRADO').length
        }

        // Projects by status
        const projectsByStatus = {
            cotizando: client.projects.filter(p => p.status === 'COTIZANDO').length,
            aprobado: client.projects.filter(p => p.status === 'APROBADO').length,
            produccion: client.projects.filter(p => p.status === 'PRODUCCION').length,
            entregado: client.projects.filter(p => p.status === 'ENTREGADO').length,
            cerrado: client.projects.filter(p => p.status === 'CERRADO').length
        }

        return {
            success: true,
            report: {
                client: {
                    id: client.id,
                    name: client.name,
                    company: client.company,
                    email: client.email,
                    phone: client.phone,
                    createdAt: client.createdAt
                },
                metrics: {
                    totalProyectos,
                    totalCotizaciones,
                    totalIngresos,
                    totalEgresos,
                    utilidadTotal,
                    margenPromedio: margenPromedio.toFixed(2)
                },
                quotesByStatus,
                projectsByStatus,
                projects: client.projects,
                quotes: client.quotes,
                incomes: client.incomes
            }
        }
    } catch (_error: any) {
        console.error('Error generating client report:', _error)
        return { success: false, error: _error.message }
    }
}

// Get supplier report
export async function getSupplierReport(supplierId: string) {
    await verifyAdminAccess()

    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                orders: {
                    include: {
                        quote: {
                            select: {
                                project_name: true
                            }
                        },
                        project: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                tasks: {
                    include: {
                        quote: {
                            select: {
                                project_name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                expenses: {
                    include: {
                        project: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: { date: 'desc' }
                }
            }
        })

        if (!supplier) {
            return { success: false, error: 'Proveedor no encontrado' }
        }

        // Calculate metrics
        const totalOrdenes = supplier.orders.length
        const totalTareas = supplier.tasks.length
        const totalPagos = supplier.expenses.reduce((sum, expense) => sum + expense.amount, 0)

        // Orders by status
        const ordersByStatus = {
            pending: supplier.orders.filter(o => o.status === 'PENDING').length,
            ordered: supplier.orders.filter(o => o.status === 'ORDERED').length,
            received: supplier.orders.filter(o => o.status === 'RECEIVED').length
        }

        // Payment status
        const paymentStatus = {
            pending: supplier.orders.filter(o => o.paymentStatus === 'PENDING').length,
            partial: supplier.orders.filter(o => o.paymentStatus === 'PARTIAL').length,
            paid: supplier.orders.filter(o => o.paymentStatus === 'PAID').length
        }

        // Tasks by status
        const tasksByStatus = {
            pending: supplier.tasks.filter(t => t.status === 'PENDING').length,
            inProgress: supplier.tasks.filter(t => t.status === 'IN_PROGRESS').length,
            completed: supplier.tasks.filter(t => t.status === 'COMPLETED').length
        }

        return {
            success: true,
            report: {
                supplier: {
                    id: supplier.id,
                    name: supplier.name,
                    type: supplier.type,
                    createdAt: supplier.createdAt
                },
                metrics: {
                    totalOrdenes,
                    totalTareas,
                    totalPagos
                },
                ordersByStatus,
                paymentStatus,
                tasksByStatus,
                orders: supplier.orders,
                tasks: supplier.tasks,
                expenses: supplier.expenses
            }
        }
    } catch (_error: any) {
        console.error('Error generating supplier report:', error)
        return { success: false, error: error.message }
    }
}

// Get clients list for selector
export async function getClientsList() {
    await verifyAdminAccess()

    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })

        return {
            success: true,
            clients: clients.map(c => ({
                id: c.id,
                name: c.name,
                company: c.company,
                email: c.email
            }))
        }
    } catch (_error: any) {
        console.error('Error fetching clients list:', error)
        return { success: false, error: error.message }
    }
}

// Get suppliers list for selector
export async function getSuppliersList() {
    await verifyAdminAccess()

    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        })

        return {
            success: true,
            suppliers: suppliers.map(s => ({
                id: s.id,
                name: s.name,
                type: s.type
            }))
        }
    } catch (_error: any) {
        console.error('Error fetching suppliers list:', error)
        return { success: false, error: error.message }
    }
}
