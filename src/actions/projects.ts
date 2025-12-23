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
    } catch (error) {
        return { eligible: false, error: 'Error al verificar elegibilidad' }
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
    } catch (error) {
        console.error('Error closing project:', error)
        return { success: false, error: 'Error al cerrar el proyecto' }
    }
}
