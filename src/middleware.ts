import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const ADMIN_ROUTES = ['/accounting', '/expenses', '/users']

// Public routes (no auth needed)
const PUBLIC_ROUTES = ['/login', '/register']

// Forced Admin Emails
const ADMIN_EMAILS = [
    'kunstdesign16@gmail.com',
    'direccion@kunstdesign.com.mx'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Check authentication
    const userEmailCookie = request.cookies.get('user_email')
    const userRoleCookie = request.cookies.get('user_role')

    const userEmail = userEmailCookie?.value
    let userRole = userRoleCookie?.value

    // Redirect to login if not authenticated
    if (!userEmail) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const emailLower = userEmail.toLowerCase().trim()
    const isDesignatedAdmin = ADMIN_EMAILS.includes(emailLower)

    // AGGRESSIVE SYNC: If it's an admin email, but the role cookie is missing or wrong
    if (isDesignatedAdmin && userRole !== 'admin') {
        const response = NextResponse.next()

        // Force correct cookies in the response to update the browser
        const cookieOptions = {
            path: '/',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }

        response.cookies.set('user_role', 'admin', cookieOptions)
        // Also ensure email is set correctly
        response.cookies.set('user_email', emailLower, cookieOptions)

        return response
    }

    // Check admin routes access
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        // If we already detected it's a designated admin, we can proceed
        if (isDesignatedAdmin) {
            return NextResponse.next()
        }

        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)',
    ],
}
