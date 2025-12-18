'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function updateUserProfile(data: { name: string; email: string }) {
    const { prisma } = await import('@/lib/prisma')
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value

    if (!userEmail) {
        return { success: false, error: 'No autorizado' }
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: userEmail } })

        if (!user) {
            return { success: false, error: 'Usuario no encontrado' }
        }

        // Check if new email is taken by someone else
        if (data.email !== user.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } })
            if (existing) {
                return { success: false, error: 'El correo electrónico ya está en uso' }
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                email: data.email
            }
        })

        // Update cookies
        cookieStore.set('user_email', data.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
        cookieStore.set('user_name', data.name, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Update Profile Error:', error)
        return { success: false, error: 'Error al actualizar perfil' }
    }
}

export async function changeUserPassword(data: { current: string; new: string }) {
    const { prisma } = await import('@/lib/prisma')
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value

    if (!userEmail) {
        return { success: false, error: 'No autorizado' }
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: userEmail } })

        if (!user) {
            return { success: false, error: 'Usuario no encontrado' }
        }

        const isValid = await bcrypt.compare(data.current, user.password)
        if (!isValid) {
            return { success: false, error: 'La contraseña actual es incorrecta' }
        }

        const hashedPassword = await bcrypt.hash(data.new, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        console.error('Password Change Error:', error)
        return { success: false, error: 'Error al cambiar contraseña' }
    }
}
