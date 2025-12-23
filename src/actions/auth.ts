'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = [
    'kunstdesign16@gmail.com',
    'direccion@kunstdesign.com.mx'
]

export async function login(prevState: any, formData: FormData) {
    let bcrypt;
    try {
        bcrypt = await import('bcryptjs');
    } catch (e) {
        console.error('Failed to load bcryptjs');
    }

    const emailInput = formData.get('email') as string
    const password = formData.get('password') as string

    if (!emailInput || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    const email = emailInput.toLowerCase().trim()

    try {
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { error: 'Credenciales inválidas' }
        }

        let isCorrectPassword = false

        // 1. Try bcrypt comparison
        if (bcrypt) {
            try {
                isCorrectPassword = await bcrypt.compare(password, user.password)
            } catch (e) {
                // Not a bcrypt hash
            }
        }

        // 2. Fallback: Plain text comparison
        if (!isCorrectPassword) {
            if (password === user.password) {
                isCorrectPassword = true
            }
        }

        if (!isCorrectPassword) {
            return { error: 'Credenciales inválidas' }
        }

        // FORCE ADMIN ROLE in the session logic
        let finalRole = user.role
        if (ADMIN_EMAILS.some(e => e.toLowerCase().trim() === email)) {
            finalRole = 'admin'
        }

        const cookieStore = await cookies()

        // EXTREMELY EXPLICIT COOKIE SETTINGS
        const cookieOptions = {
            httpOnly: false,
            path: '/',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }

        // We set both the original and forced values
        cookieStore.set('user_email', user.email, cookieOptions)
        cookieStore.set('user_role', finalRole, cookieOptions)
        cookieStore.set('user_name', user.name || 'Usuario', cookieOptions)
        cookieStore.set('auth_refresh', Date.now().toString(), cookieOptions)

        redirect('/dashboard')
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('Login error:', error)
        return { error: 'Ocurrió un error: ' + error.message }
    }
}

export async function register(prevState: any, formData: FormData) {
    const bcrypt = await import('bcryptjs')
    const name = formData.get('name') as string
    const emailInput = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !emailInput || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    const email = emailInput.toLowerCase().trim()

    try {
        const { prisma } = await import('@/lib/prisma')
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: 'El correo electrónico ya está registrado' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const role = ADMIN_EMAILS.some(e => e.toLowerCase().trim() === email) ? 'admin' : 'staff'

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        redirect('/login')
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('Register error:', error)
        return { error: 'Error: ' + error.message }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_email')
    cookieStore.delete('user_role')
    cookieStore.delete('user_name')
    cookieStore.delete('auth_refresh')
    redirect('/login')
}
