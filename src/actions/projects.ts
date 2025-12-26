'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(data: { name: string; clientId: string; description?: string }) {
    const project = await (prisma as any).project.create({
        data: {
            name: data.name,
            clientId: data.clientId,
            description: data.description,
            status: 'COTIZANDO'
        }
    })

    revalidatePath('/projects')
    return project
}

export async function getProjectClosureEligibility(projectId: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: {
                supplierOrders: true
            }
        })

        if (!project) return { eligible: false, error: 'Proyecto no encontrado' }
        if (project.status === 'CERRADO') return { eligible: false, error: 'El proyecto ya está cerrado' }

        const pendingOrders = project.supplierOrders.filter((order: any) => order.paymentStatus !== 'PAID')

        return {
            eligible: pendingOrders.length === 0,
            pendingCount: pendingOrders.length,
            status: project.status
        }
    } catch (_error) {
        return { eligible: false, error: 'Error' }
    }
}

export async function closeProject(projectId: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const eligibility = await getProjectClosureEligibility(projectId)

        if (!eligibility.eligible) {
            return {
                success: false,
                error: eligibility.error || `No se puede cerrar el proyecto. Tiene ${eligibility.pendingCount} órdenes sin liquidar.`
            }
        }

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { status: 'CERRADO' }
        })

        revalidatePath('/projects')
        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/dashboard')

        return { success: true }
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
    }
}

export async function deleteProject(projectId: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        // Verificar proyecto existe
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: {
                quotes: true,
                supplierOrders: true,
                incomes: true,
                expenses: true
            }
        })

        if (!project) {
            return { success: false, error: 'Proyecto no encontrado' }
        }

        // VALIDACIÓN 1: Cotizaciones aprobadas
        const approvedQuotes = project.quotes.filter((q: any) => q.isApproved)
        if (approvedQuotes.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar el proyecto porque tiene ${approvedQuotes.length} cotización(es) aprobada(s). Esto indica que ya hay compromisos con el cliente.`,
                reason: 'approved_quotes'
            }
        }

        // VALIDACIÓN 2: Órdenes de compra
        if (project.supplierOrders.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar el proyecto porque tiene ${project.supplierOrders.length} orden(es) de compra. Esto indica que ya hay compromisos con proveedores.`,
                reason: 'supplier_orders'
            }
        }

        // VALIDACIÓN 3: Ingresos registrados
        if (project.incomes.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar el proyecto porque tiene ${project.incomes.length} ingreso(s) registrado(s). Esto indica que ya hay movimientos financieros.`,
                reason: 'incomes'
            }
        }

        // VALIDACIÓN 4: Gastos variables
        if (project.expenses.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar el proyecto porque tiene ${project.expenses.length} gasto(s) registrado(s). Esto indica que ya hay movimientos financieros.`,
                reason: 'expenses'
            }
        }

        // VALIDACIÓN 5: Cotizaciones en borrador (eliminar en cascada)
        if (project.quotes.length > 0) {
            await (prisma as any).quote.deleteMany({
                where: { projectId: projectId }
            })
        }

        // Eliminar proyecto
        await (prisma as any).project.delete({
            where: { id: projectId }
        })

        revalidatePath('/projects')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (_error) {
        console.error('Error:', _error)
        return {
            success: false,
            error: 'Error'
        }
    }
}
