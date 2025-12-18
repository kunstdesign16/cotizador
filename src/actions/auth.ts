'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

export async function login(prevState: any, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = LoginSchema.safeParse({ email, password })

    if (!result.success) {
        return { error: 'Invalid input' }
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    // Password check (should use bcrypt in production)
    if (!user || user.password !== password) {
        // Fallback for demo if no users seeded
        if (email === 'admin@kunst.mx' && password === 'kunst') {
            // Create admin user if doesn't exist
            const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@kunst.mx' } })
            if (!existingAdmin) {
                await prisma.user.create({
                    data: {
                        email: 'admin@kunst.mx',
                        password: 'kunst',
                        name: 'Admin',
                        role: 'admin'
                    }
                })
            }
            // Set session cookie
            const cookieStore = await cookies()
            cookieStore.set('user_email', 'admin@kunst.mx', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })
            cookieStore.set('user_role', 'admin', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            })
        } else {
            return { error: 'Credenciales inválidas' }
        }
    } else {
        // Valid user - set session cookies
        const cookieStore = await cookies()
        cookieStore.set('user_email', user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })
        cookieStore.set('user_role', user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })
    }

    redirect('/dashboard')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_email')
    cookieStore.delete('user_role')
    redirect('/login')
}
