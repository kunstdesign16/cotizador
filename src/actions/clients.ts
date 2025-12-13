'use server'

import { revalidatePath } from 'next/cache'

export type ClientState = {
    errors?: {
        name?: string[]
        email?: string[]
        company?: string[]
        phone?: string[]
    }
    message?: string
}

export async function getClients() {
    const { prisma } = await import('@/lib/prisma')
    return await prisma.client.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { quotes: true }
            }
        }
    })
}

export async function createClient(prevState: ClientState, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    // Basic Validation
    if (!name) {
        return {
            errors: {
                name: ['El nombre es obligatorio']
            },
            message: 'Error de validación'
        }
    }

    try {
        const client = await prisma.client.create({
            data: {
                name,
                company,
                email,
                phone
            }
        })
        revalidatePath('/clients')
        revalidatePath('/quotes/new') // Revalidate quotes page to refresh client list
        return { message: 'Cliente creado exitosamente', success: true, id: client.id }
    } catch (e) {
        console.error(e)
        return { message: 'Error al crear el cliente' }
    }
}

export async function updateClient(id: string, prevState: ClientState, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!name) {
        return {
            errors: { name: ['El nombre es obligatorio'] },
            message: 'Error de validación'
        }
    }

    try {
        await prisma.client.update({
            where: { id },
            data: { name, company, email, phone }
        })
        revalidatePath('/clients')
        revalidatePath('/clients/' + id)
        revalidatePath('/quotes/new')
        return { message: 'Cliente actualizado', success: true }
    } catch (e) {
        return { message: 'Error al actualizar' }
    }
}

export async function deleteClient(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.client.delete({
            where: { id }
        })
        revalidatePath('/clients')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar' }
    }
}
