'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = [
    'kunstdesign16@gmail.com',
    'direccion@kunstdesign.com.mx',
    'dirección@kunstdesign.com.mx'
]

export async function createUser(data: {
    email: string
    password: string
    name?: string
    role?: string
}) {
    // Security Check
    const role = await getUserRole()
    if (role !== 'admin') {
        return { success: false, error: 'No tienes permisos de administrador' }
    }

    try {
        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email }
        })
        if (existing) {
            return { success: false, error: 'El email ya está registrado' }
        }

        const isAlwaysAdmin = ADMIN_EMAILS.includes(data.email.toLowerCase().trim())
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: data.password, // TODO: Hash with bcrypt in production
                name: data.name || null,
                role: isAlwaysAdmin ? 'admin' : (data.role || 'staff')
            }
        })
        revalidatePath('/users')
        return { success: true, id: user.id }
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Error al crear usuario' }
    }
}

export async function updateUser(id: string, data: {
    email?: string
    password?: string
    name?: string
    role?: string
}) {
    // Security Check
    const role = await getUserRole()
    if (role !== 'admin') {
        return { success: false, error: 'No tienes permisos de administrador' }
    }

    try {
        await prisma.user.update({
            where: { id },
            data
        })
        revalidatePath('/users')
        return { success: true }
    } catch (error) {
        console.error('Error updating user:', error)
        return { success: false, error: 'Error al actualizar usuario' }
    }
}

export async function deleteUser(id: string) {
    // Security Check
    const role = await getUserRole()
    if (role !== 'admin') {
        return { success: false, error: 'No tienes permisos de administrador' }
    }

    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/users')
        return { success: true }
    } catch (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Error al eliminar usuario' }
    }
}

export async function getCurrentUser() {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value

    if (!userEmail) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, email: true, name: true, role: true }
    })

    return user
}

export async function getUserRole() {
    const user = await getCurrentUser()
    return user?.role || 'staff'
}
