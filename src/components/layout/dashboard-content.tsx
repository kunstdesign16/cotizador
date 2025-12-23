'use client'

import { usePathname } from 'next/navigation'

export function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'

    return (
        <main className={`${isLoginPage ? 'w-full' : 'pt-16 lg:pt-0 lg:pl-64'} min-h-screen transition-all duration-300`}>
            {children}
        </main>
    )
}
