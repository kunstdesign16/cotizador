'use server'

import { revalidatePath } from 'next/cache'

export async function createSupplierTask(
    supplierId: string,
    quoteId: string, // Tasks are generally linked to a project/quote
    description: string,
    expectedDate?: Date,
    priority: string = 'MEDIUM'
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const task = await prisma.supplierTask.create({
            data: {
                supplierId,
                quoteId: quoteId || undefined, // Allow null/undefined
                description,
                expectedDate,
                priority,
                status: 'PENDING'
            }
        })
        revalidatePath('/suppliers')
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true, id: task.id }
    } catch (error) {
        console.error('Error creating task:', error)
        return { success: false, error: 'Error al crear tarea' }
    }
}

export async function updateTaskStatus(id: string, status: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierTask.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/suppliers')
        revalidatePath('/tasks')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando estatus' }
    }
}

export async function updateTaskPriority(id: string, priority: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierTask.update({
            where: { id },
            data: { priority }
        })
        revalidatePath('/suppliers')
        revalidatePath('/tasks')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando prioridad' }
    }
}

export async function updateSupplierTask(
    id: string,
    data: {
        description?: string
        priority?: string
        expectedDate?: Date | null
    }
) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierTask.update({
            where: { id },
            data
        })
        revalidatePath('/suppliers')
        revalidatePath('/tasks')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error actualizando tarea' }
    }
}

export async function deleteTask(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.supplierTask.delete({ where: { id } })
        revalidatePath('/suppliers')
        revalidatePath('/tasks')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar tarea' }
    }
}
