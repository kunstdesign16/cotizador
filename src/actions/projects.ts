'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-utils'

async function generateUniqueNumber(prefix: string, model: string, field: string) {
    let attempts = 0
    while (attempts < 10) {
        // Generate a 6-digit random number
        const num = Math.floor(100000 + Math.random() * 900000).toString()
        const fullNumber = num

        const existing = await (prisma as any)[model].findUnique({
            where: { [field]: fullNumber }
        })

        if (!existing) return fullNumber
        attempts++
    }
    return Math.floor(100000 + Math.random() * 900000).toString() // Fallback after 10 tries
}

export async function createProject(data: { name: string; clientId: string; description?: string }) {
    try {
        const user = await getCurrentUser()

        // Generate unique Order and Folio (6 digits)
        const orderNumber = await generateUniqueNumber('', 'project', 'orderNumber')
        const folioNumber = await generateUniqueNumber('', 'project', 'folioNumber')

        const project = await (prisma as any).project.create({
            data: {
                name: data.name,
                clientId: data.clientId,
                description: data.description,
                status: 'draft',
                financialStatus: 'ABIERTO',
                userId: user?.id || null,
                orderNumber,
                folioNumber
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

export async function updateDeliveryInfo(projectId: string, data: {
    deliveryDate?: Date | null,
    transportType?: string,
    deliveryNotes?: string,
    sellerName?: string,
    invoiceUrl?: string,
    deliveryExtraItems?: any
}) {
    try {
        await (prisma as any).project.update({
            where: { id: projectId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        })
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Error updating delivery info:', err)
        return { success: false, error: 'Error al actualizar información de entrega' }
    }
}

export async function updateDeliveryItemDimensions(itemId: string, data: {
    packagingConcept?: string,
    boxes?: number,
    piecesPerBox?: number,
    deliveryObservations?: string
}) {
    try {
        const { prisma } = await import('@/lib/prisma')
        await (prisma as any).quoteItem.update({
            where: { id: itemId },
            data
        })
        return { success: true }
    } catch (err: any) {
        console.error('Error updating item delivery info:', err)
        return { success: false, error: 'Error al actualizar cajas' }
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

export async function fixLegacyProjectNumbers() {
    try {
        const projects = await (prisma as any).project.findMany({
            where: {
                OR: [
                    { orderNumber: null },
                    { folioNumber: null }
                ]
            }
        });

        for (const project of projects) {
            const updates: any = {};
            if (!project.orderNumber) {
                updates.orderNumber = await generateUniqueNumber('', 'project', 'orderNumber');
            }
            if (!project.folioNumber) {
                updates.folioNumber = await generateUniqueNumber('', 'project', 'folioNumber');
            }

            if (Object.keys(updates).length > 0) {
                await (prisma as any).project.update({
                    where: { id: project.id },
                    data: updates
                });
            }
        }

        revalidatePath('/projects');
        return { success: true, count: projects.length };
    } catch (error) {
        console.error('Error fixing legacy numbers:', error);
        return { success: false };
    }
}
