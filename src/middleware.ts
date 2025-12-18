import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const ADMIN_ROUTES = ['/accounting', '/expenses', '/users']

// Public routes (no auth needed)
const PUBLIC_ROUTES = ['/login']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Check authentication
    const userEmail = request.cookies.get('user_email')?.value
    const userRole = request.cookies.get('user_role')?.value

    // Redirect to login if not authenticated
    if (!userEmail) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin routes
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (userRole !== 'admin') {
            // Redirect non-admin users to dashboard
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
