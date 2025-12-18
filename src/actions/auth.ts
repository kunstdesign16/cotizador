'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = await import('bcryptjs')

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() } // Normalize email for lookup
        })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: 'Credenciales inválidas' }
        }

        // Active check
        if (!user.isActive) {
            return { error: 'Cuenta desactivada. Contacte al administrador.' }
        }

        // Valid user - set session cookies

        // ADMIN OVERRIDE FOR WHITELISTED EMAILS (Robust Check)
        // Ensure these exact strings match your user emails
        const ADMIN_EMAILS = ['kunstdesign16@gmail.com', 'dirección@kunstdesign.com.mx', 'direccion@kunstdesign.com.mx']
        const userEmailLower = user.email.toLowerCase().trim()

        let finalRole = user.role
        let roleUpdated = false

        console.log(`[LOGIN] User: ${userEmailLower}, Current Role: ${user.role}`)

        // Force Admin role if email is whitelisted
        if (ADMIN_EMAILS.includes(userEmailLower)) {
            console.log(`[LOGIN] Whitelisted Admin detected: ${userEmailLower}`)

            // Always ensure the database reflects this, even if it says otherwise currently
            // We do this BEFORE setting cookies to ensure consistency
            if (user.role !== 'admin') {
                console.log(`[LOGIN] Updating user ${user.id} to ADMIN in database...`)
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'admin' }
                })
                finalRole = 'admin'
                roleUpdated = true
                console.log(`[LOGIN] User updated to ADMIN.`)
            } else {
                finalRole = 'admin' // Confirm it's admin
                console.log(`[LOGIN] User is already ADMIN in db.`)
            }
        }

        const cookieStore = await cookies()

        // Force update user_role cookie with finalRole
        cookieStore.set('user_email', user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
        cookieStore.set('user_role', finalRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
        cookieStore.set('user_name', user.name || 'Usuario', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
        // Force refresh via a timestamp cookie to ensure client components re-read
        cookieStore.set('auth_refresh', Date.now().toString(), { path: '/' })

        console.log(`[LOGIN] Session set. Role: ${finalRole}`)

        redirect('/dashboard')
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('Login error:', error)
        return { error: 'Ocurrió un error al iniciar sesión' }
    }
}

export async function register(prevState: any, formData: FormData) {
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = await import('bcryptjs')

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return { error: 'Por favor complete todos los campos' }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: 'El correo electrónico ya está registrado' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // ADMIN OVERRIDE FOR WHITELISTED EMAILS ON REGISTRATION
        const ADMIN_EMAILS = ['kunstdesign16@gmail.com', 'dirección@kunstdesign.com.mx', 'direccion@kunstdesign.com.mx']
        const role = ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? 'admin' : 'staff'

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        redirect('/login')
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
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
