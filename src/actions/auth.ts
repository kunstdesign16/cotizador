'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = [
    'kunstdesign16@gmail.com',
    'direccion@kunstdesign.com.mx',
    'dirección@kunstdesign.com.mx'
]

export async function login(prevState: any, formData: FormData) {
    const bcrypt = await import('bcryptjs')
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: 'Credenciales inválidas' }
        }

        const userEmailLower = user.email.toLowerCase().trim()

        let finalRole = user.role
        if (ADMIN_EMAILS.includes(userEmailLower)) {
            finalRole = 'admin'
        }

        const cookieStore = await cookies()

        // Use httpOnly: false for cookies that need to be read by client-side Sidebar
        cookieStore.set('user_email', user.email, { httpOnly: false, path: '/' })
        cookieStore.set('user_role', finalRole, { httpOnly: false, path: '/' })
        cookieStore.set('user_name', user.name || 'Usuario', { httpOnly: false, path: '/' })
        cookieStore.set('auth_refresh', Date.now().toString(), { httpOnly: false, path: '/' })

        redirect('/dashboard')
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('Login error:', error)
        return { error: 'Ocurrió un error al iniciar sesión' }
    }
}

export async function register(prevState: any, formData: FormData) {
    const bcrypt = await import('bcryptjs')
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    try {
        const emailLower = email.toLowerCase().trim()
        const existingUser = await prisma.user.findUnique({
            where: { email: emailLower }
        })

        if (existingUser) {
            return { error: 'El correo electrónico ya está registrado' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const role = ADMIN_EMAILS.includes(emailLower) ? 'admin' : 'staff'

        await prisma.user.create({
            data: {
                name,
                email: emailLower,
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
        return { error: 'Ocurrió un error al crear la cuenta' }
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
