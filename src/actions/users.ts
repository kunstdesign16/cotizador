'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = [
    'kunstdesign16@gmail.com',
    'direccion@kunstdesign.com.mx'
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
    try {
        const cookieStore = await cookies()
        const userEmail = cookieStore.get('user_email')?.value

        if (!userEmail) {
            return null
        }

        const emailLower = userEmail.toLowerCase().trim()
        const user = await prisma.user.findUnique({
            where: { email: emailLower },
            select: { id: true, email: true, name: true, role: true }
        })

        if (!user) return null

        // Enforce admin role for specific emails even if DB says otherwise
        if (ADMIN_EMAILS.includes(emailLower)) {
            user.role = 'admin'
        }

        return user
    } catch (error) {
        console.error('Error in getCurrentUser:', error)
        return null // Fail silently to allow landing pages/login to load
    }
}

export async function getUserRole() {
    const cookieStore = await cookies()
    const roleCookie = cookieStore.get('user_role')?.value
    const emailCookie = cookieStore.get('user_email')?.value

    // Check if it's one of the forced admin emails first
    if (emailCookie && ADMIN_EMAILS.includes(emailCookie.toLowerCase().trim())) {
        return 'admin'
    }

    // Otherwise trust the cookie (if it's not tampered) or fall back to DB via getCurrentUser
    if (roleCookie) return roleCookie

    const user = await getCurrentUser()
    return user?.role || 'staff'
}
