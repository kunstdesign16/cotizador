'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * BYPASS AUTHENTICATION
 * This is a temporary overrides to allow full access without DB checks.
 * User requested to remove login restrictions.
 */

export async function login(prevState: any, formData: FormData) {
    // We ignore the input and just grant access
    const cookieStore = await cookies()

    // Set a universal "Admin" session
    cookieStore.set('user_email', 'admin@kunstdesign.com') // Placeholder
    cookieStore.set('user_role', 'admin') // Full permissions
    cookieStore.set('user_name', 'Administrador')
    cookieStore.set('auth_refresh', Date.now().toString())

    redirect('/dashboard')
}

export async function register(prevState: any, formData: FormData) {
    // Same behavior for register - just let them in
    const cookieStore = await cookies()

    cookieStore.set('user_email', 'admin@kunstdesign.com')
    cookieStore.set('user_role', 'admin')
    cookieStore.set('user_name', 'Administrador')
    cookieStore.set('auth_refresh', Date.now().toString())

    redirect('/dashboard')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_email')
    cookieStore.delete('user_role')
    cookieStore.delete('user_name')
    cookieStore.delete('auth_refresh')
    redirect('/login')
}
