'use client'
import { Sidebar } from './sidebar'
import { usePathname } from 'next/navigation'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className={`${isLoginPage ? 'w-full' : 'pl-64'} min-h-screen transition-all duration-300`}>
                {children}
            </main>
        </div>
    )
}
