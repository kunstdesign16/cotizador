'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

async function checkAdmin() {
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value
    return role === 'admin'
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    const isAdmin = await checkAdmin()
    if (!isAdmin) return { success: false, error: 'No autorizado' }

    const { prisma } = await import('@/lib/prisma')
    try {
        // Prevent deactivating oneself (optional but good UX)
        // We'd need to know current user ID, but for now we skip that check unless critical

        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al cambiar estatus' }
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    const isAdmin = await checkAdmin()
    if (!isAdmin) return { success: false, error: 'No autorizado' }

    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al cambiar rol' }
    }
}
