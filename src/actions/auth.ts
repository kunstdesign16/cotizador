'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

const RegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
})

export async function register(prevState: any, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = RegisterSchema.safeParse({ name, email, password })

    if (!result.success) {
        return { error: 'Datos inválidos. Verifica que la contraseña tenga al menos 6 caracteres.' }
    }

    try {
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            return { error: 'El correo electrónico ya está registrado.' }
        }

        // Check if this is the first user
        const userCount = await prisma.user.count()
        const role = userCount === 0 ? 'admin' : 'staff'

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // TODO: Hash in production
                role,
            }
        })

        // Auto-login
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

    } catch (error) {
        console.error("Registration error:", error)
        return { error: 'Error al crear la cuenta. Intente nuevamente.' }
    }

    redirect('/dashboard')
}

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

        // ADMIN OVERRIDE FOR WHITELISTED EMAILS (Robust Check)
        const ADMIN_EMAILS = ['kunstdesign16@gmail.com', 'dirección@kunstdesign.com.mx', 'direccion@kunstdesign.com.mx']
        const userEmailLower = user.email.toLowerCase().trim()

        let finalRole = user.role

        // Force Admin role if email is whitelisted
        if (ADMIN_EMAILS.includes(userEmailLower)) {
            // Always ensure the database reflects this, even if it says otherwise currently
            if (user.role !== 'admin') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'admin' }
                })
            }
            finalRole = 'admin'
        }

        const cookieStore = await cookies()

        // Force update user_role cookie with finalRole
        cookieStore.set('user_email', user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })
        cookieStore.set('user_role', finalRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })
        cookieStore.set('user_name', user.name || 'Usuario', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })

        redirect('/dashboard')
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_email')
    cookieStore.delete('user_role')
    redirect('/login')
}
