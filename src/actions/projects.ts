'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-utils'

export async function createProject(data: { name: string; clientId: string; description?: string }) {
    try {
        const user = await getCurrentUser()
        const project = await (prisma as any).project.create({
            data: {
                name: data.name,
                clientId: data.clientId,
                description: data.description,
                status: 'draft',
                financialStatus: 'ABIERTO',
                userId: user?.id || null
            }
        })

        revalidatePath('/projects')
        revalidatePath('/dashboard')
        return { success: true, data: project }
    } catch (err: any) {
        console.error('Error creating project:', err)
        return { success: false, error: err.message || 'Error al crear el proyecto' }
    }
}

export async function getProjectClosureEligibility(projectId: string) {
    try {
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: {
                supplierOrders: true
            }
        })

        if (!project) return { eligible: false, error: 'Proyecto no encontrado' }
        if (project.financialStatus === 'CERRADO') return { eligible: false, error: 'El proyecto ya está cerrado financieramente' }

        const pendingOrders = project.supplierOrders.filter((order: any) => order.paymentStatus !== 'PAID')

        return {
            eligible: pendingOrders.length === 0,
            pendingCount: pendingOrders.length,
            status: project.status as string
        }
    } catch (_error) {
        return { eligible: false, error: 'Error' }
    }
}

export async function closeProject(projectId: string) {
    try {
        const { prisma } = await import('@/lib/prisma') // Ensure prisma import in scope if needed, though likely available globally in file context

        await prisma.$transaction(async (tx) => {
            // 1. Mark all pending supplier orders as PAID (Liquidated)
            await tx.supplierOrder.updateMany({
                where: {
                    projectId: projectId,
                    paymentStatus: { not: 'PAID' }
                },
                data: { paymentStatus: 'PAID' }
            })

            // 2. Close Project + Set as Delivered
            await tx.project.update({
                where: { id: projectId },
                data: {
                    financialStatus: 'CERRADO',
                    status: 'closed'
                }
            })
        })

        revalidatePath('/projects')
        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/dashboard')

        return { success: true }
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error al cerrar el proyecto' }
    }
}

export async function deleteProject(projectId: string) {
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
        return { success: false, error: 'Error' }
    }
}

export async function updateProjectStatus(projectId: string, status: 'draft' | 'active' | 'closed' | 'cancelled') {
    const { prisma } = await import('@/lib/prisma')

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        })

        if (!project) return { success: false, error: 'Proyecto no encontrado' }

        if (project.financialStatus === 'CERRADO') {
            return { success: false, error: 'No se puede cambiar el estado de un proyecto cerrado financieramente.' }
        }

        // APROBADO check removed
        if ((status as any) === 'APROBADO') {
            return { success: false, error: 'El estado APROBADO no es válido. Use active.' }
        }

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { status }
        })

        revalidatePath('/projects')
        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/dashboard')

        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error al actualizar estado' }
    }
}

export async function cancelProject(projectId: string) {
    const { prisma } = await import('@/lib/prisma')

    // SAFE CANCELLATION CHECK
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { incomes: true, expenses: true }
    })

    if (!project) return { success: false, error: 'Proyecto no encontrado' }

    if (project.incomes.length > 0) {
        return { success: false, error: 'No se puede cancelar un proyecto con ingresos registrados. Debe cerrarlo financieramente.' }
    }

    if (project.expenses.length > 0) {
        return { success: false, error: 'No se puede cancelar un proyecto con egresos registrados. Debe cerrarlo financieramente.' }
    }

    return updateProjectStatus(projectId, 'cancelled')
}
